// 🔄 Auto-update event status based on date
async function autoUpdateEventStatuses() {
  console.log("🔄 Running auto-update for event statuses...");
  
  const API_URL = "http://localhost:5000/events";
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return;
    
    const responseData = await response.json();
    // Handle both old format (array) and new format (object with events array)
    const events = Array.isArray(responseData) ? responseData : responseData.events;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updatedCount = 0;
    
    for (const event of events) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      // Auto-update to 'Completed' if date has passed and status is 'Active'
      if (eventDate < today && event.status === 'Active') {
        try {
          const updateResponse = await fetch(`${API_URL}/${event._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...event, status: 'Completed' })
          });
          
          if (updateResponse.ok) {
            updatedCount++;
            console.log(`✅ Updated "${event.name}" to Completed`);
          }
        } catch (error) {
          console.error(`❌ Failed to update event ${event.name}:`, error);
        }
      }
    }
    
    if (updatedCount > 0) {
      console.log(`✅ Auto-updated ${updatedCount} event(s) to Completed status`);
      return true; // Indicates updates were made
    }
    return false;
  } catch (error) {
    console.error(" Auto-update failed:", error);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🛠️ Event Management Page Loaded!");
  
  // Run auto-update on page load
  const hasUpdates = await autoUpdateEventStatuses();
  
  // Set up periodic auto-update every 5 minutes
  setInterval(async () => {
    await autoUpdateEventStatuses();
  }, 5 * 60 * 1000); // 5 minutes

  const loggedInOrganizer = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInOrganizer || loggedInOrganizer.role !== "manager") {
    showToast("🚫 Access Denied: Only event organizers can access this page.", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  // Display organizer name in header
  const organizerNameEl = document.getElementById("organizerName");
  if (organizerNameEl && loggedInOrganizer.username) {
    organizerNameEl.textContent = loggedInOrganizer.username;
  }

  // Logout functionality - support both button IDs
  const logoutBtn = document.getElementById("logout-btn") || document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("🔴 Logging out...");
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }

  // Toggle ticket price field based on event type
  const eventTypeFree = document.getElementById("eventTypeFree");
  const eventTypePaid = document.getElementById("eventTypePaid");
  const ticketPriceField = document.getElementById("ticketPriceField");
  const ticketPriceInput = document.getElementById("ticketPrice");

  eventTypeFree.addEventListener("change", () => {
    ticketPriceField.style.display = "none";
    ticketPriceInput.value = "0";
    ticketPriceInput.removeAttribute("required");
  });

  eventTypePaid.addEventListener("change", () => {
    ticketPriceField.style.display = "block";
    ticketPriceInput.setAttribute("required", "required");
  });

  // Initialize Location Picker Map
  let locationPickerMap = null;
  let locationMarker = null;
  let selectedLat = null;
  let selectedLng = null;

  function initLocationPicker() {
    // Default center (Hyderabad, India - you can change this to any default location)
    const defaultLat = 17.5403;
    const defaultLng = 78.3844;
    
    locationPickerMap = L.map('locationPickerMap').setView([defaultLat, defaultLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(locationPickerMap);

    // Add click handler to map
    locationPickerMap.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Update selected coordinates
      selectedLat = lat;
      selectedLng = lng;
      
      // Update hidden inputs
      document.getElementById('eventLat').value = lat;
      document.getElementById('eventLng').value = lng;
      
      // Update display
      document.getElementById('coordinatesDisplay').textContent = 
        `📌 Selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      document.getElementById('clearLocationBtn').style.display = 'inline-block';
      
      // Remove old marker if exists
      if (locationMarker) {
        locationPickerMap.removeLayer(locationMarker);
      }
      
      // Add new marker
      locationMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(locationPickerMap);
      
      locationMarker.bindPopup('<b>Event Location</b><br>Click anywhere to change').openPopup();
    });

    // Clear location button
    document.getElementById('clearLocationBtn').addEventListener('click', function() {
      if (locationMarker) {
        locationPickerMap.removeLayer(locationMarker);
        locationMarker = null;
      }
      selectedLat = null;
      selectedLng = null;
      document.getElementById('eventLat').value = '';
      document.getElementById('eventLng').value = '';
      document.getElementById('coordinatesDisplay').textContent = '📌 No location selected yet';
      this.style.display = 'none';
    });
  }

  // Initialize the map
  initLocationPicker();

  const API_URL = "/events";

  // Event creation handler (SINGLE LISTENER - should only trigger once)
  document.getElementById("addEventBtn").addEventListener("click", async () => {
    const addEventBtn = document.getElementById('addEventBtn');
    
    // Normal create flow
    const name = document.getElementById("eventName").value.trim();
    const categorySelect = document.getElementById("eventCategory").value;
    const customCategory = document.getElementById("customCategory").value.trim();
    const category = categorySelect === 'Other' ? customCategory : categorySelect;
    const date = document.getElementById("eventDate").value.trim();
    const time = document.getElementById("eventTime").value.trim();
    const venue = document.getElementById("eventVenue").value.trim();
    const description = document.getElementById("eventDescription").value.trim();
    const capacity = parseInt(document.getElementById("eventCapacity").value) || 100;
    const status = document.getElementById("eventStatus").value || 'Draft';
    const lat = parseFloat(document.getElementById("eventLat").value);
    const lng = parseFloat(document.getElementById("eventLng").value);
    
    // Get ticket pricing info
    const isPaid = document.getElementById("eventTypePaid").checked;
    const ticketPrice = isPaid ? parseFloat(document.getElementById("ticketPrice").value) || 0 : 0;

    console.log("📍 Location values:", { lat, lng, isValidLat: !isNaN(lat), isValidLng: !isNaN(lng) });
    console.log("🎫 Ticket info:", { isPaid, ticketPrice });

    if (!name || !category || !date || !time || !venue || !description || !capacity) {
      showToast(" Please fill in all fields.", "error");
      return;
    }
    
    if (isPaid && (!ticketPrice || ticketPrice <= 0)) {
      showToast(" Please enter a valid ticket price for paid events.", "error");
      return;
    }

    const newEvent = {
      name, 
      category,
      date, 
      time,
      venue, 
      description,
      capacity,
      status,
      organizer: loggedInOrganizer.username,
      isPaid,
      ticketPrice,
      currency: 'INR'
    };

    // Add coordinates if they were selected
    if (!isNaN(lat) && !isNaN(lng)) {
      newEvent.lat = lat;
      newEvent.lng = lng;
      console.log(" Coordinates added to event:", { lat, lng });
    } else {
      console.warn("⚠️ No valid coordinates selected - event will not show on map");
    }

    console.log("📤 Sending event to server:", newEvent);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        showToast(" Event created successfully!", "success");
        
        // Clear form
        document.getElementById("eventName").value = "";
        document.getElementById("eventCategory").value = "";
        document.getElementById("customCategory").value = "";
        document.getElementById("customCategoryGroup").style.display = "none";
        document.getElementById("eventDate").value = "";
        document.getElementById("eventTime").value = "";
        document.getElementById("eventVenue").value = "";
        document.getElementById("eventDescription").value = "";
        document.getElementById("eventCapacity").value = "";
        document.getElementById("eventStatus").value = "Draft";
      } else {
        showToast(" Failed to create event. Please try again.", "error");
      }
    } catch (error) {
      console.error(" Error adding event:", error);
      showToast(" Error creating event. Please try again.", "error");
    }
  });

  // Toast Notification Function
  function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.textContent = message;
    
    let bgColor = 'linear-gradient(135deg, #667eea, #764ba2)';
    if (type === 'success') bgColor = 'linear-gradient(135deg, #10b981, #059669)';
    if (type === 'error') bgColor = 'linear-gradient(135deg, #ef4444, #dc2626)';
    
    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${bgColor};
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideInUp 0.3s ease-out;
      font-weight: 600;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
});
