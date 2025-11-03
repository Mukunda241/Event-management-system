# Event Management System - Frontend

This is the frontend application for the Event Management System.

## Setup Instructions

### 1. Configure API Endpoint
Before deploying, update the `js/config.js` file:
- Replace `PRODUCTION_API_URL` with your backend URL from Render

### 2. Local Development
You can use any static file server:

**Option 1: Using Python**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option 2: Using Node.js (http-server)**
```bash
npx http-server -p 3000
```

**Option 3: Using VS Code Live Server Extension**
- Install Live Server extension
- Right-click on `home.html` or `index.html`
- Select "Open with Live Server"

## Deployment on Render

### Deploy as Static Site

1. **Create a New Static Site** on Render
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Root Directory:** `frontend`
   - **Build Command:** (leave empty)
   - **Publish Directory:** `.` (current directory)

4. **Deploy!**

5. **After deployment:**
   - Copy your frontend URL
   - Update the backend's `FRONTEND_URL` environment variable
   - Update `js/config.js` with your backend URL

## Project Structure

```
frontend/
├── css/              # All stylesheets
├── js/               # All JavaScript files
│   ├── config.js     # API configuration (UPDATE THIS!)
│   └── ...           # Other JS files
├── assets/           # JSON data files and other assets
├── home.html         # Main homepage
├── index.html        # Alternative entry point
└── ...               # Other HTML pages
```

## Important: Update API URLs

After deploying both frontend and backend:

1. **In frontend `js/config.js`:**
   ```javascript
   PRODUCTION_API_URL: 'https://your-backend-app.onrender.com'
   ```

2. **In all JavaScript files:**
   - Replace any hardcoded `http://localhost:5000` URLs
   - Use `API_CONFIG.BASE_URL` instead

## Features

- User authentication (register, login)
- Event browsing and management
- Calendar view
- Favorites system
- Notifications
- Leaderboard
- Admin dashboard
- Dark mode
- And more...
