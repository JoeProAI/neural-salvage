# 💾 Backup & Recovery Guide

## Multi-Layer Backup Strategy

**If you can make money, you need backups. Period.**

---

## 📦 Layer 1: Firebase Backups

### Automatic Backups (Recommended)

**Enable in Firebase Console:**

```
1. Go to https://console.firebase.google.com
2. Select your project: nueral-salvage
3. Firestore Database → Backups
4. Click "Enable backups"
5. Configure:
   - Frequency: Daily
   - Retention: 7 days minimum (30 days recommended)
   - Location: Multi-region
6. Save
```

**Cost:** ~$0.50-2/month for typical usage

### Manual Firestore Export

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export Firestore
firebase firestore:export gs://nueral-salvage-backups/firestore-$(date +%Y%m%d)

# List backups
gsutil ls gs://nueral-salvage-backups/
```

### Storage Backup

```bash
# Backup Firebase Storage to another bucket
gsutil -m cp -r \
  gs://nueral-salvage.firebasestorage.app \
  gs://nueral-salvage-backups/storage-$(date +%Y%m%d)
```

### Schedule Regular Backups

**Option 1: GitHub Actions (Free)**

Create `.github/workflows/backup.yml`:

```yaml
name: Firebase Backup

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Firebase Tools
        run: npm install -g firebase-tools
      
      - name: Export Firestore
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: |
          firebase firestore:export \
            gs://nueral-salvage-backups/firestore-$(date +%Y%m%d)
```

**Get FIREBASE_TOKEN:**
```bash
firebase login:ci
# Copy token to GitHub Secrets
```

---

## 🔐 Layer 2: Wallet Backups

### Critical: Your Arweave Wallet

**3-Location Rule:**

**Location 1: Password Manager**
```
1Password / Bitwarden / LastPass
→ Store seed phrase (12 words)
→ Store JWK file as secure note
→ Add tags: "arweave", "neural-salvage", "critical"
```

**Location 2: Physical Backup**
```
Seed Phrase:
→ Write on paper with pen
→ Store in fireproof safe or safety deposit box
→ Consider steel backup plate: https://cryptosteel.com

JWK File:
→ Print on paper, store with seed phrase
→ Or USB drive in safe
```

**Location 3: Encrypted Digital Backup**
```
# Create encrypted backup
# Using GPG:
gpg --symmetric --cipher-algo AES256 arweave-wallet.json

# Creates: arweave-wallet.json.gpg
# Store on:
→ External hard drive (encrypted)
→ Cloud storage (Dropbox, Google Drive) - already encrypted
→ Second password manager account
```

### Wallet Recovery Test

**Test this NOW (before you need it):**

```
1. Take seed phrase from Location 2
2. Restore wallet: https://arweave.app
3. Verify address matches
4. Check balance
5. Do NOT use this restored wallet (security risk)
6. Delete from computer after test
```

---

## 💻 Layer 3: Code Backups

### Git (Already Done!)

```bash
# Verify remote
git remote -v

# Create backup tag
git tag -a backup-$(date +%Y%m%d) -m "Backup before major changes"
git push origin backup-$(date +%Y%m%d)

# List all backup tags
git tag -l "backup-*"
```

### GitHub Repository Backup

**Option 1: GitHub Archive (Manual)**
```
1. Go to your repo
2. Settings → Archives
3. Download ZIP archive
4. Store on external drive
```

**Option 2: Mirror Repository**
```bash
# Clone as mirror
git clone --mirror https://github.com/your-username/neural-salvage.git

# Store on external drive or second Git host
```

### Vercel Configuration Backup

**Save your entire Vercel config:**

```
1. Vercel Dashboard → Settings
2. Scroll through all sections
3. Screenshot or document:
   - Environment variables (names, not values)
   - Build settings
   - Domain configuration
   - Team members
   - Integrations
