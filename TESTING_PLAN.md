# 🧪 Complete Testing Plan - OpenSea Integration

## 🎯 **GOAL: Verify Everything Works Before Launch**

We need to test each component thoroughly to ensure the dual-chain minting actually works and NFTs appear on OpenSea.

---

## 📋 **TESTING PHASES:**

```
Phase 1: Dependencies & Setup (Day 1)
Phase 2: Contract Deployment (Day 2-3)
Phase 3: Minting Tests (Day 4-5)
Phase 4: OpenSea Verification (Day 6)
Phase 5: End-to-End Tests (Day 7)
Phase 6: Load Testing (Day 8)
```

---

## ✅ **PHASE 1: Dependencies & Setup**

### **1.1 Install Dependencies**
```bash
# Install required packages
npm install ethers@^6.9.0
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
npm install dotenv

# Verify installation
npx hardhat --version
# Expected: Hardhat version 2.x.x

# Check ethers
node -e "console.log(require('ethers').version)"
# Expected: 6.9.0 or higher
```

**✅ Pass Criteria:**
- [ ] All packages install without errors
- [ ] Hardhat CLI works
- [ ] Ethers v6+ installed

---

### **1.2 Environment Variables**
```bash
# Check .env file has all required variables
cat .env | grep -E "(ARWEAVE|POLYGON|NEXT_PUBLIC)"

# Required variables:
# ARWEAVE_PRIVATE_KEY
# POLYGON_PRIVATE_KEY
# POLYGON_RPC_URL
# POLYGONSCAN_API_KEY
# NEXT_PUBLIC_APP_URL
```

**✅ Pass Criteria:**
- [ ] All env vars present
- [ ] No placeholder values
- [ ] Keys are valid format

---

### **1.3 Wallet Setup**
```bash
# Check Polygon wallet has MATIC
node -e "
const ethers = require('ethers');
const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
const address = 'YOUR_WALLET_ADDRESS';
provider.getBalance(address).then(b => console.log('Balance:', ethers.formatEther(b), 'MATIC'));
"

# Expected: > 0.1 MATIC for testnet, > 10 MATIC for mainnet
```

**✅ Pass Criteria:**
- [ ] Wallet has sufficient MATIC
- [ ] Can connect to Polygon RPC
- [ ] Address is valid

---

## ✅ **PHASE 2: Contract Deployment (TESTNET)**

### **2.1 Compile Contract**
```bash
# Compile smart contract
npx hardhat compile

# Expected output:
# Compiled 1 Solidity file successfully
```

**✅ Pass Criteria:**
- [ ] Contract compiles without errors
- [ ] No warnings
- [ ] Artifacts generated

---

### **2.2 Deploy to Mumbai Testnet**
```bash
# Get free testnet MATIC first
# Visit: https://faucet.polygon.technology

# Deploy to Mumbai
npx hardhat run scripts/deploy.js --network polygonMumbai

# Expected output:
# ✅ Neural Salvage NFT deployed to: 0x...
# 🔗 View on PolygonScan: https://mumbai.polygonscan.com/address/0x...
# 🎨 OpenSea Collection: https://testnets.opensea.io/assets/mumbai/0x...
```

**✅ Pass Criteria:**
- [ ] Contract deploys successfully
- [ ] Transaction confirmed on blockchain
- [ ] Contract address returned
- [ ] Can view on Mumbai PolygonScan

---

### **2.3 Verify Contract**
```bash
# Verify on PolygonScan
npx hardhat verify --network polygonMumbai CONTRACT_ADDRESS "DEPLOYER_ADDRESS" "PLATFORM_WALLET"

# Or verification happens automatically in deploy script
```

**✅ Pass Criteria:**
- [ ] Contract verified on PolygonScan
- [ ] Source code visible
- [ ] Can read contract functions

---

