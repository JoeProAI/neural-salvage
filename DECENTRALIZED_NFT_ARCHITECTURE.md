# 🌐 Decentralized NFT Architecture

## Overview

Neural Salvage has been redesigned for **TRUE DECENTRALIZATION** with user-signed Arweave transactions and external marketplace compatibility.

---

## ⚡ What Changed

### **Before (Custodial)**
- ❌ Platform wallet signed all transactions
- ❌ Users didn't truly own NFTs on-chain
- ❌ Bundlr platform wallet paid for storage
- ❌ No external marketplace compatibility
- ❌ Internal marketplace required

### **After (Decentralized)**
- ✅ User's wallet signs all transactions
- ✅ True on-chain ownership
- ✅ User pays AR directly (~$0.05)
- ✅ STAMP protocol for marketplace compatibility
- ✅ Can sell on BazAR, Pianity, ArDrive, etc.

---

## 🏗️ Architecture

### **1. User-Signed Transactions**

```typescript
// lib/nft/arweave-user.ts
export async function mintArweaveNFTUserSigned(
  assetBuffer: Buffer,
  assetMimeType: string,
  metadata: NFTMetadata,
  creatorAddress: string,
  arconnect: any // User's ArConnect wallet
)
```

**Flow:**
1. User connects ArConnect wallet
2. Check wallet has enough AR (~0.01 AR = $0.05)
3. Create transaction with user's wallet
4. User signs via ArConnect popup
5. Submit to Arweave network
6. NFT is truly owned by user's wallet

### **2. Transaction Ledger (Internal)**

Firebase tracks ALL mints for analytics/history:

```typescript
{
  nftId: 'nft_xxx',
  userId: 'user_xxx',
  blockchain: 'arweave',
  arweave: {
    manifestId: 'tx_id',
    arweaveUrl: 'https://arweave.net/tx_id',
    uploadCost: 0.01, // AR cost
    uploadedAt: timestamp
  },
  creator: {
    walletAddress: '9fn66O7...',
    signature: 'user_signed'
  },
  // NOT used for selling - just tracking
  listedOnMarketplaces: ['bazar', 'pianity']
}
```

**Purpose:**
- Track mint history
- Analytics dashboard
- User portfolio view
- Link to external marketplace listings
- **NOT a marketplace** - just a ledger

### **3. STAMP Protocol Integration (Phase 2)**

STAMP = Standardized Token Asset Marketplace Protocol

**Benefits:**
- Compatible with all Arweave NFT marketplaces
- Royalties enforced on-chain (5% on all sales)
- Ownership transfer standard
- Discovery on external platforms

**Implementation:**
```typescript
// Coming in Phase 2
export async function createSTAMPNFT(
  manifestId: string,
  creatorAddress: string,
  royaltyBps: number // 500 = 5%
)
```

### **4. External Marketplace Links**

Instead of building marketplace, we integrate with existing ones:

