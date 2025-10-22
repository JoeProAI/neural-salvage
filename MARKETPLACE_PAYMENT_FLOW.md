# 🏪 Neural Salvage Marketplace - Payment Flow & Legal Compliance

## ✅ This is a LEGITIMATE, SECURE Marketplace

The Neural Salvage marketplace uses **Stripe Connect**, the industry-standard platform trusted by Airbnb, Lyft, Shopify, and thousands of legitimate marketplaces.

---

## 💰 How Payments Work (Everyone Gets Paid Fairly)

### 1. **Seller Onboarding (Stripe Connect)**

When a creator wants to sell their assets:

1. **Click "Start Selling" in Settings**
2. **Redirected to Stripe** (not our servers)
3. **Stripe verifies identity:**
   - Government ID
   - Tax information (W-9/W-8)
   - Bank account details
4. **Stripe creates Connected Account** for the seller
5. **Seller gets their own Stripe dashboard**

**Why this is legitimate:**
- ✅ Stripe handles all KYC (Know Your Customer) compliance
- ✅ Sellers connect their own bank accounts directly to Stripe
- ✅ Tax reporting is automatic (1099-K forms)
- ✅ We never touch seller bank account info

---

### 2. **When Someone Buys an Asset**

**Payment Flow:**
```
Buyer → Stripe → [Platform Fee] → Seller Bank Account
         (holds)   (automatic)      (direct deposit)
```

**Step-by-step:**

1. **Buyer pays $100** (example)
2. **Stripe holds the money** (secure escrow)
3. **Platform fee deducted:** 10% = $10
4. **Seller receives:** $90 (directly to their bank)
5. **Transfer happens:** 2-7 business days (Stripe standard)

**Example:**
- Asset price: $50
- Platform fee (10%): $5
- Seller receives: $45
- Stripe processes: Direct deposit to seller's bank
- You (platform) receive: $5 to your Stripe account

**Why this is secure:**
- ✅ Stripe handles all money movement
- ✅ We never hold customer funds
- ✅ PCI-DSS compliant (credit card security)
- ✅ Automatic fraud detection
- ✅ Buyer protection (Stripe disputes)

---

### 3. **Payment Timeline**

