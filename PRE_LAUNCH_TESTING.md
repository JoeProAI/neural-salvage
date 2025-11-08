# 🧪 PRE-LAUNCH TESTING GUIDE - Complete Feature Verification

## **Testing Philosophy**

**Goal:** Verify EVERY feature works perfectly before launch  
**Method:** Manual testing + Automated testing + Load testing  
**Standard:** Production-ready quality

---

## 📋 **TESTING CHECKLIST**

### **Phase 1: Feature Testing (Manual)**

#### **1.1 Authentication & User Management**

**Test 1: Sign Up**
```
□ Go to /signup
□ Enter email: test1@example.com
□ Enter password: TestPassword123!
□ Click "Sign Up"
□ Verify account created in Firebase
□ Check user redirected to dashboard
□ Verify session persists on refresh

Expected: ✅ User created, logged in, redirected
```

**Test 2: Login**
```
□ Log out
□ Go to /login
□ Enter credentials
□ Click "Login"
□ Verify redirected to dashboard

Expected: ✅ Login successful
```

**Test 3: Profile Management**
```
□ Go to profile settings
□ Update display name
□ Upload profile picture
□ Click "Save"
□ Refresh page
□ Verify changes saved

Expected: ✅ Profile updated
```

**Test 4: Password Reset**
```
□ Log out
□ Click "Forgot Password"
□ Enter email
□ Check email for reset link
□ Click link
□ Set new password
□ Log in with new password

Expected: ✅ Password reset successful
```

**Test 5: Session Persistence**
```
□ Log in
□ Close browser
□ Reopen browser
□ Go to site
□ Verify still logged in

Expected: ✅ Session persists
```

---

#### **1.2 Media Upload**

**Test 6: Image Upload (Small)**
```
□ Go to upload page
□ Select 5 MB image (PNG)
□ Drag & drop onto upload zone
□ Verify preview appears
□ Verify progress bar shows
□ Verify upload completes
□ Check Firebase Storage

Expected: ✅ Image uploaded, stored
```

**Test 7: Image Upload (Large)**
```
□ Select 200 MB image
□ Upload via click interface
□ Monitor progress bar
□ Verify completes without timeout

Expected: ✅ Large image uploads successfully
```

**Test 8: Audio Upload (MP3)**
```
□ Select 50 MB MP3 file
□ Upload
□ Verify audio preview plays
□ Check file stored

Expected: ✅ Audio uploaded, playable
```

**Test 9: Audio Upload (FLAC)**
```
□ Select 100 MB FLAC file
□ Upload
□ Verify accepts format
□ Check stored correctly

Expected: ✅ FLAC accepted and stored
```

**Test 10: Video Upload (MP4)**
```
□ Select 300 MB MP4 video
□ Upload
□ Verify video preview works
□ Check stored

Expected: ✅ Video uploaded, playable
```

**Test 11: Multi-file Upload**
```
□ Select 10 files (mixed types)
□ Upload all at once
□ Verify all appear in queue
□ Verify all upload successfully
□ Check all stored

Expected: ✅ All files uploaded
```

**Test 12: File Size Limit**
```
□ Try to upload 600 MB file
□ Verify error message appears
□ Message says "Max 500 MB"

Expected: ✅ Rejected with clear error
```

**Test 13: Invalid File Type**
```
□ Try to upload .exe file
□ Verify rejected
□ Error message clear

Expected: ✅ Rejected with error
```

---

#### **1.3 AI Metadata Generation**

**Test 14: Image Analysis**
```
□ Upload scenic photo
□ Wait for AI processing
□ Check generated title
□ Check generated description
□ Verify accuracy

Expected: ✅ Accurate, creative metadata
```

**Test 15: Multiple Images**
```
□ Upload 5 different images
□ Check each gets unique metadata
□ Verify no duplicates
□ Check quality of descriptions

Expected: ✅ Unique, quality metadata for each
```

**Test 16: AI Edit Capability**
```
□ Upload image
□ See AI metadata
□ Click "Edit"
□ Modify title and description
□ Save changes
□ Verify saved

Expected: ✅ Can edit AI-generated content
```

