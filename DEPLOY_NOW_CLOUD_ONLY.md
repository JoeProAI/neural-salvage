# ⚡ Deploy to Vercel - Cloud Only (No Local Testing)

**Get your retro-futuristic salvage shop live in 5 minutes**

---

## 🚀 Step 1: Push to GitHub

```bash
git push origin main
```

✅ **Done!** Vercel will auto-deploy from your GitHub repo.

---

## 🔑 Step 2: Add Environment Variables to Vercel

Go to: **https://vercel.com/your-username/neural-salvage**

Navigate to: **Settings → Environment Variables**

### **Add These Variables:**

```bash
# Arweave NFT System
ARWEAVE_PRIVATE_KEY={"kty":"RSA","n":"...YOUR WALLET JSON..."}
NEXT_PUBLIC_ARWEAVE_ENABLED=true
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app

# Firebase (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (if not already set)
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"
```

### **How to Get Your Arweave Wallet JSON:**

If you have `platform-wallet.json` or your wallet file:

```bash
# Windows PowerShell:
(Get-Content platform-wallet.json) -join ''

# Mac/Linux:
cat platform-wallet.json | tr -d '\n'
```

Copy the entire output (single line JSON) and paste as `ARWEAVE_PRIVATE_KEY` value.

---

## 🔄 Step 3: Redeploy

In Vercel Dashboard:
1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **"Redeploy"** button

Or trigger new deployment:
```bash
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

---

## ✅ Step 4: Verify It Works

### **Visit Your Site:**
https://neural-salvage.vercel.app

### **You Should See:**
- ✅ Retro-futuristic salvage theme
- ✅ Dark background with teal/orange accents
- ✅ Animated glowing effects
- ✅ "INITIATE SALVAGE" buttons

### **Test Auth:**
1. Click "ENTER →"
2. Sign up with email
3. Should redirect to dashboard

### **Test NFT Minting (After Login):**
1. Upload an asset
2. Click "Mint as NFT"
3. Wait for Arweave confirmation (~2-5 minutes)
4. Check transaction on: https://viewblock.io/arweave

---

## 🔍 Check Deployment Logs

If something's wrong, check Vercel logs:

1. Vercel Dashboard → Your Project
2. Click latest deployment
3. Go to **"Functions"** or **"Build Logs"** tab
4. Look for errors

### **Common Issues:**

**"Module not found":**
- Check `package.json` has all dependencies
- Redeploy with clear cache

**"Invalid environment variable":**
- Check ARWEAVE_PRIVATE_KEY is valid JSON
- Check no extra quotes or spaces

**"Firebase auth failed":**
- Verify Firebase config is correct
- Check Firebase Admin key has proper `\n` newlines

---

## 💰 Verify Arweave Balance

You can't run scripts locally, but you can check your balance online:

**Option 1: ViewBlock Explorer**
```
https://viewblock.io/arweave/address/YOUR_WALLET_ADDRESS
```

**Option 2: Arweave.app**
```
https://arweave.app/
# Import your wallet to view balance
```

**Your balance:** 9.451 AR (~$94)
**Can mint:** ~9,000-45,000 NFTs

---

## 🎯 What Happens Next

### **Users Can Now:**
1. ✅ Visit your site (retro-futuristic design)
2. ✅ Sign up / Sign in
3. ✅ Upload unlimited assets (Firebase)
4. ✅ Mint NFTs to Arweave ($1 each)
5. ✅ Own permanent blockchain NFTs

### **You Get:**
- $0.90 profit per NFT mint
- Firebase costs ~$10-20/month for 100 users
- NFT revenue covers hosting costs + profit!

---

## 📊 Monitor Your System

### **Check NFT Mints:**
```
https://viewblock.io/arweave/address/YOUR_WALLET_ADDRESS/txs
```

### **Check Vercel Analytics:**
```
Vercel Dashboard → Analytics tab
```

### **Check Firebase Usage:**
```
Firebase Console → Usage tab
```

---

## 🚨 If You Need to Test Wallet

Since you can't run scripts locally, test on production:

1. Go to: `https://neural-salvage.vercel.app/dashboard`
2. Upload a test image
3. Click "Mint as NFT"
4. It will use your platform wallet (9.451 AR)
5. Check result in 2-5 minutes

**First mint = proof your system works!**

---

## ⚡ Quick Reference

| Task | URL/Command |
|------|-------------|
| **Your Live Site** | https://neural-salvage.vercel.app |
| **Vercel Dashboard** | https://vercel.com |
| **Check AR Balance** | https://viewblock.io/arweave |
| **Firebase Console** | https://console.firebase.google.com |
| **Deploy** | `git push origin main` |
| **Environment Vars** | Vercel → Settings → Environment Variables |

---

## ✅ Deployment Checklist

- [ ] Pushed latest code to GitHub
- [ ] Added ARWEAVE_PRIVATE_KEY to Vercel
- [ ] Added NEXT_PUBLIC_ARWEAVE_ENABLED=true
- [ ] Added NEXT_PUBLIC_APP_URL
- [ ] Redeployed on Vercel
- [ ] Site loads with retro theme
- [ ] Can sign up / sign in
- [ ] Can upload assets
- [ ] Can mint test NFT
- [ ] NFT appears on Arweave

---

**You're live! No local setup needed!** 🚀
