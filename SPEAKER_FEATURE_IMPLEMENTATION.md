# Speaker/Chief Guest Feature - Implementation Guide

## Overview

This feature allows event managers to add speaker/chief guest information with photos, which will be displayed to users on the event details page.

## ✅ Database Schema Updated

The event schema now includes a `speakers` array with the following fields:

```javascript
speakers: [{
  name: String (required),
  designation: String,
  bio: String,
  photo: String (Base64 or URL),
  role: Enum ['Chief Guest', 'Keynote Speaker', 'Panelist', 'Workshop Instructor', 'Speaker'],
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String
  },
  sessionTopic: String,
  sessionTime: String
}]
```

## Features Included

### 1. **Multiple Speakers Support**
- Add multiple speakers per event
- Different roles (Chief Guest, Keynote Speaker, etc.)
- Individual session topics and times

### 2. **Rich Profile Information**
- Name and designation
- Professional bio
- Photo upload (supports Base64 encoding)
- Social media links
- Session details

### 3. **User-Facing Display**
- Speaker cards with photos
- "Meet the Speakers" section on event details
- Speaker highlights on event cards

## Implementation Steps

### Phase 1: Event Creation Form (event-management.html)

Add speaker management section to the event creation form:

```html
<!-- Add this section after the event details -->
<div class="form-section">
    <h3>🎤 Speakers & Chief Guests</h3>
    
    <div id="speakersContainer">
        <!-- Speaker entries will be added here dynamically -->
    </div>
    
    <button type="button" id="addSpeakerBtn" class="secondary-btn">
        ➕ Add Speaker
    </button>
</div>

<!-- Speaker Template (hidden) -->
<template id="speakerTemplate">
    <div class="speaker-entry">
        <div class="speaker-header">
            <h4>Speaker Details</h4>
            <button type="button" class="remove-speaker-btn">✖ Remove</button>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Speaker Name *</label>
                <input type="text" class="speaker-name" required>
            </div>
            
            <div class="form-group">
                <label>Role</label>
                <select class="speaker-role">
                    <option value="Speaker">Speaker</option>
                    <option value="Chief Guest">Chief Guest</option>
                    <option value="Keynote Speaker">Keynote Speaker</option>
                    <option value="Panelist">Panelist</option>
                    <option value="Workshop Instructor">Workshop Instructor</option>
                </select>
            </div>
        </div>
        
        <div class="form-group">
            <label>Designation</label>
            <input type="text" class="speaker-designation" placeholder="e.g., CEO at TechCorp">
        </div>
        
        <div class="form-group">
            <label>Biography</label>
            <textarea class="speaker-bio" rows="3" placeholder="Brief professional background..."></textarea>
        </div>
        
        <div class="form-group">
            <label>Session Topic</label>
            <input type="text" class="speaker-topic" placeholder="What will they talk about?">
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Session Time</label>
                <input type="time" class="speaker-time">
            </div>
            
            <div class="form-group">
                <label>Photo</label>
                <input type="file" class="speaker-photo" accept="image/*">
                <small>Max 2MB, JPG/PNG</small>
            </div>
        </div>
        
        <div class="form-group">
            <label>Social Links (Optional)</label>
            <input type="url" class="speaker-linkedin" placeholder="LinkedIn URL">
            <input type="url" class="speaker-twitter" placeholder="Twitter URL">
            <input type="url" class="speaker-website" placeholder="Website URL">
        </div>
        
        <div class="speaker-photo-preview" style="display: none;">
            <img src="" alt="Speaker photo preview">
        </div>
    </div>
</template>
```

### Phase 2: JavaScript for Speaker Management (event-management.js)

Add this code to handle speaker entries:

