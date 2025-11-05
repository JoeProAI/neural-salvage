/**
 * Test NFT minting with platform wallet
 * Run: node scripts/test-mint.js
 * 
 * Make sure ARWEAVE_PRIVATE_KEY is set in .env.local first!
 */

const Bundlr = require('@bundlr-network/client');
require('dotenv').config({ path: '.env.local' });

async function testMint() {
  console.log('🧪 Testing Arweave NFT Minting System...\n');
  
  // Load wallet from environment
  const walletKey = process.env.ARWEAVE_PRIVATE_KEY;
  
  if (!walletKey) {
    console.error('❌ ARWEAVE_PRIVATE_KEY not found in .env.local');
    console.log('\n💡 Steps to fix:');
    console.log('   1. Copy contents of scripts/platform-wallet.json');
    console.log('   2. Add to .env.local as ARWEAVE_PRIVATE_KEY="<json here>"');
    console.log('   3. Make sure it\'s a single-line string');
    process.exit(1);
  }
  
  try {
    // Initialize Bundlr
    console.log('📡 Connecting to Bundlr network...');
    const bundlr = new Bundlr.default(
      'https://node2.bundlr.network',
      'arweave',
      walletKey
    );
    
    await bundlr.ready();
    console.log('✅ Connected to Bundlr successfully');
    
    // Check balance
    const balance = await bundlr.getLoadedBalance();
    const balanceAR = bundlr.utils.fromAtomic(balance);
    console.log(`💰 Bundlr Balance: ${balanceAR} AR`);
    
    if (parseFloat(balanceAR) === 0) {
      console.log('\n⚠️  Bundlr balance is 0!');
      console.log('💡 This is normal - Bundlr pulls from your Arweave wallet automatically');
    }
    
    // Create test NFT metadata
    const metadata = {
      name: 'Neural Salvage Test NFT #' + Date.now(),
      description: 'Test NFT minted from Neural Salvage platform to verify Arweave integration',
      image: 'https://via.placeholder.com/512x512.png?text=Test+NFT',
      external_url: process.env.NEXT_PUBLIC_APP_URL || 'https://neural-salvage.vercel.app',
      attributes: [
        { trait_type: 'Test', value: 'true' },
        { trait_type: 'Platform', value: 'Neural Salvage' },
        { trait_type: 'Timestamp', value: new Date().toISOString() }
      ],
      properties: {
        category: 'test',
        created_at: new Date().toISOString()
      }
    };
    
    // Estimate cost first
    const metadataString = JSON.stringify(metadata, null, 2);
    const metadataSize = Buffer.byteLength(metadataString);
    const price = await bundlr.getPrice(metadataSize);
    const priceAR = bundlr.utils.fromAtomic(price);
    
    console.log(`\n📊 Test Mint Details:`);
    console.log(`   Metadata size: ${metadataSize} bytes`);
    console.log(`   Estimated cost: ${priceAR} AR`);
    
    // Upload metadata
    console.log('\n📤 Uploading test metadata to Arweave...');
    const metadataBuffer = Buffer.from(metadataString);
    const tx = await bundlr.upload(metadataBuffer, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'Neural-Salvage' },
        { name: 'Type', value: 'test-nft-metadata' },
        { name: 'Test', value: 'true' },
      ],
    });
    
    console.log('\n✅ Test NFT Minted Successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Transaction ID: ${tx.id}`);
    console.log(`View at: https://arweave.net/${tx.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n⏳ Wait ~2-5 minutes for Arweave confirmation');
    console.log('🔍 Then visit the URL above to see your test NFT metadata');
    
    // Cost estimates for different file sizes
    console.log('\n💵 Cost Estimates for Different File Sizes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const sizes = [
      { label: '10 KB (small image)', bytes: 10 * 1024 },
      { label: '100 KB (medium image)', bytes: 100 * 1024 },
      { label: '1 MB (large image)', bytes: 1024 * 1024 },
      { label: '10 MB (HD video clip)', bytes: 10 * 1024 * 1024 },
    ];
    
    for (const size of sizes) {
      const sizePrice = await bundlr.getPrice(size.bytes);
      const sizePriceAR = bundlr.utils.fromAtomic(sizePrice);
      console.log(`   ${size.label.padEnd(25)} ~${sizePriceAR} AR`);
    }
    
    console.log('\n🎉 Your NFT minting system is working!');
    console.log('📋 Next: Deploy to Vercel and test through UI');
    
  } catch (error) {
    console.error('\n❌ Error during test mint:', error.message);
    console.log('\n💡 Common fixes:');
    console.log('   1. Check ARWEAVE_PRIVATE_KEY is valid JSON');
    console.log('   2. Ensure wallet has AR balance');
    console.log('   3. Wait a few minutes if you just funded wallet');
    console.log('   4. Try different Bundlr node: https://node1.bundlr.network');
    process.exit(1);
  }
}

testMint().catch(console.error);
