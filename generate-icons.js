/**
 * Generate Space Salvage Icons using OpenAI gpt-image-1
 * 
 * Setup:
 * 1. npm install openai
 * 2. Set OPENAI_API_KEY environment variable
 * 3. node generate-icons.js
 */

const OpenAI = require('openai');
const fs = require('fs');
const https = require('https');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here',
  baseURL: 'https://api.openai.com/v1',
  timeout: 120000, // 2 minutes for image generation
  maxRetries: 2
});

// Icon configurations
const icons = [
  {
    name: 'storage-vault',
    prompt: 'A photorealistic 3D render of a massive industrial storage vault door, heavy-duty metallic construction with weathered titanium and bronze panels, chunky industrial rivets and reinforced bolts, space salvage operation aesthetic, dramatic studio lighting from top-left, ultra-realistic materials with subtle scratches and wear, represents eternal durability and 200+ year storage capability, futuristic but functional design, clean isolated background, octane render, 8K quality, professional product photography style'
  },
  {
    name: 'energy-core',
    prompt: 'A photorealistic 3D render of a glowing plasma energy core, industrial containment housing with weathered metallic frame, bright blue-white energy glow with subtle orange accents, space-grade reactor technology, visible power cables and cooling systems, subtle radiation hazard markings, represents infinite permanence and eternal power, dramatic cinematic lighting, ultra-realistic materials, futuristic space salvage aesthetic, clean isolated background, octane render, 8K quality'
  },
  {
    name: 'satellite-network',
    prompt: 'A photorealistic 3D render of a distributed satellite network node, industrial spacecraft with antenna arrays and solar panels, weathered space-grade metal construction, multiple orbital units connected by glowing data transmission lines, represents decentralized network architecture, dramatic space lighting with rim lights, ultra-realistic materials showing years of space exposure, futuristic but functional salvage operation aesthetic, clean isolated background, octane render, 8K quality'
  }
];

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Generate single icon
async function generateIcon(config) {
  console.log(`\n🎨 Generating ${config.name}...`);
  console.log(`Prompt: ${config.prompt.substring(0, 80)}...`);
  
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1", // GPT Image - highest quality
      prompt: config.prompt,
      n: 1,
      size: "1024x1024",
      quality: "high", // low, medium, high, or auto
      output_format: "png",
      background: "transparent" // For icons
    });

    const imageUrl = response.data[0].url;
    const filepath = path.join(__dirname, 'public', 'icons', `${config.name}.png`);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Download the image
    await downloadImage(imageUrl, filepath);
    
    console.log(`✅ Saved to: ${filepath}`);
    return { success: true, name: config.name, path: filepath };
  } catch (error) {
    console.error(`❌ Error generating ${config.name}:`, error.message);
    return { success: false, name: config.name, error: error.message };
  }
}

// Main function
async function generateAllIcons() {
  console.log('🚀 Starting icon generation with OpenAI...\n');
  console.log('Model: gpt-image-1 (GPT Image - highest quality)');
  console.log('Size: 1024x1024');
  console.log('Quality: High');
  console.log('Format: PNG with transparent background');
  console.log('Style: Photorealistic space salvage\n');
  console.log('═══════════════════════════════════════════\n');

  const results = [];
  
  // Generate icons sequentially to avoid rate limits
  for (const icon of icons) {
    const result = await generateIcon(icon);
    results.push(result);
    
    // Wait 2 seconds between requests to be nice to the API
    if (icon !== icons[icons.length - 1]) {
      console.log('\n⏳ Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('\n📊 GENERATION SUMMARY:\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${icons.length}`);
  if (successful.length > 0) {
    successful.forEach(r => console.log(`   - ${r.name}.png`));
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${icons.length}`);
    failed.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  }
  
  console.log('\n═══════════════════════════════════════════\n');
  
  if (successful.length === icons.length) {
    console.log('🎉 ALL ICONS GENERATED SUCCESSFULLY!\n');
    console.log('📁 Icons saved to: public/icons/\n');
    console.log('🔧 Next steps:');
    console.log('   1. Check the generated icons');
    console.log('   2. Run: node update-icon-code.js');
    console.log('   3. Or let Cascade know to update the code!\n');
  } else {
    console.log('⚠️  Some icons failed to generate.');
    console.log('   Check your API key and try again.\n');
  }
}

// Check if API key is set
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
  console.error('❌ ERROR: OPENAI_API_KEY not set!');
  console.error('\nSet it with:');
  console.error('  Windows: set OPENAI_API_KEY=sk-...');
  console.error('  Mac/Linux: export OPENAI_API_KEY=sk-...');
  console.error('\nOr add to .env file and use dotenv\n');
  process.exit(1);
}

// Run it!
generateAllIcons().catch(error => {
  console.error('\n❌ FATAL ERROR:', error.message);
  process.exit(1);
});