**Test 17: AI Error Handling**
```
□ Disconnect internet
□ Upload image
□ Verify graceful fallback
□ User can still enter metadata manually

Expected: ✅ Works without AI if needed
```

---

#### **1.4 NFT Minting**

**Test 18: Basic NFT Mint**
```
□ Upload image
□ Click "Mint NFT"
□ Connect wallet (ArConnect)
□ Verify cost shown: $4.99
□ Sign transaction
□ Wait for confirmation (2-3 min)
□ Verify NFT appears in gallery
□ Check Arweave transaction ID

Expected: ✅ NFT minted successfully
```

**Test 19: Wallet Signing**
```
□ Start mint process
□ When wallet prompt appears
□ Click "Sign"
□ Verify signature captured
□ Check transaction submitted

Expected: ✅ Signature works
```

**Test 20: Minting Multiple NFTs**
```
□ Mint 5 NFTs in a row
□ Verify each processes separately
□ Check all appear in gallery
□ Verify no duplicates

Expected: ✅ All 5 minted correctly
```

**Test 21: Audio NFT Mint**
```
□ Upload MP3 file
□ Add title/description
□ Mint as NFT
□ Verify stored on Arweave
□ Check appears in gallery with 🎵 badge

Expected: ✅ Audio NFT works
```

**Test 22: Video NFT Mint**
```
□ Upload MP4 file
□ Mint as NFT
□ Check gallery shows 🎬 badge
□ Verify video playable

Expected: ✅ Video NFT works
```

**Test 23: Large File NFT**
```
□ Upload 400 MB file
□ Mint as NFT
□ Monitor upload to Arweave
□ Verify completes successfully
□ Check cost calculation accurate

Expected: ✅ Large file mints correctly
```

**Test 24: Cost Estimation**
```
□ Upload 10 MB file
□ Check estimated cost before minting
□ Verify shows ~$4.99
□ Complete mint
□ Verify actual cost matches estimate

Expected: ✅ Estimate accurate
```

**Test 25: Minting Without Wallet**
```
□ Log in
□ Try to mint without connecting wallet
□ Verify error message
□ Message instructs to connect wallet

Expected: ✅ Clear error, helpful message
```

---

#### **1.5 NFT Gallery**

**Test 26: Gallery Display**
```
□ Go to "My NFTs"
□ Verify all minted NFTs appear
□ Check grid layout responsive
□ Verify images load correctly
□ Check badges display (status, media type)

Expected: ✅ Gallery displays beautifully
```

**Test 27: Gallery Performance**
```
□ Load gallery with 20+ NFTs
□ Check load time (should be < 2 seconds)
□ Verify Firebase cache used
□ Check no duplicate NFTs

Expected: ✅ Fast load, no duplicates
```

**Test 28: Media Type Badges**
```
□ Mint image, audio, video NFTs
□ Go to gallery
□ Verify correct badges:
  - 🎵 for audio
  - 🎬 for video
  - No badge for images

Expected: ✅ Badges show correctly
```

**Test 29: Status Indicators**
```
□ During minting (before confirm)
□ Check NFT shows "pending" status
□ After confirmation
□ Check shows "confirmed" status
□ Badge colors correct (amber → green)

Expected: ✅ Status updates correctly
```

**Test 30: Gallery Sorting**
```
□ Mint NFTs at different times
□ Check gallery sorts by date (newest first)
□ Verify order correct

Expected: ✅ Sorted by date
```

**Test 31: Empty Gallery**
```
□ Create new account
□ Go to gallery before minting
□ Check empty state displays
□ Message helpful and encouraging

Expected: ✅ Good empty state UX
```

---

#### **1.6 NFT Detail Page**

**Test 32: Image NFT Detail**
```
□ Click image NFT in gallery
□ Verify high-res image displays
□ Check metadata shows correctly
□ Verify blockchain links work
□ Check "Download" button (if owner)

Expected: ✅ All details display
```

**Test 33: Audio NFT Detail**
```
□ Click audio NFT
□ Verify audio player appears
□ Click play
□ Verify plays correctly
□ Check waveform animates
□ Test volume control
□ Test progress bar
□ Test download button

Expected: ✅ Audio player works perfectly
```

