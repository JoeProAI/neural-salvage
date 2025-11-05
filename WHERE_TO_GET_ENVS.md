# 🔑 Where to Get Your Environment Variables

**Complete guide to finding all your API keys and credentials**

---

## 🎯 Quick Checklist

You need these for Vercel deployment:

- [ ] Arweave wallet JSON
- [ ] Firebase configuration (6 values)
- [ ] Firebase Admin credentials (3 values)
- [ ] Optional: Daytona, OpenAI, Qdrant

---

## 1. 🔶 ARWEAVE WALLET

### **What You Need:**
```bash
ARWEAVE_PRIVATE_KEY={"kty":"RSA","n":"...full wallet JSON..."}
NEXT_PUBLIC_ARWEAVE_ENABLED=true
```

### **Where to Get It:**

#### **Option A: You Already Have a Wallet File**

If you have a file named:
- `platform-wallet.json`
- `arweave-wallet.json`
- Or any `.json` wallet file

**Windows PowerShell:**
```powershell
# Navigate to where your wallet is
cd "C:\Path\To\Your\Wallet"

# Copy wallet as single line
(Get-Content platform-wallet.json) -join ''
```

Copy the output and paste it as the value for `ARWEAVE_PRIVATE_KEY` in Vercel.

---

#### **Option B: Generate New Wallet**

If you don't have a wallet yet:

```powershell
cd "c:\Projects\The Machine\Nueral Salvage\neural-salvage"
node scripts/generate-wallet.js
```

This creates `platform-wallet.json` with your new wallet.

**⚠️ IMPORTANT:** 
- Backup this file in 3 places (password manager, encrypted USB, cloud vault)
- Never commit it to GitHub
- You'll need to fund it with AR tokens

**Get wallet address:**
```powershell
node scripts/get-wallet-address.js
```

**Fund your wallet:**
1. Buy AR on exchange (Binance, Kraken, etc.)
2. Send AR to your wallet address
3. Check balance: https://viewblock.io/arweave/address/YOUR_ADDRESS

---

## 2. 🔥 FIREBASE CONFIGURATION

### **What You Need:**
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### **Where to Get It:**

1. **Go to Firebase Console:**
   - https://console.firebase.google.com

2. **Select Your Project:**
   - Click on "neural-salvage" (or your project name)

3. **Get Configuration:**
   - Click ⚙️ Settings icon (top left)
   - Click "Project settings"
   - Scroll down to "Your apps" section
   - Look for "Web app" (if you don't have one, click "Add app" → Web)

4. **Copy the Config:**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",              // ← NEXT_PUBLIC_FIREBASE_API_KEY
     authDomain: "your-project.firebaseapp.com",  // ← NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     projectId: "your-project",      // ← NEXT_PUBLIC_FIREBASE_PROJECT_ID
     storageBucket: "your-project.appspot.com",   // ← NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "123456789", // ← NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123:web:abc123"       // ← NEXT_PUBLIC_FIREBASE_APP_ID
   };
   ```

---

## 3. 🔒 FIREBASE ADMIN SDK

### **What You Need:**
```bash
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### **Where to Get It:**

1. **Firebase Console:**
   - https://console.firebase.google.com

2. **Go to Project Settings:**
   - Click ⚙️ Settings → Project settings

3. **Service Accounts Tab:**
   - Click "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key"
   - A JSON file will download

4. **Extract from JSON:**
   ```json
   {
     "project_id": "your-project",           // ← FIREBASE_ADMIN_PROJECT_ID
     "client_email": "firebase-adminsdk@...", // ← FIREBASE_ADMIN_CLIENT_EMAIL
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   }
   ```

