# 🖼️ NFT Image Not Showing - Troubleshooting Guide

## 🔍 **The Problem**

When viewing an NFT, the image shows "Image unavailable" instead of displaying the cover art or media preview.

---

## 📋 **Where Image URLs Come From**

### **In Mint API** (`app/api/nft/mint/route.ts` lines 208-210):

```typescript
metadata: {
  ...nftMetadata,
  image: (asset.type === 'audio' || asset.type === 'document') && coverArtUrl
    ? coverArtUrl  // ← For audio/docs: use AI cover art
    : mintResult.assetUrl,  // ← For images/videos: use Arweave URL
}
```

**Image Source Logic:**
```
Audio/Document NFTs:
└─ Uses AI-generated cover art URL (from Firebase Storage)

Image/Video NFTs:
└─ Uses Arweave asset URL (https://arweave.net/[txId])
```

---

## ❌ **Common Causes**

### **1. Cover Art Not Generated**
```
Problem: Audio NFT has no coverArtUrl
Result: metadata.image = undefined
Fix: Generate cover art before minting
```

### **2. Arweave URL Not Loaded Yet**
```
Problem: Arweave transaction still pending
Result: Image exists but takes time to propagate
Fix: Wait 1-2 minutes for Arweave network
```

### **3. CORS Issues**
```
Problem: Browser blocks Arweave URLs
Result: Image URL valid but won't load in browser
Fix: Use Arweave gateway or proxy
```

### **4. Firebase Storage URL Expired**
```
Problem: Cover art URL is temporary Firebase URL
Result: Works initially, breaks after expiration
Fix: Use permanent Firebase URLs
```

---

## 🔧 **FIXES**

### **Fix 1: Ensure Cover Art is Generated**

**Update Mint API** to **always** have a cover art fallback:

```typescript
// In mint API, before minting:
let finalCoverArtUrl = coverArtUrl;

// If no cover art, generate placeholder or use default
if (!finalCoverArtUrl && (asset.type === 'audio' || asset.type === 'document')) {
  // Option A: Generate one quickly
  try {
    const coverArt = await generateAICoverArt({
      title: nftMetadata.name,
      description: nftMetadata.description,
      style: 'album_cover',
    });
    finalCoverArtUrl = coverArt.url;
  } catch (error) {
    console.warn('Failed to generate cover art, using default');
    // Option B: Use default placeholder
    finalCoverArtUrl = 'https://your-app.com/default-cover.jpg';
  }
}

// Then use finalCoverArtUrl in metadata:
image: (asset.type === 'audio' || asset.type === 'document') && finalCoverArtUrl
  ? finalCoverArtUrl
  : mintResult.assetUrl,
```

---

### **Fix 2: Use Permanent Cover Art URLs**

**Problem:** If cover art is in Firebase Storage with temporary URL.

**Solution:** Get permanent download URL:

```typescript
// In cover art generation:
import { getDownloadURL } from 'firebase/storage';

const coverArtUrl = await getDownloadURL(fileRef); // Permanent URL
```

---

### **Fix 3: Add Fallback in NFT Metadata**

**Update the metadata to always have a valid image:**

```typescript
metadata: {
  ...nftMetadata,
  image: (asset.type === 'audio' || asset.type === 'document') && coverArtUrl
    ? coverArtUrl
    : mintResult.assetUrl || 'https://arweave.net/[defaultImageTxId]',
  // Add animation_url for media files
  animation_url: (asset.type === 'audio' || asset.type === 'video')
    ? mintResult.assetUrl
    : undefined,
}
```

**NFT Standard Fields:**
- `image` = Preview/thumbnail (always required)
- `animation_url` = Actual media file (for audio/video)

---

### **Fix 4: Check Existing NFTs**

**For NFTs already minted with broken images:**

```typescript
// Run this script to fix existing NFTs:
const fixNFTImages = async () => {
  const nftsRef = adminDb().collection('nfts');
  const snapshot = await nftsRef.get();
  
  for (const doc of snapshot.docs) {
    const nft = doc.data();
    
    // Check if image is missing or broken
    if (!nft.metadata?.image || nft.metadata.image === '') {
      console.log(`Fixing NFT ${doc.id}: No image`);
      
      // Try to get image from Arweave metadata
      const arweaveUrl = `https://arweave.net/${nft.arweave.manifestId}`;
      
      try {
        const response = await fetch(arweaveUrl);
        const metadata = await response.json();
        
        if (metadata.image) {
          await doc.ref.update({
            'metadata.image': metadata.image,
            updatedAt: new Date(),
          });
          console.log(`✅ Fixed image for ${doc.id}`);
        }
      } catch (error) {
        console.error(`Failed to fix ${doc.id}:`, error);
      }
    }
  }
};
```

---

## 🧪 **DEBUGGING STEPS**

### **1. Check NFT in Firebase**

```
1. Go to Firebase Console → Firestore
2. Find nfts collection
3. Find your NFT document
4. Check metadata.image field
5. Copy the URL and test in browser
```

### **2. Check Arweave Transaction**

```
1. Get the arweaveId from NFT
2. Visit: https://viewblock.io/arweave/tx/[arweaveId]
3. Check if transaction is confirmed
4. Click "Data" tab to see metadata
5. Check if image field exists
```

### **3. Test Image URL**

```bash
# Test if image URL is accessible:
curl -I "https://arweave.net/[txId]"

