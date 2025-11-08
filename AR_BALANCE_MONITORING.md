# 🔋 AR Balance Monitoring System

**Critical:** AR refills take ~1 WEEK to process - you need early warning!

---

## 📊 **Current AR Balance: 9 AR**

```
Starting balance: 9 AR (~$144 USD)
Estimated mints: ~180 mints (at 0.05 AR per mint average)
Days remaining: ~18 days (at 10 mints/day average)
Status: ✅ HEALTHY
```

---

## ⚠️ **Alert Thresholds**

| Status | AR Balance | Action | Urgency |
|--------|------------|--------|---------|
| **HEALTHY** | 5+ AR | None | ✅ Good |
| **WARNING** | 3-5 AR | Plan refill | ⚠️ Soon |
| **CRITICAL** | 1-3 AR | **START REFILL NOW** | 🚨 Urgent |
| **EMPTY** | <1 AR | **EMERGENCY** | ❌ Users blocked |

---

## 🔄 **Auto-Monitoring Setup**

### Option 1: Vercel Cron Jobs (Recommended)

1. Go to Vercel Dashboard → Your Project
2. Settings → Cron Jobs
3. Add new cron job:
   ```
   Name: AR Balance Monitor
   URL: /api/cron/monitor-ar-balance?secret=YOUR_CRON_SECRET
   Schedule: 0 12 * * * (daily at noon UTC)
   ```

4. Add to `.env`:
   ```bash
   CRON_SECRET=your-random-secret-here-make-it-strong
   ```

### Option 2: External Cron Service

**cron-job.org** (Free):
1. Sign up at https://cron-job.org
2. Create new job:
   ```
   URL: https://your-app.vercel.app/api/cron/monitor-ar-balance?secret=YOUR_SECRET
   Schedule: Daily at 12:00 UTC
   Method: GET
   ```

**GitHub Actions** (Add to `.github/workflows/monitor-ar.yml`):
```yaml
name: Monitor AR Balance
on:
  schedule:
    - cron: '0 12 * * *' # Daily at noon UTC
  workflow_dispatch: # Manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check AR Balance
        run: |
          curl -X GET "https://your-app.vercel.app/api/cron/monitor-ar-balance?secret=${{ secrets.CRON_SECRET }}"
```

---

## 📱 **Manual Balance Check**

### As Admin (via API)

```bash
# Get your auth token from Firebase
curl -X GET "https://your-app.vercel.app/api/admin/ar-balance" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### Via Code

```typescript
import { getARBalanceStatus } from '@/lib/utils/arBalanceMonitor';

const status = await getARBalanceStatus(10); // avg 10 mints/day

console.log(status.alertMessage);
// "✅ Healthy: 9.00 AR remaining (~18 days). No action needed."
```

### Quick Healthcheck (No Auth)

```bash
# Returns status in headers
curl -I "https://your-app.vercel.app/api/admin/ar-balance"

# Response headers:
# X-AR-Status: healthy
# X-AR-Mints-Remaining: 180
# X-AR-Days-Remaining: 18
```

---

## 💰 **How to Refill AR**

### When You Get Alert: "CRITICAL - Start refill NOW!"

**Step 1: Buy AR Tokens**

**Option A: SimpleSwap.io** (Easiest for USDC → AR)
```
1. Go to https://simpleswap.io
2. Select exchange:
   - From: USDC (or your preferred crypto)
   - To: AR (Arweave)
   - Amount: See recommended amount in alert
3. Enter your Arweave wallet address
4. Complete the swap
5. AR arrives in 1-24 hours
```

**Option B: Crypto Exchange** (Kraken, Binance, etc.)
```
1. Buy AR with USD/USDC on exchange
2. Withdraw to your Arweave wallet address
3. AR arrives in 1-24 hours
```

**Step 2: Load into Bundlr**

Once AR arrives in your wallet, Bundlr will **automatically detect and load it**.

Verify with:
```bash
npm run check-ar-balance
```

**Total Time: 1-7 days** (depending on method)

---

## 🎯 **Refill Recommendations**

### Based on Usage

| Avg Daily Mints | Recommended Balance | Refill Frequency |
|-----------------|---------------------|------------------|
| 5/day | 5 AR (~$80) | Every ~20 days |
| 10/day | 10 AR (~$160) | Every ~20 days |
| 25/day | 20 AR (~$320) | Every ~16 days |
| 50/day | 30 AR (~$480) | Every ~12 days |

### Your Current Stats (9 AR balance)

```
At 10 mints/day average:
- Days remaining: ~18 days
- Next refill needed: Around November 26, 2025
- Recommended refill: 10 AR (~$160)
```

---

## 📧 **Email Alerts** (Future)

To enable email notifications:

1. **Add Email Service** (SendGrid, AWS SES, Resend, etc.)

2. **Update `arBalanceMonitor.ts`:**
```typescript
async function sendLowBalanceAlert(status: ARBalanceStatus) {
  // Replace with your email service
  await sendEmail({
    to: 'admin@your-domain.com',
    subject: `${status.status === 'critical' ? 'URGENT' : 'WARNING'}: Low AR Balance`,
    body: `
      AR Balance: ${status.balanceAR} AR
      Status: ${status.status}
      Days remaining: ${status.daysRemaining}
      ${status.alertMessage}
    `
  });
}
```

3. **Set in Env Vars:**
```bash
ADMIN_EMAIL=your-email@example.com
SENDGRID_API_KEY=your-key-here # or your email service key
```

---

## 🛠️ **Troubleshooting**

### "Balance shows 0 AR but I have funds"

**Issue:** Bundlr hasn't loaded your AR yet

**Fix:**
1. Check your Arweave wallet on https://viewblock.io/arweave
2. If AR is there, manually load into Bundlr:
   ```bash
   # Use Bundlr CLI
   bundlr fund 5000000000000 # Amount in Winston (5 AR)
   ```

### "Cron job not running"

**Check:**
1. Verify `CRON_SECRET` is set in env vars
2. Check Vercel logs: Dashboard → Deployments → Logs
3. Test manually: `curl https://your-app.vercel.app/api/cron/monitor-ar-balance?secret=YOUR_SECRET`

