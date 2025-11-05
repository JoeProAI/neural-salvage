# ⚡ Quick Start: Launch in 10 Minutes

## 🎯 What You're Launching

A complete NFT + AI platform with:
- ✅ Real blockchain NFT minting
- ✅ AI image analysis (GPT-4o Vision)
- ✅ Payment processing (Stripe)
- ✅ Beta user system
- ✅ Pro subscriptions

---

## 📋 Checklist (Do This Now)

### **1. Add Missing Environment Variables** (2 minutes)

Go to: **Vercel → Your Project → Settings → Environment Variables**

Add these 2:

```bash
# Get from Stripe Dashboard → Webhooks (create new endpoint)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Generate with: openssl rand -base64 32
ADMIN_SECRET=your-random-secret-here
```

---

### **2. Configure Stripe Webhook** (3 minutes)

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://neural-salvage.vercel.app/api/webhooks/stripe/standard`
4. Events to select:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
5. Copy "Signing secret" → Add to Vercel as `STRIPE_WEBHOOK_SECRET`

---

### **3. Deploy** (1 minute)

```bash
git push origin main
```

Wait ~2 minutes for Vercel deploy.

---

### **4. Test It Works** (4 minutes)

1. **Sign up:** Create test account
2. **Upload:** Upload a photo
3. **Test AI:** Click "Generate AI Description"
   - Should redirect to Stripe ($0.10)
   - Use test card: `4242 4242 4242 4242`
   - Should complete and run AI
4. **Grant yourself beta:**
   ```bash
   curl -X POST https://neural-salvage.vercel.app/api/admin/beta-users \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"userId": "YOUR_USER_ID", "action": "grant", "adminId": "you"}'
   ```
5. **Test beta access:** Try AI again (should be FREE)

---

## 🎁 Invite Beta Users

### **Quick Method (Firebase Console):**

1. Go to: https://console.firebase.google.com
2. Select project → Firestore
3. Find user in `users` collection
4. Add fields:
   ```json
   {
     "isBetaUser": true,
     "betaAccessGrantedBy": "your_name",
     "betaAccessGrantedAt": "2025-01-05T12:00:00Z"
   }
   ```

### **API Method:**

```bash
curl -X POST https://neural-salvage.vercel.app/api/admin/beta-users \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_firestore_id",
    "action": "grant",
    "adminId": "your_name"
  }'
```

---

## 💰 Pricing

**Free:**
- Unlimited uploads/storage
- No AI or NFTs

**Pay-Per-Use:**
- $0.10 per AI analysis (you profit $0.09)
- $1.00 per NFT mint (you profit $0.80)

**Pro - $9.99/month:**
- Unlimited AI
- 10 free NFT mints/month
- $0.50 per additional mint

**Beta Users:**
- EVERYTHING FREE

---

## 📊 Where to Check Things

**Revenue:** https://dashboard.stripe.com/payments

**Users:** https://console.firebase.google.com → Firestore → `users`

**Beta Users:**
```bash
curl https://neural-salvage.vercel.app/api/admin/beta-users \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

**Logs:** https://vercel.com/dashboard → Your Project → Logs

---

## 🐛 Quick Fixes

**Payment not working?**
- Check webhook secret is correct
- Check webhook URL is correct
- Wait 1-2 minutes for webhook to process

**Beta user still charged?**
- Confirm `isBetaUser: true` in Firestore
- Clear browser cache

**AI not running?**
- Check `DAYTONA_API_KEY` and `OPENAI_API_KEY` in Vercel
- Check Vercel logs for errors

---

## 🎯 First Week Goals

- ✅ Invite 5-10 beta users
- ✅ Get 20+ assets uploaded
- ✅ Test all features work
- ✅ Gather feedback
- ✅ Fix any bugs

---

## 🚀 You're Live!

Your complete NFT/AI SaaS is running.

**Pages:**
- Landing: https://neural-salvage.vercel.app
- Pricing: https://neural-salvage.vercel.app/pricing
- Dashboard: https://neural-salvage.vercel.app/dashboard

**Make money:**
- Get users
- Some will pay-per-use
- Some will subscribe to Pro
- Beta users help you improve

---

For detailed setup: See `BETA_AND_PAYMENT_SETUP.md`

**GO LAUNCH! 🚀💰**