### **2.4 Test Contract Functions**
```javascript
// test/contract-test.js
const { ethers } = require("hardhat");

async function testContract() {
  const contractAddress = "YOUR_DEPLOYED_CONTRACT";
  const contract = await ethers.getContractAt("NeuralSalvageNFT", contractAddress);
  
  // Test 1: Check name
  const name = await contract.name();
  console.log("✅ Name:", name); // Should be "Neural Salvage"
  
  // Test 2: Check symbol
  const symbol = await contract.symbol();
  console.log("✅ Symbol:", symbol); // Should be "NSLV"
  
  // Test 3: Check total supply
  const supply = await contract.totalSupply();
  console.log("✅ Total Supply:", supply.toString()); // Should be 0
  
  // Test 4: Check owner
  const owner = await contract.owner();
  console.log("✅ Owner:", owner);
  
  console.log("🎉 All contract functions work!");
}

testContract();
```

**✅ Pass Criteria:**
- [ ] Name returns "Neural Salvage"
- [ ] Symbol returns "NSLV"
- [ ] Total supply is 0
- [ ] Owner address is correct

---

## ✅ **PHASE 3: Minting Tests (TESTNET)**

### **3.1 Test Arweave Minting (Existing)**
```bash
# Test existing Arweave minting
curl -X POST http://localhost:3000/api/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "test_audio_123",
    "userId": "test_user_001",
    "metadata": {
      "name": "Test Audio NFT",
      "description": "Testing Arweave minting"
    }
  }'

# Expected: Returns arweaveId, assetUrl, metadataUrl
```

**✅ Pass Criteria:**
- [ ] Arweave transaction succeeds
- [ ] Returns valid transaction ID
- [ ] Can view on https://arweave.net/[txId]
- [ ] Metadata is correct

---

### **3.2 Test Polygon Minting (New)**
```javascript
// test/polygon-mint-test.js
const { mintNFTOnPolygon } = require('../lib/nft/polygon');

async function testPolygonMint() {
  try {
    const result = await mintNFTOnPolygon({
      recipientAddress: "YOUR_TEST_WALLET",
      metadataURI: "https://arweave.net/test-metadata",
      arweaveId: "test-arweave-id-123",
      royaltyPercentage: 500,
    });
    
    console.log("✅ Polygon Mint Success!");
    console.log("Token ID:", result.tokenId);
    console.log("OpenSea URL:", result.openseaUrl);
    console.log("Transaction:", result.transactionHash);
    
  } catch (error) {
    console.error("❌ Polygon Mint Failed:", error);
  }
}

testPolygonMint();
```

**✅ Pass Criteria:**
- [ ] Polygon mint succeeds
- [ ] Returns token ID
- [ ] Transaction confirmed
- [ ] Gas cost reasonable (~$0.10)

---

### **3.3 Test Dual-Chain Minting**
```bash
# Test complete dual-chain flow
curl -X POST http://localhost:3000/api/nft/mint-dual-chain \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "test_audio_456",
    "userId": "test_user_002",
    "metadata": {
      "name": "Dual Chain Test NFT",
      "description": "Testing Arweave + Polygon",
      "attributes": [
        {"trait_type": "Type", "value": "Audio"},
        {"trait_type": "Duration", "value": "3:45"}
      ]
    },
    "userWalletAddress": "YOUR_TEST_WALLET"
  }'

# Expected:
# {
#   "success": true,
#   "nft": {
#     "id": "arweave-tx-id",
#     "arweave": { "transactionId": "...", "url": "..." },
#     "polygon": { "tokenId": "1", "openseaUrl": "...", "transactionHash": "..." }
#   }
# }
```

**✅ Pass Criteria:**
- [ ] Both mints succeed
- [ ] Arweave transaction confirmed
- [ ] Polygon transaction confirmed
- [ ] NFT data saved to Firebase
- [ ] Both URLs work

---

## ✅ **PHASE 4: OpenSea Verification (TESTNET)**

### **4.1 Check OpenSea Testnet**
```
1. Go to: https://testnets.opensea.io
2. Connect your test wallet (MetaMask)
3. Search for your contract: 0x[contract-address]
4. Verify NFT appears
```

**Manual Checks:**
- [ ] NFT is visible on OpenSea testnet
- [ ] Image loads from Arweave URL
- [ ] Name displays correctly
- [ ] Description displays correctly
- [ ] Attributes show up
- [ ] Metadata is accurate

---

### **4.2 Force Refresh Metadata**
```
1. On OpenSea NFT page
2. Click "..." menu
3. Select "Refresh metadata"
4. Wait 30 seconds
5. Reload page
```

