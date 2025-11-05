# 🚀 Retro-Futuristic Salvage Shop Design System

**Inspired by retro sci-fi, space-age salvage yards, and otherworldly chop shops**

---

## 🎨 Color Palette

### **Primary Colors (Retro Sci-Fi)**

```css
--retro-orange: #FF6B35     /* Atomic orange */
--retro-yellow: #F7931E     /* Solar yellow */
--retro-teal: #00CFC1       /* Space-age teal */
--retro-purple: #9B59B6     /* Nebula purple */
--retro-cream: #FFF8E7      /* Vintage paper */
```

### **Neutral Colors (Industrial Salvage)**

```css
--salvage-dark: #1A1A1F     /* Deep space */
--salvage-metal: #2C2C34    /* Brushed steel */
--salvage-rust: #4A4A52     /* Oxidized metal */
--salvage-dust: #6B6B73     /* Dusty gray */
--salvage-light: #F5F5F0    /* Weathered white */
```

### **Accent Colors (Otherworldly)**

```css
--glow-cyan: #00E5FF        /* Hologram blue */
--glow-magenta: #FF00FF     /* Neon pink */
--glow-lime: #CCFF00        /* Radiation green */
--warning-amber: #FFA500    /* Alert orange */
```

---

## 📐 Typography

### **Headlines (Retro Futuristic)**

```css
/* Primary headline font */
font-family: 'Audiowide', 'Orbitron', sans-serif;
/* Fallback: Use system fonts with bold weight */

H1: 4rem (64px), font-weight: 700, letter-spacing: 0.05em
H2: 3rem (48px), font-weight: 600, letter-spacing: 0.03em
H3: 2rem (32px), font-weight: 600
```

### **Body Text (Clean & Readable)**

```css
font-family: 'Inter', 'system-ui', sans-serif;

Body: 1rem (16px), font-weight: 400, line-height: 1.6
Small: 0.875rem (14px)
Tiny: 0.75rem (12px)
```

### **Monospace (Tech/Data)**

```css
font-family: 'Roboto Mono', 'Courier New', monospace;

/* Use for: transaction IDs, wallet addresses, file sizes */
```

---

## 🎭 Design Principles

### **1. Retro-Futuristic**
- 1960s space-age optimism meets modern tech
- Rounded corners (not sharp cyberpunk)
- Warm colors (not cold blues)
- Propaganda poster vibes

### **2. Industrial Salvage**
- Weathered textures
- Metal panels
- Rivets and screws aesthetic
- "Used future" look

### **3. Functional Beauty**
- Everything looks useful
- No decoration without purpose
- Clear hierarchy
- Easy to navigate

---

## 🧩 Components

### **Buttons**

```tsx
// Primary (Orange gradient)
className="bg-gradient-to-r from-retro-orange to-retro-yellow 
           text-salvage-dark font-semibold px-6 py-3 rounded-lg
           hover:shadow-[0_0_20px_rgba(255,107,53,0.5)]
           transition-all duration-300"

// Secondary (Teal outline)
className="border-2 border-retro-teal text-retro-teal
           px-6 py-3 rounded-lg hover:bg-retro-teal/10
           font-semibold transition-all"

// Danger (Warning amber)
className="bg-warning-amber text-salvage-dark
           px-6 py-3 rounded-lg hover:bg-warning-amber/90
           font-semibold"
```

### **Cards (Salvage Panels)**

```tsx
className="bg-salvage-metal border-2 border-salvage-rust
           rounded-xl p-6 shadow-xl
           hover:border-retro-teal hover:shadow-retro-teal/20
           transition-all duration-300"
```

### **Input Fields**

```tsx
className="bg-salvage-dark border-2 border-salvage-rust
           text-retro-cream px-4 py-3 rounded-lg
           focus:border-retro-teal focus:ring-2 focus:ring-retro-teal/30
           outline-none transition-all"
```

### **Badges/Tags**

```tsx
// Status badge
className="bg-retro-teal/20 border border-retro-teal
           text-retro-teal px-3 py-1 rounded-full text-sm
           font-medium"

// NFT badge  
className="bg-retro-purple/20 border border-retro-purple
           text-retro-purple px-3 py-1 rounded-full text-sm
           font-medium animate-pulse"
```

---

## 🌟 Special Effects

### **Glow Effects**

```css
/* Holographic glow */
box-shadow: 0 0 20px rgba(0, 229, 255, 0.5),
            0 0 40px rgba(0, 229, 255, 0.3);

/* Neon text */
text-shadow: 0 0 10px currentColor,
             0 0 20px currentColor,
             0 0 30px currentColor;
```

### **Background Patterns**

```css
/* Grid pattern (like technical drawings) */
background-image: 
  linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px);
background-size: 20px 20px;

/* Noise texture */
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
```

---

## 📱 Layout Examples

### **Landing Page Hero**