4. Store in password manager as secure note
```

---

## 📝 Layer 4: Environment Variables Backup

### Secure Documentation

```
Create file: neural-salvage-env-backup.txt
Encrypt it with password manager or GPG

Format:
# Neural Salvage Environment Variables
# Last updated: 2025-01-22
# Version: 1.0

DAYTONA_API_KEY=dtn_...
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN..."
QDRANT_URL=https://...
QDRANT_API_KEY=eyJh...
ARWEAVE_PRIVATE_KEY={"kty":"RSA",...}
NEXT_PUBLIC_APP_URL=https://...

# Version History:
# 2025-01-22: Added ARWEAVE_PRIVATE_KEY
# 2025-01-15: Updated OPENAI_API_KEY
```

**Store in 2 locations:**
1. Password manager (primary)
2. Encrypted file on external drive (backup)

### Update After Every Change

```
When you rotate keys:
1. Update production
2. Update backup document
3. Add version note
4. Keep old versions for 90 days
```

---

## 🎨 Layer 5: NFT Data (Blockchain Backup)

### Good News: Already Backed Up!

```
✅ All NFTs stored on Arweave
✅ Permanent (200+ years)
✅ Decentralized (replicated globally)
✅ Cannot be deleted
✅ No action needed!
```

### Metadata Backup (Extra Protection)

```typescript
// Add to mint API - save metadata copy

export async function POST(request: NextRequest) {
  // ... minting logic ...
  
  // After successful mint, backup metadata
  await backupNFTMetadata(nft);
}

async function backupNFTMetadata(nft: NFT) {
  // Save to Firestore (already happens)
  // Plus: Send to backup service
  
  const backup = {
    nftId: nft.id,
    arweaveId: nft.arweave?.arweaveId,
    metadataUri: nft.metadataUri,
    createdAt: nft.createdAt,
  };
  
  // Option 1: Log for external collection
  console.log('[NFT_BACKUP]', JSON.stringify(backup));
  
  // Option 2: Send to webhook
  if (process.env.BACKUP_WEBHOOK_URL) {
    await fetch(process.env.BACKUP_WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(backup),
    });
  }
}
```

---

## 🔄 Recovery Procedures

### Scenario 1: Lost Arweave Wallet

**If you have seed phrase:**
```
1. Go to https://arweave.app
2. Click "Restore wallet"
3. Enter 12-word seed phrase
4. Wallet restored!
5. Generate new JWK
6. Update ARWEAVE_PRIVATE_KEY in Vercel
7. Redeploy
```

**If you have JWK file:**
```
1. Import JWK to ArConnect
2. Or use directly in code
3. Already good to go!
```

**If you lost both:**
```
❌ Wallet is GONE forever
❌ AR tokens lost
✅ NFTs still exist (users own them)
→ Create new wallet
→ Fund with new AR
→ Update env vars
→ Platform continues
```

### Scenario 2: Firestore Data Loss

**Restore from backup:**

```bash
# List available backups
firebase firestore:backups:list

# Restore specific backup
firebase firestore:backups:restore \
  --backup-id backup-id-here \
  --location us-east1

# Or from manual export
gcloud firestore import gs://nueral-salvage-backups/firestore-20250122
```

### Scenario 3: Complete Platform Failure

**Recovery Steps:**

```
1. Clone repo from GitHub
2. Create new Vercel project
3. Import environment variables from backup
4. Deploy to Vercel
5. Restore Firestore from backup (if needed)
6. Update DNS (if custom domain)
7. Test all functionality
8. Platform restored!
```

**Time estimate:** 2-4 hours if you have backups

### Scenario 4: Compromised Keys

**Immediate rotation:**

```bash
# 1. Firebase
→ Console → Service Accounts → Create new key
→ Update FIREBASE_ADMIN_PRIVATE_KEY

# 2. Arweave
→ Create new wallet
→ Transfer AR balance
→ Update ARWEAVE_PRIVATE_KEY