**✅ Pass Criteria:**
- [ ] Metadata updates
- [ ] Image still loads
- [ ] No errors

---

### **4.3 Test Marketplace Features**
```
Try on OpenSea testnet:
1. List NFT for sale (test)
2. Set price in test ETH
3. View listing
4. Cancel listing
```

**✅ Pass Criteria:**
- [ ] Can list NFT
- [ ] Price displays correctly
- [ ] Can cancel listing
- [ ] No errors

---

## ✅ **PHASE 5: End-to-End Tests (TESTNET)**

### **5.1 Complete User Flow**
```
Full flow test:

1. User uploads audio file
2. AI generates cover art
3. User mints NFT (dual-chain)
4. Check Arweave storage
5. Check Polygon transaction
6. View on OpenSea testnet
7. List for sale on OpenSea
8. Verify listing appears
```

**✅ Pass Criteria:**
- [ ] All steps complete without errors
- [ ] Total time < 5 minutes
- [ ] NFT appears on OpenSea within 2 minutes
- [ ] All data is correct

---

### **5.2 Multiple NFTs Test**
```
Mint 5 NFTs in sequence:
1. Different file types (audio, image)
2. Different metadata
3. Different users
```

**✅ Pass Criteria:**
- [ ] All 5 mint successfully
- [ ] Token IDs increment: 0, 1, 2, 3, 4
- [ ] All appear on OpenSea
- [ ] No duplicate IDs

---

### **5.3 Error Handling Test**
```
Test error scenarios:

1. Insufficient MATIC balance
2. Invalid Arweave ID
3. Invalid recipient address
4. Network timeout
5. Contract not deployed
```

**✅ Pass Criteria:**
- [ ] Errors are caught gracefully
- [ ] User-friendly error messages
- [ ] No server crashes
- [ ] Logs provide debug info

---

## ✅ **PHASE 6: Mainnet Deployment**

### **6.1 Deploy to Polygon Mainnet**
```bash
# ONLY after testnet is 100% verified!

# Final check: Wallet has 10+ MATIC
npx hardhat run scripts/deploy.js --network polygon

# Save contract address to .env
POLYGON_NFT_CONTRACT=0x...deployed_address...
```

**✅ Pass Criteria:**
- [ ] Mainnet deployment succeeds
- [ ] Contract verified on PolygonScan
- [ ] Contract address saved
- [ ] Environment updated on Vercel

---

### **6.2 Mainnet Smoke Test**
```bash
# Mint ONE test NFT on mainnet
curl -X POST https://your-app.vercel.app/api/nft/mint-dual-chain \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "mainnet_test_001",
    "userId": "admin",
    "metadata": {
      "name": "Mainnet Test",
      "description": "First mainnet NFT"
    },
    "userWalletAddress": "YOUR_WALLET"
  }'
```

**✅ Pass Criteria:**
- [ ] Mainnet mint succeeds
- [ ] Costs ~$0.60 total
- [ ] NFT appears on OpenSea mainnet
- [ ] All URLs work
- [ ] Metadata correct

---

### **6.3 Real User Test**
```
Have a real user:
1. Sign up for your platform
2. Upload their audio
3. Generate cover art
4. Mint NFT (they pay)
5. Verify appears on OpenSea
6. List for sale
```

**✅ Pass Criteria:**
- [ ] User can complete entire flow
- [ ] Payment processes correctly
- [ ] NFT appears within 2 minutes
- [ ] User can list on OpenSea
- [ ] User is satisfied

---

## ✅ **PHASE 7: Load Testing**

### **7.1 Concurrent Minting**
```javascript
// test/load-test.js
async function loadTest() {
  const promises = [];
  
  // 10 concurrent mints
  for (let i = 0; i < 10; i++) {
    promises.push(mintDualChainNFT({
      assetId: `load_test_${i}`,
      userId: `user_${i}`,
      metadata: { name: `Load Test #${i}` }
    }));
  }
  
  const results = await Promise.all(promises);
  console.log("✅ 10 concurrent mints:", results.length, "succeeded");
}
```

**✅ Pass Criteria:**
- [ ] All 10 mints succeed
- [ ] No rate limit errors
- [ ] Average time < 30 seconds per mint
- [ ] No server crashes

---

### **7.2 Cost Verification**
```
Track costs for 100 test mints:

