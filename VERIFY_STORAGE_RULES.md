# 🔍 Verify Firebase Storage Rules Are Active

## ❌ Still Getting 403 Error?

If you're still seeing `storage/unauthorized` errors, the Storage rules might not have deployed correctly.

---

## ✅ **Verify Rules in Firebase Console**

### **Steps:**

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/

2. **Select Your Project:**
   - Click on **"nueral-salvage"**

3. **Check Storage Rules:**
   - Left sidebar → Click **"Storage"**
   - Click **"Rules"** tab at the top
   - **Verify you see this rule:**

```javascript
// Direct uploads from client (new path for direct Firebase uploads)
match /users/{userId}/uploads/{fileName} {
  allow read: if true; // Public read for now
  allow write: if isOwner(userId) && isValidFileSize();
  allow delete: if isOwner(userId);
}
```

4. **If NOT there:**
   - Copy ALL rules from `DEPLOY_STORAGE_RULES.md`
   - Paste into Firebase Console editor
   - Click **"Publish"** button (TOP RIGHT - important!)
   - Wait 30 seconds

---

## 🐛 **Common Issues**

### **Issue 1: Didn't Click "Publish"**
- The rules show in the editor BUT aren't active until you click "Publish"
- **Solution:** Click the blue "Publish" button (top right)

### **Issue 2: Rules Not Propagating**
- Can take 30-60 seconds to propagate globally
- **Solution:** Wait 1 minute, try upload again

### **Issue 3: Wrong Rule Path**
The path MUST be exactly:
```javascript
match /users/{userId}/uploads/{fileName} {
```
NOT:
```javascript
match /users/{userId}/assets/{assetId}/{allPaths=**} {  // Wrong path!
```

### **Issue 4: Missing Helper Function**
Make sure this function is at the TOP of your rules:
```javascript
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

---

## 🧪 **Test The Rules**

### **In Firebase Console:**

1. Go to **Storage** → **Rules** tab
2. Look for the **"Simulator"** button (top right area)
3. Click **"Simulator"**
4. Configure:
   - **Location:** Select your storage bucket
   - **Path:** `users/YOUR_USER_ID/uploads/test.mp3`
   - **Method:** `write`
   - **Authentication:** Check "Authenticated"
   - **UID:** Enter your actual user ID
5. Click **"Run"**
6. **Should say:** ✅ "Allowed"

---

## 📋 **Complete Storage Rules (Copy Again)**

If you're not sure, **copy these rules AGAIN** and publish:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidImageType() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidVideoType() {
      return request.resource.contentType.matches('video/.*');
    }
    
    function isValidAudioType() {
      return request.resource.contentType.matches('audio/.*');
    }
    
    function isValidFileSize() {
      // Max 500MB for all files (direct upload support)
      return request.resource.size < 500 * 1024 * 1024;
    }
    
    // Direct uploads from client (new path for direct Firebase uploads)
    match /users/{userId}/uploads/{fileName} {
      allow read: if true; // Public read for now
      allow write: if isOwner(userId) && isValidFileSize();
      allow delete: if isOwner(userId);
    }
    
    // User uploads - organized by userId (legacy path for API uploads)
    match /users/{userId}/assets/{assetId}/{allPaths=**} {
      allow read: if true; // Public read for now, can be restricted based on asset visibility
      allow write: if isOwner(userId) && isValidFileSize();
    }
    
    // Thumbnails
    match /users/{userId}/thumbnails/{thumbnailId} {
      allow read: if true;
      allow write: if isOwner(userId);
    }
    
    // User avatars
    match /users/{userId}/avatar {
      allow read: if true;
      allow write: if isOwner(userId) && isValidImageType() && request.resource.size < 2 * 1024 * 1024;
    }
    
    // Temporary uploads
    match /temp/{userId}/{fileName} {
      allow read, write: if isOwner(userId) && isValidFileSize();
      allow delete: if isOwner(userId);
    }
  }
}
```

---

## 🚨 **MAKE SURE YOU:**

1. ✅ Copied ALL rules (including helper functions at top)
2. ✅ Clicked **"Publish"** button (not just save)
3. ✅ Waited 30-60 seconds after publishing
4. ✅ Hard refreshed your browser (`Ctrl + Shift + R`)
5. ✅ Verified you're logged in to the app

---

## 🎯 **After Publishing Rules**

### **Look for these logs in console:**
```javascript
✅ [GALLERY] Uploading file directly to Firebase: song.mp3
✅ [DIRECT UPLOAD] Progress: 15.3%
✅ [DIRECT UPLOAD] Progress: 100.0%
✅ [DIRECT UPLOAD] Upload complete!
```

### **NOT these errors:**
```
❌ 403 (Forbidden)
❌ storage/unauthorized
```

---

## 💡 **Quick Checklist**

```
☐ Opened Firebase Console
☐ Selected "nueral-salvage" project  
☐ Went to Storage → Rules
☐ Pasted COMPLETE rules (with helper functions)
☐ Clicked "Publish" button
☐ Waited 60 seconds
☐ Hard refreshed browser
☐ Tried upload again
```

---

## 📞 **Still Not Working?**

If you've done all of this and it still fails:

1. **Check your user ID:**
   - In browser console, type: `firebase.auth().currentUser.uid`
   - Copy the ID

2. **Verify the path matches:**
   - Error shows: `users/YOUR_ID/uploads/filename.mp3`
   - Rule matches: `users/{userId}/uploads/{fileName}`
   - Should match!

3. **Try the Simulator:**
   - Use the Firebase Console simulator (see above)
   - Test with your actual user ID

---

**If rules are published correctly, uploads should work within 60 seconds!** 🚀
