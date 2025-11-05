# 🎯 Arweave Platform Wallet Setup Guide

**Get your Neural Salvage NFT minting system ready with real AR tokens**

---

## 🎉 Good News: You Have AR!

Now let's set up a platform wallet so your app can mint NFTs for users.

---

## 📋 What You Need

- [x] AR tokens (you have this!)
- [ ] New Arweave wallet for platform
- [ ] Wallet's private key (JWK)
- [ ] Funded with AR (~0.5-1 AR for testing)

---

## 🔧 Step 1: Generate Platform Wallet

### **Option A: Use arweave-wallet-generator (Recommended)**

```bash
# Install the tool globally
npm install -g arweave-wallet-generator

# Generate new wallet
arweave-wallet-generator > platform-wallet.json
```

This creates a `platform-wallet.json` file with your new wallet's private key.

---

### **Option B: Use Online Tool (Quick but Less Secure)**

1. Visit: https://jfbeats.github.io/ArweaveWalletConnector/
2. Click "Generate New Wallet"
3. Download the wallet JSON file
4. Rename it to `platform-wallet.json`

⚠️ **Security Note**: For production, use Option A and never commit this file to git!

---

### **Option C: Use Node.js Script (Most Secure)**

Create `scripts/generate-wallet.js`:

```javascript
const Arweave = require('arweave');
const fs = require('fs');

async function generateWallet() {
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  // Generate new wallet
  const key = await arweave.wallets.generate();
  
  // Get the wallet address
  const address = await arweave.wallets.jwkToAddress(key);
  
  console.log('✅ Wallet generated!');
  console.log('Address:', address);
  console.log('\n⚠️  SAVE THIS FILE SECURELY - IT\'S YOUR PRIVATE KEY!');
  
  // Save to file
  fs.writeFileSync('platform-wallet.json', JSON.stringify(key, null, 2));
  console.log('\n📁 Saved to: platform-wallet.json');
  console.log('\n🔐 Add this address to your password manager:');
  console.log(address);
}

generateWallet().catch(console.error);
```

Run it:
```bash
node scripts/generate-wallet.js
```

---

## 💰 Step 2: Get Your New Wallet Address

### **From Wallet JSON File:**

Create `scripts/get-wallet-address.js`:

```javascript
const Arweave = require('arweave');
const fs = require('fs');

async function getAddress() {
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  // Load wallet
  const key = JSON.parse(fs.readFileSync('platform-wallet.json', 'utf-8'));
  const address = await arweave.wallets.jwkToAddress(key);
  
  console.log('Platform Wallet Address:');
  console.log(address);
  console.log('\n📋 Send AR to this address to fund your platform!');
}

getAddress().catch(console.error);
```

Run it:
```bash
node scripts/get-wallet-address.js
```

---

## 💸 Step 3: Transfer AR to Platform Wallet

### **From Your Personal Wallet:**

