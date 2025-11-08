/**
 * AR Balance Monitoring System
 * Tracks Arweave balance and alerts when refill is needed
 * 
 * CRITICAL: AR refills take ~1 week, so we need early warning!
 */

import Bundlr from '@bundlr-network/client';

export interface ARBalanceStatus {
  balanceAR: number;
  balanceUSD: number;
  estimatedMintsRemaining: number;
  status: 'healthy' | 'warning' | 'critical' | 'empty';
  daysRemaining: number;
  alertMessage: string;
  shouldRefill: boolean;
  recommendedRefillAmount: number;
}

// Thresholds (in AR)
const CRITICAL_THRESHOLD = 1; // Less than 1 AR = CRITICAL (refill NOW!)
const WARNING_THRESHOLD = 3; // Less than 3 AR = WARNING (refill soon)
const HEALTHY_THRESHOLD = 5; // 5+ AR = healthy

// AR price estimate (update periodically)
const AR_PRICE_USD = 16; // $16 per AR (approximate)

// Average cost per mint
const AVG_COST_PER_MINT_AR = 0.05; // Small file average

/**
 * Initialize Bundlr to check balance
 */
async function getBundlrInstance(): Promise<any> {
  try {
    const privateKey = process.env.ARWEAVE_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('ARWEAVE_PRIVATE_KEY not configured');
    }

    const key = typeof privateKey === 'string' ? JSON.parse(privateKey) : privateKey;
    const bundlr = new Bundlr('https://node2.bundlr.network', 'arweave', key);
    
    return bundlr;
  } catch (error) {
    console.error('❌ [AR MONITOR] Failed to initialize Bundlr:', error);
    throw error;
  }
}

/**
 * Get current AR balance status
 */
export async function getARBalanceStatus(
  averageMintsPerDay: number = 10
): Promise<ARBalanceStatus> {
  try {
    const bundlr = await getBundlrInstance();
    
    // Get balance in atomic units
    const balanceAtomic = await bundlr.getLoadedBalance();
    const balanceAR = parseFloat(bundlr.utils.fromAtomic(balanceAtomic).toString());
    const balanceUSD = balanceAR * AR_PRICE_USD;
    
    // Calculate estimates
    const estimatedMintsRemaining = Math.floor(balanceAR / AVG_COST_PER_MINT_AR);
    const daysRemaining = averageMintsPerDay > 0 
      ? Math.floor(estimatedMintsRemaining / averageMintsPerDay)
      : 999;
    
    // Determine status
    let status: 'healthy' | 'warning' | 'critical' | 'empty';
    let alertMessage: string;
    let shouldRefill: boolean;
    let recommendedRefillAmount: number;
    
    if (balanceAR <= 0) {
      status = 'empty';
      alertMessage = '🚨 URGENT: AR balance is EMPTY! Users cannot mint NFTs!';
      shouldRefill = true;
      recommendedRefillAmount = 10; // Refill with 10 AR immediately
    } else if (balanceAR < CRITICAL_THRESHOLD) {
      status = 'critical';
      alertMessage = `⚠️ CRITICAL: Only ${balanceAR.toFixed(2)} AR remaining (~${estimatedMintsRemaining} mints). Refill takes 1 week - start NOW!`;
      shouldRefill = true;
      recommendedRefillAmount = 10;
    } else if (balanceAR < WARNING_THRESHOLD) {
      status = 'warning';
      alertMessage = `⚠️ WARNING: ${balanceAR.toFixed(2)} AR remaining (~${daysRemaining} days at current rate). Plan refill soon.`;
      shouldRefill = true;
      recommendedRefillAmount = 7;
    } else if (balanceAR < HEALTHY_THRESHOLD) {
      status = 'warning';
      alertMessage = `ℹ️ Notice: ${balanceAR.toFixed(2)} AR remaining. Consider refilling within the week.`;
      shouldRefill = false;
      recommendedRefillAmount = 5;
    } else {
      status = 'healthy';
      alertMessage = `✅ Healthy: ${balanceAR.toFixed(2)} AR remaining (~${daysRemaining} days). No action needed.`;
      shouldRefill = false;
      recommendedRefillAmount = 0;
    }
    
    console.log(`💰 [AR MONITOR] Balance: ${balanceAR.toFixed(2)} AR ($${balanceUSD.toFixed(2)} USD) | Status: ${status.toUpperCase()}`);
    
    return {
      balanceAR,
      balanceUSD,
      estimatedMintsRemaining,
      status,
      daysRemaining,
      alertMessage,
      shouldRefill,
      recommendedRefillAmount
    };
    
  } catch (error) {
    console.error('❌ [AR MONITOR] Failed to check balance:', error);
    
    // Return safe defaults on error
    return {
      balanceAR: 0,
      balanceUSD: 0,
      estimatedMintsRemaining: 0,
      status: 'critical',
      daysRemaining: 0,
      alertMessage: '❌ ERROR: Could not check AR balance. Check manually!',
      shouldRefill: true,
      recommendedRefillAmount: 10
    };
  }
}