### "Users can't mint but balance looks good"

**Possible causes:**
1. Bundlr node issue (check https://bundlr.network/status)
2. Rate limiting (check Vercel logs)
3. Firebase issues (check Firebase console)

---

## 📈 **Cost Estimates**

### AR Storage Costs
```
File Size → AR Cost (approximate)

1 MB    = $0.0055 AR
5 MB    = $0.03 AR (typical song)
10 MB   = $0.05 AR (typical photo/doc)
50 MB   = $0.25 AR (album)
100 MB  = $0.50 AR (HD video)
250 MB  = $1.25 AR (large video)
500 MB  = $2.50 AR (massive file)
```

### Your New Pricing → Profit

| Tier | File Size | Your Price | AR Cost | Profit |
|------|-----------|------------|---------|--------|
| Tiny | 0-10 MB | $3.99 | $0.05 | **$3.94** (99% margin!) |
| Small | 10-50 MB | $5.99 | $0.15 | **$5.84** (97% margin!) |
| Medium | 50-100 MB | $9.99 | $0.30 | **$9.69** (97% margin!) |
| Large | 100-250 MB | $17.99 | $0.75 | **$17.24** (96% margin!) |
| XL | 250-500 MB | $29.99 | $1.50 | **$28.49** (95% margin!) |

*Includes Stripe fees (~$0.40-0.60 per transaction)*

---

## 🎉 **Optimized Revenue Model**

### New Pricing (vs Old)

**Pay-Per-Mint:**
- Was: $2.99-24.99
- Now: $3.99-29.99
- **Increase:** +$1 to +$5 per mint (20-30% more revenue!)

**Subscriptions:**
- Creator: $9.99 → $12.99 (+30% revenue)
- Pro: $29.99 → $34.99 (+17% revenue)
- Studio: $99.99 → $119.99 (+20% revenue)

### Monthly Revenue Projections (Optimized)

```
Conservative (50 users):
- 100 pay-per-mint transactions @ avg $6.99 = $699
- 10 Creator subs @ $12.99 = $130
- 3 Pro subs @ $34.99 = $105
Total: $934/month ($11,208/year)
AR costs: ~$50/month
Net profit: $884/month ($10,608/year) ✅

Growth (200 users):
- 400 transactions @ avg $6.99 = $2,796
- 40 Creator subs = $520
- 15 Pro subs = $525
- 2 Studio subs = $240
Total: $4,081/month ($48,972/year)
AR costs: ~$200/month
Net profit: $3,881/month ($46,572/year) 🚀
```

---

## ✅ **Action Checklist**

### Setup (Do Once)
- [ ] Set `CRON_SECRET` in environment variables
- [ ] Set `ADMIN_EMAILS` in environment variables
- [ ] Configure Vercel cron job or external service
- [ ] Test manual balance check: `GET /api/admin/ar-balance`
- [ ] Test cron endpoint: `GET /api/cron/monitor-ar-balance?secret=YOUR_SECRET`

### Weekly Monitoring
- [ ] Check AR balance (automated via cron)
- [ ] Review minting volume vs. estimates
- [ ] Adjust refill strategy if usage changes

### When Alert Received
- [ ] **WARNING:** Plan refill within 1 week
- [ ] **CRITICAL:** Start refill process immediately
- [ ] **EMPTY:** Emergency refill + notify users

---

## 📞 **Quick Reference**

**Current Balance:** 9 AR (~$144)
**Estimated Duration:** ~18 days at 10 mints/day
**Next Refill Needed:** ~November 26, 2025
**Refill Lead Time:** 1-7 days
**Emergency Contact:** Check SimpleSwap.io for fastest refill

---

**Last Updated:** November 8, 2025  
**Status:** ✅ System Active & Monitoring
