# Quick Testing Guide
## Test Your Event Management System Locally

### Step 1: Clear Browser Cache ⚠️ IMPORTANT
**Why:** Your browser cached the old broken paths. You MUST clear cache to see the fixes!

**How to clear:**
1. Open browser
2. Press `Ctrl + Shift + Delete`
3. Select "Cached images and files"
4. Click "Clear data"
5. Close all browser tabs

**Alternative:** Use Incognito/Private mode (Ctrl+Shift+N in Chrome)

---

### Step 2: Ensure Both Servers Are Running

#### Backend Server (Terminal 1):
```powershell
cd "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\backend"
node server.js
```
**Expected Output:**
```
Server is running on port 5000
MongoDB connected successfully!
```

#### Frontend Server (Terminal 2):
```powershell
cd "c:\Users\RCP\Downloads\Telegram Desktop\Event Management System (3)\Event Management System\frontend"
python -m http.server 3000
```
**Expected Output:**
```
Serving HTTP on :: port 3000 (http://[::]:3000/) ...
```

---

### Step 3: Test Each Page

#### 1. Login Page ✅ (Already Verified Working)
**URL:** http://localhost:3000/login.html

**What to Check:**
- [ ] Page loads without errors
- [ ] Styling looks correct (no missing CSS)
- [ ] Open Console (F12) - Should see NO 404 errors
- [ ] Try logging in (test credentials)

---

#### 2. Home Page (After Login)
**URL:** http://localhost:3000/home.html

**What to Check:**
- [ ] Page loads without errors
- [ ] Styling looks correct
- [ ] Open Console (F12):
  - Check for 404 errors ❌ (should be NONE)
  - Check Network tab - all resources should load from `css/` and `js/` directories
- [ ] Verify navigation works

---

#### 3. Events Page
**URL:** http://localhost:3000/events.html

**What to Check:**
- [ ] Page loads without errors
- [ ] Events display correctly
- [ ] Console shows NO 404 errors
- [ ] Filters work
- [ ] Search works
- [ ] API calls use `http://localhost:5000` (check Network tab)

---

#### 4. Calendar Page
**URL:** http://localhost:3000/calendar.html

**What to Check:**
- [ ] Calendar renders correctly
- [ ] Events show on calendar
- [ ] Console - no errors
- [ ] Date selection works

---

#### 5. Favorites Page
**URL:** http://localhost:3000/favorites.html

**What to Check:**
- [ ] Favorites load from API
- [ ] Can add/remove favorites
- [ ] Console - no errors

---

#### 6. Leaderboard Page
**URL:** http://localhost:3000/leaderboard.html

**What to Check:**
- [ ] Leaderboard loads
- [ ] Sorting works
- [ ] User rankings display
- [ ] Console - no errors

---

#### 7. My Tickets Page
**URL:** http://localhost:3000/my-tickets.html

**What to Check:**
- [ ] Tickets load for logged-in user
- [ ] Ticket details display
- [ ] Console - no errors

---

#### 8. Profile Page
**URL:** http://localhost:3000/profile.html

**What to Check:**
- [ ] User profile loads
- [ ] Can edit profile
- [ ] Console - no errors

---

#### 9. Event Template Page
**URL:** http://localhost:3000/event-template.html?event=someEventId

**What to Check:**
- [ ] Event details load
- [ ] Registration works
- [ ] Console - no errors

---

### Step 4: Console Error Checking Guide

#### How to Check Console:
1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for errors (red text)

#### What You Should See:
✅ **Good (No Errors):**
```
[No messages or only info messages]
```

❌ **Bad (Errors to Fix):**
```
GET http://localhost:3000/styles.css 404 (Not Found)
GET http://localhost:3000/notifications.js 404 (Not Found)
```

#### How to Check Network Tab:
1. Press **F12**
2. Click **Network** tab
3. Refresh page (F5)
4. Look at all requests

**What to Verify:**
- ✅ All CSS files load from `http://localhost:3000/css/...`
- ✅ All JS files load from `http://localhost:3000/js/...`
- ✅ All API calls go to `http://localhost:5000/...`
- ❌ NO 404 (Not Found) errors