**Supported Marketplaces:**
- **BazAR** (https://bazar.arweave.dev) - Main Arweave NFT marketplace
- **Pianity** (https://pianity.com) - Music NFT platform
- **ArDrive** (https://ardrive.io) - Storage + NFT marketplace
- **Verto** (https://verto.exchange) - DEX with NFT support

**UI Integration:**
```tsx
<NFTCard nft={nft}>
  <Button href={`https://bazar.arweave.dev/asset/${nft.manifestId}`}>
    🛒 Sell on BazAR
  </Button>
  <Button href={`https://viewblock.io/arweave/tx/${nft.manifestId}`}>
    🔍 View on ViewBlock
  </Button>
</NFTCard>
```

---

## 💰 Revenue Model

### **Minting Service Fee: $4.99**

Users pay for:
- ✅ Easy UX (no crypto complexity)
- ✅ AI analysis & metadata generation
- ✅ STAMP contract deployment
- ✅ Transaction ledger tracking
- ✅ Platform features & support

**Breakdown:**
- Service fee: $4.99 (Stripe)
- AR cost: ~$0.05 (User pays directly to Arweave)
- **Total to user: $5.04**
- **You keep: $4.50** (after Stripe fees)

### **Royalty Fee: 5% on ALL Sales**

Enforced by STAMP contract forever:
- ✅ 5% of every sale goes to platform
- ✅ Automatic - no manual tracking
- ✅ Works on ALL marketplaces
- ✅ Compounds over time as NFTs resell

**Example:**
- 100 NFTs minted = $450 mint revenue
- Average sale price: $50
- If all sell once: $250 royalty revenue
- If they resell 3x: $750 total royalty revenue
- **Long-term passive income**

---

## 🔧 Technical Details

### **Cost Calculation**

```typescript
import { calculateArweaveCost } from '@/lib/nft/arweave-user';

const fileSizeMB = 2.5;
const sizeInBytes = fileSizeMB * 1024 * 1024;

const cost = await calculateArweaveCost(sizeInBytes);
// Returns:
// {
//   arCost: 0.01,        // AR amount
//   usdCost: 0.05,       // USD equivalent
//   arPrice: 5.50        // Current AR price
// }

const serviceFee = 4.99;
const totalToUser = cost.usdCost + serviceFee; // $5.04
```

### **Wallet Balance Check**

```typescript
import { checkWalletBalance } from '@/lib/nft/arweave-user';

const { balance, hasEnough, shortfall } = await checkWalletBalance(
  walletAddress,
  0.01 // Required AR
);

if (!hasEnough) {
  alert(`You need ${shortfall.toFixed(4)} more AR in your wallet`);
  // Show funding instructions
}
```

### **Minting Flow**

```typescript
import { mintArweaveNFTUserSigned } from '@/lib/nft/arweave-user';

// 1. User clicks "Mint NFT"
// 2. Calculate cost
const cost = await calculateArweaveCost(fileSize);

// 3. Check wallet balance
const { hasEnough } = await checkWalletBalance(wallet.address, cost.arCost);
if (!hasEnough) return;

// 4. Process Stripe payment ($4.99)
const payment = await stripe.checkout.sessions.create({ amount: 4.99 });

// 5. Mint NFT (user signs)
const nft = await mintArweaveNFTUserSigned(
  fileBuffer,
  mimeType,
  metadata,
  wallet.address,
  arconnect // ArConnect instance
);

// 6. Save to ledger
await saveToLedger(nft, userId, payment.id);
```

---

## 🚀 Implementation Phases

### **Phase 1: User-Signed Transactions** ✅ (In Progress)
- [x] Create `arweave-user.ts` service
- [ ] Update MintNFTModal to use ArConnect signing
- [ ] Add wallet balance check UI
- [ ] Update cost display (AR + $4.99)
- [ ] Remove old Bundlr platform wallet code
- [ ] Test end-to-end flow

### **Phase 2: STAMP Protocol Integration** 🔄 (Next)
- [ ] Research STAMP contract deployment
- [ ] Implement STAMP NFT creation
- [ ] Add 5% royalty enforcement
- [ ] Test on BazAR marketplace
- [ ] Update metadata format for STAMP compatibility

### **Phase 3: Transaction Ledger** 📊 (After Phase 2)
- [ ] Design Firebase schema for ledger
- [ ] Create ledger tracking API
- [ ] Build analytics dashboard
- [ ] Add portfolio view for users
- [ ] Link to external marketplace listings

### **Phase 4: External Marketplace Integration** 🛒 (Final)
- [ ] Add "View on BazAR" buttons
- [ ] Add "Sell on Pianity" links
- [ ] Create marketplace discovery page
- [ ] Embed external marketplace widgets
- [ ] Add marketplace listing tracker

### **Phase 5: Pricing & Payment Updates** 💳
- [ ] Update pricing to $4.99 service fee
- [ ] Add AR cost calculator to UI
- [ ] Create wallet funding guide
- [ ] Update checkout flow
- [ ] Add AR purchase links (if needed)

---

## 📊 Benefits Summary

### **For Users:**
- ✅ **True ownership** - Your wallet, your NFT
- ✅ **Sell anywhere** - BazAR, Pianity, ArDrive, etc.
- ✅ **Low cost** - Only $5 total ($4.99 + $0.05 AR)
- ✅ **Permanent** - 200+ years guaranteed
- ✅ **Easy UX** - Platform handles complexity

### **For Platform:**
- ✅ **Decentralized** - No custody liability
- ✅ **Revenue** - $4.99 per mint + 5% royalties
- ✅ **Scalable** - No marketplace to maintain
- ✅ **Legitimate** - True Web3 principles
- ✅ **Competitive** - External marketplace access

### **For Buyers:**
- ✅ **Verified ownership** - On-chain proof
- ✅ **Multiple marketplaces** - Shop around for best price
- ✅ **Royalties support creators** - 5% goes back to artist
- ✅ **Standard format** - STAMP compatible

---

## 🔐 Security

### **User Security:**
- User controls private keys (ArConnect)
- No platform custody risk
- Transactions user-signed only
- No platform access to wallets

### **Platform Security:**
- No private key storage needed
- No blockchain transaction liability
- Stripe handles payments securely
- Firebase tracks ledger only

---

## 📝 Notes

### **Old vs New Files:**

**Deprecated (Don't use):**
- ❌ `lib/nft/arweave.ts` (platform Bundlr wallet)
- Use this for reference only, will be removed

**New (Active):**
- ✅ `lib/nft/arweave-user.ts` (user-signed transactions)
- ✅ This is the source of truth

### **Environment Variables:**

**Old (Remove after migration):**
```env
ARWEAVE_PRIVATE_KEY=<platform_wallet_key>
```

**New (None needed!):**
- No platform wallet = no secrets
- Users sign with their own wallets
- Only need public Arweave endpoint

---

## 🎯 Success Metrics

**Minting:**
- 100 mints/month = $450 revenue
- Low traffic needed for profitability

**Royalties:**
- Compound over time
- Passive income forever
- 5% of ALL sales across ALL marketplaces

**Market Fit:**
- External marketplace access = real utility
- Decentralized = Web3 legitimacy
- Low cost = competitive advantage
- Easy UX = broad appeal

---

## 🔗 Resources

- **Arweave Docs**: https://docs.arweave.org
- **ArConnect**: https://arconnect.io
- **BazAR Marketplace**: https://bazar.arweave.dev
- **STAMP Protocol**: https://github.com/ArweaveTeam/stamp
- **ViewBlock Explorer**: https://viewblock.io/arweave

---

**Last Updated:** November 7, 2025
**Status:** Phase 1 In Progress
**Next:** Update MintNFTModal for user-signed transactions