Expected costs:
- Arweave: 100 × $0.50 = $50
- Polygon: 100 × $0.10 = $10
- Total: $60 for 100 NFTs

If you charge $99 each:
- Revenue: $9,900
- Costs: $60
- Profit: $9,840 ✅
```

**✅ Pass Criteria:**
- [ ] Actual costs match estimates
- [ ] No hidden fees
- [ ] Profit margins confirmed

---

## 📊 **TESTING CHECKLIST:**

### **Before Launch:**
```
Infrastructure:
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Wallets funded
- [ ] Contract deployed (testnet)
- [ ] Contract deployed (mainnet)

Functionality:
- [ ] Arweave minting works
- [ ] Polygon minting works
- [ ] Dual-chain minting works
- [ ] Firebase saves correctly
- [ ] OpenSea indexing works

User Experience:
- [ ] Upload flow works
- [ ] AI cover art generates
- [ ] Payment processes
- [ ] NFT appears on OpenSea
- [ ] Users can list for sale

Performance:
- [ ] Minting completes < 2 minutes
- [ ] Handles concurrent requests
- [ ] Error handling works
- [ ] Costs are as expected

Security:
- [ ] Private keys secure
- [ ] API routes protected
- [ ] Rate limiting enabled
- [ ] Input validation works
```

---

## 🚨 **COMMON ISSUES & SOLUTIONS:**

### **Issue: Contract deployment fails**
```
Error: insufficient funds for gas

Solution:
1. Check wallet MATIC balance
2. Need at least 0.1 MATIC
3. Get more from faucet (testnet) or exchange (mainnet)
```

### **Issue: NFT not showing on OpenSea**
```
Problem: Minted but can't see on OpenSea

Solutions:
1. Wait 2-3 minutes for indexing
2. Force refresh metadata on OpenSea
3. Check transaction on PolygonScan
4. Verify metadataURI is correct
5. Check CORS on metadata URL
```

### **Issue: High gas costs**
```
Problem: Polygon gas > $0.10

Solutions:
1. Check gas price: should be 30-50 gwei
2. Mint during off-peak hours
3. Wait for lower gas prices
4. Optimize contract (already done)
```

### **Issue: Arweave upload fails**
```
Problem: Arweave transaction rejected

Solutions:
1. Check ARWEAVE_PRIVATE_KEY
2. Verify wallet has AR balance
3. Check file size < 100MB
4. Try again (transient error)
```

---

## 📈 **SUCCESS METRICS:**

### **Technical:**
```
✅ 100% deployment success rate
✅ < 2 minute mint time
✅ < 1% error rate
✅ 100% OpenSea indexing
✅ Costs = $0.60 ± $0.10
```

### **Business:**
```
✅ 10+ successful test mints
✅ 5+ real user mints
✅ NFTs visible on OpenSea
✅ Users can list/sell
✅ Profitable margins confirmed
```

---

## 🎯 **READY TO LAUNCH WHEN:**

```
All Phase 1-6 tests pass ✅
10+ testnet mints successful ✅
5+ mainnet test mints work ✅
Real user test completed ✅
Costs verified ✅
OpenSea integration confirmed ✅
Error handling validated ✅
Load test passed ✅
```

**Then you're ready for production! 🚀**

---

## 📝 **TESTING LOG TEMPLATE:**

```markdown
# Testing Session: [Date]

## Phase Tested: [Phase Number]
## Tester: [Name]

### Tests Run:
- [ ] Test 1: [Description] - PASS/FAIL
- [ ] Test 2: [Description] - PASS/FAIL
- [ ] Test 3: [Description] - PASS/FAIL

### Issues Found:
1. [Issue description]
   - Severity: High/Medium/Low
   - Solution: [What fixed it]

### Next Steps:
- [ ] Action item 1
- [ ] Action item 2

### Notes:
[Any additional observations]
```

---

## ✅ **START HERE:**

**Day 1: Run Phase 1 tests**
```bash
# Clone this checklist
cp TESTING_PLAN.md TESTING_LOG.md

# Start testing
npm install
npx hardhat --version
# Document results in TESTING_LOG.md
```

Let me know when you're ready to start testing! 🧪
