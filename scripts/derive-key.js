/**
 * Derive Polygon private key from MetaMask seed phrase
 * Run: node scripts/derive-key.js
 */

const { ethers } = require('ethers');

async function deriveKey() {
  console.log('🔑 Deriving private key from seed phrase...');
  console.log('');
  
  // PASTE YOUR 12 OR 24 WORD SEED PHRASE HERE (between quotes)
  const seedPhrase = 'YOUR SEED PHRASE HERE';
  
  if (seedPhrase === 'YOUR SEED PHRASE HERE') {
    console.log('❌ ERROR: Please edit this file and add your seed phrase!');
    console.log('');
    console.log('Steps:');
    console.log('1. Open scripts/derive-key.js');
    console.log('2. Replace "YOUR SEED PHRASE HERE" with your actual seed phrase');
    console.log('3. Run: node scripts/derive-key.js');
    console.log('');
    return;
  }
  
  try {
    // Create wallet from mnemonic (seed phrase)
    const wallet = ethers.Wallet.fromPhrase(seedPhrase);
    
    console.log('✅ Successfully derived wallet!');
    console.log('');
    console.log('📋 YOUR WALLET INFO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Address:      ', wallet.address);
    console.log('Private Key:  ', wallet.privateKey);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔐 SAVE THIS PRIVATE KEY SECURELY!');
    console.log('');
    console.log('Add to your .env file:');
    console.log(`POLYGON_PRIVATE_KEY=${wallet.privateKey}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Delete this file after saving the key!');
    console.log('    Your seed phrase should never be in code files.');
    
  } catch (error) {
    console.error('❌ Error deriving key:', error.message);
    console.log('');
    console.log('Common issues:');
    console.log('- Make sure seed phrase is exactly 12 or 24 words');
    console.log('- Words should be separated by spaces');
    console.log('- No extra characters or punctuation');
  }
}

deriveKey();
