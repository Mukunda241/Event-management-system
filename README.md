# Event Management System# Event-management-system

A web-based event management system where hosts can create categorized events (e.g., concerts, health seminars, education fairs), and users can browse and register for them.

A full-stack event management application with user authentication, event creation, favorites, notifications, and more.

## 🏗️ Project Structure

This project is organized into **separate frontend and backend** folders for proper deployment:

```
Event-Management-System/
├── backend/              # Node.js + Express API Server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   ├── notifications-schema.js
│   ├── notification-service.js
│   ├── utils/            # Utility scripts
│   ├── .env.example      # Environment variables template
│   └── README.md         # Backend documentation
│
├── frontend/             # Static Website (HTML, CSS, JS)
│   ├── css/              # All stylesheets
│   ├── js/               # All JavaScript files
│   │   └── config.js     # API configuration (⚠️ UPDATE THIS!)
│   ├── assets/           # JSON files and other assets
│   ├── *.html            # All HTML pages
│   └── README.md         # Frontend documentation
│
├── DEPLOYMENT_GUIDE.md   # 📖 Complete deployment instructions
└── README.md             # This file
```

## ⚡ Quick Start

### Local Development

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
MONGODB_URI=mongodb://127.0.0.1:27017/event_management
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm start
```
Backend runs on: `http://localhost:5000`

#### 2. Frontend Setup
```bash
cd frontend
```

Update `js/config.js`:
```javascript
LOCAL_API_URL: 'http://localhost:5000'
```

Serve frontend using any method:

**Option 1: Python**
```bash
python -m http.server 3000
```

**Option 2: Node.js**
```bash
npx http-server -p 3000
```

**Option 3: VS Code Live Server**
- Install Live Server extension
- Right-click `home.html` → "Open with Live Server"

Frontend runs on: `http://localhost:3000`

## 🚀 Deployment

### Deploy on Render (Recommended)

We need to deploy **two separate services**:
1. **Backend** → Web Service (Node.js)
2. **Frontend** → Static Site

📖 **Follow the complete step-by-step guide:**
[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Quick Deployment Summary:

1. **Setup MongoDB Atlas** (free cloud database)
2. **Deploy Backend** as Web Service on Render
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add `MONGODB_URI` environment variable
3. **Deploy Frontend** as Static Site on Render
   - Root Directory: `frontend`
   - Update `js/config.js` with backend URL first
4. **Test your live application!**

## ✨ Features

- 👤 **User Authentication** - Register, login, profile management
- 📅 **Event Management** - Create, edit, delete, and browse events
- ⭐ **Favorites System** - Save favorite events
- 🔔 **Notifications** - Real-time notifications
- 🏆 **Leaderboard** - User rankings and points
- 📊 **Admin Dashboard** - Event approval and management
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome Icons
- Responsive Design

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- bcryptjs (password hashing)
- CORS enabled

## 📂 Important Files to Update

Before deployment, make sure to update:

1. **`frontend/js/config.js`**
   - Update `PRODUCTION_API_URL` with your backend URL

2. **`backend/.env`** (create from `.env.example`)
   - Set `MONGODB_URI` to your MongoDB Atlas connection string
   - Set `FRONTEND_URL` to your frontend URL

## ⚠️ Common Issues

### "Network error or server not responding"
- ✅ Make sure backend is deployed as **Web Service** (not Static Site)
- ✅ Update `frontend/js/config.js` with correct backend URL
- ✅ Check CORS configuration in `backend/server.js`

### Backend not connecting to database
- ✅ Verify MongoDB Atlas connection string
- ✅ Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)
- ✅ Ensure database user has read/write permissions

### CSS/JS not loading
- ✅ Check file paths in HTML files
- ✅ Ensure files are in correct directories (css/, js/, assets/)

## 📖 Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Need Help?

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions
- Review backend and frontend README files
- Check the browser console for errors (F12)
- Review Render logs for backend issues

---

Made with ❤️ for event management