**⚠️ For FIREBASE_ADMIN_PRIVATE_KEY:**
- Copy the entire `private_key` value INCLUDING the quotes
- Make sure `\n` stays as `\n` (don't replace with actual newlines)
- Example: `"-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"`

---

## 4. 🌐 APPLICATION URL

### **What You Need:**
```bash
NEXT_PUBLIC_APP_URL=
```

### **Where to Get It:**

**For Vercel:**
1. Go to your Vercel dashboard
2. Click your project
3. Your URL is shown at the top

Common formats:
- `https://neural-salvage.vercel.app`
- `https://your-project-name.vercel.app`
- Or your custom domain if you added one

**⚠️ No trailing slash!**
- ✅ `https://neural-salvage.vercel.app`
- ❌ `https://neural-salvage.vercel.app/`

---

## 5. 🤖 OPTIONAL: AI/ANALYTICS (If You Want Them)

### **Daytona API (AI Processing):**

```bash
DAYTONA_API_KEY=
DAYTONA_API_URL=https://app.daytona.io/api
DAYTONA_TARGET=us
```

**Where:** https://daytona.io → Dashboard → API Keys

---

### **OpenAI API (AI Features):**

```bash
OPENAI_API_KEY=sk-proj-...
```

**Where:** https://platform.openai.com/api-keys

---

### **Qdrant (Vector Database for Search):**

```bash
QDRANT_URL=
QDRANT_API_KEY=
```

**Where:** https://cloud.qdrant.io → Dashboard → Your cluster

---

## 📋 Complete Environment Variables for Vercel

Copy this template and fill in your values:

```bash
# === REQUIRED: Arweave NFT System ===
ARWEAVE_PRIVATE_KEY={"kty":"RSA","n":"..."}
NEXT_PUBLIC_ARWEAVE_ENABLED=true

# === REQUIRED: App Configuration ===
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app

# === REQUIRED: Firebase Client ===
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# === REQUIRED: Firebase Admin ===
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# === OPTIONAL: AI & Analytics ===
DAYTONA_API_KEY=
DAYTONA_API_URL=https://app.daytona.io/api
DAYTONA_TARGET=us
OPENAI_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
```

---

## 🚀 How to Add to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com

2. **Select Your Project:**
   - Click "neural-salvage"

3. **Go to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables"

4. **Add Each Variable:**
   - Click "Add New"
   - Enter the name (e.g., `ARWEAVE_PRIVATE_KEY`)
   - Paste the value
   - Select environment: **Production, Preview, Development** (check all 3)
   - Click "Save"

5. **Repeat for All Variables**

6. **Redeploy:**
   - Go to "Deployments" tab
   - Click latest deployment
   - Click "Redeploy"

---

## ✅ Verification Checklist

After adding environment variables:

- [ ] Arweave wallet JSON added
- [ ] All 6 Firebase client variables added
- [ ] All 3 Firebase admin variables added
- [ ] App URL added
- [ ] Redeployed on Vercel
- [ ] Site loads without errors
- [ ] Can sign up/login
- [ ] Can upload files
- [ ] Can mint NFT (test with small file)

---

## 🆘 Quick Troubleshooting

### **"Cannot find module" or build fails:**
- Check all NEXT_PUBLIC_ variables are added
- Redeploy with cache cleared

### **"Authentication failed":**
- Verify Firebase config is correct
- Check Firebase project is on Blaze (pay-as-you-go) plan

### **"Arweave transaction failed":**
- Check wallet has AR balance
- Verify ARWEAVE_PRIVATE_KEY is valid JSON
- Check wallet address on: https://viewblock.io/arweave

### **Site loads but features don't work:**
- Check browser console for errors (F12)
- Verify all environment variables are set
- Check Vercel function logs for errors

---

## 📞 Where to Get Help

**Firebase issues:**
- Console: https://console.firebase.google.com
- Docs: https://firebase.google.com/docs

**Arweave issues:**
- Explorer: https://viewblock.io/arweave
- Docs: https://docs.arweave.org

**Vercel issues:**
- Dashboard: https://vercel.com
- Docs: https://vercel.com/docs

---

**You got this! 🚀**
