// API Configuration
// Update this with your backend URL after deployment

const API_CONFIG = {
    // For local development
    LOCAL_API_URL: 'http://localhost:5000',
    
    // For production (update this after deploying backend to Render)
    PRODUCTION_API_URL: 'https://your-backend-app.onrender.com',
    
    // Automatically use production URL if not running locally
    get BASE_URL() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? this.LOCAL_API_URL
            : this.PRODUCTION_API_URL;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
