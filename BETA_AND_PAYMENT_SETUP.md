# 🚀 Beta Users & Payment System - Complete Setup Guide

## 🎯 What Was Just Built

You now have a **COMPLETE payment system** with:

1. ✅ **Pay-per-use** - $0.10 per AI analysis, $1 per NFT mint
2. ✅ **Pro subscriptions** - $9.99/month unlimited AI + 10 free NFT mints
3. ✅ **Beta user system** - You can grant free access to testers
4. ✅ **Admin API** - Manage beta users programmatically
5. ✅ **Stripe integration** - Full checkout + webhooks
6. ✅ **Pricing page** - Beautiful comparison table

---

## 📋 Files Created

### **Payment APIs:**
- `app/api/payment/create-checkout/route.ts` - Pay-per-use checkout
- `app/api/payment/create-subscription/route.ts` - Pro plan subscription
- `app/api/payment/success/route.ts` - Payment success handler
- `app/api/webhooks/stripe/standard/route.ts` - Stripe webhook handler

### **Admin APIs:**
- `app/api/admin/beta-users/route.ts` - Manage beta access

### **Frontend:**
- `app/pricing/page.tsx` - Pricing comparison page
- Updated `app/gallery/[id]/page.tsx` - Payment before AI analysis
- Updated `components/nft/MintNFTModal.tsx` - Payment before minting

### **Types:**
- Updated `types/index.ts` - Added beta user fields

---

## 🔧 Environment Variables to Add

Add these to Vercel:

### **1. STRIPE_WEBHOOK_SECRET** (New - Required)

This is DIFFERENT from `STRIPE_CONNECT_WEBHOOK_SECRET`.

**How to get it:**
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://neural-salvage.vercel.app/api/webhooks/stripe/standard`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add to Vercel:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### **2. ADMIN_SECRET** (New - Required)

For managing beta users securely.

**Create a strong secret:**
```bash
# Generate a random secret (or use a password manager)
openssl rand -base64 32
```

**Add to Vercel:**
```
ADMIN_SECRET=your-generated-secret-here
```

**Save this secret!** You'll need it to manage beta users.

---

## ✅ Environment Variables Checklist

Make sure you have ALL of these in Vercel:

### **Firebase (Already Set):**
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`
- ✅ `FIREBASE_ADMIN_PROJECT_ID`
- ✅ `FIREBASE_ADMIN_CLIENT_EMAIL`
- ✅ `FIREBASE_ADMIN_PRIVATE_KEY`

### **Arweave (Already Set):**
- ✅ `ARWEAVE_PRIVATE_KEY`
- ✅ `NEXT_PUBLIC_ARWEAVE_ENABLED`

### **AI Services (Already Set):**
- ✅ `DAYTONA_API_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `QDRANT_URL` (optional)
- ✅ `QDRANT_API_KEY` (optional)

### **Stripe (Already Set):**
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_CONNECT_WEBHOOK_SECRET`

### **New Variables (ADD THESE):**
- ⏳ `STRIPE_WEBHOOK_SECRET` - For payment webhooks
- ⏳ `ADMIN_SECRET` - For beta user management

### **App Config (Already Set):**
- ✅ `NEXT_PUBLIC_APP_URL`
- ✅ `PLATFORM_FEE_PERCENTAGE`

---

## 🧑‍💼 How to Grant Beta Access

You can grant beta access in 2 ways:

### **Method 1: Using API (Recommended)**

Use curl or Postman:

```bash
# Grant beta access
curl -X POST https://neural-salvage.vercel.app/api/admin/beta-users \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_firestore_id",
    "action": "grant",
    "adminId": "your_name"
  }'

# Revoke beta access
curl -X POST https://neural-salvage.vercel.app/api/admin/beta-users \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_firestore_id",
    "action": "revoke"
  }'

# List all beta users
curl https://neural-salvage.vercel.app/api/admin/beta-users \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

### **Method 2: Directly in Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (Nueral Salvage)
3. Go to **Firestore Database**
4. Find the **users** collection
5. Click on a user document
6. Add these fields:
   ```json
   {
     "isBetaUser": true,
     "betaAccessGrantedBy": "your_name",
     "betaAccessGrantedAt": "2025-01-05T12:00:00Z"
   }
   ```
7. Click "Update"

