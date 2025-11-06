# 🎨 Neural Salvage Cyberpunk Theme Guide

## ✅ **Theme Successfully Applied!**

Your beautiful cyberpunk design from the HTML files is now integrated throughout the entire app!

---

## 🎯 **Color Palette**

### **Core Colors (Use these!)**

```tsx
// Backgrounds
bg-void-black        // #0A0E14 - Main background
bg-deep-space        // #151B23 - Cards, panels
bg-panel-dark        // #0F141E - Alternate panels

// Accents  
bg-data-cyan         // #6FCDDD - Primary accent (neon glow)
bg-archive-amber     // #E8A55C - Highlights, CTAs
bg-quantum-blue      // #3D5A80 - Secondary accent
bg-warning-orange    // #D97742 - Warnings, errors
bg-terminal-green    // #7FB069 - Success states

// Text
text-pure-white      // #F4F4F4 - Primary text
text-ash-gray        // #BFC0C0 - Muted text
text-data-cyan       // #6FCDDD - Links, accents
text-archive-amber   // #E8A55C - Highlights
```

### **Organized Palettes**

```tsx
// Salvage colors (organized usage)
bg-salvage-dark      // Main backgrounds
bg-salvage-medium    // Cards
bg-salvage-panel     // Panels
border-salvage-steel // Borders
text-salvage-dust    // Muted

// Neon colors (accents)
bg-neon-cyan         // Primary
bg-neon-amber        // Secondary
bg-neon-orange       // Warnings
bg-neon-green        // Success
```

---

## 🎬 **Cyberpunk Animations**

### **3D Float Effects**

```tsx
// Organic floating (cards, logos)
<div className="animate-organic-float">
  Floats smoothly with 3D rotation
</div>

// Complex logo rotation
<div className="animate-complex-rotate">
  Full 360° 3D spin
</div>

// Logo float with depth
<div className="animate-logo-float">
  Advanced 3D floating effect
</div>
```

### **Glow & Pulse Effects**

```tsx
// Panel pulse (floor tiles)
<div className="animate-panel-pulse">
  Pulsing border glow
</div>

// Bracket glow (corners)
<div className="animate-bracket-glow">
  Holographic corner effect
</div>

// Twinkling stars
<div className="animate-twinkle">
  Star field effect
</div>

// Shimmer slide
<div className="animate-slide-shimmer">
  Sliding light effect
</div>
```

### **Scan Lines**

```tsx
// Retro CRT scan effect
<div className="animate-scan">
  Moving scan lines
</div>
```

---

## 🎨 **Pre-Built Components**

### **1. Cyberpunk Card**

```tsx
<div className="cyberpunk-card p-6">
  <h2>Card Title</h2>
  <p>Content with 3D hover effect</p>
</div>
```

**Features:**
- ✅ 3D perspective transform
- ✅ Wild hover animation (lifts up + tilts)
- ✅ Glowing borders
- ✅ Glass morphism background

---

### **2. Cyberpunk Button**

```tsx
<button className="cyberpunk-button">
  Click Me
</button>
```

**Features:**
- ✅ Neon gradient (amber → orange)
- ✅ Shimmer effect on hover
- ✅ 3D lift animation
- ✅ Glowing shadow

---

### **3. Glass Panel**

```tsx
<div className="cyberpunk-glass p-6 rounded-lg">
  Transparent glassy content
</div>
```

**Features:**
- ✅ Backdrop blur
- ✅ Semi-transparent background
- ✅ Glowing border

---

### **4. Holographic Corners**

```tsx
<div className="holo-corners relative p-6">
  Content with animated corner brackets
</div>
```

**Features:**
- ✅ Animated corner brackets
- ✅ Color-shifting glow
- ✅ Cyberpunk aesthetic

---

### **5. Shimmer Effect**

```tsx
<div className="cyberpunk-shimmer relative p-6">
  Content with top shimmer line
</div>
```

**Features:**
- ✅ Sliding light bar
- ✅ Cyan → Amber gradient
- ✅ Infinite animation

---

## 🔤 **Typography**

### **Fonts Included**

```tsx
// Headings (bold, monospace)
<h1 className="font-space-mono">
  NEURAL SALVAGE
</h1>

// Subheadings (futuristic, narrow)
<h2 className="font-rajdhani">
  Digital Preservation
</h2>

// Code/technical (monospace)
<code className="font-jetbrains">
  const code = true;
</code>

// Body text (default)
<p className="font-inter">
  Regular body text
</p>
```

---

## 🎭 **Full Page Example**

