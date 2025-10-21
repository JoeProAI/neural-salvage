# Setup Guide

Complete guide to setting up Neural Salvage for development and production.

## 🚀 Quick Start with Daytona.io (Recommended)

**Daytona.io** provides instant, pre-configured development environments for Neural Salvage. This is the fastest way to get started!

### What is Daytona?
Daytona is a development environment manager that creates fully configured workspaces in seconds. No local setup required!

### Getting Started with Daytona

1. **Install Daytona CLI**
```bash
curl -sf https://download.daytona.io/daytona/install.sh | sh
```

2. **Create Neural Salvage Workspace**
```bash
# From GitHub repository
daytona create https://github.com/your-username/neural-salvage

# Or from local directory
daytona create /path/to/neural-salvage
```

3. **Daytona automatically:**
   - ✅ Sets up Node.js 20 environment
   - ✅ Installs all npm dependencies
   - ✅ Configures development ports (3000)
   - ✅ Provides VS Code in browser
   - ✅ Sets up Git integration
   - ✅ Manages environment variables

4. **Access your workspace**
   - Daytona opens VS Code automatically
   - Port 3000 is exposed for Next.js dev server
   - Terminal is ready to use

5. **Configure environment variables**
```bash
# In Daytona workspace terminal
cp .env.example .env.local
# Edit .env.local with your credentials
```

6. **Start development**
```bash
npm run dev
```

7. **Access your app**
   - Daytona provides a public URL
   - Share with team members
   - Test on any device

### Daytona Configuration

Neural Salvage includes `.daytona/config.yaml` with:
- Pre-configured Node.js 20 environment
- Automatic dependency installation
- Port 3000 exposure for dev server
- VS Code extensions for optimal development
- Git integration

### Daytona Commands

```bash
# List workspaces
daytona list

# Stop workspace
daytona stop neural-salvage

# Start workspace
daytona start neural-salvage

# Delete workspace
daytona delete neural-salvage

# SSH into workspace
daytona ssh neural-salvage
```

### Benefits of Using Daytona
- ⚡ **Instant Setup**: No local configuration needed
- 🔄 **Consistent Environment**: Same setup for all developers
- 🌐 **Access Anywhere**: Work from any device with a browser
- 🤝 **Easy Collaboration**: Share workspaces with team
- 💾 **No Local Resources**: Runs in the cloud
- 🔒 **Secure**: Isolated development environments

---

## Prerequisites

### Required
- **Node.js** 20.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Accounts Needed
- **Firebase** account (free tier available)
- **OpenAI** account with API access
- **Qdrant** account (cloud or self-hosted)
- **Stripe** account (for marketplace features)
- **Vercel** account (for deployment)

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd neural-salvage

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "neural-salvage"
4. Enable Google Analytics (optional)
5. Create project

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - Email/Password
   - Google
   - GitHub
4. Configure OAuth consent screen for social providers

#### Create Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose production mode
4. Select location (choose closest to your users)
5. Deploy security rules from `firestore.rules`

#### Set up Storage
1. Go to **Storage**
2. Click "Get started"
3. Choose production mode
4. Deploy security rules from `storage.rules`

#### Get Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>) to add web app
4. Copy configuration values

#### Create Service Account
1. Go to **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract values for environment variables

### 3. OpenAI Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account or sign in
3. Go to **API Keys**
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)
6. Add billing information if needed

### 4. xAI Setup (Optional)