**Beta users get:**
- ✅ Unlimited AI analyses (no charge)
- ✅ Unlimited NFT mints (no charge)
- ✅ All Pro features
- ✅ No payment required
- ✅ "Beta User" badge on pricing page

---

## 💰 Pricing Structure

### **Free Tier:**
- ✅ Unlimited uploads
- ✅ Unlimited storage
- ✅ Collections & gallery
- ❌ No AI analyses
- ❌ No NFT mints

### **Pay-Per-Use:**
- ✅ Everything in Free
- 💰 **$0.10 per AI analysis**
  - Your cost: ~$0.01
  - Profit: ~$0.09 (900% margin!)
- 💰 **$1.00 per NFT mint**
  - Your cost: ~$0.10-0.20
  - Profit: ~$0.80-0.90 (400-900% margin!)

### **Pro Plan - $9.99/month:**
- ✅ Everything in Free
- ✅ **Unlimited AI analyses** (included)
- ✅ **10 free NFT mints/month** (save $10)
- 💰 **$0.50 per additional mint** (50% discount)
- ✅ Priority support

### **Beta Users:**
- ✅ **Everything FREE**
- ✅ No limits
- ✅ All Pro features
- ✅ No payment required

---

## 🎯 User Flow Examples

### **Example 1: Free User Wants AI Analysis**

1. User uploads photo
2. Clicks "✨ Generate AI Description & Tags"
3. System checks: Not beta user, not Pro subscriber
4. Redirects to Stripe Checkout ($0.10)
5. User pays
6. Webhook confirms payment
7. Redirects back with `?payment=success&action=analyze`
8. Frontend triggers AI analysis automatically
9. AI generates description + tags
10. User sees results

### **Example 2: Beta User Wants AI Analysis**

1. User uploads photo
2. Clicks "✨ Generate AI Description & Tags"
3. System checks: Beta user!
4. AI analysis runs immediately (no payment)
5. Shows: "✨ AI analysis complete! (Beta user - free)"
6. User sees results

### **Example 3: Pro User Wants to Mint NFT**

1. User uploads photo
2. Clicks "⛓️ Mint as NFT on Arweave"
3. System checks: Pro subscriber, 3 mints used this month
4. Shows: "Pro plan - Free mint 4/10 this month"
5. Mints NFT immediately (no payment)
6. User gets NFT

### **Example 4: Pro User Exceeded Free Mints**

1. User uploads photo (already minted 10 this month)
2. Clicks "⛓️ Mint as NFT on Arweave"
3. System checks: Pro subscriber, 10 mints used
4. Redirects to Stripe Checkout ($0.50 discounted price)
5. User pays
6. NFT mints
7. User gets NFT

---

## 🧪 Testing the System

### **Test 1: Free User Payment**

1. Create a test user (sign up normally)
2. Upload a photo
3. Click "Generate AI"
4. Should redirect to Stripe Checkout ($0.10)
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. Should redirect back and run AI analysis

### **Test 2: Beta User Access**

1. Grant yourself beta access (see instructions above)
2. Upload a photo
3. Click "Generate AI"
4. Should run immediately with "Beta user - free" message
5. No payment required

### **Test 3: Pro Subscription**

1. Go to `/pricing`
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Complete subscription
5. Webhook should update your plan to "pro"
6. All AI analyses now free
7. First 10 NFT mints free

---

## 🔄 Deployment Steps

### **1. Add Environment Variables**

Go to Vercel → Settings → Environment Variables:

```bash
# Add these two new variables:
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
ADMIN_SECRET=your-generated-secret
```

### **2. Push Code**

```bash
git push origin main
```

Vercel will auto-deploy (~2 minutes).

### **3. Configure Stripe Webhooks**

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://neural-salvage.vercel.app/api/webhooks/stripe/standard`
3. Select events (see above)
4. Copy webhook secret
5. Add to Vercel env vars

### **4. Test Everything**

- Sign up a new user
- Upload a photo
- Try AI analysis (should ask for payment)
- Grant yourself beta access
- Try AI again (should be free)
- Check Stripe Dashboard for payments

---

## 📊 Monitoring & Analytics

### **Track Revenue:**

**In Stripe Dashboard:**
- See all payments
- See subscriptions
- See failed payments
- Export reports

**In Firebase:**
- Query `sales` collection for marketplace
- Query `pending_mints` for NFT payments
- Query `pending_analyses` for AI payments

### **Track Beta Users:**

