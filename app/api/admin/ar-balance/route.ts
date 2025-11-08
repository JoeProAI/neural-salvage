import { NextRequest, NextResponse } from 'next/server';
import { getARBalanceStatus, formatBalanceDisplay, getRefillInstructions } from '@/lib/utils/arBalanceMonitor';
import admin from 'firebase-admin';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function GET(request: NextRequest) {
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
        error: 'Forbidden - Admin access required'
      }, { status: 403 });
    }

    // 2. Get average mints per day (optional query param)
    const url = new URL(request.url);
    const avgMintsPerDay = parseInt(url.searchParams.get('avgMintsPerDay') || '10');

    // 3. Check AR balance
    const status = await getARBalanceStatus(avgMintsPerDay);

    // 4. Return detailed status
    return NextResponse.json({
      success: true,
      balance: {
        ar: status.balanceAR,
        usd: status.balanceUSD
      },
      estimates: {
        mintsRemaining: status.estimatedMintsRemaining,
        daysRemaining: status.daysRemaining
      },
      status: status.status,
      alert: {
        message: status.alertMessage,
        shouldRefill: status.shouldRefill,
        recommendedAmount: status.recommendedRefillAmount
      },
      display: formatBalanceDisplay(status),
      refillInstructions: status.shouldRefill 
        ? getRefillInstructions(status.recommendedRefillAmount)
        : null
    });

  } catch (error: any) {
    console.error('❌ [AR BALANCE API] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to check AR balance',
      details: error.message 
    }, { status: 500 });
  }
}

/**
 * Public endpoint (no auth) for simple status check
 * Only returns basic info, no sensitive data
 */
export async function HEAD(request: NextRequest) {
  try {
    const status = await getARBalanceStatus(10);
    
    // Return status in headers (simple healthcheck)
    return new NextResponse(null, {
      status: status.status === 'healthy' ? 200 : 
              status.status === 'warning' ? 503 : 500,
      headers: {
        'X-AR-Status': status.status,
        'X-AR-Mints-Remaining': status.estimatedMintsRemaining.toString(),
        'X-AR-Days-Remaining': status.daysRemaining.toString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