1. Go to [xAI Console](https://console.x.ai/)
2. Create account or sign in
3. Generate API key
4. Copy the key

### 5. Qdrant Setup

#### Option A: Qdrant Cloud (Recommended)
1. Go to [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create account
3. Create a new cluster
4. Copy cluster URL and API key

#### Option B: Self-Hosted
```bash
# Using Docker
docker run -p 6333:6333 qdrant/qdrant

# URL will be: http://localhost:6333
# No API key needed for local development
```

### 6. Stripe Setup

#### Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or sign in
3. Complete business verification

#### Enable Stripe Connect
1. Go to **Connect** in dashboard
2. Enable Connect
3. Configure platform settings
4. Set up webhook endpoints

#### Get API Keys
1. Go to **Developers** > **API Keys**
2. Copy publishable and secret keys
3. Use test keys for development

#### Set up Webhooks
1. Go to **Developers** > **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `account.updated`
   - `charge.refunded`
4. Copy webhook signing secret

### 7. Environment Variables

Create `.env.local` file in project root:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# xAI (optional)
XAI_API_KEY=xai-...

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (from service account JSON)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Qdrant
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-api-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=10
```

### 8. Deploy Firebase Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select:
# - Firestore
# - Storage
# - Use existing project
# - Use existing rules files

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### 9. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Add Environment Variables**
   - In Vercel project settings
   - Go to **Environment Variables**
   - Add all variables from `.env.local`
   - Make sure to use production values

4. **Deploy**
   - Vercel will automatically deploy
   - Get your production URL
   - Update Firebase authorized domains
   - Update Stripe webhook URL

### Post-Deployment

1. **Update Firebase**
   - Add production domain to authorized domains
   - Update OAuth redirect URIs

2. **Update Stripe**
   - Add production webhook endpoint
   - Switch to live API keys

3. **Test Production**
   - Test authentication flows
   - Test file uploads
   - Test AI processing
   - Test marketplace checkout

## Development Workflow

### Local Development

```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests
npm run test:e2e
```

## Troubleshooting

### Common Issues

#### Firebase Connection Errors
- Verify all environment variables are set
- Check Firebase project settings
- Ensure security rules are deployed
- Verify service account permissions

#### Upload Failures
- Check file size limits (100MB max)
- Verify Storage security rules
- Check Firebase Storage quota
- Ensure proper CORS configuration

#### AI Processing Errors
- Verify OpenAI API key is valid
- Check API usage limits
- Ensure image URLs are accessible
- Verify Qdrant connection

#### Search Not Working
- Verify Qdrant is running
- Check vector collection exists
- Ensure embeddings are generated
- Verify API key permissions

#### Stripe Errors
- Use test mode for development
- Verify webhook signature
- Check Stripe Connect status
- Ensure proper event handling

### Debug Mode

Enable debug logging:

```env
# Add to .env.local
DEBUG=true
LOG_LEVEL=debug
```

### Getting Help

1. Check [documentation](./README.md)
2. Review [API docs](./api.md)
3. Check [GitHub issues](https://github.com/your-repo/issues)
4. Contact support

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Enable automatic image optimization
- Configure image domains in `next.config.ts`

### Caching
- Enable SWR for data fetching
- Configure CDN caching headers
- Use Redis for API caching (optional)

### Database
- Create Firestore indexes for queries
- Use pagination for large datasets
- Implement data archiving strategy

## Security Checklist

- [ ] All environment variables are set
- [ ] Firebase security rules deployed
- [ ] Storage security rules deployed
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive data
- [ ] Webhook signatures verified
- [ ] API keys rotated regularly

## Monitoring

### Firebase
- Monitor authentication metrics
- Track database usage
- Monitor storage usage
- Set up budget alerts

### Vercel
- Monitor function execution times
- Track bandwidth usage
- Review error logs
- Set up uptime monitoring

### Stripe
- Monitor payment success rates
- Track Connect account status
- Review dispute notifications
- Monitor webhook delivery

## Backup Strategy

### Database Backups
- Enable Firestore automatic backups
- Export data regularly
- Test restore procedures

### Storage Backups
- Configure Storage backup rules
- Implement versioning
- Test file recovery

## Scaling Considerations

### When to Scale
- Upload volume > 1000/day
- Storage > 100GB
- AI processing > 10,000/day
- Concurrent users > 1000

### Scaling Options
- Upgrade Firebase plan
- Add Redis caching
- Implement CDN
- Use Cloud Functions for background jobs
- Consider microservices architecture

## Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Firebase Explorer

### Useful Commands

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated

# Update packages
npm update

# Analyze bundle size
npm run build
npm run analyze
```

## Next Steps

After setup:
1. Create your first user account
2. Upload test media files
3. Test AI analysis
4. Try semantic search
5. Create collections
6. Test marketplace features
7. Customize theme and branding
8. Deploy to production

For more information, see:
- [Architecture Documentation](./architecture.md)
- [API Reference](./api.md)
- [Contributing Guide](./contributing.md)