---

### Step 5: Test API Functionality

#### Create Test User (If Needed):
```powershell
# Run in backend directory
node
> const mongoose = require('mongoose');
> mongoose.connect('mongodb://127.0.0.1:27017/eventManagement');
> // Create user via register page instead
```

**Or use Register Page:**
1. Go to http://localhost:3000/register.html
2. Create a test user
3. Login with credentials

#### Test These Functions:
- [ ] Register new user
- [ ] Login
- [ ] Logout
- [ ] View events
- [ ] Add event to favorites
- [ ] Remove from favorites
- [ ] Book event ticket
- [ ] View my tickets
- [ ] Cancel booking
- [ ] Update profile
- [ ] Search events
- [ ] Filter events by category/date
- [ ] View leaderboard
- [ ] Earn points (login daily, attend events)

---

### Step 6: Common Issues & Solutions

#### Issue: Still seeing 404 errors for CSS/JS files
**Solution:** 
1. Hard refresh: Press `Ctrl + F5` (not just F5)
2. Clear browser cache completely
3. Try Incognito mode
4. Check file paths in HTML source (right-click → View Page Source)

#### Issue: API calls fail
**Solution:**
1. Verify backend server is running on port 5000
2. Check MongoDB is connected
3. Check console for CORS errors
4. Verify `API_CONFIG.BASE_URL` is defined (type in console: `API_CONFIG.BASE_URL`)

#### Issue: Page shows but styling is broken
**Solution:**
1. Check Console for CSS 404 errors
2. Verify CSS files exist in `frontend/css/` folder
3. Check HTML file has correct paths: `<link rel="stylesheet" href="css/...">`

#### Issue: JavaScript features don't work
**Solution:**
1. Check Console for JS errors
2. Verify `config.js` loads BEFORE other scripts
3. Check JS files exist in `frontend/js/` folder
4. Verify `API_CONFIG` is defined

---

### Step 7: Report Results

After testing, document:

#### ✅ What Works:
- Login page: ✅ / ❌
- Home page: ✅ / ❌
- Events page: ✅ / ❌
- Calendar: ✅ / ❌
- Favorites: ✅ / ❌
- Leaderboard: ✅ / ❌
- My Tickets: ✅ / ❌
- Profile: ✅ / ❌
- Event Template: ✅ / ❌

#### ❌ What Doesn't Work:
- List any pages with errors
- Copy Console error messages
- Note which API calls fail
- Document any 404 errors

---

### Step 8: Next Steps

#### If Everything Works ✅:
1. Proceed to deployment
2. Follow **DEPLOYMENT_GUIDE.md**
3. Deploy backend to Render (Web Service)
4. Deploy frontend to Render (Static Site)
5. Update `config.js` with production backend URL

#### If Issues Found ❌:
1. Document errors clearly
2. Check Console messages
3. Verify file paths
4. Check server logs
5. Ask for help with specific error messages

---

## Quick Reference Commands

### Start Backend:
```powershell
cd backend
node server.js
```

### Start Frontend:
```powershell
cd frontend
python -m http.server 3000
```

### Clear Browser Cache:
```
Ctrl + Shift + Delete
```

### Hard Refresh:
```
Ctrl + F5
```

### Open Console:
```
F12
```

---

## Testing Checklist Summary

**Before Testing:**
- [ ] Clear browser cache
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] MongoDB connected

**During Testing:**
- [ ] Check each page for styling
- [ ] Check Console (F12) for errors
- [ ] Check Network tab for 404s
- [ ] Test API functionality
- [ ] Test navigation between pages

**After Testing:**
- [ ] Document what works
- [ ] Document any errors
- [ ] Prepare for deployment if all works

---

## Success Criteria ✅

Your system is ready for deployment when:
1. ✅ All pages load without 404 errors
2. ✅ All styling appears correctly
3. ✅ All API calls succeed
4. ✅ User can login/register
5. ✅ Events display on all pages
6. ✅ CRUD operations work (Create, Read, Update, Delete)
7. ✅ Navigation works between pages
8. ✅ Console shows no errors

---

Good luck with testing! 🚀
