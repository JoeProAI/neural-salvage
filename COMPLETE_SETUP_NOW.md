# ⚡ Complete Your Setup - 5 Minutes

You have **9.451 AR** ready to go! Let's finish this.

---

## 🎯 All You Need To Do

### **Create `.env.local` file in project root:**

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Or on Windows:
copy .env.example .env.local
```

### **Add your Arweave wallet:**

Open `.env.local` and update this line:

```bash
# Replace with YOUR wallet JWK (the JSON file you have)
ARWEAVE_PRIVATE_KEY='{"kty":"RSA","n":"...PASTE YOUR ENTIRE WALLET JSON HERE..."}'
```

**How to get your wallet JWK:**
- If you have `platform-wallet.json` → Copy its entire contents
- Paste as single-line string
- Make sure it starts with `{` and ends with `}`

### **Update app URL:**

```bash
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app
```

---

## ✅ Test It Works

```bash
# Test your wallet connection
node scripts/check-balance.js

# Should show:
# Balance: 9.451 AR
# Estimated mints: ~9,000-45,000
```

```bash
# Test minting
node scripts/test-mint.js

# Should upload a test NFT to Arweave
```

---

## 🚀 Deploy to Vercel

```bash
# Add to Vercel environment variables:
# Dashboard → Settings → Environment Variables

ARWEAVE_PRIVATE_KEY=<your wallet JWK>
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app
NEXT_PUBLIC_ARWEAVE_ENABLED=true

# Then deploy:
git push origin main
```

---

## ✅ That's It!

With 9.451 AR you can mint:
- ~9,000 small images (100KB each)
- ~4,500 medium images (1MB each)  
- ~900 large images (10MB each)

**At $1/mint:** That's $9,000-45,000 in potential revenue! 💰

---

**Next:** Let's build that retro-futuristic design! 🎨
