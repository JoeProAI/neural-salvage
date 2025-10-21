# Neural Salvage - Production Deployment Guide

## 🚀 Quick Deployment to Vercel

Neural Salvage is now powered by **Daytona** for seamless AI processing in isolated sandboxes. This guide will help you deploy to production.

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - For repository hosting
2. **Vercel Account** - For hosting (free tier available)
3. **Daytona API Key** - Get from [Daytona Dashboard](https://app.daytona.io)
4. **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com)
5. **Firebase Project** - Set up at [Firebase Console](https://console.firebase.google.com)
6. **Qdrant Instance** - Cloud or self-hosted from [Qdrant](https://qdrant.tech)
7. **Stripe Account** (Optional) - For marketplace features

---

## Step 1: Get Your API Keys

### Daytona API Key
1. Go to [Daytona Dashboard](https://app.daytona.io)
2. Navigate to **Keys** section
3. Click **Create Key**
4. Select permissions: `Sandboxes` (write & delete)
5. Copy your key (format: `dtn_...`)

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy key (format: `sk-proj-...`)

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** → **General**
4. Copy all configuration values
5. Go to **Service Accounts** → **Generate New Private Key**
6. Save the JSON file (you'll need the values)

### Qdrant Configuration
1. Create account at [Qdrant Cloud](https://cloud.qdrant.io)
2. Create a new cluster
3. Copy the **Cluster URL** and **API Key**

---

## Step 2: Push to GitHub

```bash
# Navigate to project directory
cd "c:/Projects/The Machine/Nueral Salvage/neural-salvage"

# Add all files
git add .

# Commit
git commit -m "feat: integrate Daytona for AI processing"

# Create GitHub repository (via GitHub CLI or web interface)
# Option 1: Using GitHub CLI
gh repo create neural-salvage --public --source=. --remote=origin --push

# Option 2: Manual
# Create repository at github.com/new
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/neural-salvage.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your `neural-salvage` repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node Version**: 20.x

5. Click **Deploy** (it will fail without environment variables - that's expected)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## Step 4: Configure Environment Variables in Vercel

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Variables

```env
# Daytona Configuration
DAYTONA_API_KEY=dtn_your-actual-key-here
DAYTONA_API_URL=https://app.daytona.io/api
DAYTONA_TARGET=us

# OpenAI
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Firebase Public
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"

# Qdrant
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
```

### Optional Variables (for marketplace)

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
PLATFORM_FEE_PERCENTAGE=10
```

**Important Notes:**
- For `FIREBASE_ADMIN_PRIVATE_KEY`, keep the quotes and `\n` characters
- Set all variables for **Production**, **Preview**, and **Development** environments
- Click **Save** after adding each variable

---

## Step 5: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait for build to complete (2-3 minutes)

---

## Step 6: Post-Deployment Configuration

### Configure Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domain: `your-app.vercel.app`
5. Click **Add domain**

### Configure Stripe Webhooks (if using marketplace)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter webhook URL: `https://your-app.vercel.app/api/webhooks/stripe`
5. Select events:
   - `payment_intent.succeeded`
   - `account.updated`
   - `charge.refunded`
6. Copy the **Signing Secret** and add it as `STRIPE_CONNECT_WEBHOOK_SECRET` in Vercel

---

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the following:
   - ✅ Landing page loads
   - ✅ Sign up / Login works
   - ✅ Upload an image
   - ✅ AI analysis completes (check Daytona Dashboard for sandbox activity)
   - ✅ Search functionality works
   - ✅ No console errors

---

## How Daytona Integration Works

Neural Salvage now uses **Daytona sandboxes** for all AI processing:

### Image Upload Flow:
1. User uploads image → Firebase Storage
2. API calls `daytonaService.analyzeImage(imageUrl)`
3. Daytona creates isolated sandbox
4. Python code runs in sandbox with OpenAI API
5. Performs: Caption, Tags, NSFW, OCR, Colors - **all in one execution**
6. Returns results instantly
7. Sandbox auto-cleans up
8. Results stored in Firestore + Qdrant

### Benefits:
- **Parallel Processing**: Multiple sandboxes = concurrent uploads
- **Isolated Execution**: Each analysis in secure container
- **No Fallbacks**: Seamless operation without complexity
- **Scalable**: Handles bulk uploads efficiently
- **Cost Effective**: Pay only for actual processing time

---

## Monitoring & Debugging

### Check Daytona Usage
- Go to [Daytona Dashboard](https://app.daytona.io)
- View sandbox history and logs
- Monitor API usage

### Check Vercel Logs
- Go to Vercel Dashboard → **Deployments**
- Click on active deployment → **Functions**
- View function logs for debugging

### Common Issues

**Issue**: "DAYTONA_API_KEY is required"
- **Fix**: Add `DAYTONA_API_KEY` in Vercel environment variables

**Issue**: "Embedding generation failed"
- **Fix**: Ensure `OPENAI_API_KEY` is set correctly

**Issue**: "Analysis failed"
- **Fix**: Check Daytona sandbox logs in dashboard

**Issue**: Firebase auth error
- **Fix**: Add Vercel domain to Firebase authorized domains

---

## Updating the Deployment

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "your update message"
git push origin main
```

Vercel will automatically deploy the changes.

---

## Cost Estimates

### Daytona Costs
- **Tier 1** (Free): 10 vCPU / 10GiB RAM
- **Tier 2**: 100 vCPU / 200GiB RAM
- Sandbox time: ~$0.01-0.05 per analysis
- Monitor usage at [Daytona Dashboard](https://app.daytona.io)

### Estimated Monthly Costs (1000 uploads/month)
- Daytona: $10-50
- OpenAI: $20-100 (GPT-4o vision)
- Vercel: Free (hobby) or $20 (pro)
- Firebase: $0-25
- Qdrant: Free (1GB) or $50+
- **Total**: ~$50-250/month

---

## Security Best Practices

1. **Never commit API keys** - Always use environment variables
2. **Use production keys** - Keep test keys for development
3. **Enable Firebase security rules** - See `firestore.rules` and `storage.rules`
4. **Monitor Daytona usage** - Set up usage alerts
5. **Regular updates** - Keep dependencies updated

---

## Support & Resources

- **Daytona Docs**: https://docs.daytona.io
- **Vercel Docs**: https://vercel.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Project Issues**: GitHub Issues

---

## Success Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] Users can sign up/login
- [ ] File uploads work
- [ ] AI analysis completes successfully
- [ ] Daytona sandboxes appear in dashboard
- [ ] Search functionality works
- [ ] No errors in Vercel logs
- [ ] Firebase domains configured
- [ ] Stripe webhooks configured (if applicable)

---

**🎉 Congratulations!** Neural Salvage is now live with Daytona-powered AI processing!

Your deployment URL: `https://your-app.vercel.app`

For questions or issues, check the [HANDOFF.md](./HANDOFF.md) documentation.
