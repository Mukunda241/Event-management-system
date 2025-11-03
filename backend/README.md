# Event Management System - Backend

This is the backend server for the Event Management System.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with the following:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
FRONTEND_URL=your_frontend_url
```

### 3. Run the Server Locally
```bash
npm start
```

The server will run on `http://localhost:5000`

## Deployment on Render

### Deploy as Web Service (NOT Static Site)

1. **Create a New Web Service** on Render (not Static Site)
2. **Connect your GitHub repository**
3. **Configure the service:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

4. **Add Environment Variables:**
   - `MONGODB_URI` - Your MongoDB connection string (use MongoDB Atlas for cloud database)
   - `PORT` - Will be automatically set by Render
   - `FRONTEND_URL` - Your frontend URL (add after deploying frontend)

5. **Deploy!**

## API Endpoints

The backend provides REST API endpoints for:
- User authentication (register, login)
- Event management (CRUD operations)
- Notifications
- Favorites
- Leaderboard
- And more...

## Database

Uses MongoDB for data storage. Make sure to:
- Create a MongoDB Atlas account (free tier available)
- Get your connection string
- Add it to environment variables
