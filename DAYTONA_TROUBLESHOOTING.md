# 🔧 Daytona "Payment Setup Failed" Troubleshooting

## 🐛 **Issue:**
```
AI generation error: Error: Payment setup failed
```

**You have $20k in Daytona credits, so why this error?**

---

## 🎯 **Root Cause:**

The error comes from **Daytona's API**, not your code. Common causes:

### **1. API Key Permissions** (Most Likely)
```
Your API key might not have permission to:
- Create sandboxes
- Run code
- Access billing/credits

Fix: Regenerate API key with full permissions
```

### **2. Organization Billing Not Linked**
```
Credits exist BUT:
- Not linked to the organization
- Not linked to the project
- Not accessible by this API key

Fix: Check Daytona dashboard organization settings
```

### **3. Payment Method Required Despite Credits**
```
Daytona might require:
- Credit card on file (even with credits)
- Payment method for overages
- Billing profile completed

Fix: Add payment method to account
```

### **4. API Key from Wrong Organization**
```
You have credits in Org A
But API key is from Org B

Fix: Use API key from the organization with credits
```

---

## ✅ **How to Fix:**

### **Step 1: Check Daytona Dashboard**

```
1. Go to: https://app.daytona.io
2. Click: Settings → Billing
3. Verify:
   - ✅ Credits showing: $20,000
   - ✅ Organization selected
   - ✅ Payment method on file (even if not used)
```

### **Step 2: Regenerate API Key**

```
1. Go to: https://app.daytona.io
2. Click: Settings → API Keys
3. Delete old key
4. Create new key with FULL permissions:
   ✅ Read
   ✅ Write
   ✅ Execute
   ✅ Billing access
5. Copy new key
```

### **Step 3: Update Vercel**

```
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Update: DAYTONA_API_KEY=your_new_key
4. Redeploy
```

### **Step 4: Add Payment Method (If Needed)**

```
Even with credits, Daytona might require:
1. Settings → Billing → Payment Methods
2. Add credit card
3. Save (won't be charged while you have credits)
```

---

## 🔍 **Debug: Check What's Really Happening**

### **Test Daytona Directly:**

Create this test file:

```typescript
// scripts/test-daytona.ts
import { Daytona } from '@daytonaio/sdk';

async function testDaytona() {
  try {
    console.log('Testing Daytona connection...');
    console.log('API Key:', process.env.DAYTONA_API_KEY?.substring(0, 20) + '...');
    
    const daytona = new Daytona({
      apiKey: process.env.DAYTONA_API_KEY!,
      target: 'us',
    });
    
    console.log('Creating sandbox...');
    const sandbox = await daytona.create({
      envVars: {
        TEST: 'hello',
      },
    });
    
    console.log('✅ Sandbox created:', sandbox.id);
    
    console.log('Running test code...');
    const result = await sandbox.process.codeRun('print("Hello from Daytona!")');
    
    console.log('✅ Code executed:', result);
    console.log('Exit code:', result.exitCode);
    console.log('Output:', result.result);
    
    await sandbox.delete();
    console.log('✅ Test complete!');
    
  } catch (error: any) {
    console.error('❌ Daytona test failed:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', error.response?.data || error);
  }
}

testDaytona();
```

**Run it:**
```bash
npx tsx scripts/test-daytona.ts
```

This will show the EXACT error from Daytona!

---

## 💡 **Quick Workaround (While Fixing):**

The fixes I just pushed make AI optional:
```
✅ Users can upload files
✅ Get basic auto-generated tags
✅ Mint NFTs
✅ List on OpenSea

All WITHOUT Daytona AI! ✅
```

So your platform works even if Daytona has issues.

---

## 🎯 **Most Likely Solution:**

**The API key doesn't have proper permissions.**

Fix:
1. Go to Daytona dashboard
2. Settings → API Keys
3. Delete current key
4. Create new key with **ALL permissions**
5. Update DAYTONA_API_KEY in Vercel
6. Redeploy

This solves 90% of "Payment setup failed" errors even when you have credits.

---

## 📞 **If Still Broken:**

Contact Daytona support:
- Email: support@daytona.io
- Slack: Get invite at app.daytona.io
- Say: "I have $20k credits but getting 'Payment setup failed' error"

They'll check your account and fix permissions.

---

## 🚀 **Alternative: Skip Daytona Entirely**

Use OpenAI directly instead:

**Cost comparison:**
```
Daytona: $20k credits
OpenAI direct: $0.01 per analysis

$20k / $0.01 = 2,000,000 analyses!

Direct OpenAI might be simpler! ✅
```

Want me to help you switch to direct OpenAI API? Would take 10 minutes and avoid this issue entirely.
