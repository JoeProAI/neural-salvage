# 📚 Mintlify Documentation Setup

## Complete guide to deploying your Neural Salvage documentation

---

## 🎯 What is Mintlify?

Mintlify creates beautiful, modern documentation sites from Markdown files. Perfect for:
- API documentation
- User guides
- Developer resources
- Feature explanations

**Your docs will look like:** https://mintlify.com/showcase

---

## 📁 Documentation Structure Created

```
docs/
├── mint.json                    # Mintlify configuration
├── introduction.mdx             # Homepage
├── quickstart.mdx               # Getting started guide
├── api-reference/
│   ├── nft/
│   │   └── mint.mdx             # NFT minting API docs
│   └── [other endpoints]        # To be added
├── guides/
│   └── [user guides]            # To be added
└── concepts/
    └── [core concepts]          # To be added
```

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Install Mintlify CLI**

```bash
npm install -g mintlify
```

### **Step 2: Preview Locally**

```bash
cd "c:\Projects\The Machine\Nueral Salvage\neural-salvage\docs"
mintlify dev
```

Visit: http://localhost:3000

You'll see your documentation site running!

### **Step 3: Deploy to Mintlify**

```bash
# Login to Mintlify
mintlify login

# Deploy
mintlify deploy
```

**Your docs will be live at:** `https://your-subdomain.mintlify.app`

---

## 🎨 Customization

### **Update mint.json**

```json
{
  "name": "Neural Salvage",  // Your platform name
  "logo": {
    "dark": "/logo/dark.svg",  // Add your logo
    "light": "/logo/light.svg"
  },
  "colors": {
    "primary": "#0D9373",  // Match your brand
    "light": "#07C983",
    "dark": "#0D9373"
  }
}
```

### **Add Your Logo**

1. Create `docs/logo/` folder
2. Add `dark.svg` and `light.svg`
3. Recommended size: 120x40px

### **Update Social Links**

```json
{
  "anchors": [
    {
      "name": "GitHub",
      "icon": "github",
      "url": "https://github.com/yourusername/neural-salvage"
    },
    {
      "name": "Discord",
      "icon": "discord",
      "url": "https://discord.gg/your-server"
    }
  ]
}
```

---

## 📝 Adding More Documentation

### **Create User Guides**

```bash
# Create guide files
docs/guides/creating-account.mdx
docs/guides/uploading-assets.mdx
docs/guides/minting-nfts.mdx
docs/guides/marketplace.mdx
docs/guides/collections.mdx
```

**Template:**
```mdx
---
title: 'Guide Title'
description: 'Brief description'
---

## Overview

Your content here...

<Steps>
  <Step title="Step 1">
    First step description
  </Step>
  <Step title="Step 2">
    Second step description
  </Step>
</Steps>
```

### **Create Concept Pages**

```bash
docs/concepts/nft-minting.mdx
docs/concepts/arweave.mdx
docs/concepts/permanent-storage.mdx
docs/concepts/pricing.mdx
```

**Template:**
```mdx
---
title: 'Concept Title'
description: 'Explain the concept'
---

## What is [Concept]?

Explanation...

<Card title="Key Point" icon="lightbulb">
  Important information
</Card>

## Why It Matters

More details...
```

### **Create API Documentation**

For each API endpoint, create a file like:

```bash
docs/api-reference/nft/estimate.mdx
docs/api-reference/nft/get.mdx
docs/api-reference/assets/upload.mdx
```

**Template:**
```mdx
---
title: 'Endpoint Name'
api: 'POST /api/endpoint'
description: 'What it does'
---

## Request

<ParamField body="param" type="string" required>
  Parameter description
</ParamField>

## Response

<ResponseField name="field" type="string">
  Response field description
</ResponseField>

<RequestExample>
```bash cURL
curl example...
```
</RequestExample>
```

---

## 🛠️ Mintlify Features

### **Components You Can Use**

```mdx
<!-- Cards -->
<Card title="Title" icon="icon-name" href="/link">
  Description
</Card>

<!-- Callouts -->
<Info>Info message</Info>
<Warning>Warning message</Warning>
<Tip>Tip message</Tip>
<Note>Note message</Note>

<!-- Code Blocks -->
```javascript
const code = 'here';
```

<!-- Accordions -->
<AccordionGroup>
  <Accordion title="Title">
    Content
  </Accordion>
</AccordionGroup>

<!-- Tabs -->
<Tabs>
  <Tab title="Tab 1">
    Content 1
  </Tab>
  <Tab title="Tab 2">
    Content 2
  </Tab>
</Tabs>

<!-- Steps -->
<Steps>
  <Step title="Step 1">
    Description
  </Step>
</Steps>
```

### **Icons Available**

