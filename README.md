# Neural Salvage 🤖

**AI-Powered Media Salvage Yard** - Upload, organize, explore, and sell your digital creations with cutting-edge AI understanding and semantic search.

![Neural Salvage](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=for-the-badge&logo=firebase)
![AI Powered](https://img.shields.io/badge/AI-Powered-cyan?style=for-the-badge)

## 🌟 Features

### 🤖 AI-Powered Intelligence
- **Automatic Captioning**: Generate descriptive captions for images and videos
- **Smart Tagging**: AI-generated tags for easy organization
- **NSFW Detection**: Automatic content moderation
- **OCR Text Extraction**: Extract text from images
- **Audio Transcription**: Whisper-powered audio-to-text
- **Color Analysis**: Dominant color palette extraction
- **Semantic Search**: Natural language search with vector embeddings

### 📤 Media Management
- **Multi-Format Support**: Images, videos, audio, and documents
- **Bulk Upload**: Upload multiple files simultaneously
- **Progress Tracking**: Real-time upload progress with cancel/retry
- **Thumbnail Generation**: Automatic thumbnail creation
- **Resumable Uploads**: Firebase Storage integration

### 🎨 Beautiful UI
- **AI Scrapyard Theme**: Cyberpunk-inspired design with neon accents
- **Multiple Layouts**: Grid, Masonry, and Filmstrip views
- **Lightbox Modal**: Full-screen media viewing
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Eye-friendly interface

### 🔍 Advanced Search
- **Vector Similarity**: Semantic search using Qdrant
- **Keyword Fallback**: Traditional search when needed
- **Smart Filters**: Type, color, tags, date, price
- **Real-time Results**: Instant search feedback

### 📁 Smart Organization
- **Collections**: Organize media into folders
- **AI Auto-Grouping**: Automatic similarity clustering
- **Drag & Drop**: Intuitive organization
- **Batch Actions**: Bulk operations on multiple items

### 💰 Marketplace
- **Stripe Connect**: Integrated payment processing
- **Seller Onboarding**: Easy setup for creators
- **Revenue Splits**: Automatic platform fee calculation
- **Secure Delivery**: Expiring download links
- **Sales Dashboard**: Track earnings and transactions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Firebase account
- OpenAI API key
- Qdrant instance (cloud or self-hosted)
- Stripe account (for marketplace features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd neural-salvage
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# OpenAI
OPENAI_API_KEY=your_key_here

# xAI (optional fallback)
XAI_API_KEY=your_key_here

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key

# Qdrant
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_CONNECT_WEBHOOK_SECRET=your_webhook_secret
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Architecture](./docs/architecture.md) - System design and data flow
- [API Reference](./docs/api.md) - API endpoints documentation
- [Setup Guide](./docs/setup.md) - Detailed setup instructions
- [Contributing](./docs/contributing.md) - Development guidelines

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library

### Backend
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Next.js API Routes** - Serverless functions

### AI & ML
- **OpenAI GPT-4o** - Vision and language models
- **xAI Grok** - Fallback AI provider
- **Whisper** - Audio transcription
- **Qdrant** - Vector database for semantic search

### Payments
- **Stripe Connect** - Marketplace payments
- **Stripe Webhooks** - Payment confirmation

## 🎯 Use Cases

- **Photographers**: Organize and sell photo collections
- **Content Creators**: Manage video and audio libraries
- **Designers**: Store and monetize design assets
- **Researchers**: Organize and search document archives
- **Artists**: Showcase and sell digital art

## 🔐 Security

- Firebase Authentication with email/password, Google, and GitHub
- Firestore security rules for data isolation
- Storage security rules for file access control
- Signed URLs for secure file delivery
- HTTPS-only in production

## 📈 Roadmap

See [docs/roadmap.md](./docs/roadmap.md) for planned features and improvements.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./docs/contributing.md) for guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [OpenAI](https://openai.com/)
- Vector search by [Qdrant](https://qdrant.tech/)
- Payments by [Stripe](https://stripe.com/)

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Read the docs](./docs/)

---

**Neural Salvage** - Where AI meets digital creativity 🚀