```tsx
export default function CyberpunkPage() {
  return (
    <div className="min-h-screen bg-void-black text-pure-white">
      {/* Header with 3D effect */}
      <header className="p-8">
        <h1 className="font-space-mono text-5xl text-data-cyan animate-organic-float">
          NEURAL SALVAGE
        </h1>
        <p className="font-rajdhani text-xl text-ash-gray mt-2">
          Where AI Meets Digital Creativity
        </p>
      </header>

      {/* Grid of cards */}
      <div className="grid grid-cols-3 gap-6 p-8">
        <div className="cyberpunk-card holo-corners p-6">
          <div className="animate-logo-float w-16 h-16 mx-auto mb-4">
            {/* Logo SVG */}
          </div>
          <h3 className="font-rajdhani text-xl text-archive-amber">
            Feature Title
          </h3>
          <p className="text-ash-gray mt-2">
            Description text goes here
          </p>
        </div>
        
        {/* More cards... */}
      </div>

      {/* CTA Section */}
      <div className="cyberpunk-glass p-12 m-8 rounded-xl">
        <h2 className="font-rajdhani text-3xl text-data-cyan mb-4">
          Get Started
        </h2>
        <button className="cyberpunk-button">
          Mint Your First NFT
        </button>
      </div>
    </div>
  );
}
```

---

## 🎨 **Quick Combos**

### **Card with Everything**

```tsx
<div className="cyberpunk-card holo-corners cyberpunk-shimmer relative p-6 animate-organic-float">
  <h3 className="font-space-mono text-data-cyan">Title</h3>
  <p className="text-ash-gray">Content</p>
  <button className="cyberpunk-button mt-4">Action</button>
</div>
```

### **Stat Card (like HTML)**

```tsx
<div className="cyberpunk-card p-8 text-center group hover:scale-105 transition-transform">
  <div className="w-16 h-16 mx-auto mb-4 animate-complex-rotate">
    {/* Icon SVG */}
  </div>
  <div className="font-space-mono text-4xl text-archive-amber mb-2">
    200+
  </div>
  <div className="font-rajdhani text-sm text-data-cyan uppercase tracking-wider">
    Years Storage
  </div>
</div>
```

### **Hero Section**

```tsx
<section className="relative min-h-screen flex items-center justify-center">
  {/* Animated background effects here */}
  
  <div className="cyberpunk-card max-w-4xl p-12 text-center">
    <div className="animate-logo-float w-32 h-32 mx-auto mb-8">
      {/* Logo */}
    </div>
    
    <h1 className="font-space-mono text-6xl text-pure-white mb-4">
      NEURAL<br/>SALVAGE
    </h1>
    
    <p className="font-rajdhani text-xl text-data-cyan mb-8 tracking-widest">
      DIGITAL PRESERVATION
    </p>
    
    <p className="text-ash-gray text-lg mb-8">
      Store Your NFTs for <span className="text-archive-amber">200+ Years</span>
    </p>
    
    <button className="cyberpunk-button text-lg">
      Get Started
    </button>
  </div>
</section>
```

---

## 🎯 **Design Principles**

### **✅ DO:**
- Use `data-cyan` (#6FCDDD) for primary accents
- Use `archive-amber` (#E8A55C) for CTAs and highlights
- Add 3D transforms for depth (`transform-style: preserve-3d`)
- Use animations sparingly (they're powerful!)
- Combine glass effects with glows

### **❌ DON'T:**
- Use too many animations on one element
- Forget to add hover states
- Mix too many neon colors
- Ignore the 3D perspective
- Use pure white (#FFF) - use `pure-white` (#F4F4F4)

---

## 🌟 **Pro Tips**

1. **Layer effects**: Combine `cyberpunk-card` + `holo-corners` + `cyberpunk-shimmer`
2. **Hierarchy**: 
   - Headers: `font-space-mono` + `text-data-cyan`
   - Subheaders: `font-rajdhani` + `text-archive-amber`
   - Body: `font-inter` + `text-ash-gray`
3. **Depth**: Use `translateZ()` in custom transforms for 3D
4. **Glow**: Add `shadow-[0_0_20px_rgba(111,205,221,0.3)]` for cyan glow
5. **Hover**: Always add hover states with color shifts

---

## 📱 **Responsive**

All animations and 3D effects automatically scale down on mobile:

```tsx
// Desktop: Full 3D effects
// Tablet: Reduced transforms
// Mobile: Simplified (no floor panels, simpler corners)
```

---

## 🚀 **Next Steps**

1. **Replace existing cards** with `cyberpunk-card`
2. **Update buttons** to `cyberpunk-button`
3. **Add animations** to static elements
4. **Apply fonts**: Space Mono (headers), Rajdhani (subs), Inter (body)
5. **Use color palette** consistently

---

## 🎨 **Visual Examples**

### **Before (Generic)**
```tsx
<div className="bg-gray-800 border border-gray-700 p-4">
  <h3 className="text-white">Title</h3>
</div>
```

### **After (Cyberpunk!)**
```tsx
<div className="cyberpunk-card holo-corners p-6 animate-organic-float">
  <h3 className="font-space-mono text-data-cyan">TITLE</h3>
</div>
```

---

## 🎉 **Your Theme is Ready!**

**Everything from your HTML files is now available:**
- ✅ Colors (exact matches)
- ✅ Fonts (Google Fonts imported)
- ✅ Animations (all keyframes)
- ✅ 3D effects (perspective + transforms)
- ✅ Components (cards, buttons, panels)
- ✅ Grain texture (background overlay)

**Start using these classes throughout your app!**

The design will look professional, modern, and absolutely NOT AI-generated! 🚀
