# 💰 How to Sell Your Arweave NFTs

## 🎯 Overview

Your Neural Salvage NFTs are **Arweave Atomic NFTs** - real blockchain assets with permanent storage. Here's how to sell them!

---

## 🏪 **Option 1: List on Existing Marketplaces**

### **A. OpenSea (Largest NFT Marketplace)**

**Status:** OpenSea doesn't directly support Arweave NFTs yet, but you can bridge them.

**How to list:**

1. **Bridge to Ethereum/Polygon:**
   - Use a bridge service (e.g., Wormhole)
   - Wrap your Arweave NFT to make it ERC-721 compatible
   - Pay bridge fees (~$5-50)

2. **Create OpenSea Collection:**
   - Go to: https://opensea.io/collection/create
   - Connect MetaMask wallet
   - Add your bridged NFT
   - Set price and list

**Pros:**
- ✅ Huge user base (millions)
- ✅ Easy to use
- ✅ Built-in payments

**Cons:**
- ❌ Requires bridging (extra cost)
- ❌ 2.5% marketplace fee
- ❌ Gas fees on Ethereum

---

### **B. Arweave Native Marketplaces**

These marketplaces directly support Arweave NFTs (no bridging needed):

#### **1. ArDrive Marketplace**
- **URL:** https://ardrive.io/marketplace
- **Fee:** ~2%
- **Payment:** AR tokens
- **How to list:**
  1. Connect ArConnect wallet
  2. Import your NFT using transaction ID
  3. Set price in AR
  4. List for sale

#### **2. BazAR**
- **URL:** https://bazar.arweave.dev
- **Fee:** 0% (decentralized)
- **Payment:** AR tokens
- **How to list:**
  1. Connect wallet
  2. Create listing contract
  3. Set price
  4. Share listing link

#### **3. Pianity (Music/Art)**
- **URL:** https://pianity.com
- **Fee:** 15%
- **Payment:** AR tokens + credit card
- **Best for:** Digital art, music NFTs

---

## 🔨 **Option 2: Build Your Own Marketplace**

Add a marketplace to Neural Salvage platform:

### **Features to Add:**

**1. List for Sale**
```typescript
// Already have this in your asset!
asset.forSale = true;
asset.price = 10; // AR tokens or USD
```

**2. Browse Marketplace**
```typescript
// Create /marketplace page
// Show all assets where forSale = true
```

**3. Purchase Flow**
```typescript
// Buyer clicks "Buy"
// Payment via Stripe (USD) or ArConnect (AR)
// Transfer NFT ownership
// Update currentOwner in Firestore
```

**4. Transfer NFT**
```typescript
// Update NFT document:
nft.currentOwner = buyerWalletAddress;
nft.transfers.push({
  from: sellerAddress,
  to: buyerAddress,
  price: 10,
  timestamp: new Date()
});
```

### **Implementation Plan:**

I can help you build:
- ✅ Marketplace listing page
- ✅ Buy button with Stripe integration
- ✅ NFT transfer on purchase
- ✅ Seller dashboard (view sales, earnings)
- ✅ Buyer dashboard (purchased NFTs)

**Pros:**
- ✅ Keep 100% of fees (no marketplace cut)
- ✅ Full control over UX
- ✅ Build your brand
- ✅ Accept USD payments (easier for users)

**Cons:**
- ❌ Requires development time
- ❌ Need to market it yourself
- ❌ Lower initial traffic

---

## 💳 **Payment Options**

### **A. Accept USD (via Stripe)**

**Current Setup:**
- ✅ You already have Stripe for minting
- ✅ Can easily add "Buy NFT" flow

**How it works:**
1. Buyer pays $X USD
2. Stripe processes payment
3. You get USD (minus Stripe fee)
4. System transfers NFT ownership
5. Original seller gets paid out

**Pros:**
- Most users have credit cards
- No crypto knowledge needed
- You handle conversion

**Cons:**
- Stripe takes 2.9% + $0.30
- You need to convert USD → AR for gas fees

---

### **B. Accept AR Tokens (via ArConnect)**

**How it works:**
1. Buyer connects ArConnect wallet
2. Buyer sends AR to your platform wallet
3. Platform verifies payment
4. System transfers NFT ownership
5. Platform pays seller (minus fee)

**Pros:**
- No Stripe fees
- Native to Arweave
- Crypto-native users prefer this

**Cons:**
- Most users don't have AR
- Need to handle crypto transactions
- Price volatility

---

### **C. Hybrid Approach (Recommended)**

Accept both USD and AR:
```typescript
// Payment options
payment_method: 'stripe' | 'arweave'
price_usd: 10.00
price_ar: 0.25  // Dynamic conversion
```

**Benefits:**
- ✅ Reach both crypto and non-crypto users
- ✅ Maximize sales
- ✅ Users choose preferred method

---

## 🎨 **Marketing Your NFTs**

### **1. Social Media**

**Twitter/X:**
- Share NFT image + Arweave link
- Use hashtags: #NFTs #Arweave #DigitalArt #Web3
- Tag @ArweaveEco for visibility

**Instagram:**
- Post high-quality images
- Link to your marketplace in bio
- Use Instagram Stories for drops

**Discord:**
- Join NFT communities
- Share in self-promo channels
- Build your own server

