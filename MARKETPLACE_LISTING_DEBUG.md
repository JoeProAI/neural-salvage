# 🐛 Marketplace Listing Debug Guide

## 🔍 **Check What's Failing:**

### **Step 1: Open Browser Console**
```
1. Go to your NFT page
2. Press F12 (open DevTools)
3. Go to Console tab
4. Click "List for Sale"
5. Look for red error messages
```

### **Common Errors & Fixes:**

---

## ❌ **ERROR 1: "ArConnect wallet not found"**

**Cause:** ArConnect extension not installed

**Fix:**
```
1. Install ArConnect browser extension
2. Create/import Arweave wallet
3. Fund with ~0.001 AR ($0.025) for gas fees
4. Refresh page and try again
```

---

## ❌ **ERROR 2: "User does not have AR tokens"**

**Cause:** Wallet has 0 AR balance

**Fix:**
```
1. Get wallet address from ArConnect
2. Buy AR tokens on exchange (Binance, Kraken)
3. Send 0.01 AR to wallet (~$0.25)
4. Wait for confirmation
5. Try listing again
```

---

## ❌ **ERROR 3: "createTransaction is not a function"**

**Cause:** Arweave.js not installed or incorrect usage

**Fix:**
```bash
npm install arweave
```

---

## ❌ **ERROR 4: "dispatch failed" or "Transaction rejected"**

**Cause:** User canceled signature or insufficient AR

**Fix:**
- Make sure user approves the transaction popup
- Ensure wallet has AR for gas fees
- Check ArConnect permissions

---

## ✅ **WORKING TEST:**

### **What Should Happen:**
```
1. Click "List for Sale"
2. Enter price: $50
3. ArConnect popup appears
4. User approves transaction
5. Success message
6. Transaction ID logged
7. Check BazAR.io in 2-3 min
```

---

## 🔧 **DEBUGGING STEPS:**

### **1. Test Wallet Connection:**
```javascript
// In browser console
console.log(window.arweaveWallet)
// Should show: {connect, disconnect, getActiveAddress, ...}

window.arweaveWallet.getActiveAddress()
// Should show: "your-wallet-address"
```

### **2. Check AR Balance:**
```javascript
// In browser console
const address = await window.arweaveWallet.getActiveAddress()
const response = await fetch(`https://arweave.net/wallet/${address}/balance`)
const winston = await response.text()
const ar = winston / 1e12
console.log(`AR Balance: ${ar}`)
// Should be > 0.001
```

### **3. Test Transaction Creation:**
```javascript
// In browser console
const arweave = Arweave.init({host: 'arweave.net', port: 443, protocol: 'https'})
const tx = await arweave.createTransaction({data: 'test'})
console.log(tx)
// Should show transaction object
```

---

## 💡 **LIKELY ISSUE:**

Based on the error, it's probably one of these:

### **A. ArConnect Not Installed**
→ Install from Chrome/Firefox store

### **B. Wallet Has No AR**
→ Send 0.01 AR (~$0.25) to wallet

### **C. Missing Permissions**
→ Reconnect wallet with proper permissions

---

## 🎯 **TELL ME THE ERROR:**

**What does the console say when you click "List for Sale"?**

Copy the exact error message and I'll fix it immediately!