1. **Open Your AR Wallet App** (ArConnect, ar.page, or whatever you're using)

2. **Send Transaction:**
   - To: `[Platform wallet address from Step 2]`
   - Amount: `0.5` AR (for testing - costs ~$0.01-0.50 per mint)
   - Fee: Use recommended fee

3. **Wait for Confirmation** (~2-5 minutes)

4. **Verify Balance:**

Create `scripts/check-balance.js`:

```javascript
const Arweave = require('arweave');
const fs = require('fs');

async function checkBalance() {
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  const key = JSON.parse(fs.readFileSync('platform-wallet.json', 'utf-8'));
  const address = await arweave.wallets.jwkToAddress(key);
  const balance = await arweave.wallets.getBalance(address);
  const arBalance = arweave.ar.winstonToAr(balance);
  
  console.log('Platform Wallet Balance:');
  console.log(`${arBalance} AR`);
  console.log(`\nEstimated mints possible: ${Math.floor(parseFloat(arBalance) / 0.001)}`);
}

checkBalance().catch(console.error);
```

Run it:
```bash
node scripts/check-balance.js
```

---

## 🔐 Step 4: Add Wallet to Environment Variables

### **⚠️ CRITICAL: Never commit this to Git!**

Update `.env.local`:

```bash
# Copy the ENTIRE contents of platform-wallet.json
# It should be a JSON object with properties: n, e, d, p, q, etc.
ARWEAVE_PRIVATE_KEY='{"kty":"RSA","n":"...","e":"...","d":"...","p":"...","q":"...","dp":"...","dq":"...","qi":"..."}'

# Your app URL (for NFT metadata links)
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app
```

### **How to Get the Full JWK:**

```bash
# On Mac/Linux:
cat platform-wallet.json | tr -d '\n'

# On Windows (PowerShell):
Get-Content platform-wallet.json | ForEach-Object { $_ -replace '\s', '' }

# Or manually: Copy entire contents of platform-wallet.json (all on one line)
```

Paste the entire JSON (as a single line string) as the value for `ARWEAVE_PRIVATE_KEY`.

---

## 🔒 Step 5: Secure Your Wallet

### **Add to `.gitignore`:**

```
# Arweave Wallet (NEVER COMMIT!)
platform-wallet.json
scripts/platform-wallet.json
*.jwk
```

### **Backup Wallet (DO THIS NOW):**

1. **Copy `platform-wallet.json`** to 3 safe locations:
   - Password manager (1Password, Bitwarden, LastPass)
   - Encrypted USB drive
   - Encrypted cloud storage (not Dropbox/Google Drive directly)

2. **Also save the wallet address** separately

3. **Delete local copy** after adding to `.env.local`:
   ```bash
   rm platform-wallet.json
   ```

---

## 🧪 Step 6: Test NFT Minting

Create `scripts/test-mint.js`:

```javascript
const Bundlr = require('@bundlr-network/client');
const fs = require('fs');

async function testMint() {
  console.log('🧪 Testing Arweave NFT Minting...\n');
  
  // Load wallet from .env
  const walletKey = process.env.ARWEAVE_PRIVATE_KEY;
  
  if (!walletKey) {
    console.error('❌ ARWEAVE_PRIVATE_KEY not found in environment');
    return;
  }
  
  try {
    // Initialize Bundlr
    console.log('📡 Connecting to Bundlr...');
    const bundlr = new Bundlr.default(
      'https://node2.bundlr.network',
      'arweave',
      walletKey
    );
    
    await bundlr.ready();
    console.log('✅ Connected to Bundlr');
    
    // Check balance
    const balance = await bundlr.getLoadedBalance();
    console.log(`💰 Balance: ${bundlr.utils.fromAtomic(balance)} AR`);
    
    // Create test NFT metadata
    const metadata = {
      name: 'Neural Salvage Test NFT',
      description: 'Test NFT minted from Neural Salvage platform',
      image: 'https://via.placeholder.com/512',
      attributes: [
        { trait_type: 'Test', value: 'true' },
        { trait_type: 'Platform', value: 'Neural Salvage' }
      ],
      created_at: new Date().toISOString()
    };
    
    // Upload metadata
    console.log('\n📤 Uploading test metadata...');
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const tx = await bundlr.upload(metadataBuffer, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'test-nft-metadata' },
      ],
    });
    
    console.log('✅ Test NFT Metadata Uploaded!');
    console.log(`\nTransaction ID: ${tx.id}`);
    console.log(`View at: https://arweave.net/${tx.id}`);
    console.log(`\n⏳ Wait ~2-5 minutes for confirmation, then visit the URL above`);
    
    // Estimate cost for 1MB file
    const oneMB = 1024 * 1024;
    const price = await bundlr.getPrice(oneMB);
    console.log(`\n💵 Cost for 1MB file: ${bundlr.utils.fromAtomic(price)} AR`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMint().catch(console.error);
```

Run it:
```bash
# Load environment variables and run test
node -r dotenv/config scripts/test-mint.js
```

---

## ✅ Verification Checklist

- [ ] New platform wallet generated
- [ ] Wallet address saved in password manager
- [ ] AR tokens transferred to platform wallet (0.5-1 AR)
- [ ] Balance confirmed with check-balance.js
- [ ] `ARWEAVE_PRIVATE_KEY` added to `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL` added to `.env.local`
- [ ] `platform-wallet.json` backed up (3 locations)
- [ ] `platform-wallet.json` deleted from project
- [ ] `.gitignore` updated
- [ ] Test mint successful
- [ ] Can view test NFT on https://arweave.net/[transaction-id]

---

## 💰 Funding Strategy

### **For Development/Testing:**
- Start with: **0.5 AR** (~$5-10)
- Allows: ~500-1000 test mints
- Refill when: Balance < 0.1 AR

### **For Production:**
- Start with: **5-10 AR** ($50-100)
- Allows: ~5,000-10,000 mints
- Set up: Auto-refill alerts at 2 AR
- Consider: Daily cost caps in app logic

---

## 🚨 Security Best Practices

### **DO:**
- ✅ Store JWK in environment variables only
- ✅ Backup wallet in 3 secure locations
- ✅ Use different wallets for dev/prod
- ✅ Monitor wallet balance daily
- ✅ Set up cost limits in code
- ✅ Rotate wallet if compromised

### **DON'T:**
- ❌ Commit wallet file to git
- ❌ Share wallet JWK with anyone
- ❌ Use same wallet for personal + platform
- ❌ Store unencrypted in cloud
- ❌ Forget to backup before deleting
- ❌ Fund wallet with more than needed

---

## 🎯 Next Steps After Setup

1. **Update Vercel Environment Variables**
   - Add `ARWEAVE_PRIVATE_KEY` to Vercel Dashboard
   - Add `NEXT_PUBLIC_APP_URL`

2. **Test on Production**
   - Deploy to Vercel
   - Test mint through UI
   - Verify NFT appears on Arweave

3. **Add Monitoring**
   - Daily balance checks
   - Alert when balance < 0.5 AR
   - Track mint costs

4. **Add Cost Protection**
   - Daily mint limits per user
   - File size limits
   - Platform cost caps

---

## 📊 Cost Reference

| File Size | Estimated Cost | Notes |
|-----------|---------------|-------|
| 10 KB | ~$0.01 | Small image/text |
| 100 KB | ~$0.02-0.05 | Medium image |
| 1 MB | ~$0.10-0.20 | Large image/video |
| 10 MB | ~$1.00-2.00 | HD video |
| 100 MB | ~$10-20 | Max recommended |

**Platform fee suggestion:** Add 10-20% markup for profit

---

## 🆘 Troubleshooting

### **"Insufficient balance" error:**
- Check wallet balance with `check-balance.js`
- Transfer more AR to platform wallet
- Wait 2-5 minutes for confirmation

### **"Invalid JWK" error:**
- Ensure ARWEAVE_PRIVATE_KEY is complete JSON object
- Check for missing quotes or brackets
- Paste as single-line string in .env.local

### **"Failed to connect to Bundlr":**
- Check internet connection
- Try different Bundlr node: `https://node1.bundlr.network`
- Bundlr may be down (check status.bundlr.network)

### **Transaction not appearing:**
- Wait 2-5 minutes for Arweave confirmation
- Check transaction status: `https://arweave.net/tx/[txId]/status`
- Confirmed when `confirmed.block_height` is not null

---

## 📚 Resources

- **Arweave Explorer**: https://viewblock.io/arweave
- **Bundlr Docs**: https://docs.bundlr.network
- **AR Price**: https://www.coingecko.com/en/coins/arweave
- **Arweave Status**: https://status.arweave.dev

---

**You're ready to mint real blockchain NFTs!** 🎉