### **2. NFT Communities**

- Reddit: r/NFT, r/Arweave
- Discord: Arweave Official, NFT collectors
- Twitter Spaces: Join NFT discussions

### **3. Your Platform**

- Create `/marketplace` page
- Show trending/featured NFTs
- Add search and filters
- Share links to specific NFTs

---

## 📊 **Pricing Strategy**

### **Initial Pricing:**

**For New Artists:**
- Start low: $5-20 USD
- Build reputation first
- Increase prices as demand grows

**For Established Artists:**
- Market rate: $50-500+
- Based on your following
- Comparable to similar work

### **Dynamic Pricing:**

```typescript
// Factors to consider:
- Rarity (1/1 vs editions)
- Your follower count
- Similar NFT sales
- Art quality/uniqueness
- Current market trends
```

### **Auction vs Fixed Price:**

**Fixed Price:**
- ✅ Simple
- ✅ Immediate sales
- ✅ Predictable

**Auction:**
- ✅ Can get higher price
- ✅ Creates excitement
- ❌ More complex to implement

---

## 🔄 **NFT Transfer Process**

### **On Your Platform:**

**When someone buys:**

```typescript
// 1. Verify payment
const paymentReceived = await verifyStripePayment(sessionId);

// 2. Update NFT ownership
await adminDb().collection('nfts').doc(nftId).update({
  currentOwner: buyerWalletAddress,
  previousOwner: sellerWalletAddress,
  transfers: FieldValue.arrayUnion({
    from: sellerWalletAddress,
    to: buyerWalletAddress,
    price: priceUSD,
    priceAR: priceAR,
    timestamp: new Date(),
    txId: stripeSessionId
  })
});

// 3. Update asset
await adminDb().collection('assets').doc(assetId).update({
  ownerId: buyerId,
  forSale: false,
  soldAt: new Date(),
  soldPrice: priceUSD
});

// 4. Pay seller (via Stripe Connect or manual)
await payoutToSeller(sellerId, priceUSD * 0.95); // 5% platform fee

// 5. Notify both parties
await sendEmail(buyer, 'You purchased an NFT!');
await sendEmail(seller, 'Your NFT sold!');
```

---

## 🛡️ **Security & Trust**

### **Verify Ownership:**

Users can verify NFT authenticity:
- ✅ Check transaction on ViewBlock
- ✅ Verify wallet address matches
- ✅ See full transfer history
- ✅ View on-chain metadata

### **Prevent Fraud:**

**Your platform should:**
- ✅ Only allow owner to list NFT
- ✅ Remove listing after sale
- ✅ Hold funds until transfer complete
- ✅ Show verified badge for your mints

---

## 📈 **Royalties (Future Income)**

### **How Royalties Work:**

**Set royalty percentage:**
```typescript
royaltyPercentage: 10  // 10% to original creator
```

**On secondary sales:**
```
Sale price: $100
Royalty (10%): $10 → Original creator
Seller gets: $90
```

### **Implementing Royalties:**

**Your marketplace:**
```typescript
// On purchase
const royaltyAmount = price * (nft.royaltyPercentage / 100);
await payoutToCreator(nft.originalMinter, royaltyAmount);
await payoutToSeller(nft.currentOwner, price - royaltyAmount);
```

**External marketplaces:**
- Include royalty in metadata
- Most respect creator royalties
- Automatic on OpenSea

---

## 🚀 **Quick Start: Enable Selling Now**

### **1. Add "List for Sale" Feature:**

I can help you add:
- Toggle switch: "List for sale"
- Price input field
- Save to Firestore

### **2. Create Marketplace Page:**

Display all NFTs where `forSale = true`

### **3. Add Buy Button:**

- Stripe checkout for USD
- ArConnect for AR tokens
- Transfer ownership on payment

### **4. Seller Dashboard:**

- View your listed NFTs
- See sales history
- Track earnings

---

## 💡 **Recommendations**

**For Your Platform (Short Term):**

1. ✅ Add "List for Sale" toggle (this is easy!)
2. ✅ Create `/marketplace` page
3. ✅ Enable purchases via Stripe (you already have this!)
4. ✅ Auto-transfer NFT on purchase

**For External Sales (Long Term):**

1. 🔄 List on BazAR (native Arweave)
2. 🔄 Bridge to OpenSea (if you want massive audience)
3. 🔄 Share on Twitter/Discord for visibility

---

## 📋 **Next Steps**

**Want me to:**

1. **Build marketplace features?**
   - Listing page
   - Buy button
   - Transfer system
   - Seller dashboard

2. **Create selling guide for users?**
   - How to list their NFTs
   - Pricing tips
   - Marketing advice

3. **Add external marketplace links?**
   - Quick links to list on BazAR
   - Integration with ArDrive
   - OpenSea bridge instructions

**Let me know what you want to tackle first!** 🚀

---

## 🔗 **Useful Links**

- **BazAR Marketplace:** https://bazar.arweave.dev
- **ArDrive:** https://ardrive.io
- **OpenSea:** https://opensea.io
- **Arweave.org:** https://arweave.org
- **ViewBlock Explorer:** https://viewblock.io/arweave
- **NFT Marketing Guide:** https://nftcalendar.io/marketing-guide
