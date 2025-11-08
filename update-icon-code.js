/**
 * Update app/page.tsx to use generated icons instead of Lucide icons
 */

const fs = require('fs');
const path = require('path');

const PAGE_FILE = path.join(__dirname, 'app', 'page.tsx');

// Check if icons exist
const iconsDir = path.join(__dirname, 'public', 'icons');
const requiredIcons = ['storage-vault.png', 'energy-core.png', 'satellite-network.png'];

console.log('🔍 Checking for generated icons...\n');

let allIconsExist = true;
requiredIcons.forEach(icon => {
  const iconPath = path.join(iconsDir, icon);
  if (fs.existsSync(iconPath)) {
    console.log(`✅ Found: ${icon}`);
  } else {
    console.log(`❌ Missing: ${icon}`);
    allIconsExist = false;
  }
});

if (!allIconsExist) {
  console.log('\n❌ Not all icons are generated yet!');
  console.log('Run: node generate-icons.js first\n');
  process.exit(1);
}

console.log('\n✅ All icons found!\n');
console.log('🔧 Updating app/page.tsx...\n');

// Read the current file
let content = fs.readFileSync(PAGE_FILE, 'utf8');

// Remove Lucide imports
const oldImport = `import { Shield, Zap, Network } from 'lucide-react';`;
const newImport = `import Image from 'next/image';`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('✅ Updated imports');
}

// Replace the icon rendering code
const oldIconCode = `              {[
                { value: '200+', label: 'Years Storage', Icon: Shield },
                { value: '∞', label: 'Permanence', Icon: Zap },
                { value: '100%', label: 'Decentralized', Icon: Network }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="relative bg-gradient-to-br from-deep-space/75 to-panel-dark/88 border-2 border-data-cyan/28 rounded-lg p-10 text-center cursor-pointer group"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(68px) rotate(0.3deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-data-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="mb-5 flex justify-center transition-all duration-500 group-hover:scale-125 group-hover:rotate-[360deg]"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(111, 205, 221, 0.4))' }}
                  >
                    <stat.Icon 
                      size={64} 
                      strokeWidth={1.5}
                      className="text-data-cyan/90"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(111, 205, 221, 0.6))' }}
                    />
                  </div>
                  <div className="font-space-mono text-6xl font-bold text-archive-amber mb-3 transition-all duration-500 group-hover:scale-110"
                    style={{ textShadow: '0 0 22px #E8A55C' }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-rajdhani text-base text-data-cyan uppercase tracking-[0.14em] font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}`;

const newIconCode = `              {[
                { value: '200+', label: 'Years Storage', icon: '/icons/storage-vault.png' },
                { value: '∞', label: 'Permanence', icon: '/icons/energy-core.png' },
                { value: '100%', label: 'Decentralized', icon: '/icons/satellite-network.png' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="relative bg-gradient-to-br from-deep-space/75 to-panel-dark/88 border-2 border-data-cyan/28 rounded-lg p-10 text-center cursor-pointer group"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'translateZ(68px) rotate(0.3deg)',
                    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-data-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="mb-5 flex justify-center transition-all duration-500 group-hover:scale-125 group-hover:rotate-[360deg]"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(111, 205, 221, 0.4))' }}
                  >
                    <Image
                      src={stat.icon}
                      alt={stat.label}
                      width={80}
                      height={80}
                      className="object-contain"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(111, 205, 221, 0.6))' }}
                    />
                  </div>
                  <div className="font-space-mono text-6xl font-bold text-archive-amber mb-3 transition-all duration-500 group-hover:scale-110"
                    style={{ textShadow: '0 0 22px #E8A55C' }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-rajdhani text-base text-data-cyan uppercase tracking-[0.14em] font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}`;

if (content.includes(oldIconCode)) {
  content = content.replace(oldIconCode, newIconCode);
  console.log('✅ Updated icon rendering code');
} else {
  console.log('⚠️  Warning: Could not find exact icon code to replace');
  console.log('   You may need to update manually');
}

// Write the updated content
fs.writeFileSync(PAGE_FILE, content, 'utf8');

console.log('\n✅ Successfully updated app/page.tsx!');
console.log('\n📁 Changes made:');
console.log('   - Removed Lucide icon imports');
console.log('   - Added Next.js Image import');
console.log('   - Updated icon rendering to use generated PNG files');
console.log('\n🚀 Next steps:');
console.log('   1. Check the changes: git diff app/page.tsx');
console.log('   2. Test locally or deploy to production');
console.log('   3. Commit: git add -A && git commit -m "feat: Add high-quality space salvage icons"');
console.log('\n✨ Your icons are now live!\n');