Mintlify uses [Font Awesome](https://fontawesome.com/icons) icons:

```mdx
<Card icon="rocket">...</Card>
<Card icon="code">...</Card>
<Card icon="book">...</Card>
<Card icon="brain">...</Card>
<Card icon="store">...</Card>
```

---

## 🌐 Custom Domain (Optional)

### **Setup Custom Domain**

1. Go to Mintlify dashboard
2. Settings → Domain
3. Add your domain: `docs.neural-salvage.com`
4. Add DNS records:
   ```
   Type: CNAME
   Name: docs
   Value: cname.mintlify.com
   ```
5. Wait for verification (5-30 min)

---

## 📊 Analytics Integration

### **Google Analytics**

Add to `mint.json`:
```json
{
  "analytics": {
    "ga4": {
      "measurementId": "G-XXXXXXXXXX"
    }
  }
}
```

### **PostHog**

```json
{
  "analytics": {
    "posthog": {
      "apiKey": "your-posthog-key"
    }
  }
}
```

---

## ✅ Documentation Checklist

### **Essential Pages (Create These First)**

- [x] introduction.mdx (done)
- [x] quickstart.mdx (done)
- [x] api-reference/nft/mint.mdx (done)
- [ ] features.mdx
- [ ] guides/creating-account.mdx
- [ ] guides/uploading-assets.mdx
- [ ] guides/minting-nfts.mdx
- [ ] guides/marketplace.mdx
- [ ] concepts/arweave.mdx
- [ ] concepts/permanent-storage.mdx
- [ ] concepts/pricing.mdx
- [ ] api-reference/introduction.mdx
- [ ] api-reference/authentication.mdx
- [ ] api-reference/nft/estimate.mdx
- [ ] api-reference/nft/get.mdx
- [ ] api-reference/assets/upload.mdx

### **Nice to Have**

- [ ] FAQ page
- [ ] Troubleshooting guide
- [ ] Video tutorials
- [ ] Changelog
- [ ] Roadmap
- [ ] Migration guide (if from other platforms)

---

## 🚀 Deployment Options

### **Option 1: Mintlify Hosting (Recommended)**

```bash
mintlify deploy
```

**Pros:**
- Free hosting
- Automatic updates
- Built-in analytics
- Fast CDN
- Custom domain support

**Your URL:** `https://your-subdomain.mintlify.app`

### **Option 2: Self-Host**

```bash
# Build static site
mintlify build

# Deploy to Vercel/Netlify
# Upload the build folder
```

---

## 📝 Writing Best Practices

### **1. Be Concise**

```mdx
❌ Bad:
In order to create an account on our platform, you will need to navigate to...

✅ Good:
Sign in with Google to create your account.
```

### **2. Use Examples**

```mdx
✅ Always include:
- Code examples
- Screenshots
- Expected outputs
- Common errors
```

### **3. Structure Content**

```mdx
✅ Good structure:
1. Overview (what it is)
2. Prerequisites (what you need)
3. Steps (how to do it)
4. Examples (code samples)
5. Troubleshooting (common issues)
```

### **4. Link Related Content**

```mdx
See also:
- [Related Guide](/guides/related)
- [API Reference](/api-reference/endpoint)
```

---

## 🔧 Maintenance

### **Update Documentation**

```bash
# Edit files in docs/
# Preview changes
mintlify dev

# Deploy updates
mintlify deploy
```

### **Version Control**

```bash
# Docs are in your repo
git add docs/
git commit -m "Update documentation"
git push
```

### **Regular Updates**

- [ ] Weekly: Review for accuracy
- [ ] Monthly: Add new features
- [ ] Quarterly: Major updates
- [ ] After releases: Update API docs

---

## 💰 Mintlify Pricing

```
Free Tier (Perfect for you):
✅ Unlimited pages
✅ Custom domain
✅ Analytics
✅ Search
✅ Versioning
✅ API documentation

Pro ($150/month):
- Advanced analytics
- Custom branding removal
- Priority support
- Higher rate limits

Start with free, upgrade if needed later.
```

---

## 📞 Support Resources

- **Mintlify Docs:** https://mintlify.com/docs
- **Component Library:** https://mintlify.com/docs/content/components
- **Discord:** https://discord.gg/mintlify
- **Examples:** https://mintlify.com/showcase

---

## 🎯 Next Steps

**This Week:**
1. Run `mintlify dev` to preview
2. Add your logo
3. Update colors in mint.json
4. Deploy with `mintlify deploy`

**This Month:**
1. Complete all essential pages
2. Add code examples to API docs
3. Create video tutorials
4. Set up custom domain

**Ongoing:**
1. Update with new features
2. Add user feedback
3. Improve based on analytics
4. Keep API docs current

---

**Your documentation is ready to deploy! Just run `mintlify deploy` in the docs folder.** 📚
