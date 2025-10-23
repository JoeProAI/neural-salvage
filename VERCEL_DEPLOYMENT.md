# 🚀 Deploy to Vercel (No Local Setup Required)

## Step-by-Step Deployment Guide

---

## 📋 Prerequisites

### 1. Create Arweave Wallet (5 min)

```
1. Go to https://arweave.app/welcome
2. Click "Create new wallet"
3. WRITE DOWN your 12-word seed phrase
   → Save in password manager (1Password, Bitwarden)
   → Write on paper, store in safe
   → YOU CANNOT RECOVER WITHOUT THIS
4. Download wallet JWK file
5. Copy your wallet address
```

### 2. Fund Wallet

**Testing (FREE):**
```
→ Go to https://faucet.arweave.net
→ Paste wallet address
→ Get free testnet AR tokens
```

**Production:**
```
→ Buy AR from exchange (Binance, KuCoin, Gate.io)
→ Send $50-100 to your wallet
→ This covers ~500-1000 NFT mints
```

### 3. Prepare JWK

```bash
# Open your arweave-wallet.json
# Copy ENTIRE contents
# Minify to single line (remove line breaks)

# Use online JSON minifier or:
cat arweave-wallet.json | jq -c

# Result: {"kty":"RSA","n":"...","e":"AQAB",...}
```

---

## 🚀 Deployment Steps

### Step 1: Push Code to GitHub

```bash
cd "c:\Projects\The Machine\Nueral Salvage\neural-salvage"

git add .
git commit -m "Add NFT minting with Arweave"
git push origin main
```

### Step 2: Create Vercel Project

```
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. Configure:
   Framework: Next.js
   Root Directory: ./
   Build Command: npm run build
5. DON'T deploy yet!
```

### Step 3: Add Environment Variables

**Go to: Settings → Environment Variables**

**For EACH variable below:**
- Click "Add Variable"
- Name: (copy exactly)
- Value: (paste value)
- Environment: **Select ALL THREE** (Production, Preview, Development)
- Click "Save"

#### Required Variables:

```env
# Daytona AI
DAYTONA_API_KEY=your_daytona_api_key_here
DAYTONA_API_URL=https://app.daytona.io/api
DAYTONA_TARGET=us

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Firebase Public Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-fbsvc@nueral-salvage.iam.gserviceaccount.com
```

**FIREBASE_ADMIN_PRIVATE_KEY** (Keep quotes and \n):
```
"-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key_content_here\n-----END PRIVATE KEY-----\n"
```

**Continued:**
```env
# Qdrant Vector DB
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here

# Stripe
STRIPE_CONNECT_WEBHOOK_SECRET=your_stripe_webhook_secret_here
PLATFORM_FEE_PERCENTAGE=10

# Arweave NFT Minting - PASTE YOUR JWK HERE
ARWEAVE_PRIVATE_KEY={"kty":"RSA","n":"YOUR_MINIFIED_JWK_HERE"}

# App URL - UPDATE AFTER FIRST DEPLOY
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**⚠️ CRITICAL:**
- `ARWEAVE_PRIVATE_KEY` must be minified JSON (single line)
- Keep all quotes and special characters
- Test with testnet wallet first!

### Step 4: Deploy

```
1. After adding ALL env vars
2. Go to: Deployments tab
3. Click "Deploy" (or trigger redeploy)
4. Wait 2-3 minutes for build
5. You'll get URL: https://your-app-name.vercel.app
```

### Step 5: Update App URL

```
1. Copy your Vercel URL
2. Go back to: Settings → Environment Variables
3. Find: NEXT_PUBLIC_APP_URL
4. Edit value to your actual URL
5. Save
6. Redeploy from Deployments tab
```

### Step 6: Test Your Deployment

```
1. Visit your Vercel URL
2. Sign in with Google
3. Upload test image
4. Click "Mint as NFT"
5. Install ArConnect: https://arconnect.io
6. Connect wallet
7. Mint NFT
8. Verify on: https://viewblock.io/arweave
```

---

## ✅ Post-Deployment Checklist

- [ ] All environment variables added
- [ ] Deployment successful (no errors)
- [ ] Can sign in with Google
- [ ] Can upload assets
- [ ] NFT minting shows cost estimate
- [ ] ArConnect wallet connects
- [ ] Test NFT mints successfully
- [ ] NFT visible on Arweave explorer

---

## 🔧 Troubleshooting

### "Build Failed"

```
→ Check Vercel logs for errors
→ Verify all env vars are added
→ Check for TypeScript errors
→ Ensure all dependencies installed
```

### "Can't Connect to Firebase"

```
→ Verify Firebase env vars are correct
→ Check FIREBASE_ADMIN_PRIVATE_KEY has quotes and \n
→ Ensure Firebase services enabled (Auth, Firestore, Storage)
```

### "NFT Minting Fails"

```
→ Check ARWEAVE_PRIVATE_KEY is valid
→ Verify wallet has AR tokens
→ Check Arweave network status
→ Review Vercel function logs
```

### "ArConnect Not Found"

```
→ User needs to install: https://arconnect.io
→ Extension only works in browser, not mobile
```

---

## 🎯 Next Steps

After successful deployment:

1. **Review**: `SECURITY_IRONCLAD.md` - Implement security measures
2. **Setup**: `BACKUP_RECOVERY.md` - Configure backups
3. **Monitor**: Check Vercel logs daily
4. **Test**: Mint a few NFTs on testnet
5. **Launch**: Switch to mainnet wallet

---

## 📞 Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Arweave Explorer:** https://viewblock.io/arweave
**ArConnect Wallet:** https://arconnect.io
**Testnet Faucet:** https://faucet.arweave.net

**Your deployment is live! Now secure it with the security guide.** 🚀
