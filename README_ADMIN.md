# 🎯 Event Management System - Admin Approval

A complete event management system with admin approval for organizers.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **ADMIN_GUIDE.md** | Complete admin system guide with all features |
| **QUICK_ACCESS.md** | Quick reference for URLs and common tasks |
| **ADMIN_SETUP.md** | Technical setup and implementation details |
| **README_ADMIN.md** | This file - Overview and quick start |

---

## ⚡ Quick Start

### 1. Start the Server
```bash
node server.js
```

### 2. Create Admin Account (First Time Only)
```bash
node create-admin-real-db.js
```

### 3. Access Admin Panel
```
URL: http://localhost:5000/admin-login.html
Username: admin
Password: admin123
```

---

## 🔗 Essential URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Admin Dashboard** | `http://localhost:5000/admin-dashboard.html` | Full admin interface |
| **Quick Approve** | `http://localhost:5000/quick-approve.html` | Fast approvals (no login) |
| **Admin Login** | `http://localhost:5000/admin-login.html` | Admin authentication |
| **Admin Tools** | `http://localhost:5000/admin-tools.html` | Navigation hub |
| **Register** | `http://localhost:5000/register.html` | User registration |
| **Login** | `http://localhost:5000/login.html` | User login |

---

## 🎯 How It Works

### Registration Flow

```
User selects "Event Organizer" role
         ↓
Account created with status "pending"
         ↓
User tries to login
         ↓
Blocked with "Pending Approval" message
         ↓
Admin approves from dashboard
         ↓
User can login and create events ✅
```

---

## 👥 User Roles

### 1. **User** (Auto-Approved)
- Can view events
- Can register for events
- Cannot create events
- No approval needed

### 2. **Manager / Event Organizer** (Requires Approval)
- Can create events (after approval)
- Can edit their events
- Can delete their events
- **Must be approved by admin**

### 3. **Admin** (Super User)
- Can approve/reject organizers
- Can view all accounts
- Can access admin dashboard
- Full system access

---

## 🔐 Admin Credentials

```
Username: admin
Password: admin123
Database: event_management (with underscore!)
```

⚠️ **Change the password after first login!**

---

## 🛠️ Useful Scripts

### Database Management
```bash
# Check users in CORRECT database (event_management)
node check-real-database.js

# Create admin in CORRECT database
node create-admin-real-db.js

# Find all admin accounts
node find-all-admins.js
```

### Approval Management
```bash
# Approve all pending organizers at once
node approve-all.js
```

### Legacy Scripts (Wrong Database!)
```bash
# These connect to "eventmanagement" (NO underscore) - WRONG!
node check-users.js
node create-admin.js
node complete-reset.js
```

---

## 🔧 Troubleshooting

### Problem: Admin login redirects to wrong page

**Solution:**
```bash
# 1. Stop server
taskkill /F /IM node.exe

# 2. Recreate admin in CORRECT database
node create-admin-real-db.js

# 3. Restart server
node server.js

# 4. Clear browser cache (Ctrl + Shift + Delete)
# 5. Login in incognito mode
```

---

### Problem: No pending organizers showing

**Solutions:**
1. Make sure server is running
2. Have someone register as "Event Organizer"
3. Refresh the admin dashboard
4. Check browser console for errors (F12)

---

### Problem: Database connection error

**Check:**
```javascript
// server.js line 368 should be:
mongoose.connect("mongodb://127.0.0.1:27017/event_management")
// Notice the UNDERSCORE in event_management!
```

---

## 📊 Admin Dashboard Features

### Statistics Cards
- 👥 Total Organizers
- ⏳ Pending Approvals
- ✅ Approved Count
- ❌ Rejected Count

### Organizer Table
- View all organizers
- Filter by status (All/Pending/Approved/Rejected)
- Approve/Reject buttons
- User details (name, email, status)

### Quick Actions
- ✅ **Approve** - Grant organizer access
- ❌ **Reject** - Deny organizer request
- Auto-refresh after action

---

## 🚀 Deployment Checklist

Before going live:

- [ ] MongoDB is running
- [ ] Server starts without errors
- [ ] Admin account created and tested
- [ ] Can register as organizer
- [ ] Pending message shows correctly
- [ ] Admin can approve/reject
- [ ] Approved organizer can login
- [ ] Approved organizer can create events
- [ ] Changed default admin password
- [ ] Backed up database

---

## 📝 Project Structure

### Key Files

#### Backend
- `server.js` - Main server with approval logic
- `package.json` - Dependencies

#### Admin Pages
- `admin-dashboard.html` - Main admin interface
- `admin-dashboard.js` - Dashboard logic
- `admin-login.html` - Admin authentication
- `quick-approve.html` - Fast approval tool
- `admin-tools.html` - Navigation hub

#### User Pages
- `register.html` / `register.js` - User registration
- `login.html` / `login.js` - User login
- `event-management.html` - Organizer dashboard

#### Scripts
- `create-admin-real-db.js` - Create admin (CORRECT DB)
- `check-real-database.js` - Check users (CORRECT DB)
- `find-all-admins.js` - Find admin accounts
- `approve-all.js` - Bulk approve organizers

#### Documentation
- `ADMIN_GUIDE.md` - Complete guide
- `QUICK_ACCESS.md` - Quick reference
- `ADMIN_SETUP.md` - Technical setup
- `README_ADMIN.md` - This file

---

## 🎓 Getting Help

### Read the Guides
1. **ADMIN_GUIDE.md** - Detailed features and workflows
2. **QUICK_ACCESS.md** - Quick reference for common tasks
3. **ADMIN_SETUP.md** - Technical implementation details

### Check Server Logs
```bash
# Server logs show:
# - Login attempts
# - Approval actions
# - Database connections
# - Errors
```

### Browser Console
```
Press F12 to open DevTools
Check Console tab for errors
Check Network tab for failed requests
```

---

## 💡 Pro Tips

### 1. Bookmark Admin Tools Hub
Set `http://localhost:5000/admin-tools.html` as your homepage for quick access.

### 2. Use Quick Approve for Speed
For fast approvals without login, use `quick-approve.html`.

### 3. Monitor Pending Count
Check dashboard regularly so organizers don't wait too long.

### 4. Keep Server Running
For production, use PM2:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
```

### 5. Regular Database Backups
```bash
mongodump --db event_management --out ./backup
```

---

## 🔒 Security Notes

### Important Security Practices

1. **Change Default Password**
   - Default is `admin123`
   - Change it immediately after first login

2. **Database Name Matters**
   - Correct: `event_management` (with underscore)
   - Scripts for correct DB have `-real-db` in filename

3. **Access Control**
   - Keep admin credentials secure
   - Don't share admin account
   - Consider adding IP restrictions

4. **Validate Organizers**
   - Check email addresses before approving
   - Reject suspicious accounts
   - Monitor approved organizers' activities

---

## 🎉 Success!

Your admin approval system is fully operational!

**What You Can Do Now:**
- ✅ Approve/reject organizer accounts
- ✅ View system statistics
- ✅ Manage all organizers from dashboard
- ✅ Use quick approve for fast actions
- ✅ Control who can create events

**Key Achievement:**
✨ Only approved organizers can create events - no more spam! ✨

---

## 📞 System Status

**Current Status:** ✅ Fully Operational

**Admin Account:** ✅ Created  
**Database:** ✅ event_management  
**Server:** ✅ Running on port 5000  
**Approval System:** ✅ Active  

---

**Happy Managing! 🚀**

---

*Event Management System with Admin Approval*  
*Version 1.0*  
*Last Updated: October 18, 2025*