# 3. Other APIs
→ Daytona: Regenerate in dashboard
→ OpenAI: Create new key in dashboard
→ Qdrant: Rotate in Qdrant cloud

# 4. Deploy
→ Update all in Vercel
→ Redeploy
→ Test thoroughly
```

---

## 🔍 Testing Your Backups

### Monthly Backup Test

**First Sunday of each month:**

```
1. Verify Firebase backup exists
   → Check Firebase Console → Backups
   
2. Test wallet restore
   → Import seed phrase to test wallet
   → Verify address matches
   → Delete test wallet
   
3. Check Git backups
   → Verify latest commits pushed
   → Check backup tags exist
   
4. Verify env var backup
   → Open password manager
   → Confirm all keys documented
   
5. Test recovery procedure
   → Clone repo to new folder
   → Verify can build locally
   → Delete test clone
```

**Document results:**
```
Backup Test: 2025-01-22
✅ Firebase backup: 7 days available
✅ Wallet restore: Success
✅ Git backups: 15 tags
✅ Env vars: All documented
✅ Recovery test: Success
```

---

## 📊 Backup Checklist

### Daily (Automatic)
- [ ] Firebase auto-backup (if enabled)
- [ ] Git commits pushed to GitHub
- [ ] Vercel deployment logs saved

### Weekly
- [ ] Check Firebase backup status
- [ ] Verify wallet balance
- [ ] Review error logs

### Monthly
- [ ] Run backup test procedure
- [ ] Update env var backup doc
- [ ] Review storage costs
- [ ] Archive old backups

### Quarterly
- [ ] Full recovery test
- [ ] Rotate critical keys
- [ ] Update backup locations
- [ ] Review backup strategy

---

## 💰 Backup Costs

**Estimated monthly costs:**

| Service | Cost | Worth It? |
|---------|------|-----------|
| Firebase Backups | $0.50-2 | ✅ Yes |
| External Storage | $0-5 | ✅ Yes |
| Password Manager | $3-5 | ✅ Yes |
| Steel Backup Plate | $50 one-time | ✅ Yes |
| **Total** | **~$10/month** | **✅ Cheap insurance** |

**What you're protecting:**
- User data (priceless)
- NFT platform (revenue)
- Arweave wallet (real money)
- Your reputation (invaluable)

**Cost of NOT having backups:**
- Lost data: ❌ $10,000s
- Lost wallet: ❌ $100s-1000s
- Lost reputation: ❌ Platform dead
- Recovery time: ❌ Days/weeks

**Backups are cheap. Data loss is expensive.**

---

## 🎯 Quick Recovery Commands

**Save these for emergencies:**

```bash
# Restore Firestore
firebase firestore:backups:restore --backup-id BACKUP_ID

# Clone repo
git clone https://github.com/your-username/neural-salvage.git

# Check wallet balance
# (Add to your monitoring tools)

# List backups
gsutil ls gs://nueral-salvage-backups/

# Export current state
firebase firestore:export gs://nueral-salvage-backups/emergency-$(date +%Y%m%d-%H%M)
```

---

## ✅ You're Protected

**With this backup strategy:**

✅ **Firebase data:** Daily automatic backups
✅ **Arweave wallet:** 3-location backup
✅ **Code:** Git + GitHub + local clones
✅ **NFT data:** Permanent blockchain storage
✅ **Env vars:** Encrypted documentation
✅ **Recovery plan:** Tested and ready

**You can recover from:**
- Server failure ✅
- Data corruption ✅
- Lost wallet ✅
- Compromised keys ✅
- Accidental deletion ✅
- Natural disaster ✅

**Recovery time:** 2-4 hours with proper backups

---

## 📞 Support

**If you need to recover:**

1. Stay calm
2. Check this guide
3. Follow procedures
4. Document everything
5. Test after recovery

**You've got this. Your data is safe.** 💾