**Test 34: Video NFT Detail**
```
□ Click video NFT
□ Verify video player appears
□ Click play
□ Test fullscreen
□ Test controls (pause, seek, volume)
□ Check download works

Expected: ✅ Video player works perfectly
```

**Test 35: Blockchain Verification**
```
□ On NFT detail page
□ Click "View on Arweave"
□ Opens arweave.net/[tx-id]
□ Verify NFT data visible
□ Click "View on ViewBlock"
□ Opens ViewBlock explorer
□ Verify transaction found

Expected: ✅ Links work, data verifiable
```

**Test 36: Metadata Display**
```
□ Check detail page shows:
  - Title
  - Description
  - Minted date
  - Royalty percentage
  - Owner address
  - Transaction ID
  - File size
  - Media type

Expected: ✅ All metadata present
```

**Test 37: Owner vs Non-Owner View**
```
□ View your own NFT
□ Verify "Download" button visible
□ Verify "List for Sale" button visible
□ Log out
□ View same NFT (if public)
□ Verify download button hidden

Expected: ✅ Permissions correct
```

---

#### **1.7 Marketplace Listing**

**Test 38: List for Sale**
```
□ Go to NFT detail page (your NFT)
□ Click "List for Sale"
□ Modal opens
□ Enter price: $50
□ Verify AR conversion shows
□ Select duration: 30 days
□ Check fee breakdown (2%)
□ Click "List for Sale"
□ Sign transaction with wallet
□ Verify success message

Expected: ✅ Listing created
```

**Test 39: USD to AR Conversion**
```
□ Open list modal
□ Enter $100
□ Verify AR amount shows
□ Check exchange rate reasonable
□ Change to $500
□ Verify AR updates

Expected: ✅ Conversion accurate, live
```

**Test 40: Duration Options**
```
□ Open list modal
□ Check duration options:
  - 7 days
  - 30 days
  - 90 days
  - Forever
□ Select each
□ Verify saves selection

Expected: ✅ All options work
```

**Test 41: Fee Calculation**
```
□ Enter price: $100
□ Check fee display shows $2 (2%)
□ Check net earnings shows $98
□ Change price to $1000
□ Verify fee updates to $20
□ Verify net shows $980

Expected: ✅ Fees calculated correctly
```

**Test 42: BazAR Integration**
```
□ List NFT
□ Wait 2-3 minutes
□ Go to bazar.arweave.dev
□ Search for your NFT (by ID or address)
□ Verify listing appears
□ Check price correct
□ Check duration correct

Expected: ✅ NFT listed on BazAR
```

**Test 43: Listing Without Wallet**
```
□ Disconnect wallet
□ Try to list NFT
□ Verify error message
□ Instructions to connect wallet

Expected: ✅ Clear error message
```

---

#### **1.8 Royalty System**

**Test 44: Royalty Percentage**
```
□ Mint NFT
□ Check default royalty: 3%
□ Verify stored in blockchain tags
□ Check viewable on detail page

Expected: ✅ 3% royalty set
```

**Test 45: Royalty on Resale (Simulated)**
```
Note: Requires actual sale to test fully
□ List NFT for $100
□ Calculate expected royalty: $3 (3%)
□ Verify royalty recipient is original creator address

Expected: ✅ Royalty structure correct
```

---

### **Phase 2: Error Handling & Edge Cases**

**Test 46: Network Offline**
```
□ Turn off internet
□ Try to load gallery
□ Verify graceful error
□ Turn internet back on
□ Verify auto-recovers

Expected: ✅ Handles offline gracefully
```

**Test 47: Slow Network**
```
□ Throttle network to 3G
□ Upload file
□ Verify progress bar accurate
□ Verify completes successfully

Expected: ✅ Works on slow connection
```

**Test 48: Firebase Permission Error**
```
□ Temporarily restrict Firestore rules
□ Try to load gallery
□ Verify falls back to blockchain
□ Verify still shows NFTs

Expected: ✅ Fallback works
```

