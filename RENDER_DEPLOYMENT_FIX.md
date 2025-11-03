# 🚀 Render Deployment - Network Error Fix

## ✅ What I've Done

1. **Updated Frontend API Configuration** (`frontend/js/config.js`)
   - Changed `PRODUCTION_API_URL` to: `https://event-management-system-6lyo.onrender.com`
   - The app will automatically use this URL when not running on localhost

## 📋 Next Steps to Deploy

### Step 1: Update Backend Environment Variables on Render

Go to your **backend service** on Render:
1. Click on your backend service: `event-management-system-6lyo`
2. Go to **"Environment"** tab
3. Add/Update this environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://your-frontend-app.onrender.com` (replace with your actual frontend URL)
4. Click **"Save Changes"**

> **Note**: This allows CORS to accept requests from your frontend

### Step 2: Commit and Push Changes to GitHub

Run these commands in your terminal:

```powershell
git add .
git commit -m "Fixed API URLs for Render deployment"
git push
```

### Step 3: Deploy Frontend

After pushing to GitHub:
1. Go to Render Dashboard
2. Open your **frontend service**
3. It should auto-deploy, but if not:
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

### Step 4: Test Your Application

1. Open your frontend URL on Render
2. Try to login/register
3. The "Network Error" should be gone! 🎉

---

## 🔍 If You Still See "Network Error"

### Check 1: Verify Backend is Running
- Open: `https://event-management-system-6lyo.onrender.com`
- You should see a response (not a blank page)

### Check 2: Check Browser Console
- Press `F12` in your browser
- Go to **Console** tab
- Look for CORS errors or network errors
- Share the exact error message

### Check 3: Verify Environment Variables
In Render → Backend Service → Environment tab, make sure:
- `MONGODB_URI` is set correctly
- `FRONTEND_URL` is set to your frontend URL
- `PORT` is set to `5000` or let Render set it automatically

---

## 🌐 Your URLs

**Backend**: `https://event-management-system-6lyo.onrender.com`
**Frontend**: *(Add your frontend URL here after deployment)*

---

## 📝 Configuration Files Updated

✅ `frontend/js/config.js` - Updated with your Render backend URL
✅ `backend/.env.example` - Updated with deployment instructions

---

## 🆘 Need Help?

If you still face issues after these steps, check:
1. Render logs (Backend service → Logs tab)
2. Browser console errors (F12)
3. Network tab in browser (F12 → Network)

Share the error messages and I'll help you fix them!
