# Nearby Hotels Feature - Setup Guide

## 🎯 Overview
The Nearby Hotels feature displays hotels near event venues using Google Maps API. It shows hotels in both list and map views with ratings, distances, and amenities.

## 🔑 Google Maps API Setup

### Step 1: Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
4. Create credentials → API Key
5. Copy your API key

### Step 2: Configure API Key
In `frontend/event-template.html`, replace `YOUR_API_KEY` with your actual key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places&callback=initMap" async defer></script>
```

### Step 3: Restrict API Key (Recommended)
1. In Google Cloud Console, click on your API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain: `localhost:3000/*` (for development)
4. Add production domain when deployed

## 💰 Pricing
- **Free Tier**: $200 credit/month
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Estimate**: ~28,000 page loads free per month

## 🎨 Features Implemented

### List View
- ✅ Hotel cards with images
- ✅ Ratings with stars
- ✅ Distance from venue
- ✅ Price indicators
- ✅ Amenities badges
- ✅ "View Details" button (opens Google Maps)

### Map View
- ✅ Interactive Google Map
- ✅ Event venue marker (purple)
- ✅ Hotel markers (red)
- ✅ Click markers for info windows
- ✅ Get directions link

### Responsive Design
- ✅ Grid layout for desktop
- ✅ Single column for mobile
- ✅ Toggle buttons for view switching

## 📝 Adding Coordinates to Events

### Method 1: Manually in Database
Update your MongoDB events with latitude and longitude:

```javascript
{
  name: "Tech Conference 2025",
  venue: "Hyderabad Convention Center",
  lat: 17.3850,
  lng: 78.4867,
  // ... other fields
}
```

### Method 2: Via Event Creation Form
Add lat/lng fields when creating events in the organizer dashboard.

### Method 3: Geocoding Service
Use Google Geocoding API to convert addresses to coordinates automatically.

## 🔧 Alternative: Free OpenStreetMap

If you want a free alternative without API keys:

### Using Leaflet.js + OpenStreetMap
1. Replace Google Maps script with:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

2. Modify `nearby-hotels.js` to use Leaflet API
3. Use Overpass API for hotel data (free but limited)

**Pros**: Free, no API key needed
**Cons**: Less hotel data, no booking integration

## 🎯 Testing

### Test with Sample Event
1. Create event with coordinates:
   ```
   Venue: "Taj Krishna Hotel, Hyderabad"
   Latitude: 17.4239
   Longitude: 78.4738
   ```

2. Open event details page
3. Scroll down to see "Nearby Hotels" section
4. Toggle between List and Map views

### Expected Results
- Shows 10-12 hotels within 5km radius
- Hotels sorted by distance
- Map shows all hotels with markers
- Click hotel cards to open in Google Maps

## 🐛 Troubleshooting

### "Hotels Map Unavailable" Message
**Cause**: API key not configured
**Fix**: Add your Google Maps API key in event-template.html

### No Hotels Showing
**Cause**: Event doesn't have lat/lng coordinates
**Fix**: Add coordinates to event in database

### Map Not Loading
**Cause**: 
- API key restrictions
- APIs not enabled in Google Cloud
**Fix**: Check API key restrictions and enable required APIs

### Console Errors
- `Google is not defined`: API script not loaded, check API key
- `REQUEST_DENIED`: Enable Places API in Google Cloud Console
- `OVER_QUERY_LIMIT`: Free tier exceeded, add billing

## 📊 Database Schema Update

Your event schema already supports lat/lng fields:

```javascript
const eventSchema = new mongoose.Schema({
  name: String,
  venue: String,
  lat: Number,  // Already exists
  lng: Number,  // Already exists
  // ... other fields
});
```

## 🚀 Future Enhancements

1. **Direct Booking Integration**
   - Partner with Booking.com/Agoda
   - Show real prices and availability
   - Earn commission on bookings

2. **Hotel Filters**
   - Filter by price range
   - Filter by rating
   - Filter by amenities

3. **Sort Options**
   - Sort by distance
   - Sort by price
   - Sort by rating

4. **Hotel Recommendations**
   - AI-powered suggestions
   - Based on event type
   - User preferences

5. **Special Deals**
   - Event attendee discounts
   - Group booking rates
   - Early bird specials

## 📖 API Documentation

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Places API](https://developers.google.com/maps/documentation/places/web-service)
- [Geocoding API](https://developers.google.com/maps/documentation/geocoding)

## ✅ Checklist

- [ ] Get Google Maps API key
- [ ] Enable Maps JavaScript API
- [ ] Enable Places API  
- [ ] Add API key to event-template.html
- [ ] Add lat/lng to events in database
- [ ] Test with sample event
- [ ] Set API key restrictions
- [ ] Monitor API usage

## 💡 Tips

1. **Cache Results**: Store hotel data to reduce API calls
2. **Lazy Load**: Load hotels only when user scrolls to section
3. **Batch Requests**: Request multiple hotels at once
4. **Error Handling**: Always show fallback content
5. **Mobile First**: Optimize for mobile users

---

**Need Help?** Check the console logs for detailed debugging information.