**For Sellers:**
- ✅ Payments appear in their Stripe dashboard immediately
- ✅ Bank transfer: 2-7 business days (Stripe's standard)
- ✅ Can view all transaction history
- ✅ Download invoices and reports

**For Platform (You):**
- ✅ Platform fees go to your Stripe account
- ✅ Can set payout schedule (daily, weekly, monthly)
- ✅ Full transaction records for accounting

---

## 🔒 Legal & Compliance

### **1099-K Tax Forms (Automatic)**

- Stripe automatically issues 1099-K forms to sellers who:
  - Earn more than $600/year (US sellers)
  - Meet transaction thresholds
- **You don't handle tax reporting** - Stripe does it
- Sellers are responsible for their own taxes

### **Terms of Service Requirements**

The marketplace includes:
- ✅ Clear commission structure (10% default)
- ✅ Seller agreement (automated via Stripe)
- ✅ Buyer terms and conditions
- ✅ Refund policy
- ✅ DMCA/Copyright compliance
- ✅ Privacy policy

**Recommendation:** Get these reviewed by a lawyer before going live.

### **Payment Processing Licenses**

- ✅ **Stripe handles all licensing** (they're licensed in 195+ countries)
- ✅ You don't need a money transmitter license
- ✅ You don't need payment processor registration
- ✅ Stripe is PCI-DSS Level 1 certified

---

## 💳 Stripe Connect Architecture

### **Connected Accounts (Sellers)**

Each seller gets their own Stripe account:
- Own dashboard at `dashboard.stripe.com`
- Own bank account connection
- Own payout schedule
- Own tax forms
- Own dispute management

### **Platform Account (You)**

Your Stripe account:
- Receives platform fees only
- Doesn't hold seller funds
- Full transaction visibility
- Compliance dashboard

### **Payment Splitting (Automatic)**

When a buyer pays:
```javascript
// Stripe automatically splits:
Total: $100
├─ Platform Fee: $10 → Your account
└─ Seller Payout: $90 → Seller's bank
```

---

## 🛡️ Buyer Protection

Buyers are protected by:
- ✅ Stripe's dispute system
- ✅ Chargeback protection (for legitimate sellers)
- ✅ Fraud detection
- ✅ Secure card processing
- ✅ 3D Secure authentication

**Refund Process:**
1. Buyer requests refund
2. You review (via admin dashboard)
3. Approve/deny via Stripe API
4. If approved: Money returned to buyer
5. Platform fee can be refunded or kept

---

## 📊 Commission Structure (Configurable)

**Default:** 10% platform fee

**How to change:**
```env
PLATFORM_FEE_PERCENTAGE=10  # Change this in Vercel
```

**Examples:**
- 5% = Very competitive (like Gumroad)
- 10% = Industry standard (like Etsy)
- 15-20% = Premium with extra features
- 30% = High-touch curation (like app stores)

**Note:** Stripe also charges their fee (2.9% + $0.30 per transaction), which comes out of your platform fee or can be passed to buyer.

---

## 🔐 Security & Fraud Prevention

### **Stripe's Built-in Protection:**
- Machine learning fraud detection
- 3D Secure (Strong Customer Authentication)
- Card verification (CVV, ZIP)
- Velocity checks (rate limiting)
- IP/device fingerprinting

### **Your Responsibilities:**
- ✅ Verify asset ownership before allowing sales
- ✅ Monitor for prohibited content
- ✅ Handle DMCA takedown requests
- ✅ Review suspicious transactions
- ✅ Ban bad actors

---

## 📝 Webhook Handling (Automatic)

The marketplace listens for Stripe webhooks:

**Payment succeeded:**
- ✅ Mark asset as sold
- ✅ Grant buyer access
- ✅ Notify seller
- ✅ Update analytics

**Payout paid:**
- ✅ Record in database
- ✅ Update seller dashboard

**Dispute created:**
- ✅ Notify you
- ✅ Freeze asset access (optional)
- ✅ Collect evidence

---

## 💡 Recommended Practices

### **1. Transparent Fees**
Show buyers and sellers exactly what they pay:
```
Asset: $50.00
Platform Fee (10%): $5.00
Stripe Fee (2.9% + $0.30): $1.76
---------------------------------
Seller Receives: $42.94
You Receive: $5.00
Stripe Receives: $1.76
```

### **2. Clear Policies**
- Refund policy (30 days? No refunds?)
- License terms (commercial use? attribution?)
- Prohibited content
- Payment timing

### **3. Seller Support**
- Help sellers understand payouts
- Provide tax information resources
- Explain chargeback process
- Offer seller analytics

### **4. Compliance Documents**
Get legal review for:
- Terms of Service
- Privacy Policy
- Seller Agreement
- DMCA Policy
- Cookie Policy

---

## 🚀 Going Live Checklist

Before enabling marketplace:

- [ ] Complete Stripe verification
- [ ] Set up webhooks in production
- [ ] Review terms of service with lawyer
- [ ] Test full payment flow with test cards
- [ ] Set platform fee percentage
- [ ] Configure payout schedule
- [ ] Add support email/contact
- [ ] Create seller onboarding guide
- [ ] Set up dispute handling process
- [ ] Enable Stripe Radar (fraud detection)

---

## 📞 Support & Resources

**Stripe Documentation:**
- Connect: https://stripe.com/docs/connect
- Payments: https://stripe.com/docs/payments
- Tax: https://stripe.com/docs/connect/taxes

**Legal Resources:**
- Terms of Service Generator: https://www.termsfeed.com
- Privacy Policy: https://www.privacypolicies.com
- DMCA Agent: https://www.copyright.gov

**Your Stripe Dashboard:**
- Test mode: https://dashboard.stripe.com/test
- Live mode: https://dashboard.stripe.com

---

## ✅ Summary: Is This Legitimate?

**YES!** Here's why:

1. ✅ **Stripe is a regulated payment processor** (like PayPal, Square)
2. ✅ **Sellers get their own accounts** (not a pool)
3. ✅ **Direct bank deposits** (no middleman holding funds)
4. ✅ **Automatic tax compliance** (1099-K forms)
5. ✅ **Industry-standard fees** (10% platform + Stripe fees)
6. ✅ **Buyer protection** (disputes, refunds)
7. ✅ **Fraud prevention** (Stripe Radar)
8. ✅ **Used by major companies** (proven at scale)

**Bottom Line:**
- Sellers get paid directly by Stripe (not you)
- You get platform fees only
- Everyone can track their money
- It's transparent, secure, and legal

---

**Questions?** Check Stripe's Connect documentation or consult with a lawyer specializing in marketplace businesses.
