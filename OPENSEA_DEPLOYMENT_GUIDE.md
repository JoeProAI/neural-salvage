# 🚀 OpenSea Integration - Deployment Guide

## 🎯 GOAL: Get Your NFTs on OpenSea in 1 Week

This guide will help you deploy dual-chain NFT minting so your NFTs appear on OpenSea marketplace with **2 million+ potential buyers**.

---

## 📋 WHAT YOU'LL HAVE:

```
Before: NFTs only on Arweave (10K potential buyers)
After:  NFTs on OpenSea (2M+ potential buyers) ✅

How it works:
1. File stored on Arweave (permanent, $0.50)
2. NFT minted on Polygon (OpenSea access, $0.10)
3. Polygon NFT points to Arweave URL
4. Auto-appears on OpenSea!
```

---

## ⏰ TIMELINE:

```
Day 1-2: Install dependencies & deploy contract
Day 3-4: Integrate Polygon minting
Day 5:   Test on testnet
Day 6:   Deploy to mainnet
Day 7:   Start seeing NFTs on OpenSea! 🎉
```

---

## 📦 STEP 1: Install Dependencies

### **1.1 Install Hardhat & Ethers**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install ethers@^6.9.0
npm install dotenv
```

### **1.2 Install OpenZeppelin Contracts**
```bash
npm install @openzeppelin/contracts
```

### **1.3 Verify Installation**
```bash
npx hardhat --version
# Should show: Hardhat version 2.x.x
```

---

## 🔑 STEP 2: Set Up Polygon Wallet

### **2.1 Create Deployment Wallet**

**Option A: Use MetaMask**
```
1. Open MetaMask
2. Create new account: "Neural Salvage Deployer"
3. Copy private key (Settings → Security → Export Private Key)
4. NEVER share this key!
```

**Option B: Create New Wallet Programmatically**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# This generates a private key
# Derive address using: https://etherscan.io/pushTx
```

### **2.2 Fund Wallet with MATIC**

**You Need:**
- Deployment: ~$10 worth of MATIC (one-time)
- Per mint: ~$0.10 MATIC (ongoing)

**How to Get MATIC:**
```
1. Buy MATIC on Coinbase/Binance
2. Withdraw to Polygon network
3. Send to your deployer wallet address
```

**Minimum Amounts:**
```
Test deployment (Mumbai testnet): 0.5 MATIC (free from faucet)
Main deployment (Polygon mainnet): 10 MATIC (~$8)
```

---

## 🔐 STEP 3: Configure Environment Variables

### **3.1 Add to `.env` file:**

```bash
# Existing variables (keep these)
ARWEAVE_PRIVATE_KEY=your_arweave_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# NEW - Polygon Configuration
POLYGON_PRIVATE_KEY=your_polygon_wallet_private_key
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# After deployment, add:
POLYGON_NFT_CONTRACT=0x...contract_address...
```

### **3.2 Get PolygonScan API Key (Free)**
```
1. Go to: https://polygonscan.com/myapikey
2. Sign up (free)
3. Create new API key
4. Add to .env
```

---

## 🚢 STEP 4: Deploy Smart Contract

### **4.1 Deploy to Testnet First (Mumbai)**

```bash
# Get free testnet MATIC
# Visit: https://faucet.polygon.technology
# Enter your wallet address
# Receive 0.5 MATIC

# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network polygonMumbai
```

**Expected Output:**
```
🚀 Deploying Neural Salvage NFT Contract to Polygon...
📝 Deploying with account: 0x...
💰 Account balance: 0.5 MATIC
✅ Neural Salvage NFT deployed to: 0x123...
🔗 View on PolygonScan: https://mumbai.polygonscan.com/address/0x123...
🎨 OpenSea Collection: https://testnets.opensea.io/assets/mumbai/0x123...
```

### **4.2 Test Minting on Testnet**

```bash
# Test mint an NFT
curl -X POST https://your-domain.vercel.app/api/nft/mint-dual-chain \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "test_asset_123",
    "userId": "test_user",
    "metadata": {
      "name": "Test NFT",
      "description": "Testing OpenSea integration"
    },
    "userWalletAddress": "0x..."
  }'
```

### **4.3 Verify on Test OpenSea**

```
1. Go to: https://testnets.opensea.io
2. Connect your wallet
3. Search for your contract: 0x123...
4. See your test NFT!
```

**If it works → Proceed to mainnet!**

---

## 🌐 STEP 5: Deploy to Mainnet

### **5.1 Deploy Contract to Polygon Mainnet**

```bash
# Make sure you have 10 MATIC in deployer wallet!

npx hardhat run scripts/deploy.js --network polygon
```

**Expected Output:**
```
✅ Neural Salvage NFT deployed to: 0xABC...
🎨 OpenSea Collection: https://opensea.io/assets/matic/0xABC...
💾 Save this address to your .env file:
   POLYGON_NFT_CONTRACT=0xABC...
```

### **5.2 Update Environment Variables**

```bash
# Add to .env file:
POLYGON_NFT_CONTRACT=0xABC...the_actual_contract_address
```

### **5.3 Deploy to Vercel**

```bash
git add .
git commit -m "Add Polygon/OpenSea integration"
git push

# Or deploy manually:
vercel --prod
```

**Add env vars to Vercel:**
```
1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add all Polygon variables:
   - POLYGON_PRIVATE_KEY
   - POLYGON_RPC_URL
   - POLYGON_NFT_CONTRACT
   - POLYGONSCAN_API_KEY
4. Redeploy
```

---

## 🎨 STEP 6: Verify OpenSea Integration

