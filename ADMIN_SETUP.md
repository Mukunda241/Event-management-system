# Admin Approval System - Setup Guide

## Overview

The Event Management System now includes an **Admin Approval System** to prevent unauthorized users from creating organizer accounts. This ensures quality control and proper oversight of who can create events on the platform.

## How It Works

### User Roles
1. **Regular Users** - Auto-approved, can browse and register for events
2. **Event Organizers (Managers)** - Require admin approval before they can create events
3. **Administrators** - Can approve/reject organizer applications

### Account Status Flow
```
Manager Registration → Status: "pending" → Admin Reviews → Status: "approved" or "rejected"
```

## Setup Instructions

### Step 1: Create Admin Account

Before anyone can become an organizer, you need to create the first admin account.

**Option A: Using the Script (Recommended)**
```bash
node create-admin.js
```

This will create an admin account with:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@eventmanager.com`

⚠️ **IMPORTANT**: Change the password after first login!

**Option B: Modify an Existing User**

If you already have a user account, you can promote it to admin using MongoDB:

```bash
# Open MongoDB shell
mongosh

# Switch to your database
use eventmanagement

# Update the user
db.users.updateOne(
  { username: "your_username" },
  { 
    $set: { 
      role: "admin",
      accountStatus: "approved"
    }
  }
)
```

### Step 2: Access Admin Dashboard

1. Login with your admin credentials at `login.html`
2. You'll be automatically redirected to `admin-dashboard.html`
3. The dashboard shows all organizer accounts with their status

### Step 3: Manage Organizer Applications

On the admin dashboard, you can:
- **View pending applications** - Organizers waiting for approval
- **Approve accounts** - Allow organizers to create events
- **Reject accounts** - Deny organizer access
- **Filter by status** - View all, pending, approved, or rejected accounts
- **See approval history** - Track who approved/rejected and when

## User Experience

### For Regular Users
- Registration is instant
- No waiting period
- Can immediately browse and register for events

### For Event Organizers
1. **Registration**: Create account with "Event Organizer" role
2. **Notification**: See message that account requires approval
3. **Login Attempt**: If pending, see friendly message explaining status
4. **Approval**: Once approved by admin, can login and create events
5. **Rejection**: If rejected, see message with support contact info

### For Administrators
1. **Login**: Use admin credentials
2. **Dashboard**: View all organizer accounts
3. **Review**: Click pending applications to see details
4. **Approve/Reject**: One-click approval or rejection
5. **Tracking**: See who you've approved/rejected with timestamps

## API Endpoints

The following endpoints were added for admin functionality:

### Get All Organizers (Admin Only)
```
GET /admin/organizers
Returns: Array of all manager accounts (excluding passwords)
```

### Get Pending Organizers (Admin Only)
```
GET /admin/pending-organizers
Returns: Array of pending manager accounts
```

### Approve Organizer (Admin Only)
```
POST /admin/approve-organizer/:username
Body: { adminUsername: "admin" }
Returns: Success message with updated user info
```

### Reject Organizer (Admin Only)
```
POST /admin/reject-organizer/:username
Body: { adminUsername: "admin" }
Returns: Success message with updated user info
```

## Database Schema Changes

### User Schema Updates
```javascript
{
  role: { 
    type: String, 
    enum: ["user", "manager", "admin"], 
    required: true 
  },
  accountStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: function() {
      return this.role === "manager" ? "pending" : "approved";
    }
  },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}
```

## Files Modified/Created

### New Files
- `admin-dashboard.html` - Admin dashboard UI
- `admin-dashboard.js` - Dashboard functionality
- `create-admin.js` - Script to create first admin

### Modified Files
- `server.js` - Added admin endpoints and login validation
- `login.js` - Handle pending/rejected status responses
- `register.js` - Show approval notice for organizers
- `register.html` - Display approval requirement on organizer card

## Security Considerations

1. **Login Protection**: Pending/rejected managers cannot login
2. **Admin Verification**: All admin endpoints should verify admin role (currently done client-side, consider adding middleware)
3. **Password Security**: Change default admin password immediately
4. **Audit Trail**: approvedBy and approvedAt fields track who did what

## Future Enhancements

Consider implementing:
- Email notifications when account is approved/rejected
- Bulk approve/reject functionality
- Admin notes/comments on applications
- Appeal process for rejected accounts
- Activity logs for admin actions
- Multiple admin levels (super admin, moderator, etc.)

## Troubleshooting

### "Access denied" when trying to access admin dashboard
- Make sure you're logged in as admin
- Check that the user role is exactly "admin" (case-sensitive)
- Verify MongoDB has the role set correctly

### Organizers still able to login after rejection
- Clear browser localStorage
- Restart the server
- Check that login.js was updated with status validation

### Admin endpoints not working
- Verify server.js has the new admin routes
- Check that MongoDB is running
- Ensure the endpoints are before the fallback route

## Testing Checklist

- [ ] Create admin account using script
- [ ] Login as admin, access dashboard
- [ ] Register new organizer account
- [ ] See organizer in pending list
- [ ] Approve the organizer
- [ ] Organizer can now login and create events
- [ ] Register another organizer
- [ ] Reject the organizer
- [ ] Rejected organizer sees appropriate message on login
- [ ] Stats update correctly (pending, approved, rejected counts)
- [ ] Filter tabs work properly

## Support

If you encounter any issues with the admin approval system:
1. Check the browser console for errors
2. Verify MongoDB is running and connected
3. Ensure all files are saved and server restarted
4. Check that user roles are set correctly in database
