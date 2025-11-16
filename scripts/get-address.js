const { ethers } = require('ethers');

const privateKey = '0x339ccdbf1fd55830a7e646328daca91e4bef6cf08add96031c36b647e6670843';
const wallet = new ethers.Wallet(privateKey);

console.log('');
console.log('📋 YOUR POLYGON WALLET ADDRESS:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(wallet.address);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Send 100 MATIC (~$80) to this address');
console.log('');