**Test 49: Arweave Query Failure**
```
Note: Simulate by blocking Arweave API
□ Try to load NFTs
□ Verify uses Firebase cache
□ Verify doesn't crash

Expected: ✅ Resilient to blockchain issues
```

**Test 50: Wallet Connection Failure**
```
□ Try to connect wallet (simulate rejection)
□ Click cancel in wallet popup
□ Verify app doesn't crash
□ Verify helpful error message

Expected: ✅ Handles wallet rejection
```

**Test 51: Transaction Failure**
```
□ Start mint with insufficient AR in wallet
□ Verify error caught
□ Message explains issue
□ App doesn't crash

Expected: ✅ Transaction errors handled
```

**Test 52: Session Expiration**
```
□ Log in
□ Wait for session to expire (or force expire)
□ Try to perform action
□ Verify redirected to login
□ Login again
□ Verify returns to intended action

Expected: ✅ Session handled gracefully
```

**Test 53: Invalid Image Format**
```
□ Rename .txt file to .png
□ Try to upload
□ Verify rejected
□ Error message clear

Expected: ✅ File validation works
```

**Test 54: Concurrent Actions**
```
□ Start minting NFT
□ While processing, try to mint another
□ Verify queuing works
□ Or error prevents concurrent mints

Expected: ✅ Handles concurrency
```

**Test 55: Browser Back Button**
```
□ Navigate through app
□ Use browser back button
□ Verify navigation correct
□ No data loss

Expected: ✅ Back button works properly
```

---

### **Phase 3: Mobile & Responsive Testing**

**Test 56: Mobile Phone (iOS)**
```
□ Open site on iPhone
□ Test all core features:
  - Sign up/login
  - Upload (use camera)
  - Mint NFT
  - View gallery
  - View detail page
  - List for sale
□ Verify UI responsive
□ Check touch interactions work

Expected: ✅ Fully functional on mobile
```

**Test 57: Mobile Phone (Android)**
```
□ Repeat Test 56 on Android device
□ Test wallet connection (mobile wallets)
□ Verify all features work

Expected: ✅ Works on Android
```

**Test 58: Tablet (iPad)**
```
□ Test on iPad
□ Check layout optimized for tablet
□ Verify touch gestures work
□ Test landscape and portrait

Expected: ✅ Tablet experience good
```

**Test 59: Small Desktop (1366x768)**
```
□ Resize browser to 1366x768
□ Check layout doesn't break
□ Verify scrolling works
□ All content accessible

Expected: ✅ Works on small screens
```

**Test 60: Large Desktop (4K)**
```
□ View on 4K monitor
□ Check layout scales well
□ Images high quality
□ No stretched elements

Expected: ✅ Looks good on 4K
```

---

### **Phase 4: Performance Testing**

**Test 61: Page Load Speed**
```
□ Use Chrome DevTools Lighthouse
□ Run performance audit
□ Target scores:
  - Performance: >90
  - Accessibility: >90
  - Best Practices: >90
  - SEO: >80

Expected: ✅ Good Lighthouse scores
```

**Test 62: Gallery Load Time (Many NFTs)**
```
□ Account with 100+ NFTs
□ Load gallery
□ Measure time to first render
□ Target: < 2 seconds

Expected: ✅ Loads quickly even with many NFTs
```

**Test 63: Image Optimization**
```
□ Check images use modern formats (WebP)
□ Verify lazy loading implemented
□ Check no massive images slow page

Expected: ✅ Images optimized
```

**Test 64: Bundle Size**
```
□ Check JavaScript bundle size
□ Target: < 500 KB (gzipped)
□ Use code splitting if needed

Expected: ✅ Bundle size reasonable
```

**Test 65: API Response Times**
```
□ Test mint API: < 5 seconds
□ Test upload API: depends on file size
□ Test list API: < 2 seconds
□ Test gallery query: < 1 second

Expected: ✅ APIs respond quickly
```

---

### **Phase 5: Security Testing**

**Test 66: SQL Injection (N/A - NoSQL)**
```
□ Try injecting malicious input in forms
□ Verify Firebase handles safely
□ No data exposure

Expected: ✅ No SQL injection vulnerability
```