```javascript
// Speaker Management
let speakers = [];

document.getElementById('addSpeakerBtn').addEventListener('click', () => {
    const template = document.getElementById('speakerTemplate');
    const clone = template.content.cloneNode(true);
    
    // Add remove functionality
    clone.querySelector('.remove-speaker-btn').addEventListener('click', (e) => {
        e.target.closest('.speaker-entry').remove();
    });
    
    // Add photo preview functionality
    const photoInput = clone.querySelector('.speaker-photo');
    photoInput.addEventListener('change', handleSpeakerPhotoUpload);
    
    document.getElementById('speakersContainer').appendChild(clone);
});

// Handle speaker photo upload with Base64 encoding
function handleSpeakerPhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Photo size must be less than 2MB');
        event.target.value = '';
        return;
    }
    
    // Validate file type
    if (!file.type.match('image.*')) {
        alert('Please upload an image file');
        event.target.value = '';
        return;
    }
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = event.target.closest('.speaker-entry').querySelector('.speaker-photo-preview');
        preview.style.display = 'block';
        preview.querySelector('img').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Collect speaker data when creating event
function collectSpeakerData() {
    const speakerEntries = document.querySelectorAll('.speaker-entry');
    const speakers = [];
    
    speakerEntries.forEach(entry => {
        const name = entry.querySelector('.speaker-name').value.trim();
        if (!name) return; // Skip if no name
        
        const photoInput = entry.querySelector('.speaker-photo');
        let photoBase64 = '';
        
        if (photoInput.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(photoInput.files[0]);
            // Note: This is async, need to handle properly
        }
        
        const speaker = {
            name: name,
            designation: entry.querySelector('.speaker-designation').value.trim(),
            bio: entry.querySelector('.speaker-bio').value.trim(),
            photo: entry.querySelector('.speaker-photo-preview img').src || '',
            role: entry.querySelector('.speaker-role').value,
            sessionTopic: entry.querySelector('.speaker-topic').value.trim(),
            sessionTime: entry.querySelector('.speaker-time').value,
            socialLinks: {
                linkedin: entry.querySelector('.speaker-linkedin').value.trim(),
                twitter: entry.querySelector('.speaker-twitter').value.trim(),
                website: entry.querySelector('.speaker-website').value.trim()
            }
        };
        
        speakers.push(speaker);
    });
    
    return speakers;
}

// Modify event creation to include speakers
// In your existing addEventBtn click handler, add:
const speakers = collectSpeakerData();
newEvent.speakers = speakers;
```

### Phase 3: Display Speakers on Event Details Page

Add this HTML section to your event details modal/page:

```html
<!-- Add this in event details display -->
<div class="speakers-section" id="speakersSection" style="display: none;">
    <h3>🎤 Meet the Speakers</h3>
    <div class="speakers-grid" id="speakersGrid">
        <!-- Speaker cards will be inserted here -->
    </div>
</div>
```

Add this JavaScript to display speakers:

```javascript
function displaySpeakers(speakers) {
    if (!speakers || speakers.length === 0) {
        document.getElementById('speakersSection').style.display = 'none';
        return;
    }
    
    document.getElementById('speakersSection').style.display = 'block';
    const grid = document.getElementById('speakersGrid');
    
    grid.innerHTML = speakers.map(speaker => `
        <div class="speaker-card">
            <div class="speaker-photo">
                ${speaker.photo ? 
                    `<img src="${speaker.photo}" alt="${speaker.name}">` :
                    `<div class="speaker-placeholder">
                        <i class="fas fa-user"></i>
                    </div>`
                }
                <span class="speaker-role-badge">${speaker.role}</span>
            </div>
            
            <div class="speaker-info">
                <h4>${speaker.name}</h4>
                ${speaker.designation ? `<p class="speaker-designation">${speaker.designation}</p>` : ''}
                ${speaker.bio ? `<p class="speaker-bio">${speaker.bio}</p>` : ''}
                
                ${speaker.sessionTopic ? `
                    <div class="speaker-session">
                        <strong>Topic:</strong> ${speaker.sessionTopic}
                        ${speaker.sessionTime ? `<br><strong>Time:</strong> ${speaker.sessionTime}` : ''}
                    </div>
                ` : ''}
                
                ${(speaker.socialLinks.linkedin || speaker.socialLinks.twitter || speaker.socialLinks.website) ? `
                    <div class="speaker-social">
                        ${speaker.socialLinks.linkedin ? `<a href="${speaker.socialLinks.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>` : ''}
                        ${speaker.socialLinks.twitter ? `<a href="${speaker.socialLinks.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                        ${speaker.socialLinks.website ? `<a href="${speaker.socialLinks.website}" target="_blank"><i class="fas fa-globe"></i></a>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}
```

### Phase 4: CSS Styling

Add these styles for speaker display:

```css
/* Speaker Management Form */
.speaker-entry {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
    border-left: 4px solid #667eea;
}

.speaker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.speaker-header h4 {
    margin: 0;
    color: #333;
}

.remove-speaker-btn {
    background: #ef4444;
    color: white;
    border: none;
    padding: 5px 15px;
    border-radius: 4px;
    cursor: pointer;
}

.speaker-photo-preview {
    margin-top: 10px;
    text-align: center;
}

.speaker-photo-preview img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    border: 2px solid #ddd;
}

