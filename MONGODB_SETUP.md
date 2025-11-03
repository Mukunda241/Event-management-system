# 🗄️ MongoDB Setup for Render Deployment

## ⚠️ Critical Issue

Your backend is trying to connect to MongoDB, but on Render, **you can't use localhost MongoDB**.

You need to use a **cloud MongoDB service** like MongoDB Atlas (it's FREE).

---

## 🚀 Quick Setup: MongoDB Atlas (FREE)

### Step 1: Create MongoDB Atlas Account

1. Go to: [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free (no credit card required)
3. Choose the **FREE tier** (M0 Sandbox)

### Step 2: Create a Cluster

1. After signup, click **"Build a Database"**
2. Choose **FREE** tier (M0)
3. Select a cloud provider (AWS recommended)
4. Choose a region **close to your Render deployment** (e.g., US East if your Render is in Oregon)
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User

1. In MongoDB Atlas, go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `eventadmin` (or any name you want)
5. Password: Generate a secure password (SAVE THIS!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Whitelist IP Addresses

1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Render to connect
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://eventadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Replace `<password>` with your actual password**
6. Add database name at the end:
   ```
   mongodb+srv://eventadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/event_management?retryWrites=true&w=majority
   ```

### Step 6: Add to Render Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click your **backend service**: `event-management-system-6lyo`
3. Click **"Environment"** tab
4. Add this variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your full connection string from Step 5
5. Click **"Save Changes"**

Your backend will automatically redeploy with the new database connection!

---

## 🎉 That's It!

Once deployed, your app will connect to MongoDB Atlas (cloud database) instead of localhost.

---

## 🔍 Verify Connection

After deployment:
1. Go to Render → Backend Service → **Logs** tab
2. Look for: `✅ MongoDB connected successfully!`
3. If you see this, you're good! ✅

---

## 🆘 Troubleshooting

### Error: "MongooseServerSelectionError"
- ❌ Connection string is wrong
- ❌ IP not whitelisted (add 0.0.0.0/0)
- ❌ Wrong username/password

### Error: "Authentication failed"
- ❌ Wrong password in connection string
- ❌ User doesn't have correct permissions

### MongoDB Atlas Tips
- ✅ FREE tier: 512 MB storage (enough for small apps)
- ✅ Automatic backups
- ✅ Can upgrade later if needed
- ✅ Multiple region replicas for reliability

---

## 📝 Quick Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created FREE cluster
- [ ] Created database user with password
- [ ] Whitelisted 0.0.0.0/0 (all IPs)
- [ ] Got connection string
- [ ] Replaced `<password>` with actual password
- [ ] Added `/event_management` database name
- [ ] Added to Render environment variables
- [ ] Waited for backend to redeploy
- [ ] Checked logs for "MongoDB connected successfully"

---

## 🔗 Useful Links

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB Connection String Format](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

Need help? Let me know at which step you're stuck!