**Test 67: XSS Prevention**
```
□ Try injecting <script> tags in metadata
□ Verify escaped/sanitized
□ Check doesn't execute

Expected: ✅ XSS prevented
```

**Test 68: CSRF Protection**
```
□ Verify Firebase auth tokens used
□ Check API routes validate tokens
□ Try making unauthorized requests

Expected: ✅ CSRF protected
```

**Test 69: File Upload Security**
```
□ Try uploading malicious files
□ Verify file type validation
□ Check file size limits enforced
□ Verify stored safely

Expected: ✅ Upload security good
```

**Test 70: Environment Variables**
```
□ Check .env.local not committed to Git
□ Verify API keys not exposed in client
□ Check sensitive data server-side only

Expected: ✅ Secrets secure
```

**Test 71: Rate Limiting**
```
□ Try minting 20 NFTs rapidly
□ Verify rate limiting kicks in
□ Check error message helpful

Expected: ✅ Rate limiting works
```

**Test 72: Auth Token Security**
```
□ Check tokens stored securely (httpOnly if possible)
□ Verify tokens expire appropriately
□ Test token refresh works

Expected: ✅ Auth secure
```

---

### **Phase 6: Load Testing**

**Test 73: Concurrent Users (Daytona Sandbox)**
```
□ Use Daytona.io to spin up test instances
□ Simulate 100 concurrent users
□ Each user:
  - Signs up
  - Uploads file
  - Mints NFT
  - Views gallery
□ Monitor:
  - Response times
  - Error rates
  - Firebase/Vercel metrics

Expected: ✅ Handles 100 users smoothly
```

**Test 74: Database Load**
```
□ Simulate 1000 NFTs in database
□ Query performance
□ Check indexes work
□ Measure query times

Expected: ✅ Database performs well
```

**Test 75: Storage Load**
```
□ Upload 100 GB of files total
□ Check Firebase Storage handles it
□ Verify download speeds acceptable

Expected: ✅ Storage scales
```

**Test 76: Arweave Load**
```
□ Mint 50 NFTs in parallel
□ Monitor Bundlr performance
□ Check transaction confirmations
□ Verify no failures

Expected: ✅ Blockchain handles load
```

**Test 77: API Rate Limits**
```
□ Make 1000 API calls rapidly
□ Check Vercel doesn't throttle
□ Check Firebase quota not exceeded
□ Monitor for 429 errors

Expected: ✅ Within rate limits
```

---

## 📊 **Test Result Tracking**

### **Create Testing Spreadsheet:**

```
| Test # | Feature | Status | Issues Found | Fixed? | Notes |
|--------|---------|--------|--------------|--------|-------|
| 1      | Sign Up | ✅     | None         | N/A    |       |
| 2      | Login   | ❌     | Slow load    | 🚧     | Working on it |
| ...    | ...     | ...    | ...          | ...    | ...   |
```

### **Priority Levels:**
- 🔴 **Critical** - Blocks launch, must fix immediately
- 🟡 **High** - Important, fix before launch
- 🟢 **Medium** - Should fix, can launch without
- ⚪ **Low** - Nice to have, post-launch OK

---

## 🎯 **Success Criteria**

### **Minimum to Launch:**
- ✅ All critical features work (auth, upload, mint, gallery)
- ✅ No critical bugs
- ✅ Security tests pass
- ✅ Mobile responsive
- ✅ Performance acceptable (< 3s load)
- ✅ Can handle 50 concurrent users

### **Ideal Before Launch:**
- ✅ All features tested
- ✅ All high-priority issues fixed
- ✅ Load tested to 100+ concurrent users
- ✅ Monitoring in place (PostHog, Sentry)
- ✅ Intercom chat working

---

## 🚀 **Next Steps After Testing**

1. **Fix all critical issues**
2. **Document remaining issues** (for post-launch)
3. **Final security audit**
4. **Set up monitoring**
5. **Deploy to production**
6. **Launch!** 🎉

---

**Estimated Testing Time:** 2-3 days for thorough testing  
**Recommended:** Test with 5-10 beta users before public launch

Ready to start testing? Let's go! 🧪
