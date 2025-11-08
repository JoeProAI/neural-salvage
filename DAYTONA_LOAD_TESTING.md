# 🧪 DAYTONA LOAD TESTING GUIDE

## **Using Your $20K Daytona.io Credits for Platform Testing**

---

## 🎯 **TESTING GOALS**

**What We're Testing:**
1. Can platform handle 100+ concurrent users?
2. Do all features work under load?
3. Where are the bottlenecks?
4. What breaks first?
5. What's our max capacity?

**Success Criteria:**
- ✅ 100 concurrent users without errors
- ✅ API response times < 5 seconds
- ✅ No database crashes
- ✅ No memory leaks
- ✅ Successful NFT minting under load

---

## 📋 **DAYTONA SANDBOX ARCHITECTURE**

### **What is Daytona.io?**
- Cloud development environments
- Pre-configured workspaces
- Isolated testing environments
- Scales to hundreds of instances

### **How We'll Use It:**

```
Daytona Sandbox 1-10:  User simulation (sign up, upload, mint)
Daytona Sandbox 11-20: Concurrent minting stress test
Daytona Sandbox 21-30: Marketplace load test
Daytona Sandbox 31-40: Subscription stress test
Daytona Sandbox 41-50: Database query performance
Daytona Monitoring:    Aggregate metrics
```

---

## 🛠️ **SETUP PHASE**

### **Step 1: Create Daytona Account**

```
1. Go to daytona.io
2. Sign up / log in
3. Add your $20K credits
4. Verify credits active
```

### **Step 2: Create Test Scripts**

We'll use **k6** (load testing tool) for simulations.

**Install k6:**
```bash
# On your local machine
brew install k6  # macOS
# OR
choco install k6  # Windows
```

---

## 📝 **LOAD TEST SCRIPTS**

### **Test 1: User Signup Load**

**File:** `load-tests/signup-load.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const url = 'https://your-site.vercel.app/api/auth/signup';
  
  const payload = JSON.stringify({
    email: `test${__VU}_${__ITER}@example.com`,
    password: 'TestPassword123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

**Run Test:**
```bash
k6 run load-tests/signup-load.js
```

---

### **Test 2: NFT Minting Load**

**File:** `load-tests/minting-load.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '5m', target: 10 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  // 1. Login
  const loginRes = http.post(
    'https://your-site.vercel.app/api/auth/login',
    JSON.stringify({
      email: 'test@example.com',
      password: 'TestPassword123!',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const authToken = loginRes.json('token');

  // 2. Upload file (simulated)
  const formData = new FormData();
  formData.append('file', http.file('test-image.png', 'test-image.png', 'image/png'));
  
  const uploadRes = http.post(
    'https://your-site.vercel.app/api/upload',
    formData.body(),
    {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + formData.boundary,
        'Authorization': `Bearer ${authToken}`,
      },
    }
  );

  check(uploadRes, {
    'upload successful': (r) => r.status === 200,
  });

  const assetId = uploadRes.json('assetId');

  // 3. Mint NFT
  const mintRes = http.post(
    'https://your-site.vercel.app/api/nft/mint',
    JSON.stringify({
      assetId: assetId,
      title: `Test NFT ${__VU}_${__ITER}`,
      description: 'Load test NFT',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    }
  );

  check(mintRes, {
    'mint successful': (r) => r.status === 200,
    'mint time < 10s': (r) => r.timings.duration < 10000,
  });

  sleep(5);
}
```

---

### **Test 3: Gallery Query Load**

**File:** `load-tests/gallery-load.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://your-site.vercel.app/api/nfts', {
    headers: {
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'returns NFTs': (r) => r.json('nfts').length > 0,
  });

  sleep(Math.random() * 3); // Random delay 0-3s
}
```

---

### **Test 4: Marketplace Listing Load**

**File:** `load-tests/marketplace-load.js`

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  // List NFT for sale
  const res = http.post(
    'https://your-site.vercel.app/api/marketplace/list',
    JSON.stringify({
      nftId: 'test-nft-id',
      priceUSD: 50,
      duration: '30_days',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
      },
    }
  );

  check(res, {
    'listing created': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(2);
}
```

---

## 🚀 **DAYTONA DEPLOYMENT STRATEGY**

### **Phase 1: Single Instance Test (Baseline)**

**Goal:** Measure performance with 1 user

```bash
# In Daytona Sandbox 1
cd neural-salvage
npm install
npm run build

# Run baseline test
k6 run --vus 1 --duration 1m load-tests/signup-load.js
```

