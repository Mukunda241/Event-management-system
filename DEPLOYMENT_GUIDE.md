# 🚀 Complete Deployment Guide for Render

This guide will help you deploy your Event Management System with **separate frontend and backend** on Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **MongoDB Atlas Account** - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Create a **New Project** (e.g., "Event Management")
4. Click **"Build a Database"**
5. Choose **FREE Shared** tier
6. Select a cloud provider and region (choose closest to your users)
7. Click **"Create Cluster"** (takes 3-5 minutes)

### 1.2 Configure Database Access
1. **Database Access** (left sidebar):
   - Click **"Add New Database User"**
   - Choose **Password** authentication
   - Username: `eventadmin` (or any name)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click **"Add User"**

2. **Network Access** (left sidebar):
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (or use `0.0.0.0/0`)
   - Click **"Confirm"**

### 1.3 Get Connection String
1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://eventadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace `<password>`** with your actual password
5. Add database name: Change `/?retryWrites` to `/event_management?retryWrites`
   
   Final format:
   ```
   mongodb+srv://eventadmin:yourpassword@cluster0.xxxxx.mongodb.net/event_management?retryWrites=true&w=majority
   ```

---

## 🔧 Step 2: Deploy Backend (Web Service)

### 2.1 Push Code to GitHub
```bash
git add .
git commit -m "Separated frontend and backend"
git push origin main
```

### 2.2 Create Backend Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `event-management-backend` |
   | **Root Directory** | `backend` |
   | **Environment** | `Node` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

### 2.3 Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://eventadmin:yourpassword@cluster0.xxxxx.mongodb.net/event_management?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | (leave empty for now, we'll add it after frontend deployment) |

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. You'll get a URL like: `https://event-management-backend.onrender.com`
4. **Save this URL!** You'll need it for the frontend

### 2.5 Test Backend
Open: `https://event-management-backend.onrender.com`

You should see your backend running! If you get an error, check the logs.

---

## 🎨 Step 3: Deploy Frontend (Static Site)

### 3.1 Update API Configuration
**Before deploying frontend**, update the config file:

1. Open `frontend/js/config.js`
2. Replace `PRODUCTION_API_URL` with your backend URL:
   ```javascript
   PRODUCTION_API_URL: 'https://event-management-backend.onrender.com',
   ```
3. Save the file
4. Commit and push:
   ```bash
   git add frontend/js/config.js
   git commit -m "Updated production API URL"
   git push origin main
   ```

### 3.2 Create Frontend Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository (same repo)
4. Configure service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `event-management-frontend` |
   | **Root Directory** | `frontend` |
   | **Branch** | `main` |
   | **Build Command** | (leave empty) |
   | **Publish Directory** | `.` |

### 3.3 Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment (2-5 minutes)
3. You'll get a URL like: `https://event-management-frontend.onrender.com`
4. **Save this URL!**

---

## 🔄 Step 4: Final Configuration

### 4.1 Update Backend with Frontend URL
1. Go to Render Dashboard → **Backend Service**
2. Click **"Environment"** (left sidebar)
3. Find `FRONTEND_URL` variable
4. Click **"Edit"** and add your frontend URL:
   ```
   https://event-management-frontend.onrender.com
   ```
5. Click **"Save Changes"**
6. Backend will automatically redeploy

### 4.2 Update CORS (if needed)
If you're getting CORS errors, update `backend/server.js`:

```javascript
const cors = require("cors");

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

Commit and push:
```bash
git add backend/server.js
git commit -m "Updated CORS configuration"
git push origin main
```

---

## ✅ Step 5: Test Your Application

1. **Open Frontend URL**: `https://event-management-frontend.onrender.com`
2. **Try to register** a new account
3. **Try to login**
4. **Create an event**
5. **Check if everything works**

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: Backend not connecting to database**
- Check MongoDB Atlas → Network Access (allow 0.0.0.0/0)
- Verify `MONGODB_URI` in Render environment variables
- Check backend logs in Render dashboard

**Problem: Backend keeps crashing**
- Check logs in Render dashboard
- Make sure `package.json` has all dependencies
- Verify `npm start` command is correct

**Problem: 503 Service Unavailable**
- Free tier services spin down after inactivity
- First request might be slow (wakes up the service)
- Consider upgrading to paid tier for always-on service

### Frontend Issues

**Problem: "Network error or server not responding"**
- Verify `frontend/js/config.js` has correct backend URL
- Check browser console for exact error
- Make sure backend is running (visit backend URL)

**Problem: CSS/JS not loading**
- Check file paths in HTML files
- Make sure files are in correct directories
- Check browser network tab for 404 errors

**Problem: CORS errors**
- Update backend CORS configuration
- Add `FRONTEND_URL` to backend environment variables
- Redeploy backend after changes

---

## 📊 Monitoring

### Check Logs
- **Backend**: Render Dashboard → Your Backend Service → Logs
- **Frontend**: Check browser console (F12)

### Monitor Database
- MongoDB Atlas Dashboard → Metrics

---

## 💰 Cost Considerations

### Free Tier Limits (Render)
- **Backend (Web Service)**: 750 hours/month, spins down after 15 mins of inactivity
- **Frontend (Static Site)**: 100 GB bandwidth/month
- **Database (MongoDB Atlas)**: 512 MB storage

### Paid Upgrades (Optional)
- **Render**: $7/month for always-on backend
- **MongoDB Atlas**: $9/month for 2GB storage

---

## 🎉 You're Done!

Your Event Management System is now live!

- **Frontend**: `https://event-management-frontend.onrender.com`
- **Backend API**: `https://event-management-backend.onrender.com`
- **Database**: MongoDB Atlas

### Share your URLs:
- 🌐 Website: [Your Frontend URL]
- 📱 Share with friends and test!

---

## 📝 Next Steps

1. **Custom Domain** (Optional):
   - In Render, go to Settings → Custom Domain
   - Add your domain (e.g., `myevents.com`)
   
2. **SSL Certificate**:
   - Render provides free SSL automatically!
   
3. **Regular Backups**:
   - MongoDB Atlas has automated backups
   
4. **Monitor Performance**:
   - Check Render logs regularly
   - Monitor MongoDB Atlas metrics

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **GitHub Issues**: Open an issue in your repository

Good luck! 🚀