### **6.1 Mint Your First NFT**

```
1. Go to your app: https://your-domain.vercel.app
2. Upload a file
3. Generate AI cover art (if audio)
4. Click "Mint NFT"
5. Wait ~2 minutes
```

### **6.2 Check OpenSea**

```
Visit: https://opensea.io/assets/matic/[contract]/[tokenId]

Should show:
✅ NFT image (from Arweave!)
✅ Name and description
✅ Attributes
✅ "Buy Now" button (when listed)
```

### **6.3 Verify Data**

```
Arweave:
- File stored permanently ✅
- Cost: ~$0.50

Polygon:
- NFT minted ✅  
- Cost: ~$0.10
- Gas: Paid

OpenSea:
- Indexed automatically ✅
- Ready for sale
```

---

## 💰 STEP 7: Start Selling!

### **7.1 List NFT on OpenSea**

**Option A: OpenSea UI**
```
1. Go to OpenSea
2. Connect wallet
3. Find your NFT
4. Click "Sell"
5. Set price in ETH
6. List for sale
```

**Option B: Your App (Future)**
```
Add listing functionality to your app
Users can list directly
Still appears on OpenSea
```

### **7.2 Pricing Strategy**

```
Consider:
- Arweave storage: $0.50
- Polygon gas: $0.10
- Your profit margin
- Market rates

Example:
Cost: $0.60
Sell for: $10-50
Profit: $9.40-$49.40 per NFT! 💰
```

---

## 📊 MONITORING & ANALYTICS

### **Check Contract Stats:**

```javascript
// Total NFTs minted
const totalSupply = await contract.totalSupply();

// Check a specific NFT
const tokenURI = await contract.tokenURI(tokenId);

// View on PolygonScan
https://polygonscan.com/address/[contract]
```

### **OpenSea Analytics:**

```
Visit: https://opensea.io/collection/neural-salvage

See:
- Floor price
- Total volume
- Owners
- Sales history
```

---

## 🔧 TROUBLESHOOTING

### **Issue 1: Contract Deployment Fails**

**Error:** `insufficient funds`
```
Solution:
- Check wallet has enough MATIC
- Need ~0.1 MATIC for deployment
- Get more from exchange
```

**Error:** `nonce too high`
```
Solution:
- Reset MetaMask
- Settings → Advanced → Reset Account
- Try deploying again
```

### **Issue 2: NFT Not Showing on OpenSea**

**Wait Time:**
```
- Polygon transaction: ~5 seconds
- OpenSea indexing: ~2 minutes
- Refresh metadata: Use OpenSea refresh button
```

**Force Refresh:**
```
1. Go to your NFT on OpenSea
2. Click "..." menu
3. Select "Refresh metadata"
4. Wait 30 seconds
```

### **Issue 3: Image Not Loading**

**Check:**
```
1. Arweave URL working?
   - Visit: https://arweave.net/[txId]
   - Should show image

2. Metadata correct?
   - Check tokenURI
   - Should have "image" field
   - Should point to Arweave

3. CORS issues?
   - Arweave auto-handles CORS
   - Should work automatically
```

---

## 💡 COST SUMMARY

### **One-Time Costs:**
```
Contract deployment: ~$10 (10 MATIC)
Testing on Mumbai: $0 (free testnet)
PolygonScan API: $0 (free tier)
Total one-time: ~$10
```

### **Per NFT Costs:**
```
Arweave storage: ~$0.50
Polygon minting: ~$0.10
Total per NFT: ~$0.60

If you sell for $50:
Your profit: $49.40! ✅
```

### **OpenSea Fees:**
```
Listing: FREE
First sale: 2.5% OpenSea fee
You get: 97.5% of sale price
Royalties: 5% on future sales (forever!)
```

---

## 🎯 SUCCESS CHECKLIST

After deployment, verify:

- [ ] Contract deployed on Polygon
- [ ] Contract verified on PolygonScan
- [ ] Environment variables set
- [ ] Test NFT minted successfully
- [ ] NFT appears on OpenSea testnet
- [ ] Mainnet contract deployed
- [ ] Mainnet NFT minted
- [ ] NFT appears on OpenSea mainnet
- [ ] Can list NFT for sale
- [ ] Arweave storage working
- [ ] Metadata loads correctly
- [ ] Images display on OpenSea

---

## 🚀 NEXT STEPS

### **Immediate:**
1. Deploy contract
2. Mint test NFTs
3. Verify OpenSea integration

### **Week 2:**
1. Add collection branding on OpenSea
2. Implement listing from your app
3. Add royalty tracking

### **Month 2:**
1. Marketing on OpenSea
2. Featured collections
3. Partnerships with creators

---

## 📚 RESOURCES

- **Polygon Docs:** https://docs.polygon.technology
- **OpenSea Docs:** https://docs.opensea.io
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin:** https://docs.openzeppelin.com
- **Ethers.js:** https://docs.ethers.org

---

## ❓ NEED HELP?

### **Common Questions:**

**Q: Do users need crypto wallets?**
A: Yes for now, but we can add credit card payments later (Crossmint)

**Q: Can I update metadata after minting?**
A: No on blockchain, but you can update on OpenSea UI

**Q: How do royalties work?**
A: Built into contract - 5% of all future sales come to you automatically

**Q: What about gas fees?**
A: ~$0.10 per mint on Polygon (very cheap!)

---

## 🎉 YOU'RE READY!

Run through the steps and your NFTs will be on OpenSea with **2 million+ potential buyers**!

**Start with Step 1 → Install dependencies**

Good luck! 🚀
