/**
 * Generate new Arweave wallet for platform use
 * Run: node scripts/generate-wallet.js
 */

const Arweave = require('arweave');
const fs = require('fs');
const path = require('path');

async function generateWallet() {
  console.log('🔐 Generating new Arweave wallet...\n');
  
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  try {
    // Generate new wallet
    const key = await arweave.wallets.generate();
    
    // Get the wallet address
    const address = await arweave.wallets.jwkToAddress(key);
    
    console.log('✅ Wallet generated successfully!\n');
    console.log('📋 Wallet Address:');
    console.log(address);
    console.log('\n⚠️  CRITICAL SECURITY WARNINGS:');
    console.log('   1. NEVER commit platform-wallet.json to git');
    console.log('   2. BACKUP this file to 3 secure locations');
    console.log('   3. DELETE this file after adding to .env.local');
    console.log('   4. Save the address above in your password manager');
    
    // Save to file
    const walletPath = path.join(__dirname, 'platform-wallet.json');
    fs.writeFileSync(walletPath, JSON.stringify(key, null, 2));
    
    console.log('\n📁 Wallet saved to: scripts/platform-wallet.json');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: node scripts/get-wallet-address.js (to verify)');
    console.log('   2. Send 0.5-1 AR to the address above');
    console.log('   3. Run: node scripts/check-balance.js (after 2-5 min)');
    console.log('   4. Copy wallet JSON to ARWEAVE_PRIVATE_KEY in .env.local');
    console.log('   5. Delete scripts/platform-wallet.json');
    
  } catch (error) {
    console.error('❌ Error generating wallet:', error.message);
    process.exit(1);
  }
}

generateWallet().catch(console.error);