/**
 * Send email alert for low balance (integrate with your email service)
 */
export async function sendLowBalanceAlert(status: ARBalanceStatus): Promise<void> {
  // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
  console.log('📧 [AR MONITOR] Email alert would be sent:');
  console.log(`   Subject: ${status.status === 'critical' ? 'URGENT' : 'WARNING'} - Low AR Balance`);
  console.log(`   Message: ${status.alertMessage}`);
  console.log(`   Balance: ${status.balanceAR.toFixed(2)} AR ($${status.balanceUSD.toFixed(2)} USD)`);
  console.log(`   Days remaining: ~${status.daysRemaining} days`);
  console.log(`   Recommended refill: ${status.recommendedRefillAmount} AR`);
}

/**
 * Check balance and send alert if needed
 * Run this from a cron job or API route
 */
export async function monitorAndAlert(averageMintsPerDay: number = 10): Promise<void> {
  const status = await getARBalanceStatus(averageMintsPerDay);
  
  // Send alert if critical or warning
  if (status.status === 'critical' || status.status === 'empty') {
    await sendLowBalanceAlert(status);
  }
  
  // Log to console always
  console.log('📊 [AR MONITOR] Status Report:');
  console.log(`   Balance: ${status.balanceAR.toFixed(2)} AR ($${status.balanceUSD.toFixed(2)} USD)`);
  console.log(`   Est. mints: ~${status.estimatedMintsRemaining} mints`);
  console.log(`   Days left: ~${status.daysRemaining} days`);
  console.log(`   Status: ${status.status.toUpperCase()}`);
  console.log(`   Message: ${status.alertMessage}`);
  
  if (status.shouldRefill) {
    console.log(`\n🔔 ACTION REQUIRED:`);
    console.log(`   1. Go to your crypto exchange`);
    console.log(`   2. Buy ${status.recommendedRefillAmount} AR (~$${(status.recommendedRefillAmount * AR_PRICE_USD).toFixed(2)} USD)`);
    console.log(`   3. Send to your Arweave wallet address`);
    console.log(`   4. Load into Bundlr node (takes ~1 week to process)`);
    console.log(`\n⏰ REMINDER: AR refills take ~1 WEEK - don't wait!`);
  }
}

/**
 * Format balance for display in admin dashboard
 */
export function formatBalanceDisplay(status: ARBalanceStatus): string {
  const statusEmoji = {
    healthy: '✅',
    warning: '⚠️',
    critical: '🚨',
    empty: '❌'
  }[status.status];

  return `
${statusEmoji} AR Balance: ${status.balanceAR.toFixed(2)} AR ($${status.balanceUSD.toFixed(2)} USD)
📊 Estimated: ~${status.estimatedMintsRemaining} mints remaining
⏰ Time left: ~${status.daysRemaining} days at current rate
${status.shouldRefill ? '\n🔔 REFILL NEEDED - Takes 1 week!' : '✅ No action needed'}
  `.trim();
}

/**
 * Calculate how much AR is needed for a specific number of mints
 */
export function calculateARNeeded(
  numberOfMints: number,
  avgFileSizeMB: number = 10
): {
  arNeeded: number;
  usdCost: number;
} {
  // Estimate AR cost based on file size
  // Arweave charges ~$5-6 per GB
  const arCostPerMB = 0.0055; // $5.50 per GB average
  const arCostPerMint = avgFileSizeMB * arCostPerMB;
  const arNeeded = numberOfMints * arCostPerMint;
  const usdCost = arNeeded * AR_PRICE_USD;
  
  return {
    arNeeded,
    usdCost
  };
}

/**
 * Get refill instructions
 */
export function getRefillInstructions(arAmount: number): string {
  const usdCost = arAmount * AR_PRICE_USD;
  
  return `
🔄 HOW TO REFILL ARWEAVE BALANCE

Required: ${arAmount} AR (~$${usdCost.toFixed(2)} USD)

Step 1: Buy AR Tokens
  - Option A: Crypto Exchange (Kraken, Binance, etc.)
    → Buy AR with USD/USDC
    → Withdraw to your Arweave wallet address
    
  - Option B: SimpleSwap.io (Recommended for USDC)
    → Go to simpleswap.io
    → Select: USDC → AR
    → Amount: $${usdCost.toFixed(2)} worth
    → Destination: Your Arweave wallet address
    → Complete swap

Step 2: Load into Bundlr
  - Your AR will arrive in ~1-24 hours
  - Bundlr will auto-detect and load the balance
  - Check balance: Run 'npm run check-ar-balance'

⏰ IMPORTANT: This process takes 1-7 days total
   Plan ahead! Don't wait until balance is empty!

💡 TIP: Keep at least ${HEALTHY_THRESHOLD} AR in balance (~$${(HEALTHY_THRESHOLD * AR_PRICE_USD).toFixed(2)})
   This ensures ~${Math.floor(HEALTHY_THRESHOLD / AVG_COST_PER_MINT_AR)} mints buffer
  `.trim();
}
