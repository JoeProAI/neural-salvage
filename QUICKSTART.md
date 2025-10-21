# 🚀 Neural Salvage - Quick Start Guide

Get Neural Salvage running in **under 10 minutes** with this streamlined guide!

---

## ⚡ Fastest Path: Daytona.io

```bash
# 1. Install Daytona
curl -sf https://download.daytona.io/daytona/install.sh | sh

# 2. Create workspace
daytona create https://github.com/your-username/neural-salvage

# 3. Configure environment (in Daytona terminal)
cp .env.example .env.local
nano .env.local  # Add your API keys

# 4. Start development
npm run dev

# Done! Access via Daytona's public URL
```

---

## 🏃 Manual Quick Start

### Step 1: Extract & Install (2 minutes)
```bash
# Extract the zip
unzip neural-salvage-mvp.zip
cd neural-salvage

# Install dependencies
npm install
```

### Step 2: Firebase Setup (3 minutes)
1. Go to https://console.firebase.google.com/
2. Create new project: "neural-salvage"
3. Enable **Authentication** → Email/Password, Google, GitHub
4. Create **Firestore Database** → Production mode
5. Enable **Storage** → Production mode
6. Get config from **Project Settings** → Your apps → Web

### Step 3: Get API Keys (3 minutes)
1. **OpenAI**: https://platform.openai.com/api-keys
2. **Qdrant**: https://cloud.qdrant.io/ (create free cluster)
3. **Stripe** (optional): https://dashboard.stripe.com/test/apikeys

### Step 4: Configure Environment (1 minute)
```bash
cp .env.example .env.local
```

Edit `.env.local` with your keys:
```env
# Minimum required for testing
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-key
```

### Step 5: Deploy Firebase Rules (1 minute)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
firebase init  # Select Firestore + Storage, use existing files
firebase deploy --only firestore:rules,storage:rules
```

### Step 6: Run! (30 seconds)
```bash
npm run dev
```

Open http://localhost:3000 🎉

---

## 🎯 First Steps After Running

### 1. Create Account
- Go to http://localhost:3000
- Click "Get Started"
- Sign up with email or social auth

### 2. Upload Media
- Click "Upload Media" on dashboard
- Drag & drop images/videos
- Watch AI analysis happen automatically

### 3. Try Search
- Use natural language: "sunset over mountains"
- See semantic search in action
- Filter by type, tags, colors

### 4. Create Collection
- Go to Collections
- Create your first folder
- Organize your media

### 5. Test Marketplace (Optional)
- Connect Stripe account in Settings
- Mark an asset "For Sale"
- Set a price
- View in Marketplace

---

## 🔧 Troubleshooting

### "Firebase not configured"
→ Check `.env.local` has all NEXT_PUBLIC_FIREBASE_* variables

### "OpenAI API error"
→ Verify OPENAI_API_KEY is valid and has credits

### "Qdrant connection failed"
→ Check QDRANT_URL and QDRANT_API_KEY

### "Upload fails"
→ Deploy Firebase Storage rules: `firebase deploy --only storage:rules`

### "Dependencies won't install"
→ Try: `rm -rf node_modules package-lock.json && npm install`

---

## 📱 Test Checklist

- [ ] Sign up with email
- [ ] Sign in with Google/GitHub
- [ ] Upload an image
- [ ] Wait for AI analysis
- [ ] Search for the image
- [ ] Create a collection
- [ ] Add image to collection
- [ ] Edit image tags
- [ ] Mark image for sale
- [ ] View marketplace

---

## 🚀 Deploy to Production

### Vercel (Recommended)
```bash
# 1. Push to GitHub
git remote add origin https://github.com/your-username/neural-salvage.git
git push -u origin main

# 2. Import to Vercel
# - Go to vercel.com
# - Import repository
# - Add environment variables
# - Deploy!
```

### Update After Deploy
1. Add production URL to Firebase authorized domains
2. Update Stripe webhook URL
3. Switch to production API keys
4. Test everything again

---

## 💡 Pro Tips

### Development
- Use Daytona for instant setup
- Test with Firebase emulators
- Use Stripe test mode
- Monitor AI costs

### Production
- Enable Firebase security rules
- Set up error tracking
- Monitor usage and costs
- Implement rate limiting
- Use CDN for media

### AI Processing
- Start with small batches
- Monitor API usage
- Implement retry logic
- Cache embeddings
- Use fallback providers

---

## 📞 Need Help?

1. **Check docs**: `docs/setup.md` for detailed guide
2. **Review API**: `docs/api.md` for endpoint details
3. **Architecture**: `docs/architecture.md` for system design
4. **Handoff**: `HANDOFF.md` for complete overview

---

## 🎉 You're All Set!

Neural Salvage is ready to go. Just:
1. Configure your services
2. Run the app
3. Start uploading
4. Enjoy AI-powered media management!

**Happy salvaging!** 🤖✨