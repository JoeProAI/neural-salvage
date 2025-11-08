# 🎨 Generate High-Quality Icons with gpt-image-1

## **Quick Start - 3 Commands**

```bash
# 1. Install OpenAI SDK (if not already installed)
npm install openai

# 2. Set your API key
set OPENAI_API_KEY=sk-your-key-here

# 3. Generate all icons
node generate-icons.js
```

**Done!** Icons will be saved to `public/icons/`

---

## 📋 **Detailed Instructions**

### **Step 1: Get Your OpenAI API Key**

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### **Step 2: Set Environment Variable**

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-your-actual-key-here"
```

**Windows (CMD):**
```cmd
set OPENAI_API_KEY=sk-your-actual-key-here
```

**Mac/Linux:**
```bash
export OPENAI_API_KEY=sk-your-actual-key-here
```

**Permanent (add to .env file):**
```bash
# Create or edit .env file
echo OPENAI_API_KEY=sk-your-actual-key-here >> .env

# Install dotenv
npm install dotenv

# Update generate-icons.js to use dotenv (first line):
require('dotenv').config();
```

### **Step 3: Install Dependencies**

```bash
npm install openai
```

### **Step 4: Run the Script**

```bash
node generate-icons.js
```

---

## 📊 **What the Script Does**

```
🎨 Generates 3 high-quality icons using gpt-image-1:

1. storage-vault.png      - Heavy industrial vault door
2. energy-core.png        - Glowing plasma reactor
3. satellite-network.png  - Orbital satellite network

Settings:
- Model: gpt-image-1 (GPT Image - highest quality)
- Size: 1024x1024
- Quality: High
- Format: PNG
- Background: Transparent
- Style: Photorealistic space salvage
```

---

## ⏱️ **Time & Cost Estimate**

**Time:**
- Each icon: 30-60 seconds
- Total: 2-4 minutes

**Cost:**
- High quality 1024x1024: ~4,160 image tokens per icon
- 3 icons: ~12,480 image tokens
- Cost: Check [OpenAI pricing](https://openai.com/api/pricing/)
- Estimated: $1-2 for all 3 icons

---

## 📁 **Output Location**

Icons will be saved to:
```
neural-salvage/
  public/
    icons/
      storage-vault.png      ✓
      energy-core.png        ✓
      satellite-network.png  ✓
```

---

## 🔧 **Troubleshooting**

### **Error: "OPENAI_API_KEY not set"**
```bash
# Make sure you set the environment variable
set OPENAI_API_KEY=sk-your-key-here

# Or check if it's set:
echo %OPENAI_API_KEY%  # Windows CMD
echo $env:OPENAI_API_KEY  # Windows PowerShell
echo $OPENAI_API_KEY  # Mac/Linux
```

### **Error: "Cannot find module 'openai'"**
```bash
npm install openai
```

### **Error: "Rate limit exceeded"**
- Wait a few seconds and try again
- The script already includes 2-second delays between icons
- Check your API usage at https://platform.openai.com/usage

### **Error: "Model not found"**
- Make sure you have access to gpt-image-1
- You may need to complete Organization Verification
- Check https://platform.openai.com/settings/organization/general

### **Generated images look wrong**
- Check the prompts in `generate-icons.js`
- Adjust the prompts if needed
- Regenerate with: `node generate-icons.js`

---

## ✅ **After Generation**

### **1. Check the Icons**
```bash
# Open the folder
start public\icons  # Windows
open public/icons   # Mac
```

### **2. Update the Code**
Once icons are generated, let me know and I'll update `app/page.tsx` to use them!

Or you can manually update:
```typescript
// In app/page.tsx
// Replace Lucide icons with:
<img src="/icons/storage-vault.png" alt="Storage" className="w-16 h-16" />
<img src="/icons/energy-core.png" alt="Energy" className="w-16 h-16" />
<img src="/icons/satellite-network.png" alt="Network" className="w-16 h-16" />
```

---

## 🎨 **Customizing the Prompts**

To change the style or details, edit `generate-icons.js`:

```javascript
const icons = [
  {
    name: 'storage-vault',
    prompt: 'YOUR CUSTOM PROMPT HERE'  // ← Edit this
  },
  // ... etc
];
```

Then run again:
```bash
node generate-icons.js
```

---

## 💡 **Tips**

**Make them even better:**
- Increase size to `1536x1536` for higher resolution
- Try different prompts
- Generate variations and pick the best

**Save money:**
- Use `quality: "medium"` instead of `"high"` (50% cost)
- Use `size: "512x512"` for smaller icons (25% cost)

**Generate more:**
- Add more icon configs to the `icons` array
- Run the script again

---

## 🚀 **Quick Reference**

```bash
# Full workflow
npm install openai
set OPENAI_API_KEY=sk-xxx
node generate-icons.js

# Check output
start public\icons

# Update code (after successful generation)
# → Tell Cascade or manually update app/page.tsx
```

---

**Ready?** Run `node generate-icons.js` and watch the magic happen! ✨
