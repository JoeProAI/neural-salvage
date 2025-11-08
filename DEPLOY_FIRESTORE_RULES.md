# 🔥 Deploy Firestore Rules - FIX SIGN UP/SIGN IN ISSUE

## ❌ Current Issue

**Error:** "Missing or insufficient permissions" when signing up/signing in

**Cause:** Firestore security rules need to be deployed to allow user document creation during sign-up.

**Solution:** Deploy the updated `firestore.rules` file to Firebase.

---

## ✅ **Deploy via Firebase Console (2 Minutes)**

### **Steps:**

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/

2. **Select Your Project:**
   - Click on **"nueral-salvage"**

3. **Navigate to Firestore:**
   - Left sidebar → Click **"Firestore Database"**
   - Click **"Rules"** tab at the top

4. **Replace the Rules:**
   - You'll see the current rules in the editor
   - **DELETE ALL** existing rules
   - **COPY AND PASTE** the entire contents below

5. **Publish:**
   - Click **"Publish"** button (top right)
   - Wait 5-10 seconds for deployment

6. **Done!**
   - Try signing up again - it will work!

---

## 📋 **Firestore Rules to Copy/Paste**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      // Allow create during sign-up (auth token exists but user doc doesn't yet)
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own document BUT cannot modify beta fields
      // Only Admin SDK (server-side) can modify beta fields
      allow update: if isOwner(userId) 
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny([
          'betaAccess',
          'betaGrantedAt',
          'betaGrantedBy',
          'betaReason',
          'betaNotes',
          'betaRevokedAt',
          'betaRevokedBy'
        ]);
      
      allow delete: if isOwner(userId);
    }
    
    // Assets collection
    match /assets/{assetId} {
      allow read: if resource.data.visibility == 'public' || isOwner(resource.data.userId);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Collections
    match /collections/{collectionId} {
      allow read: if resource.data.visibility == 'public' || isOwner(resource.data.userId);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // AI Jobs
    match /jobs/{jobId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // NFTs - Users can read their own NFTs and verified public NFTs
    match /nfts/{nftId} {
      // Allow list/query if authenticated (query filters by userId)
      allow list: if isAuthenticated();
      // Allow get if authenticated and (owns it OR it's verified)
      allow get: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.currentOwner == request.auth.uid ||
        resource.data.isVerified == true
      );
      // Allow creating NFTs if authenticated and setting own userId
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      // Allow update if owner
      allow update: if isAuthenticated() && (
        resource.data.userId == request.auth.uid || 
        resource.data.currentOwner == request.auth.uid
      );
      // Allow delete if creator
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Pending Mints
    match /pending_mints/{assetId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
      allow create: if isAuthenticated();
    }
    
    // Sales
    match /sales/{saleId} {
      allow read: if isOwner(resource.data.sellerId) || isOwner(resource.data.buyerId);
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.sellerId) || isOwner(resource.data.buyerId);
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, update: if isOwner(resource.data.userId);
      allow create: if isAuthenticated();
    }
  }
}
```

---

## 🧪 **After Deployment**

1. **Wait 10-30 seconds** for rules to propagate
2. **Try signing up/signing in again**
3. **Should work!** No more "insufficient permissions" error

---

## 📝 **What Was Fixed**

The rules now properly allow user document creation during the sign-up flow.

---

## 🎯 **Summary**

```
Problem: "Missing or insufficient permissions" on sign up/sign in
Solution: Deploy updated Firestore rules
Method:  Firebase Console (Firestore Database → Rules)
Time:    2 minutes
Result:  Sign up/sign in will work!
```

---

**Deploy these Firestore rules now and authentication will work!** 🚀
