# 🧪 Beta Access System - Neural Salvage

## Overview

Beta users get **100% free access** to all features:
- ✅ **Unlimited AI analyses** (no 100/month limit)
- ✅ **Unlimited storage**
- ✅ **No marketplace fees** (if you set up 100% coupon)
- ✅ **All Pro features**

This lets you test thoroughly without spending money!

---

## Quick Setup (5 minutes)

### 1. Add Your Admin Email to Vercel

In Vercel → Settings → Environment Variables:

```
ADMIN_EMAILS=your-email@gmail.com
```

(Use the same email you sign in with)

### 2. Grant Yourself Beta Access

**Option A: Firebase Console (Easiest)**

1. Go to: https://console.firebase.google.com/project/nueral-salvage/firestore
2. Click `users` collection
3. Find your user document (by email)
4. Click "Edit document"
5. Add field:
   - Field name: `betaAccess`
   - Type: `boolean`
   - Value: `true`
6. Click "Update"

**Done!** You now have unlimited everything.

---

**Option B: Via API (After adding ADMIN_EMAILS)**

```bash
# Get your Firebase auth token first
# Sign in to your app, open DevTools Console, and run:
# firebase.auth().currentUser.getIdToken().then(console.log)

curl -X POST https://neural-salvage.vercel.app/api/admin/grant-beta \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "your-email@gmail.com",
    "reason": "testing",
    "notes": "Main tester account"
  }'
```

---

## Features for Beta Users

### ✅ Unlimited AI Processing

Normal users: 100 AI analyses/month  
**Beta users: UNLIMITED** ✨

No charges for:
- Image analysis (Daytona + OpenAI)
- Video analysis
- Audio transcription
- Embedding generation

### ✅ No Storage Limits

Normal users: 10 GB (free tier)  
**Beta users: No enforcement** 

### ✅ Full Feature Access

All Pro/Enterprise features unlocked:
- Advanced semantic search
- Priority processing
- API access (when built)
- Marketplace features

---

## Grant Beta to Others

### Add Test Users

You can grant beta to:
- Friends testing the app
- Early adopters
- Investors
- Partners

**Via Firebase Console:**
1. Have them sign up normally
2. Find their user doc in Firestore
3. Set `betaAccess: true`

**Via API:**
```bash
curl -X POST https://neural-salvage.vercel.app/api/admin/grant-beta \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "friend@example.com", "reason": "early_tester"}'
```

---

## Revoke Beta Access

**Via Firebase Console:**
1. Find user document
2. Change `betaAccess` to `false`

**Via API:**
```bash
curl -X DELETE https://neural-salvage.vercel.app/api/admin/grant-beta \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "user@example.com"}'
```

---

## Testing Checklist

### Test AI Limits
- [ ] Upload 100+ images as beta user (should all work)
- [ ] Check dashboard shows "✨ BETA ACCESS"
- [ ] Verify no limit warnings

### Test Marketplace
- [ ] List an asset for sale
- [ ] Try to purchase (with test card)
- [ ] Verify download link works
- [ ] Check seller got paid (in Stripe dashboard)

### Test Access Control
- [ ] Try to grant beta as non-admin (should fail)
- [ ] Revoke beta from yourself
- [ ] Verify limits apply again
- [ ] Grant beta back

---

## Current Beta Users

Track in your own document or spreadsheet:

| Email | Granted | Reason | Notes |
|-------|---------|--------|-------|
| your-email@gmail.com | 2025-10-21 | Main dev | Unlimited testing |
| | | | |

---

## Firestore Security

Users **cannot** grant themselves beta access. The rules prevent this:

```javascript
// Users CANNOT modify beta fields
allow update: if request.auth.uid == userId
  && !request.resource.data.diff(resource.data).affectedKeys().hasAny([
    'betaAccess',
    'betaGrantedAt',
    'betaGrantedBy'
  ]);
```

Only **Admin SDK** (server-side with your Firebase private key) can modify beta fields.

---

## Cost Savings During Testing

### Without Beta System:
- You hit 100 AI limit quickly
- Need to pay $10/month for Pro
- Every test costs API credits
- Hard to test at scale

### With Beta System:
- ✅ Unlimited testing
- ✅ $0 subscription costs
- ✅ Only pay actual API usage (Daytona, OpenAI)
- ✅ Can onboard friends for free

**Estimated Savings:** $10-50/month during testing phase

---

## When to Remove Beta Access

**Before Public Launch:**
1. Revoke beta from all test users
2. Keep beta only for:
   - Core team
   - Advisors
   - Strategic partners
   - Early investors

**After Launch:**
- Grant beta sparingly (VIPs only)
- Most users should convert to paid
- Use beta as marketing tool ("exclusive early access")

---

## Environment Variables

Add to Vercel:

```env
# Required for admin access
ADMIN_EMAILS=your-email@gmail.com,partner@example.com

# Optional: For Stripe 100% discount (marketplace testing)
STRIPE_BETA_COUPON_ID=beta_100_off
```

---

## API Endpoints

### Grant Beta Access
```
POST /api/admin/grant-beta
Authorization: Bearer {firebase-token}
Content-Type: application/json

{
  "userEmail": "user@example.com",
  "reason": "early_tester",
  "notes": "Granted for Q1 testing"
}
```

### Revoke Beta Access
```
DELETE /api/admin/grant-beta
Authorization: Bearer {firebase-token}
Content-Type: application/json

{
  "userEmail": "user@example.com"
}
```

---

## FAQ

**Q: Can beta users see they have beta access?**  
A: Yes, you can add a badge in the UI (optional). Currently it's backend-only.

**Q: Do beta users count toward usage limits?**  
A: Usage is tracked but not enforced. They never hit limits.

**Q: Can I charge beta users later?**  
A: Yes, just revoke beta access and they'll fall back to free tier.

**Q: What if I accidentally grant beta to wrong person?**  
A: Just revoke it immediately via Firebase Console or API.

**Q: Is this system secure?**  
A: Yes - Firestore rules prevent self-granting. Only admins can modify beta fields.

---

## Next Steps

1. ✅ Add your email to `ADMIN_EMAILS` in Vercel
2. ✅ Grant yourself beta via Firebase Console
3. ✅ Test unlimited AI uploads
4. ✅ Grant beta to any testers
5. ✅ Test marketplace (optional)
6. ✅ Revoke before public launch

---

**You're all set to test without limits! 🚀**

Questions? Check the API response messages or Firebase Console for debugging.
