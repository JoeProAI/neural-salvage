# 🗂️ Neural Salvage Storage Architecture

**Exactly where your data lives**

---

## 📍 The Two-Tier System

### **Your Current Setup:**

```
USER UPLOADS FILE
       ↓
TIER 1: Firebase Storage (Always)
├─ File stored on Google Cloud
├─ Metadata in Firestore database
├─ Fast access via CDN
└─ Cost: ~$0.026/GB/month

       ↓ (Optional: User mints NFT)

TIER 2: Arweave Blockchain (Premium)
├─ File copied to blockchain
├─ NFT metadata created
├─ Permanent transaction ID
└─ Cost: $0.01-$2 one-time
```

---

## 🔥 Firebase (Google Cloud) - Primary Storage

### **Physical Location:**
- Google's data centers (multi-region)
- US: Iowa, South Carolina, Oregon
- Europe: Belgium, London, Frankfurt
- Asia: Tokyo, Singapore, Sydney

### **What Lives There:**

**1. Firebase Storage (Files):**
```
/users/
  /{userId}/
    /uploads/
      /images/photo1.jpg    (actual file bytes)
      /videos/clip1.mp4     (actual file bytes)
```

**2. Firestore (Database):**
```
/users/{userId}             User account data
/assets/{assetId}           File metadata
/nfts/{nftId}              NFT records
/collections/{id}          User folders
```

**3. Firebase Auth:**
```
User sessions
Login tokens
OAuth data
```

### **Monthly Costs:**

| Users | Storage | DB Ops | Total/Month |
|-------|---------|--------|-------------|
| 100 | 100GB | Medium | $10-20 |
| 500 | 500GB | High | $30-50 |
| 1K | 1TB | High | $50-100 |

**Pricing breakdown:**
- Storage: $0.026/GB/month
- Downloads: $0.12/GB
- Database reads: $0.06 per 100K

---

## ⛓️ Arweave (Blockchain) - NFT Storage

### **Physical Location:**
- Distributed globally across 1000+ miner nodes
- Replicated automatically
- No single point of failure

### **What Lives There:**

**Only NFTs** (when user pays to mint):
```
Transaction ID: abc123xyz789...
├─ Asset (copy of file from Firebase)
├─ Metadata JSON
└─ Manifest (atomic NFT standard)

Accessible at:
https://arweave.net/abc123xyz789...
```

### **One-Time Costs:**

| File Size | AR Cost | USD Cost |
|-----------|---------|----------|
| 10 KB | 0.0001 AR | ~$0.01 |
| 100 KB | 0.001 AR | ~$0.05 |
| 1 MB | 0.01 AR | ~$0.10-0.20 |
| 10 MB | 0.1 AR | ~$1-2 |

**No monthly fees - stored for 200+ years**

---

## 🔄 Data Flow: Upload to NFT

### **Step 1: User Uploads (Free)**

```
User selects file
    ↓
Uploaded to Firebase Storage
    ↓
Metadata saved to Firestore
    ↓
File visible in user's gallery
```

**Storage:** Google Cloud (Firebase)  
**Cost to you:** ~$0.026/GB/month  
**Cost to user:** FREE

---

### **Step 2: User Mints NFT (Paid)**

```
User clicks "Mint as NFT"
    ↓
File downloaded from Firebase
    ↓
Uploaded to Arweave blockchain
    ↓
NFT metadata created
    ↓
Transaction ID returned
    ↓
Firestore record updated with NFT data
```

**Storage:** Both Firebase + Arweave  
**Cost to you:** $0.01-0.20 (one-time)  
**Cost to user:** $0.50-2.00  
**Your profit:** $0.30-1.80 per mint

---

## 💰 Economics Breakdown

### **Scenario: 100 Active Users**

**Firebase costs (monthly):**
```
Users: 100
Average storage per user: 1GB
Total storage: 100GB

Storage: 100GB × $0.026 = $2.60/month
Downloads: ~$5/month
Database: ~$3/month
───────────────────────────
TOTAL: ~$10-15/month
```

**Arweave costs (per NFT mint):**
```
Average file size: 500KB
Cost per mint: $0.10
User pays: $1.00
───────────────────────────
Profit per mint: $0.90

If 20 users mint 1 NFT each/month:
Revenue: 20 × $1 = $20
Cost: 20 × $0.10 = $2
Profit: $18/month

This covers Firebase costs + $8 profit!
```

---

## 📊 Storage Comparison

| Feature | Firebase | Arweave |
|---------|----------|---------|
| **Type** | Cloud storage | Blockchain |
| **Cost** | $0.026/GB/month | $0.10-0.20/GB one-time |
| **Lifespan** | While you pay | 200+ years |
| **Speed** | Fast (CDN) | Medium (blockchain) |
| **Can delete?** | Yes | No (permanent) |
| **Can edit?** | Yes | No (immutable) |
| **Ownership** | You own | User owns NFT |
| **Portable?** | No | Yes (blockchain) |

---

## 🎯 What Users See

### **Free User (Firebase only):**
```
✓ Upload unlimited files
✓ View in gallery
✓ Organize in collections
✓ AI tagging & search
✓ Share links

✗ Not permanent
✗ Can't sell as NFT
✗ Depends on platform staying up
```

### **Paid User (Firebase + Arweave NFT):**
```
✓ Everything from Free +
✓ Permanent blockchain storage
✓ Proof of ownership timestamp
✓ Can sell on OpenSea/Rarible
✓ Portable (not locked to your platform)
✓ Survives even if you shut down
✓ Transaction ID = proof of authenticity
```

---

## 🔐 Where Secrets Live

### **Environment Variables (.env.local):**
```
# Firebase (Google Cloud)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...

# Arweave (Blockchain)
ARWEAVE_PRIVATE_KEY={"kty":"RSA",...}
NEXT_PUBLIC_APP_URL=https://neural-salvage.vercel.app

# Platform wallet = your wallet for minting
# User files = Firebase
# NFTs = Arweave
```

### **Platform Wallet Balance:**
```
Check anytime:
node scripts/check-balance.js

Example output:
Balance: 0.5 AR
Estimated mints: ~500-1000
Current value: ~$5-10 USD
```

---

## 🚀 Recommended Setup

### **Development:**
- Firebase: Free tier (plenty for testing)
- Arweave: 0.1 AR (~$1) for test mints

### **Production (100 users):**
- Firebase: Blaze plan (~$10-20/month)
- Arweave: 5 AR (~$50) refill when low

### **Scale (1000 users):**
- Firebase: ~$50-100/month
- Arweave: 10-20 AR (~$100-200) reserve
- Revenue from NFTs covers both!

---

## ✅ Quick Summary

**Where is storage?**

1. **Regular files:** Google Cloud (Firebase)
   - Location: Google data centers
   - Cost: ~$10-20/month for 100 users
   - Lifespan: As long as you pay

2. **NFT files:** Arweave blockchain
   - Location: Distributed globally (1000+ nodes)
   - Cost: $0.01-2 one-time per NFT
   - Lifespan: 200+ years minimum

3. **User data:** Firestore database (Google)
   - Location: Same as Firebase
   - Cost: Included in Firebase bill

**Bottom line:** 
- Free uploads = Firebase (you pay ~$10/mo)
- NFT mints = Arweave (user pays $1, you keep $0.90)
- You profit from NFTs to cover Firebase costs!
