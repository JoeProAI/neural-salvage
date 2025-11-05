/**
 * Get wallet address from platform-wallet.json
 * Run: node scripts/get-wallet-address.js
 */

const Arweave = require('arweave');
const fs = require('fs');
const path = require('path');

async function getAddress() {
  console.log('📋 Getting platform wallet address...\n');
  
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  try {
    const walletPath = path.join(__dirname, 'platform-wallet.json');
    
    if (!fs.existsSync(walletPath)) {
      console.error('❌ platform-wallet.json not found!');
      console.log('\n💡 Run this first: node scripts/generate-wallet.js');
      process.exit(1);
    }
    
    const key = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const address = await arweave.wallets.jwkToAddress(key);
    
    console.log('Platform Wallet Address:');
    console.log('━'.repeat(43));
    console.log(address);
    console.log('━'.repeat(43));
    console.log('\n💸 Send AR to this address to fund your platform');
    console.log('🔍 Check balance: https://viewblock.io/arweave/address/' + address);
    
  } catch (error) {
    console.error('❌ Error reading wallet:', error.message);
    process.exit(1);
  }
}

getAddress().catch(console.error);
