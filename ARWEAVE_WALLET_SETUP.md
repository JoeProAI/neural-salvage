# 🔑 Arweave Wallet Setup for NFT Minting

## 🚨 Critical Issue: Missing or Invalid ARWEAVE_PRIVATE_KEY

Your NFT minting is failing because the Arweave wallet is not properly configured in Vercel.

---

## ✅ Step-by-Step Fix

### **1. Create an Arweave Wallet (If You Don't Have One)**

**Option A: Use ArConnect (Browser Extension)**
```bash
1. Install ArConnect: https://arconnect.io
2. Create new wallet
3. Click "Export Key" → Download JWK file
```

**Option B: Use Arweave CLI**
```bash
npm install -g arweave
arweave key-create wallet.json
```

**Option C: Use Online Generator**
```
https://arweave.app/wallet
→ Generate Wallet
→ Download JWK file
```

---

### **2. Fund Your Wallet (Required for Minting)**

Your wallet needs AR tokens to pay for storage:

**Get AR tokens:**
```
1. Option 1: Buy on exchange (Binance, Coinbase, etc.)
   - Buy AR tokens
   - Withdraw to your wallet address
   
2. Option 2: Use a crypto on-ramp
   - https://arweave.org/wallet
   - Buy with credit card
   
3. Option 3: Free testnet tokens (for testing)
   - https://faucet.arweave.net
   - Enter your wallet address
```

**How much do you need?**
- **Minimum:** 0.01 AR (~$0.05) for testing
- **Production:** 1 AR (~$5) for ~100 NFT mints
- **Recommended:** 5 AR (~$25) for 500+ mints

---

### **3. Add Wallet to Vercel Environment Variables**

Your JWK file looks like this:
```json
{
  "kty": "RSA",
  "n": "very-long-base64-string...",
  "e": "AQAB",
  "d": "another-long-string...",
  "p": "long-string...",
  "q": "long-string...",
  "dp": "long-string...",
  "dq": "long-string...",
  "qi": "long-string..."
}
```

**Add to Vercel:**

1. **Go to Vercel Dashboard**
   - https://vercel.com/[your-username]/neural-salvage

2. **Navigate to Settings → Environment Variables**

