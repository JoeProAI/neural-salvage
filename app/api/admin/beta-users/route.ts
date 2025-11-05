import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Simple admin auth - in production, use proper admin authentication
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-admin-secret-here';

function checkAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_SECRET}`;
}

// List all beta users
export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const betaUsersSnapshot = await adminDb()
      .collection('users')
      .where('isBetaUser', '==', true)
      .get();

    const betaUsers = betaUsersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      betaUsers,
      count: betaUsers.length,
    });
  } catch (error: any) {
    console.error('Get beta users error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Grant or revoke beta access
export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, action, adminId } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userRef = adminDb().collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'grant') {
      await userRef.update({
        isBetaUser: true,
        betaAccessGrantedBy: adminId || 'admin',
        betaAccessGrantedAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Beta access granted',
        userId,
      });
    } else if (action === 'revoke') {
      await userRef.update({
        isBetaUser: false,
        betaAccessGrantedBy: null,
        betaAccessGrantedAt: null,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Beta access revoked',
        userId,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "grant" or "revoke"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Manage beta user error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
