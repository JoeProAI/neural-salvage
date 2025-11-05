/**
 * Check platform wallet AR balance
 * Run: node scripts/check-balance.js
 */

const Arweave = require('arweave');
const fs = require('fs');
const path = require('path');

async function checkBalance() {
  console.log('💰 Checking platform wallet balance...\n');
  
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
    const balanceWinston = await arweave.wallets.getBalance(address);
    const balanceAR = arweave.ar.winstonToAr(balanceWinston);
    
    console.log('Wallet Address:');
    console.log(address);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Balance: ${balanceAR} AR`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const arFloat = parseFloat(balanceAR);
    
    if (arFloat === 0) {
      console.log('\n⚠️  Wallet is empty!');
      console.log('💸 Send 0.5-1 AR to start minting NFTs');
    } else if (arFloat < 0.1) {
      console.log('\n⚠️  Low balance warning!');
      console.log('💸 Consider refilling soon');
    } else {
      console.log('\n✅ Balance looks good!');
    }
    
    // Estimate minting capacity
    const costPerMint = 0.001; // ~$0.01-0.10 per mint
    const estimatedMints = Math.floor(arFloat / costPerMint);
    
    console.log(`\n📊 Estimated NFT mints possible: ~${estimatedMints.toLocaleString()}`);
    console.log(`   (Based on ~${costPerMint} AR per average mint)`);
    
    // Get AR price
    try {
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd');
      const priceData = await priceResponse.json();
      const arPrice = priceData.arweave.usd;
      const balanceUSD = arFloat * arPrice;
      
      console.log(`\n💵 Current value: ~$${balanceUSD.toFixed(2)} USD`);
      console.log(`   (AR price: $${arPrice.toFixed(2)})`);
    } catch (error) {
      console.log('\n💵 Could not fetch AR price');
    }
    
  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    process.exit(1);
  }
}

checkBalance().catch(console.error);
