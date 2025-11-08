/**
 * Generate icons using direct HTTPS requests (bypasses SDK issues)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY || API_KEY === 'your-api-key-here') {
  console.error('❌ OPENAI_API_KEY not set!');
  process.exit(1);
}

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

function makeAPIRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        } else {
          reject(new Error(`API Error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

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

async function generateIcon(config) {
  console.log(`\n🎨 Generating ${config.name}...`);
  console.log(`Prompt: ${config.prompt.substring(0, 80)}...`);
  
  try {
    const response = await makeAPIRequest({
      model: 'dall-e-3', // Using dall-e-3 since gpt-image-1 might need different endpoint
      prompt: config.prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      style: 'natural'
    });

    const imageUrl = response.data[0].url;
    const dir = path.join(__dirname, 'public', 'icons');
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filepath = path.join(dir, `${config.name}.png`);
    await downloadImage(imageUrl, filepath);
    
    console.log(`✅ Saved to: ${filepath}`);
    return { success: true, name: config.name, path: filepath };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return { success: false, name: config.name, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting icon generation...\n');
  console.log('Model: dall-e-3 (High Quality)');
  console.log('Size: 1024x1024');
  console.log('Quality: HD\n');
  console.log('═══════════════════════════════════════════\n');

  const results = [];
  
  for (const icon of icons) {
    const result = await generateIcon(icon);
    results.push(result);
    
    if (icon !== icons[icons.length - 1]) {
      console.log('\n⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('\n📊 SUMMARY:\n');
  
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
  
  if (successful.length === icons.length) {
    console.log('\n🎉 ALL ICONS GENERATED!\n');
    console.log('Next: node update-icon-code.js\n');
  }
}

main().catch(console.error);
