import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase/admin';
import { qdrantService } from '@/lib/vector/qdrant';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get asset document
    const assetRef = adminDb().collection('assets').doc(assetId);
    const assetDoc = await assetRef.get();

    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();

    // Verify ownership
    if (asset?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete from Firebase Storage
    try {
      const bucket = adminStorage().bucket();
      const storagePath = `users/${userId}/assets/${assetId}/`;
      
      // Delete all files in the asset folder
      const [files] = await bucket.getFiles({ prefix: storagePath });
      
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
      
      console.log(`Deleted ${files.length} files from Storage for asset ${assetId}`);
    } catch (error) {
      console.error('Error deleting from Storage:', error);
      // Continue even if storage deletion fails
    }

    // Delete from Qdrant vector database
    try {
      await qdrantService.deleteVector(assetId);
      console.log(`Deleted vector for asset ${assetId} from Qdrant`);
    } catch (error) {
      console.error('Error deleting from Qdrant:', error);
      // Continue even if Qdrant deletion fails
    }

    // Delete from Firestore
    await assetRef.delete();
    console.log(`Deleted asset ${assetId} from Firestore`);

    return NextResponse.json({
      success: true,
      message: 'Asset deleted from all locations',
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get asset document
    const assetRef = adminDb().collection('assets').doc(assetId);
    const assetDoc = await assetRef.get();

    if (!assetDoc.exists) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const asset = assetDoc.data();

    // Verify ownership
    if (asset?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update asset
    await assetRef.update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Asset updated',
    });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}
