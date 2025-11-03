# 🚀 Deploy Your Event Management System on Render - FROM SCRATCH

## 📋 What We'll Deploy

1. **Backend** (Node.js server) - Handles API requests
2. **Frontend** (Static site) - Your website interface  
3. **MongoDB Atlas** (Database) - Stores all data

**Total Time: 20-25 minutes**

---

# PART 1: Setup MongoDB Atlas (8 minutes)

## Step 1: Create MongoDB Atlas Account

1. **Open browser** → Go to: https://www.mongodb.com/cloud/atlas/register

2. **Sign up:**
   - **Option A:** Fill email & password, click "Create your Atlas account"
   - **Option B:** Click "Sign up with Google" (faster!)

3. **Answer questions** (if asked):
   - What describes you best? → "Learning MongoDB"
   - What is your goal? → "Build a new application"
   - Click "Finish"

## Step 2: Create Database Cluster

1. **Create Organization** (if asked):
   - Name: `MyProjects`
   - Click "Next" → "Create Organization"

2. **Create Project:**
   - Name: `EventManagement`
   - Click "Next" → "Create Project"

3. **Build Database:**
   - Click "Build a Database" (big green button)
   - Choose **"M0 FREE"** (under Shared)
   - Provider: AWS
   - Region: Choose closest to you
   - Cluster Name: `Cluster0`
   - Click "Create Cluster"
   - ⏳ **Wait 3-5 minutes**

## Step 3: Create Database User

Popup appears automatically:

1. **Username:** `admin`
2. Click "Autogenerate Secure Password"
3. **📋 COPY THE PASSWORD!** Save in Notepad!
4. Click "Create User"

## Step 4: Setup Network Access

Still in popup:

1. Click "My Local Environment"
2. Click "Add My Current IP Address"
3. **ALSO click "Add a Different IP Address":**
   - IP: `0.0.0.0/0`
   - Description: `Allow all`
4. Click "Finish and Close"

## Step 5: Get Connection String

1. Wait for cluster to show "Active" 🟢
2. Click "Connect" button on Cluster0
3. Choose "Connect your application"
4. **Copy the connection string**
5. **Edit it in Notepad:**
   - Replace `<password>` with your actual password
   - Add `/event_management` after `.mongodb.net` and before `?`
   
   **Example:**
   ```
   mongodb+srv://admin:MyPass123@cluster0.abc.mongodb.net/event_management?retryWrites=true&w=majority
   ```
6. **Save this!** You'll need it soon!

✅ **MongoDB Atlas Ready!**

---

# PART 2: Transfer Your Data (5 minutes)

## Step 6: Export Data from Local MongoDB

1. **Open MongoDB Compass**
2. Connect to `mongodb://localhost:27017`
3. Click `event_management` database

**Export each collection:**
- Click `users` → "Export Collection" → JSON → Save to Desktop as `users.json`
- Click `events` → "Export Collection" → JSON → Save as `events.json`
- Repeat for all collections

## Step 7: Import to Atlas

1. **In Compass, disconnect** from localhost
2. **New Connection** → Paste Atlas connection string → Connect
3. **Create database** (if not exists):
   - Click "+ Create Database"
   - Database: `event_management`
   - Collection: `users`
   - Create

4. **Import each collection:**
   - Click `users` collection
   - "Add Data" → "Import File"
   - Select `users.json` → Import
   - Create `events` collection
   - Import `events.json`
   - Repeat for all

✅ **Data in Cloud!**

---

# PART 3: Deploy Backend on Render (5 minutes)

## Step 8: Create Render Account

1. Go to: https://render.com/
2. Click "Get Started" or "Sign Up"
3. **Sign up with GitHub** (click GitHub button)
4. Authorize Render to access your GitHub

## Step 9: Deploy Backend

1. **In Render Dashboard**, click "New +" → "Web Service"

