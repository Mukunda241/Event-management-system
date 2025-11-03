# Debug Guide: Events Not Showing in My Events Page

## Issue
Events created by organizers are not visible on the "My Events" page, even when they have Draft status.

## Debug Steps Added

I've added comprehensive debug logging to help identify the exact issue. Follow these steps:

### Step 1: Open Browser Console
1. Open your browser (Chrome/Edge/Firefox)
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab

### Step 2: Create a New Event
1. Log in as an event organizer/manager
2. Go to the Event Management page
3. Create a new event (with any status - Draft or Active)
4. Check the console for these debug messages:

```
📤 Sending event to server: {object with event data}
🔍 DEBUG: Organizer being saved: [username]
🔍 DEBUG: Event status being saved: [status]
✅ DEBUG: Event created successfully, server response: {response}
```

**Important**: Note down the exact **organizer username** that's being saved.

### Step 3: Check My Events Page
1. Navigate to the "My Events" page
2. Check the console for these debug messages:

```
🔍 DEBUG: Current user from localStorage: {user object}
🔍 DEBUG: Total events fetched: [number]
🔍 DEBUG: All events: [array of events with name, organizer, status]
🔍 DEBUG: Looking for events by organizer: [username]
🔍 DEBUG: My events found: [number]
🔍 DEBUG: My events details: [array of your events]
```

## Common Issues to Check

### Issue 1: Username Mismatch
**Symptom**: "My events found: 0" but you see your events in "All events"

**Cause**: The organizer name saved when creating the event doesn't match the current user's username.

**Check**:
- Compare the organizer name in "All events" with "Looking for events by organizer"
- They must match **exactly** (case-sensitive)

**Solution**: 
- Check if there are extra spaces, different capitalization, or typos
- The username should be consistent

### Issue 2: Events Not Being Saved
**Symptom**: "Total events fetched: 0" or your event is missing from "All events"

**Cause**: Event creation failed or wasn't saved to database

**Check**:
- Look for error messages in the console during event creation
- Check if the server is running (`node server.js`)
- Verify MongoDB is running

**Solution**:
- Restart the server
- Check server logs for errors
- Verify database connection

### Issue 3: localStorage Issue
**Symptom**: "Current user from localStorage: null" or undefined

**Cause**: User session not properly stored during login

**Solution**:
1. Log out completely
2. Clear browser cache and localStorage:
   - Press `F12` → Console tab
   - Type: `localStorage.clear()`
   - Press Enter
3. Log in again

### Issue 4: API Response Format Issue
**Symptom**: "All events" shows empty array but database has events

**Cause**: API response format mismatch

**Check**: Look at the raw response in console

**Solution**: The code handles both formats, but verify the response structure

## Manual Database Check

If events are still not showing, check the database directly:

### Option 1: Using MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. Open database: `event_management`
4. Open collection: `events`
5. Look for your events and check:
   - `organizer` field value
   - `status` field value
   - Compare with your username

### Option 2: Using MongoDB Shell
```bash
mongosh
use event_management
db.events.find({}, { name: 1, organizer: 1, status: 1 })
```

This will show all events with their name, organizer, and status.

## Expected Behavior

**My Events page should show**:
- ✅ ALL events created by the logged-in organizer
- ✅ Events with ANY status (Draft, Active, Closed, Completed, Cancelled)
- ✅ Events regardless of date (past, present, future)

**The filtering is ONLY by organizer username**, nothing else.

## Quick Test

To quickly test if the issue is with filtering or data:

1. Open Browser Console on My Events page
2. Type this command:
```javascript
fetch('http://localhost:5000/events')
  .then(r => r.json())
  .then(data => {
    const events = Array.isArray(data) ? data : data.events;
    console.table(events.map(e => ({
      name: e.name,
      organizer: e.organizer,
      status: e.status,
      date: e.date
    })));
  });
```

This will show you a nice table of ALL events in the database with their organizer names.

## Next Steps

After running the debug steps above, you'll see one of these scenarios:

### Scenario A: Events Found (My events found: X where X > 0)
- **Problem**: Events exist but aren't displaying properly
- **Check**: HTML rendering issue, check browser console for errors

### Scenario B: No Events Found (My events found: 0)
- **Sub-case 1**: Total events is 0
  - Events aren't being saved to database
  - Check server logs and database connection
  
- **Sub-case 2**: Total events > 0 but your events not in list
  - Username mismatch issue
  - Check organizer field in "All events" output
  - Compare with "Looking for events by organizer" output

### Scenario C: Console shows errors
- **Check**: Network errors, API errors, or JavaScript errors
- **Fix**: Address the specific error shown

## Files Modified for Debugging

1. ✅ `my-events.js` - Added debug logging for event fetching and filtering
2. ✅ `event-management.js` - Added debug logging for event creation

## After Debugging

Once you identify the issue, let me know what you see in the console and I'll provide the specific fix needed.

---

**Pro Tip**: Keep the console open while navigating between pages to catch any errors or warnings that might give clues about the issue.
