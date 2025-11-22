# 🧪 Test Verification Guide

Quick guide to verify all fixes are working correctly.

---

## 🎯 Quick Test (5 minutes)

### Test 1: Upload Small Audio File
```
1. Go to Dashboard → Upload
2. Upload an audio file under 10MB (e.g., a 3-minute MP3)
3. Wait for processing
4. Check gallery page for the asset

Expected Results:
✅ AI description is detailed and relevant (not generic "audio file")
✅ 10-15 meaningful tags appear
✅ Summary shows in the metadata section
✅ If audio had album art, it's preserved (not replaced)

Logs to Check:
[AUDIO] Using Whisper
[AUDIO] Got [number] chars
[AUDIO] Generating summary+tags
```

---

### Test 2: Mint NFT
```
1. Go to any asset in gallery
2. Click "Mint NFT" button
3. Connect ArConnect if not already
4. Click "Pay with Stripe"
5. Should see Stripe checkout with $4.99
6. (Optional) Complete payment with test card
7. If paid, click "Sign to Prove Ownership"
8. Approve ArConnect signature popup
9. Wait for mint to complete

Expected Results:
✅ Stripe shows $4.99 (not $2.99)
✅ ArConnect signature popup appears
✅ Signature succeeds (tries multiple API methods)
✅ Mint completes on Arweave + Polygon
✅ OpenSea link provided

Logs to Check:
💳 [NFT MINT] Checking payment requirements...
📝 Trying signMessage...
✅ Signature via [method]
🎉 [NFT MINT] DUAL-CHAIN SUCCESS!
```

---

### Test 3: Qdrant Graceful Degradation
```
1. Check Vercel environment variables
2. If QDRANT_URL is NOT set, upload any file
3. Check logs

Expected Results (Qdrant NOT configured):
✅ Upload succeeds without errors
✅ Logs show: "ℹ️ [QDRANT] Not configured"
✅ Logs show: "ℹ️ [QDRANT] Skipping upsert - not initialized"

Expected Results (Qdrant IS configured):
✅ Upload succeeds
✅ Logs show: "✅ [QDRANT] Client created"
✅ Logs show: "✅ [QDRANT] Vector upserted"
```

---

## 🐛 Common Issues & Solutions

### Issue: "JSON.parse error" in audio transcription
**Cause:** Old deployment still running
**Solution:** Wait 2-3 minutes for Vercel to finish deploying commit `6b30a94`

### Issue: ArConnect signature fails
**Cause:** ArConnect extension not installed or outdated
**Solution:** 
1. Install/update ArConnect extension
2. Refresh page
3. Try again - should cycle through 3 different API methods

### Issue: Qdrant errors in logs
**Cause:** QDRANT_URL set but invalid/collection doesn't exist
**Solution:** 
1. Either set valid Qdrant credentials
2. Or remove QDRANT_URL from Vercel (will gracefully skip)

### Issue: Payment doesn't work
**Cause:** Stripe keys not set
**Solution:** 
1. Check Vercel env vars for STRIPE_SECRET_KEY
2. Verify STRIPE_WEBHOOK_SECRET is set
3. Check Stripe dashboard for test mode

---

## 📝 Log Indicators

### ✅ Good Logs:
```
[AUDIO] Starting transcription
[AUDIO] Using Whisper (or Deepgram)
[AUDIO] Got 1234 chars
[AUDIO] Generating summary+tags
[QDRANT] Client created (or "Not configured")
[NFT MINT] Requesting user signature...
✅ Signature via signMessage
```

### ❌ Bad Logs:
```
JSON.parse error (means old code still running - wait for deploy)
TypeError: Cannot read property 'upsert' of null (should be fixed now)
No signature method available (ArConnect not installed)
Missing STRIPE_SECRET_KEY (env vars not set)
```

---

## 🚀 Deploy Status Check

**Check deployment status:**
```
https://vercel.com/[your-username]/[project-name]/deployments
```

**Look for these commits:**
- ✅ 6c492fb - NFT signature fix
- ✅ e4c1416 - Qdrant fix
- ✅ 8df2624 - Price update
- ✅ 6b30a94 - Audio transcription fix

**All should show "Ready" status**

---

## 📊 Performance Expectations

### Upload Processing Times:
- **Images:** 5-10 seconds (AI analysis)
- **Audio < 10MB:** 15-30 seconds (Whisper transcription)
- **Audio > 25MB:** 30-60 seconds (Deepgram transcription)
- **Video:** 30-60 seconds (frame extraction + AI)

### NFT Minting Times:
- **Payment:** Instant (Stripe redirect)
- **Signature:** 5-10 seconds (user approval)
- **Minting:** 20-40 seconds (blockchain upload)
- **Confirmation:** 1-2 minutes (block confirmation)

---

## 💰 Pricing Verification

### Free Tier:
- 5 NFT slots
- Unlimited uploads to salvage space
- AI analysis included

### Beta Users:
- Everything free (no limits)
- No payment required

### Pro Users:
- 50 NFT slots
- 10 free mints per month
- After 10 mints: $0.50 each
- AI analysis included

### Regular Users (Non-Pro):
- $4.99 per mint (Stripe)
- $1.99 per AI analysis (if not included)

**Test:** Verify Stripe checkout shows correct price based on user type

---

## 🎯 Success Criteria

All these should work without errors:

### Core Functionality:
- [ ] Upload audio/video/images
- [ ] AI generates descriptions and tags
- [ ] Summaries appear in UI
- [ ] Album art preserved (for audio)
- [ ] Gallery displays assets correctly

### NFT System:
- [ ] Payment flow works ($4.99)
- [ ] ArConnect signature works
- [ ] Minting completes on Arweave
- [ ] Minting completes on Polygon
- [ ] OpenSea link generated

### Infrastructure:
- [ ] No 404 errors for Qdrant (even if not configured)
- [ ] No JSON parse errors
- [ ] No "null" TypeErrors
- [ ] Logs are clear and helpful

---

## 🆘 If Something Breaks

1. **Check Vercel Logs:**
   - Functions tab
   - Look for red errors
   - Copy full error message

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

3. **Report With:**
   - Exact steps to reproduce
   - Full error message from logs
   - Screenshot if possible
   - What you expected vs what happened

---

## ✅ All Systems Go!

If you can complete all 3 quick tests above without errors, **everything is working perfectly** and you're ready to:

1. **Invite beta testers** (5-10 people)
2. **Gather feedback** on UX
3. **Polish UI** based on feedback
4. **Launch** to public! 🚀

---

## 📞 Next Steps

After testing:
1. ✅ Mark each item in the checklist
2. 📝 Note any issues found
3. 🎯 Report back with results
4. 🚀 Proceed to beta testing phase

**Everything should work perfectly now!**