**Collect Metrics:**
- Average response time
- Error rate
- Memory usage
- CPU usage

---

### **Phase 2: 10 Concurrent Users**

**Goal:** Verify basic concurrency works

```bash
# In Daytona Sandbox 1-10
# Each sandbox runs 1 user

# Sandbox 1:
k6 run --vus 1 --duration 5m load-tests/full-flow.js

# Repeat in Sandboxes 2-10
```

**Expected Results:**
- ✅ All tests pass
- ✅ Response times < 5s
- ✅ 0% error rate

---

### **Phase 3: 50 Concurrent Users**

**Goal:** Find first bottlenecks

```bash
# Distribute across 10 sandboxes, 5 users each
# Daytona Sandbox 1:
k6 run --vus 5 --duration 10m load-tests/full-flow.js

# Repeat in Sandboxes 2-10
```

**Monitor:**
- Firebase quota usage
- Vercel function execution time
- Arweave transaction queue
- Memory/CPU on Vercel

---

### **Phase 4: 100 Concurrent Users**

**Goal:** Stress test to find breaking point

```bash
# Distribute across 20 sandboxes, 5 users each
# Or 10 sandboxes, 10 users each
```

**Expected Issues:**
- ⚠️ Firebase rate limits
- ⚠️ Vercel function timeouts
- ⚠️ Bundlr queue delays
- ⚠️ Database connection pool exhaustion

---

### **Phase 5: 200+ Concurrent Users (Optional)**

**Goal:** Find absolute max capacity

```bash
# Use all 50 Daytona sandboxes
# 4-5 users per sandbox = 200-250 total
```

**This will likely break something!** That's the point - find limits.

---

## 📊 **METRICS TO TRACK**

### **Application Metrics:**

```javascript
// Add to k6 scripts
import { Trend } from 'k6/metrics';

const signupTime = new Trend('signup_duration');
const mintTime = new Trend('mint_duration');
const galleryTime = new Trend('gallery_load_duration');

export default function () {
  const start = Date.now();
  // ... perform action ...
  const duration = Date.now() - start;
  signupTime.add(duration);
}
```

**Track:**
- ⏱️ Response times (p50, p95, p99)
- ❌ Error rates
- 📈 Throughput (requests/second)
- 🔄 Concurrent connections
- 💾 Memory usage
- 🔥 CPU usage

---

### **Dashboards:**

**1. k6 Cloud (Optional - $49/month)**
```bash
k6 cloud run load-tests/signup-load.js
```

**2. Grafana + InfluxDB (Free)**
```bash
# Send metrics to InfluxDB
k6 run --out influxdb=http://localhost:8086/k6 load-tests/signup-load.js
```

**3. Simple Console Output**
```bash
# Just view in terminal
k6 run load-tests/signup-load.js

# Save to file
k6 run load-tests/signup-load.js > results.txt
```

---

## 🔍 **MONITORING DURING TESTS**

### **Watch Your Services:**

**1. Vercel Dashboard:**
```
- Go to vercel.com/dashboard
- Click your project
- View "Functions" tab
- Monitor:
  - Function invocations
  - Execution time
  - Error rate
  - Bandwidth
```

**2. Firebase Console:**
```
- Go to console.firebase.google.com
- Check:
  - Firestore usage
  - Storage usage
  - Auth usage
  - Quota warnings
```

**3. Sentry Dashboard:**
```
- Go to sentry.io
- Monitor errors in real-time
- Check error rate
- Look for new error types
```

**4. PostHog Dashboard:**
```
- Go to posthog.com
- Watch live events
- Check session recordings
- Monitor performance
```

---

## ⚠️ **EXPECTED BOTTLENECKS**

### **1. Firebase Firestore**

**Limits:**
- 10,000 writes/second (default)
- 50,000 reads/second
- 1MB document size
- 500 concurrent connections

**Solutions:**
- Use caching (you already do!)
- Batch writes
- Pagination
- Rate limiting

---

### **2. Vercel Serverless Functions**

**Limits:**
- 10 second execution time (Hobby plan)
- 50 GB-hours/month
- 100 GB bandwidth
- 100 concurrent executions

**Solutions:**
- Upgrade to Pro ($20/month)
- Optimize functions
- Use edge functions
- Implement queuing

---

### **3. Arweave/Bundlr**

**Limits:**
- ~5-10 transactions/second
- 2-3 minute confirmation time
- Network congestion

**Solutions:**
- Queue minting requests
- Show pending status
- Async processing
- Batch uploads

---

### **4. Database Connections**

**Firebase:**
- 500 concurrent connections