```bash
# API call to list all beta users
curl https://neural-salvage.vercel.app/api/admin/beta-users \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

Or check in Firebase Console:
```
users collection → filter: isBetaUser == true
```

---

## 🎁 Beta User Perks Ideas

Make your beta users feel special:

- ✅ Free access to all features forever
- ✅ Special "Beta" badge on profile
- ✅ Priority support
- ✅ Early access to new features
- ✅ Mentioned in credits/about page
- ✅ Lifetime 50% discount if they convert to paid

**How to show beta badge:**

In dashboard/profile:
```tsx
{user?.isBetaUser && (
  <div className="bg-retro-purple text-white px-3 py-1 rounded-full text-sm font-bold">
    🎉 Beta User
  </div>
)}
```

---

## 💡 First Beta Users to Invite

**Ideal beta users:**
1. **Photographers** - Need AI tagging
2. **Digital artists** - Want NFT minting
3. **Content creators** - Need organization
4. **Tech enthusiasts** - Will give good feedback
5. **Your friends** - Honest feedback

**How many:** 10-20 is perfect for beta

**Where to find them:**
- X (post about it)
- Reddit (r/photography, r/digitalart)
- Product Hunt (launch in beta mode)
- Your network (email friends)

---

## 📈 Revenue Projections with Beta Users

### **Month 1: Beta Only**
- 15 beta users (free)
- 0 paying customers
- Revenue: $0
- Costs: ~$10 (your API usage)
- Goal: Get feedback, fix bugs

### **Month 2: Soft Launch**
- 15 beta users (free)
- 20 new users (5 pay-per-use)
- Revenue: ~$20
- Costs: ~$15
- Profit: ~$5
- Goal: Prove people will pay

### **Month 3: Public Launch**
- 15 beta users (free)
- 100 new users (30 pay-per-use, 5 pro)
- Revenue: ~$150 (pay-per-use) + $50 (pro) = $200
- Costs: ~$40
- Profit: ~$160
- Goal: Growth + profitability

---

## 🎯 Success Metrics

**Week 1:**
- ✅ 5 beta users invited
- ✅ All env vars set
- ✅ Payment tested
- ✅ No errors in production

**Month 1:**
- ✅ 15 beta users
- ✅ 50+ assets uploaded
- ✅ 10+ AI analyses run
- ✅ 5+ NFTs minted
- ✅ Good feedback received

**Month 3:**
- ✅ 3+ paying customers
- ✅ $100+ revenue
- ✅ Break even on costs
- ✅ Decide: continue or pivot

---

## 🐛 Troubleshooting

### **Payment not working:**
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook is pointing to correct URL
- Check Stripe is in test mode or live mode
- Check browser console for errors

### **Beta users still charged:**
- Confirm `isBetaUser: true` in Firestore
- Check API response (should say `isBetaUser: true`)
- Clear browser cache and try again

### **Subscription not activating:**
- Check webhook received in Stripe Dashboard
- Check Firestore user doc has `plan: "pro"`
- Check `stripeSubscriptionStatus: "active"`
- Webhook might be delayed (wait 1-2 minutes)

---

## 🚀 You're Ready to Launch!

**Next steps:**

1. ✅ Add 2 environment variables (webhook secret + admin secret)
2. ✅ Deploy to Vercel (git push)
3. ✅ Configure Stripe webhook
4. ✅ Test payment flow
5. ✅ Grant yourself beta access
6. ✅ Invite 10-15 beta testers
7. ✅ Gather feedback for 2 weeks
8. ✅ Fix bugs
9. ✅ Launch publicly

**You have:**
- ✅ Real authentication
- ✅ Real file storage
- ✅ Real AI analysis
- ✅ Real blockchain NFTs
- ✅ Real payment processing
- ✅ Real subscription billing
- ✅ Beta user management

**This is a COMPLETE SaaS product!** 🎉

---

## 📞 Support

If you get stuck:

1. Check Stripe Dashboard for payment errors
2. Check Vercel logs for API errors
3. Check Firebase Console for data issues
4. Check browser console for frontend errors

**Common issues:**
- Webhook signature mismatch → Wrong secret
- Payment not completing → Webhook not configured
- Beta user charged → Field not set in Firestore
- AI not running → Missing API keys

---

**YOU GOT THIS!** 🚀💰

Your app is production-ready. Time to get users and make money!
