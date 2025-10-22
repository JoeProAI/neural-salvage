import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import admin from 'firebase-admin';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!ADMIN_EMAILS.includes(decodedToken.email || '')) {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required',
        yourEmail: decodedToken.email 
      }, { status: 403 });
    }

    // 2. Get target user email and optional fields
    const { userEmail, reason, notes } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    // 3. Find user by email
    const usersSnapshot = await adminDb()
      .collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ 
        error: 'User not found',
        email: userEmail 
      }, { status: 404 });
    }

    const userId = usersSnapshot.docs[0].id;
    const userData = usersSnapshot.docs[0].data();

    // 4. Grant beta access
    await adminDb().collection('users').doc(userId).update({
      betaAccess: true,
      betaGrantedAt: new Date(),
      betaGrantedBy: decodedToken.email,
      betaReason: reason || 'manual_grant',
      betaNotes: notes || '',
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `Beta access granted to ${userEmail}`,
      userId,
      grantedBy: decodedToken.email
    });

  } catch (error: any) {
    console.error('Grant beta error:', error);
    return NextResponse.json({ 
      error: 'Failed to grant beta access',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Verify admin token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!ADMIN_EMAILS.includes(decodedToken.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Get target user email
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    // 3. Find user
    const usersSnapshot = await adminDb()
      .collection('users')
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ 
        error: 'User not found',
        email: userEmail 
      }, { status: 404 });
    }

    const userId = usersSnapshot.docs[0].id;

    // 4. Revoke beta access
    await adminDb().collection('users').doc(userId).update({
      betaAccess: false,
      betaRevokedAt: new Date(),
      betaRevokedBy: decodedToken.email,
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `Beta access revoked for ${userEmail}`,
      userId,
      revokedBy: decodedToken.email
    });

  } catch (error: any) {
    console.error('Revoke beta error:', error);
    return NextResponse.json({ 
      error: 'Failed to revoke beta access',
      details: error.message 
    }, { status: 500 });
  }
}