# Should return 200 OK
# If 404: Image not on Arweave yet
# If timeout: Arweave gateway issue
```

### **4. Check Browser Console**

```javascript
// In browser console on NFT detail page:
console.log('NFT metadata:', nft.metadata);
console.log('Image URL:', nft.metadata.image);

// Try loading image directly:
const img = new Image();
img.onload = () => console.log('✅ Image loaded');
img.onerror = () => console.log('❌ Image failed');
img.src = nft.metadata.image;
```

---

## 🎯 **QUICK FIX FOR CURRENT ISSUE**

If you have an NFT with broken image **right now**:

### **Option 1: Manually Fix in Firebase**

```
1. Firebase Console → Firestore → nfts → [your NFT ID]
2. Click Edit Document
3. Find metadata → image
4. Replace with valid URL:
   - Cover art URL from Firebase Storage
   - Or Arweave URL: https://arweave.net/[txId]
5. Save
6. Refresh NFT page
```

### **Option 2: Re-fetch from Blockchain**

The NFT detail page already tries to fetch from blockchain if not in Firebase (lines 56-102).

If image is on Arweave but not showing:
```
1. Delete NFT from Firebase
2. Refresh NFT page
3. It will re-fetch from blockchain
4. Save updated metadata back to Firebase
```

---

## 🚀 **PERMANENT SOLUTION**

### **Update Mint API to Always Set Image:**

**File:** `app/api/nft/mint/route.ts`

**Change lines 205-211 to:**

```typescript
metadata: {
  ...nftMetadata,
  // ALWAYS set a valid image
  image: (() => {
    // 1. Use cover art for audio/docs (if available)
    if ((asset.type === 'audio' || asset.type === 'document') && coverArtUrl) {
      return coverArtUrl;
    }
    
    // 2. Use Arweave asset URL for images/videos
    if (mintResult.assetUrl) {
      return mintResult.assetUrl;
    }
    
    // 3. Fallback to default placeholder
    return `${process.env.NEXT_PUBLIC_APP_URL}/default-nft-cover.jpg`;
  })(),
  
  // Add animation_url for media files
  animation_url: (asset.type === 'audio' || asset.type === 'video')
    ? mintResult.assetUrl
    : undefined,
},
```

---

## 📊 **EXPECTED BEHAVIOR**

### **Correct Image Display:**

```
Image NFT:
├─ metadata.image = Arweave URL of image
└─ Shows image directly

Audio NFT:
├─ metadata.image = AI cover art URL
├─ metadata.animation_url = Arweave URL of audio file
├─ Shows cover art as preview
└─ MediaPlayer plays audio

Video NFT:
├─ metadata.image = Arweave URL of video (or thumbnail)
├─ metadata.animation_url = Arweave URL of video
└─ MediaPlayer plays video

Document NFT:
├─ metadata.image = AI cover art or icon
└─ Shows document icon/cover
```

---

## 🛠️ **CREATE DEFAULT COVER IMAGE**

Add a default fallback image to your app:

**File:** `public/default-nft-cover.jpg`

Create a simple 1000x1000 image with:
- Your app logo
- Text: "Neural Salvage NFT"
- Cyberpunk aesthetic

Then reference it:
```typescript
const DEFAULT_NFT_IMAGE = `${process.env.NEXT_PUBLIC_APP_URL}/default-nft-cover.jpg`;
```

---

## ✅ **VERIFICATION CHECKLIST**

After fixing:
- [ ] NFT detail page shows image
- [ ] Image loads without console errors
- [ ] CORS errors resolved
- [ ] Fallback image works if URL fails
- [ ] Audio NFTs show cover art
- [ ] Video NFTs show preview
- [ ] Image URLs are permanent (not temporary)
- [ ] New mints always have valid image
- [ ] Existing NFTs migrated/fixed

---

## 🆘 **STILL NOT WORKING?**

Check these:

1. **Firebase Storage CORS**
   ```
   Firebase Console → Storage → Rules
   Ensure read access is public for cover art
   ```

2. **Arweave Gateway**
   ```
   Try alternate gateway:
   https://arweave.net/[txId]
   https://gateway.arweave.net/[txId]
   ```

3. **Browser Cache**
   ```
   Hard refresh: Ctrl+Shift+R
   Clear cache and reload
   ```

4. **Check Network Tab**
   ```
   F12 → Network → Find image request
   See what error it returns
   ```

---

**Last Updated:** November 8, 2025  
**Status:** Diagnostic guide + fixes ready
