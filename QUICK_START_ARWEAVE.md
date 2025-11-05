# 🚀 Quick Start: Arweave NFT Minting

**Get your platform minting NFTs in 10 minutes**

---

## ✅ Prerequisites

- [x] You have AR tokens (you do!)
- [x] Node.js installed
- [x] Project cloned locally

---

## 🎯 Quick Setup (10 Minutes)

### **Step 1: Generate Platform Wallet (2 min)**

```bash
node scripts/generate-wallet.js
```

This creates `scripts/platform-wallet.json` with your new wallet.

**Copy the address shown** - you'll need it next!

---

### **Step 2: Fund the Wallet (5 min)**

Send **0.5 AR** from your personal wallet to the platform wallet address.

Wait 2-5 minutes for confirmation, then verify:

```bash
node scripts/check-balance.js
```

You should see your balance!

---

### **Step 3: Add to Environment (1 min)**

Open `.env.local` and add:

```bash
# Get the wallet JSON from scripts/platform-wallet.json
# Copy it as a single-line string
ARWEAVE_PRIVATE_KEY='{"kty":"RSA","n":"...all the JSON here..."}'

# Your app URL
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app
```

**How to get single-line JSON:**

```bash
# Mac/Linux:
cat scripts/platform-wallet.json | tr -d '\n'

# Windows PowerShell:
(Get-Content scripts/platform-wallet.json) -join ''
```

---

### **Step 4: Test It Works (2 min)**

```bash
node scripts/test-mint.js
```

You should see:
```
✅ Test NFT Minted Successfully!
Transaction ID: abc123...
View at: https://arweave.net/abc123...
```

Wait 2-5 minutes, then visit the URL. You'll see your test NFT metadata!

---

## 🔒 Security Cleanup

```bash
# Delete the wallet file (it's now in .env.local)
rm scripts/platform-wallet.json

# Or on Windows:
del scripts\platform-wallet.json
```

**Make sure you backed it up first!** (password manager, USB drive, etc.)

---

## 🎉 You're Done!

Your platform can now mint real blockchain NFTs!

### **What You Can Do Now:**

1. **Deploy to Vercel**
   - Add `ARWEAVE_PRIVATE_KEY` to Vercel environment variables
   - Add `NEXT_PUBLIC_APP_URL`
   - Deploy!

2. **Test Through UI**
   - Upload an asset
   - Click "Mint as NFT"
   - Wait for confirmation
   - See your NFT on Arweave!

3. **Monitor Usage**
   - Run `node scripts/check-balance.js` daily
   - Set up alerts when balance < 0.5 AR
   - Track minting costs

---

## 💰 Cost Reference

| What | Cost | Notes |
|------|------|-------|
| Small image (10KB) | ~$0.01 | Profile pic |
| Medium image (100KB) | ~$0.05 | Photos |
| Large image (1MB) | ~$0.10-0.20 | HD photos |
| Video (10MB) | ~$1-2 | Short clips |

**Your 0.5 AR = ~500-1000 mints** (depending on file sizes)

---

## 🆘 Something Wrong?

### **"No balance" after funding:**
- Wait 2-5 minutes for Arweave confirmation
- Check on explorer: https://viewblock.io/arweave

### **"Invalid JWK" error:**
- Make sure entire JSON is copied (starts with `{` ends with `}`)
- Check for missing quotes or commas
- Must be single-line string in .env.local

### **Test mint fails:**
- Verify wallet has balance: `node scripts/check-balance.js`
- Check ARWEAVE_PRIVATE_KEY is set: `echo $ARWEAVE_PRIVATE_KEY` (should not be empty)
- Try again in a few minutes

---

## 📚 Full Docs

For detailed explanation: **ARWEAVE_PLATFORM_WALLET_SETUP.md**

---

**Happy Minting! 🎨**
