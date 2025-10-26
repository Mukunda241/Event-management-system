# MANUAL FIX INSTRUCTIONS - Copy these code blocks

## FILE 1: event-template.js
### Find line ~300: "// Cancel tickets/booking"
### Replace the ENTIRE cancelTicketsBtn.addEventListener block with:

```javascript
// Cancel tickets/booking
cancelTicketsBtn.addEventListener("click", async () => {
    if (isPastEvent) {
        showToast("Cannot cancel booking for past events", "error");
        return;
    }
    
    // Use custom modal instead of browser confirm
    showCancelConfirmation(event.name, async () => {
        // Get current user
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const username = loggedInUser ? loggedInUser.username : null;
        
        if (!username) {
            showToast("Please login to cancel booking", "error");
            return;
        }
        
        console.log("Cancelling booking for:", event.name, "User:", username);
        
        try {
            // Cancel ticket in database
            const response = await fetch(`http://localhost:5000/tickets/${event._id}/${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to cancel ticket");
            }
            
            const result = await response.json();
            console.log("Ticket cancelled successfully:", result);
            
            // Show success with points info
            showToast(`${result.message} | -50 points deducted`, "success");
            
            // Show points deduction notification if available
            if (typeof showPointsNotification === 'function') {
                showPointsNotification(-50, 'Ticket cancelled');
            }
            
            updateRegistrationUI();
            updateAttendeeCount(event);
            
            // Reload user points if function exists
            if (typeof loadUserPoints === 'function') {
                await loadUserPoints();
            }
            
            // Reload page to refresh data
            setTimeout(() => location.reload(), 1500);
        } catch (error) {
            console.error("Error cancelling ticket:", error);
            showToast(error.message || "Failed to cancel booking. Please try again.", "error");
        }
    });
});
```

## FILE 2: my-tickets.js  
### Already fixed! ✓

## FILE 3: Remove ALL emojis from showToast calls

### In event-template.js - Replace these showToast lines:

Line 64:  showToast("No event specified!", "error");
Line 86:  showToast("Event not found!", "error");
Line 107: showToast("Error loading event details", "error");
Line 285: showToast("This event has already ended. Tickets are no longer available.", "error");
Line 289: showToast("This event has been cancelled. Tickets are not available.", "error");
Line 293: showToast("Tickets are not available for this event", "error");
Line 382: showToast("You already have tickets for this event!", "error");
Line 519: showToast("Payment successful! Tickets confirmed!", "success");
Line 523: showToast(`${ticketQuantity} ticket(s) confirmed successfully!`, "success");
Line 557: showToast("Added to favorites!", "success");
Line 626: showToast("Failed to share", "error");
Line 938: showToast('Failed to copy link');

### In event-management.js - Replace these showToast lines:

Line 202: showToast("Please fill in all fields.", "error");
Line 207: showToast("Please enter a valid ticket price for paid events.", "error");
Line 259: showToast("Failed to create event. Please try again.", "error");
Line 263: showToast("Error creating event. Please try again.", "error");

### In script.js - Replace:

Line 351: showToast(`${eventToFavorite.name} added to favorites!`);

---

## QUICK METHOD: Use Find & Replace in VS Code

Press Ctrl+H in VS Code and replace these strings across all files:

Find: "❌ 
Replace: "

Find: "✓ 
Replace: "

Find: "🎉 
Replace: "

Find: "❤️ 
Replace: "

Find: "📥 
Replace: "

Find: console.log("🗑️ 
Replace: console.log("

Find: console.log("✅ 
Replace: console.log("

---

## TEST YOUR CHANGES

1. Open event-template.html in browser
2. Click on any event
3. Try to cancel a booking
4. You should see the CUSTOM MODAL (not browser confirm)
5. Modal should have SVG icons (not emojis)
6. Success/error messages should not have emojis