3. **Add New Variable:**
   ```
   Name: ARWEAVE_PRIVATE_KEY
   Value: [PASTE ENTIRE JWK JSON - see below]
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

4. **IMPORTANT: Format the JSON Correctly**

   **Option A: Single-line (Recommended for Vercel)**
   ```
   {"kty":"RSA","n":"abc...","e":"AQAB","d":"xyz...","p":"...","q":"...","dp":"...","dq":"...","qi":"..."}
   ```

   **Option B: Multi-line (may have issues)**
   ```json
   {
     "kty": "RSA",
     "n": "abc...",
     "e": "AQAB",
     ...
   }
   ```

   **Tip:** Use an online JSON minifier to convert to single-line:
   - https://jsonformatter.org/json-minify

5. **Click "Save"**

6. **Redeploy Your App**
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

---

### **4. Verify It's Working**

After redeploying, try to mint an NFT. The logs should now show:

```
✅ [BUNDLR] JWK parsed successfully
✅ [BUNDLR] JWK validation passed
✅ [BUNDLR] Connected successfully
```

Instead of:
```
❌ [BUNDLR] Failed to parse JWK
❌ Cannot read properties of undefined (reading 'replace')
```

---

## 🔍 **Check Your Current Setup**

Run this to see if your key is set:

1. **Go to Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Look for:** `ARWEAVE_PRIVATE_KEY`
4. **Check:**
   - ✅ Is it set?
   - ✅ Is it in Production environment?
   - ✅ Does it start with `{` and end with `}`?
   - ✅ Does it have all required fields: `kty`, `n`, `e`, `d`, `p`, `q`, `dp`, `dq`, `qi`?

---

## 🚨 **Common Mistakes**

### **Mistake #1: Wrong Format**
```
❌ WRONG: Just the private key string
❌ WRONG: Missing quotes in JSON
❌ WRONG: Extra newlines or spaces
✅ RIGHT: Valid JSON with all fields
```

### **Mistake #2: Not Set in Production**
- Make sure to check **Production** environment checkbox
- Vercel has separate vars for Production/Preview/Development

### **Mistake #3: Not Redeploying**
- Environment variable changes require a redeploy
- Changes don't apply to existing deployments automatically

### **Mistake #4: Empty Wallet**
- Even with correct key, minting fails if wallet has 0 AR
- Check balance: https://viewblock.io/arweave/address/[YOUR_ADDRESS]

---

## 💰 **Check Your Wallet Balance**

1. **Get your wallet address:**
   ```bash
   # From JWK file, extract the 'n' field and convert to address
   # Or use: https://ar-tools.xyz/tools/jwk-to-address
   ```

2. **Check balance:**
   - https://viewblock.io/arweave/address/[YOUR_ADDRESS]
   - Should show: "Balance: X.XX AR"

3. **Need more AR?**
   - Buy on exchange
   - Or fund via https://arweave.org

---

## 🛡️ **SECURITY: Keep Your Key Safe!**

**⚠️ WARNING:** Your JWK file is like a password. Anyone with it can spend your AR tokens!

**Backup Locations (3 places):**
1. **Password Manager** (1Password, BitWarden)
   - Store as "Secure Note"
   - Name: "Neural Salvage Arweave Wallet"

2. **Encrypted USB Drive**
   - Copy JWK file
   - Store in safe/lockbox

3. **Paper Backup**
   - Write down the 12-word seed phrase (if you have it)
   - Store in different location

**NEVER:**
- ❌ Commit to GitHub
- ❌ Share in Slack/Discord
- ❌ Email to yourself
- ❌ Store in plain text files

**Current status:**
- ✅ In Vercel (encrypted environment variables)
- ✅ Should also have offline backup

---

## 📋 **Quick Checklist**

Before minting works, you need:

```
□ Arweave wallet created (JWK file)
□ Wallet funded with AR tokens (at least 0.01 AR)
□ ARWEAVE_PRIVATE_KEY set in Vercel
□ Variable is in Production environment
□ JSON is valid (no syntax errors)
□ App redeployed after setting variable
□ Backup of wallet in 3 locations
```

---

## 🆘 **Still Not Working?**

If you've done all the above and it still fails:

1. **Check the new error message** (should be more descriptive now)
2. **Share the exact error** (from Vercel logs)
3. **Verify JSON validity:**
   ```bash
   # Test if your JSON is valid
   echo '[PASTE YOUR JWK]' | node -e "console.log(JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8')))"
   ```

4. **Try these commands in Vercel Function logs:**
   ```
   Look for:
   - "🔑 [BUNDLR] Initializing with wallet key..."
   - "✅ [BUNDLR] JWK parsed successfully"
   - "✅ [BUNDLR] JWK validation passed"
   ```

---

## 💡 **What Happens After Setup?**

Once your wallet is properly configured:

1. ✅ NFT minting will work
2. ✅ Files uploaded to Arweave permanently
3. ✅ Each mint costs ~$0.01-0.10 (charged to your wallet)
4. ✅ Users pay $2.99, you pay storage, keep the difference (~$2.89 profit)

**Your wallet pays for storage upfront, but users reimburse you!**

---

## 📞 **Resources**

- **Arweave Docs:** https://docs.arweave.org
- **Bundlr Docs:** https://docs.bundlr.network
- **Check Wallet Balance:** https://viewblock.io/arweave
- **Buy AR Tokens:** https://arweave.org
- **JWK to Address:** https://ar-tools.xyz/tools/jwk-to-address

---

**Once this is set up, your NFT minting will work flawlessly!** 🚀