2. **Connect Repository:**
   - Find: `Event-management-system`
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `event-management-system-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

4. **Add Environment Variables** (IMPORTANT!):
   
   Click "Advanced" → "Add Environment Variable"
   
   **Variable 1:**
   - Key: `MONGODB_URI`
   - Value: (Paste your Atlas connection string from Step 5)
   
   **Variable 2:**
   - Key: `PORT`
   - Value: `5000`
   
   **Variable 3:**
   - Key: `FRONTEND_URL`
   - Value: `https://event-management-system-frontend.onrender.com`
   *(Note: We'll update this after creating frontend)*

5. **Click "Create Web Service"**

6. **Wait for deployment** ⏳ (3-5 minutes)
   - Watch logs
   - Wait for "✅ MongoDB connected successfully!"
   - Status shows "Live" 🟢

7. **Copy Backend URL:**
   - Top of page shows: `https://event-management-system-backend-XXXX.onrender.com`
   - **📋 Copy this URL!**

✅ **Backend Deployed!**

---

# PART 4: Deploy Frontend on Render (3 minutes)

## Step 10: Update Frontend Config

Before deploying frontend, we need to update the API URL:

1. **Go back to your VS Code**
2. Open `frontend/js/config.js`
3. Find line with `PRODUCTION_API_URL`
4. Update it to your backend URL from Step 9:
   ```javascript
   PRODUCTION_API_URL: 'https://event-management-system-backend-XXXX.onrender.com'
   ```
5. **Save file**
6. **Commit and push:**
   ```powershell
   git add .
   git commit -m "Updated production API URL"
   git push
   ```

## Step 11: Deploy Frontend

1. **In Render Dashboard**, click "New +" → "Static Site"

2. **Connect Repository:**
   - Find: `Event-management-system`
   - Click "Connect"

3. **Configure:**
   - **Name:** `event-management-system-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** *(leave empty)*
   - **Publish Directory:** *(leave as `.` or empty)*

4. **Click "Create Static Site"**

5. **Wait for deployment** ⏳ (1-2 minutes)

6. **Copy Frontend URL:**
   - Shows: `https://event-management-system-frontend.onrender.com`
   - **📋 Copy this!**

✅ **Frontend Deployed!**

---

# PART 5: Update Backend Environment Variable (2 minutes)

## Step 12: Fix CORS

Now update the backend to allow frontend:

1. Go back to **Backend service** in Render
2. Click "Environment" (left sidebar)
3. Find `FRONTEND_URL` variable
4. **Update its value** to your actual frontend URL:
   ```
   https://event-management-system-frontend.onrender.com
   ```
5. Click "Save Changes"
6. Backend will redeploy (2 minutes)

✅ **Everything Connected!**

---

# PART 6: Test Your Website! (2 minutes)

## Step 13: Test Everything

1. **Open your frontend URL:**
   ```
   https://event-management-system-frontend.onrender.com
   ```

2. **Create Account:**
   - Click "Create Account" or go to `/register.html`
   - Fill form
   - Submit
   - Should show success!

3. **Login:**
   - Go to `/login.html`
   - Enter your credentials
   - Click "Sign In"
   - Should redirect to dashboard!

4. **Test Features:**
   - Browse events
   - Create event (if manager)
   - Everything works!

🎉 **YOUR WEBSITE IS LIVE!**

---

# 📋 QUICK CHECKLIST

```
MONGODB ATLAS:
□ Created account
□ Created free cluster
□ Created database user & saved password
□ Added IP 0.0.0.0/0
□ Got connection string
□ Replaced <password>
□ Added /event_management
□ Saved connection string

DATA TRANSFER:
□ Exported collections from local MongoDB
□ Imported to Atlas
□ Verified data in Atlas

BACKEND DEPLOYMENT:
□ Signed up on Render
□ Created Web Service
□ Connected GitHub repo
□ Set Root Directory: backend
□ Added MONGODB_URI env var
□ Added PORT env var
□ Added FRONTEND_URL env var (temporary)
□ Deployed successfully
□ Copied backend URL

FRONTEND DEPLOYMENT:
□ Updated config.js with backend URL
□ Committed and pushed
□ Created Static Site
□ Connected repo
□ Set Root Directory: frontend
□ Deployed successfully
□ Copied frontend URL

FINAL CONFIGURATION:
□ Updated FRONTEND_URL in backend
□ Backend redeployed
□ Tested website
□ Everything works!
```

---

# 🌐 YOUR DEPLOYED URLs

After completion, you'll have:

**Frontend (your website):**
```
https://event-management-system-frontend.onrender.com
```

**Backend (API):**
```
https://event-management-system-backend-XXXX.onrender.com
```

**Database:**
```
MongoDB Atlas (cloud)
```

---

# ⚠️ IMPORTANT NOTES

## Free Tier Limitations:

1. **Render Free Tier:**
   - Services sleep after 15 min inactivity
   - First request takes 30-50 seconds to wake up
   - 750 hours/month free

2. **MongoDB Atlas Free:**
   - 512 MB storage
   - Shared cluster
   - Perfect for learning/small projects

## Keep Services Alive:

To prevent sleeping (optional):
- Use UptimeRobot.com (free)
- Ping your website every 10 minutes

---

# 🆘 TROUBLESHOOTING

## "Service won't deploy"
- Check Render logs
- Make sure `package.json` exists in backend
- Verify Node version compatibility

## "MongoDB connection failed"
- Check connection string format
- Verify password is correct (no < >)
- Make sure 0.0.0.0/0 is whitelisted

## "Network error" on website
- Verify FRONTEND_URL is set correctly in backend
- Check both services show "Live"
- Clear browser cache

## "Can't find my repo"
- Make sure repo is public
- Or grant Render access to private repos
- Refresh GitHub connection

---

# 🎯 NEXT STEPS

After deployment:

1. **Test all features thoroughly**
2. **Share your website URL!**
3. **Add custom domain** (optional, Render tutorial)
4. **Set up monitoring** (UptimeRobot)
5. **Consider upgrading** if you get traffic

---

# 📞 NEED HELP?

**Tell me:**
1. Which part you're on?
2. What error you see?
3. Screenshot if possible?

I'll guide you through it! 🚀

---

**Remember:** Take it step by step. Each part is independent. If one fails, we can fix it without affecting others!

**Ready to start? Begin with Part 1: Setup MongoDB Atlas!** 💪
