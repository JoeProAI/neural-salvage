import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { username, displayName, bio, subscriptionPrice, coverImage, avatarUrl } = body;

    // Validation
    if (!username || !displayName || !subscriptionPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (subscriptionPrice < 1 || subscriptionPrice > 1000) {
      return NextResponse.json(
        { error: 'Subscription price must be between $1 and $1000' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingYards = await adminDb()
      .collection('salvageYards')
      .where('username', '==', username)
      .where('userId', '!=', userId)
      .get();

    if (!existingYards.empty) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Create or update salvage yard
    const salvageYardRef = adminDb().collection('salvageYards').doc(userId);
    const salvageYard = {
      userId,
      username,
      displayName,
      bio: bio || '',
      coverImage: coverImage || '',
      avatarUrl: avatarUrl || '',
      subscriptionPrice,
      isActive: true,
      subscriberCount: 0,
      contentCount: 0,
      totalEarnings: 0,
      updatedAt: new Date().toISOString(),
    };

    const existingYard = await salvageYardRef.get();
    if (existingYard.exists) {
      await salvageYardRef.update(salvageYard);
    } else {
      await salvageYardRef.set({
        ...salvageYard,
        createdAt: new Date().toISOString(),
      });
    }

    console.log('✅ [SALVAGE YARD] Setup complete:', { userId, username });

    return NextResponse.json({
      success: true,
      salvageYard: { id: userId, ...salvageYard },
    });
  } catch (error: any) {
    console.error('❌ [SALVAGE YARD SETUP] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup salvage yard' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user's salvage yard
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const salvageYardDoc = await adminDb()
      .collection('salvageYards')
      .doc(userId)
      .get();

    if (!salvageYardDoc.exists) {
      return NextResponse.json(
        { exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      salvageYard: { id: salvageYardDoc.id, ...salvageYardDoc.data() },
    });
  } catch (error: any) {
    console.error('❌ [SALVAGE YARD GET] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get salvage yard' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Deactivate salvage yard
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    await adminDb()
      .collection('salvageYards')
      .doc(userId)
      .update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      });

    console.log('✅ [SALVAGE YARD] Deactivated:', userId);

    return NextResponse.json({
      success: true,
      message: 'Salvage yard deactivated',
    });
  } catch (error: any) {
    console.error('❌ [SALVAGE YARD DELETE] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deactivate salvage yard' },
      { status: 500 }
    );
  }
}