```tsx
<div className="min-h-screen bg-gradient-to-br from-salvage-dark via-salvage-metal to-salvage-dark relative overflow-hidden">
  {/* Grid background */}
  <div className="absolute inset-0 grid-pattern opacity-20" />
  
  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
    <h1 className="text-6xl font-bold text-retro-cream mb-6 
                   font-audiowide tracking-wide">
      NEURAL SALVAGE
    </h1>
    
    <p className="text-2xl text-retro-orange mb-12">
      Otherworldly Asset Recovery & Preservation
    </p>
    
    <button className="bg-gradient-to-r from-retro-orange to-retro-yellow
                       text-salvage-dark px-8 py-4 rounded-lg font-bold text-lg
                       hover:shadow-[0_0_30px_rgba(255,107,53,0.6)]
                       transform hover:scale-105 transition-all">
      ENTER THE YARD →
    </button>
  </div>
</div>
```

### **Asset Card (Salvage Item)**

```tsx
<div className="bg-salvage-metal border-2 border-salvage-rust rounded-xl overflow-hidden
                hover:border-retro-teal hover:shadow-[0_0_20px_rgba(0,207,193,0.3)]
                transition-all duration-300 group">
  {/* Image */}
  <div className="relative aspect-square overflow-hidden bg-salvage-dark">
    <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
    
    {/* NFT Badge */}
    {asset.isNFT && (
      <div className="absolute top-4 right-4 bg-retro-purple/90 backdrop-blur-sm
                      border border-retro-purple px-3 py-1 rounded-full">
        <span className="text-retro-cream text-xs font-bold">⛓️ ON-CHAIN</span>
      </div>
    )}
  </div>
  
  {/* Info */}
  <div className="p-4">
    <h3 className="text-retro-cream font-semibold text-lg mb-2">{asset.title}</h3>
    <p className="text-salvage-dust text-sm mb-4">{asset.description}</p>
    
    {/* Stats */}
    <div className="flex gap-2">
      <span className="bg-salvage-dark text-retro-teal px-2 py-1 rounded text-xs font-mono">
        {asset.size}
      </span>
      <span className="bg-salvage-dark text-retro-yellow px-2 py-1 rounded text-xs font-mono">
        {asset.type}
      </span>
    </div>
  </div>
</div>
```

### **Navigation Bar**

```tsx
<nav className="bg-salvage-metal/95 backdrop-blur-md border-b-2 border-salvage-rust
                sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    {/* Logo */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-retro-orange to-retro-yellow 
                      rounded-lg flex items-center justify-center">
        <span className="text-salvage-dark font-bold text-xl">⚡</span>
      </div>
      <span className="text-retro-cream font-audiowide text-xl tracking-wide">
        NEURAL SALVAGE
      </span>
    </div>
    
    {/* Nav Links */}
    <div className="flex gap-6">
      <a className="text-retro-cream hover:text-retro-teal transition-colors">
        THE YARD
      </a>
      <a className="text-retro-cream hover:text-retro-teal transition-colors">
        SALVAGE
      </a>
      <a className="text-retro-cream hover:text-retro-teal transition-colors">
        MANIFEST
      </a>
    </div>
    
    {/* CTA */}
    <button className="bg-retro-teal text-salvage-dark px-6 py-2 rounded-lg 
                       font-semibold hover:bg-retro-teal/90 transition-colors">
      CONNECT
    </button>
  </div>
</nav>
```

---

## 🎯 Key Visual Elements

### **1. Retro Badges/Stamps**

```
┌─────────────────┐
│  ⚡ SALVAGED ⚡  │
│   ON-CHAIN     │
│   CERTIFIED    │
└─────────────────┘
```

### **2. Tech Readouts**

```
┌────────────────────────┐
│ ASSET ID: #NS-000123  │
│ STATUS: PRESERVED     │
│ BLOCKCHAIN: ARWEAVE   │
│ TX: abc123xyz...      │
└────────────────────────┘
```

### **3. Warning Banners**

```
⚠️ PERMANENT STORAGE ENGAGED ⚠️
```

---

## 🚀 Animation Principles

### **Smooth & Purposeful**

```css
/* All transitions */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover scale */
transform: scale(1.05);

/* Glow pulse */
animation: pulse-glow 2s ease-in-out infinite;

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3); }
  50% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.6); }
}
```

---

## 📝 Copywriting Tone

### **Retro Sci-Fi Corporate**

❌ **Don't say:**
- "Upload your files"
- "Create NFT"
- "Dashboard"

✅ **Do say:**
- "Submit assets for salvage"
- "Preserve on-chain"
- "Command Center" / "The Yard"
- "Asset manifest"
- "Recovery protocols"

### **Example Copy:**

> "Welcome to Neural Salvage - Where digital assets are recovered, preserved, and certified for eternity. Our patented blockchain preservation technology ensures your data survives the heat death of the universe."

---

## 🎨 Quick Start

1. **Install fonts** (Google Fonts):
   - Audiowide (headlines)
   - Inter (body)
   - Roboto Mono (data)

2. **Update Tailwind** with color palette

3. **Apply to components** gradually

4. **Test with users** - keep it simple!

---

**This design is legally distinct from The Outer Worlds while capturing that retro-futuristic salvage shop vibe!** 🚀