**Solution:**
- Connection pooling (Firebase handles this)
- Close unused connections
- Use persistent connections

---

## ✅ **TESTING CHECKLIST**

### **Pre-Test:**
- [ ] All features working locally
- [ ] Test scripts written
- [ ] Daytona account set up
- [ ] $20K credits available
- [ ] Monitoring dashboards ready
- [ ] Team on standby (if issues)

### **During Test:**
- [ ] Run baseline (1 user)
- [ ] Run 10 user test
- [ ] Monitor all dashboards
- [ ] Document any errors
- [ ] Run 50 user test
- [ ] Check for bottlenecks
- [ ] Run 100 user test
- [ ] Find breaking point

### **Post-Test:**
- [ ] Analyze results
- [ ] Identify bottlenecks
- [ ] Create fix plan
- [ ] Re-test after fixes
- [ ] Document max capacity

---

## 🎯 **SUCCESS CRITERIA**

### **Minimum Acceptable Performance:**

```
✅ 50 concurrent users
✅ < 5% error rate
✅ < 5s response times (p95)
✅ No crashes
✅ NFT minting works under load
```

### **Ideal Performance:**

```
✅ 100 concurrent users
✅ < 1% error rate
✅ < 3s response times (p95)
✅ Graceful degradation
✅ All features functional
```

### **Excellent Performance:**

```
✅ 200+ concurrent users
✅ < 0.5% error rate
✅ < 2s response times (p95)
✅ No noticeable slowdown
✅ Auto-scaling works
```

---

## 🔧 **FIXES FOR COMMON ISSUES**

### **Issue 1: Slow API Responses**

**Symptoms:**
- Response times > 5s
- Users waiting too long

**Fixes:**
```typescript
// Add caching
const cache = new Map();

export async function GET(request: NextRequest) {
  const cacheKey = 'nfts-' + userId;
  
  if (cache.has(cacheKey)) {
    return NextResponse.json(cache.get(cacheKey));
  }
  
  const data = await fetchNFTs();
  cache.set(cacheKey, data);
  
  return NextResponse.json(data);
}

// Add pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  const nfts = await fetchNFTs(limit, offset);
  return NextResponse.json(nfts);
}
```

---

### **Issue 2: Firebase Quota Exceeded**

**Symptoms:**
- "Quota exceeded" errors
- Writes failing

**Fixes:**
1. Upgrade Firebase plan
2. Implement client-side caching
3. Reduce write frequency
4. Use batch writes

```typescript
// Batch writes
const batch = writeBatch(db);

nfts.forEach(nft => {
  const ref = doc(db, 'nfts', nft.id);
  batch.set(ref, nft);
});

await batch.commit(); // Single write operation
```

---

### **Issue 3: Vercel Function Timeouts**

**Symptoms:**
- 500 errors
- "Function timeout" in logs

**Fixes:**
1. Optimize slow queries
2. Use async/await properly
3. Move slow operations to background
4. Upgrade Vercel plan (60s limit on Pro)

```typescript
// Move to background job
export async function POST(request: NextRequest) {
  const { nftId } = await request.json();
  
  // Queue for background processing
  await queue.add('mint-nft', { nftId });
  
  return NextResponse.json({ 
    status: 'pending',
    message: 'Minting in progress...' 
  });
}
```

---

## 📈 **INTERPRETING RESULTS**

### **Good Results:**
```
✅ signup_duration p95 < 2000ms
✅ mint_duration p95 < 5000ms
✅ gallery_load_duration p95 < 1000ms
✅ error_rate < 1%
✅ throughput > 10 req/s
```

### **Acceptable Results:**
```
⚠️ signup_duration p95 < 5000ms
⚠️ mint_duration p95 < 10000ms
⚠️ gallery_load_duration p95 < 3000ms
⚠️ error_rate < 5%
⚠️ throughput > 5 req/s
```

### **Needs Improvement:**
```
❌ Any response time > 10s
❌ Error rate > 5%
❌ Throughput < 5 req/s
❌ Crashes or downtime
```

---

## 🎊 **CONCLUSION**

**With Daytona + k6, you can:**
- ✅ Test 100+ concurrent users
- ✅ Find bottlenecks before launch
- ✅ Measure real performance
- ✅ Fix issues proactively
- ✅ Launch with confidence

**Estimated Testing Time:** 1-2 days  
**Daytona Credit Usage:** ~$500-$1000 (you have $20K!)  
**Value:** Priceless for a smooth launch!

---

**Ready to stress test? Let's find and fix issues BEFORE users do!** 💪🧪