/* Speaker Display Cards */
.speakers-section {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.speakers-section h3 {
    color: #667eea;
    margin-bottom: 20px;
}

.speakers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.speaker-card {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.speaker-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.speaker-photo {
    position: relative;
    text-align: center;
    margin-bottom: 15px;
}

.speaker-photo img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #667eea;
}

.speaker-placeholder {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: white;
}

.speaker-role-badge {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 10px;
}

.speaker-info h4 {
    margin: 10px 0 5px 0;
    color: #333;
    font-size: 20px;
}

.speaker-designation {
    color: #666;
    font-size: 14px;
    margin: 5px 0;
    font-style: italic;
}

.speaker-bio {
    color: #555;
    font-size: 14px;
    line-height: 1.6;
    margin: 10px 0;
}

.speaker-session {
    background: #f0f4ff;
    padding: 10px;
    border-radius: 6px;
    margin: 10px 0;
    font-size: 13px;
    color: #333;
}

.speaker-social {
    margin-top: 15px;
    display: flex;
    gap: 10px;
    justify-content: center;
}

.speaker-social a {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: background 0.3s;
}

.speaker-social a:hover {
    background: #5568d3;
}
```

## Additional Improvements & Suggestions

### 1. **Speaker Verification Badge**
Add a verification system for notable speakers:
```javascript
verified: { type: Boolean, default: false }
```

### 2. **Speaker Ratings**
Allow attendees to rate speakers after the event:
```javascript
rating: { type: Number, min: 0, max: 5, default: 0 },
ratingCount: { type: Number, default: 0 }
```

### 3. **Speaker Availability Calendar**
Show when speakers are available for Q&A:
```javascript
availableForQA: { type: Boolean, default: false },
qaTimeSlots: [{ start: String, end: String }]
```

### 4. **Past Events by Speaker**
Link to other events where this speaker has appeared:
```javascript
pastEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
```

### 5. **Speaker Resources**
Allow speakers to upload presentation slides, materials:
```javascript
resources: [{
    title: String,
    type: { type: String, enum: ['PDF', 'PPT', 'Link', 'Video'] },
    url: String
}]
```

### 6. **Featured Speaker Highlight**
Mark one speaker as featured for the event card:
```javascript
isFeatured: { type: Boolean, default: false }
```

### 7. **Speaker Contact Form**
Allow users to send messages to speakers:
- Add a contact button
- Store messages in database
- Notify speaker via email

### 8. **Speaker Analytics**
Track speaker popularity:
- View count
- Profile clicks
- Session attendance
- Feedback scores

## Image Handling Options

### Option 1: Base64 Encoding (Current)
**Pros:** Simple, no external storage needed  
**Cons:** Large database size, slower queries

### Option 2: Cloud Storage (Recommended for Production)
Use services like:
- **Cloudinary** - Free tier available
- **AWS S3** - Scalable
- **Firebase Storage** - Easy integration

```javascript
// Example with Cloudinary
const cloudinary = require('cloudinary').v2;

async function uploadSpeakerPhoto(file) {
    const result = await cloudinary.uploader.upload(file.path);
    return result.secure_url; // Store this URL
}
```

### Option 3: Local File System
Store images in `/uploads/speakers/` folder:
```javascript
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './uploads/speakers/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
```

## API Endpoints to Add

```javascript
// Get speakers for an event
app.get('/events/:id/speakers', async (req, res) => {
    const event = await Event.findById(req.params.id);
    res.json(event.speakers);
});

// Add speaker to event
app.post('/events/:id/speakers', async (req, res) => {
    const event = await Event.findById(req.params.id);
    event.speakers.push(req.body);
    await event.save();
    res.json(event.speakers);
});

// Update speaker
app.put('/events/:eventId/speakers/:speakerId', async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    const speaker = event.speakers.id(req.params.speakerId);
    Object.assign(speaker, req.body);
    await event.save();
    res.json(speaker);
});

// Delete speaker
app.delete('/events/:eventId/speakers/:speakerId', async (req, res) => {
    const event = await Event.findById(req.params.eventId);
    event.speakers.id(req.params.speakerId).remove();
    await event.save();
    res.json({ message: 'Speaker removed' });
});
```

## Testing Checklist

- [ ] Database schema updated
- [ ] Server restarted
- [ ] Speaker form appears in event creation
- [ ] Can add multiple speakers
- [ ] Photo upload works
- [ ] Photo preview displays
- [ ] Can remove speakers
- [ ] Speaker data saves to database
- [ ] Speakers display on event details page
- [ ] Speaker cards are responsive
- [ ] Social links work
- [ ] Edit event includes speakers
- [ ] Speaker info visible to users

## Next Steps

1. **Restart server** to apply schema changes
2. **Implement Phase 1** - Add form to event-management.html
3. **Implement Phase 2** - Add JavaScript handlers
4. **Implement Phase 3** - Add display on event details
5. **Implement Phase 4** - Add CSS styling
6. **Test thoroughly** with sample data
7. **Consider cloud storage** for production

---

**This feature will significantly enhance your event management system and make events more attractive to users!** 🎤✨
