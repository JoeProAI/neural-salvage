/**
 * Cron Job: Monitor AR Balance
 * 
 * Run this daily to check AR balance and send alerts if low
 * 
 * Setup in Vercel:
 * 1. Go to Project Settings → Cron Jobs
 * 2. Add new cron: GET /api/cron/monitor-ar-balance
 * 3. Schedule: 0 12 * * * (daily at noon UTC)
 * 
 * Or use external cron service:
 * - cron-job.org
 * - EasyCron
 * - GitHub Actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitorAndAlert, getARBalanceStatus } from '@/lib/utils/arBalanceMonitor';

// Secure with a cron secret (set in env vars)
const CRON_SECRET = process.env.CRON_SECRET || 'change-me-in-production';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify cron secret from header or query param
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    const secret = authHeader?.replace('Bearer ', '') || url.searchParams.get('secret');
    
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ 
        error: 'Unauthorized - Invalid cron secret' 
      }, { status: 401 });
    }

    // 2. Get average mints per day (estimate from your usage)
    const avgMintsPerDay = parseInt(
      url.searchParams.get('avgMintsPerDay') || '10'
    );

    console.log('🔄 [CRON] Starting AR balance monitoring...');

    // 3. Run monitoring and alert
    await monitorAndAlert(avgMintsPerDay);

    // 4. Get status for response
    const status = await getARBalanceStatus(avgMintsPerDay);

    // 5. Return result
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      balance: {
        ar: status.balanceAR,
        usd: status.balanceUSD
      },
      status: status.status,
      alert: {
        message: status.alertMessage,
        shouldRefill: status.shouldRefill,
        recommendedAmount: status.recommendedRefillAmount
      },
      estimates: {
        mintsRemaining: status.estimatedMintsRemaining,
        daysRemaining: status.daysRemaining
      }
    });

  } catch (error: any) {
    console.error('❌ [CRON] AR balance monitoring failed:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to monitor AR balance',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Support POST for cron services that prefer POST
export async function POST(request: NextRequest) {
  return GET(request);
}
