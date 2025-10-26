# 🎫 Ticket System Implementation Guide

## ✅ Phase 1: Free vs Paid Events (COMPLETED)

### What's Been Implemented:

#### 1. **Database Schema Updates** (`server.js`)
```javascript
Event Schema now includes:
- isPaid: Boolean (default: false)
- ticketPrice: Number (default: 0)
- currency: String (default: 'INR')

registeredUsers now includes:
- quantity: Number (how many tickets)
- tickets: [String] (array of ticket IDs like "TKT-001")
- totalAmount: Number (total paid)
- paymentStatus: String (pending/completed/failed)
```

#### 2. **Event Creation Form** (`event-management.html`)
- ✅ Radio buttons: "Free Event" vs "Paid Event"
- ✅ Ticket price field (shows only for paid events)
- ✅ Validation: Paid events require valid price

#### 3. **Event Management Logic** (`event-management.js`)
- ✅ Toggle price field based on event type
- ✅ Validate pricing when creating events
- ✅ Save isPaid, ticketPrice to database
- ✅ Display pricing info on event cards
- ✅ Visual badges: 
  - 🆓 Green badge for free events
  - 💰 Yellow badge for paid events with price

#### 4. **Visual Design** (`event-management.css`)
- ✅ Pricing badge styles
- ✅ Free event badge (yellow/gold)
- ✅ Paid event badge (green with price)

---

## 🎯 How It Works Now:

### For Organizers (Event Creation):
```
1. Go to Event Management page
2. Fill in event details
3. Choose: ○ Free Event OR ○ Paid Event
4. If Paid → Enter ticket price (e.g., ₹500)
5. Click "Add Event"
```

### For Users (Current Registration):
```
Currently:
- User clicks "Register Now" button
- Gets added to event.registeredUsers[]
- Capacity tracked: 50/100

Next Phase:
- Will change to "Get Tickets" button
- Select quantity (1-10)
- Show total (₹0 for free, ₹500×3 for paid)
- Checkout flow
```

---

## 📋 Next Steps (Phase 2 - Ticket Booking):

### What We Need to Build:

#### 1. **Replace "Register" → "Get Tickets" Button**
```html
<!-- Old -->
<button>Register Now</button>

<!-- New -->
<button>Get Tickets - ₹500</button>  // For paid
<button>Get Tickets - Free</button>   // For free
```

#### 2. **Ticket Selection Modal**
```
┌─────────────────────────────────┐
│  🎫 Select Tickets               │
├─────────────────────────────────┤
│  How many tickets? [- 1 +]       │
│  Price per ticket: ₹500          │
│  Total: ₹500                     │
│                                  │
│  [Proceed to Checkout]           │
└─────────────────────────────────┘
```

#### 3. **Checkout Page** (`checkout.html`)
```html
- Show event details
- Show ticket quantity
- Calculate total (including GST if needed)
- Payment form (if paid event)
- Confirm button
```

#### 4. **Ticket Generation**
```javascript
Generate unique ticket IDs:
- Format: TKT-2025-ABC123
- Store in registeredUsers[].tickets[]
- Create ticket object with QR code
```

#### 5. **My Tickets Page** (`my-tickets.html`)
```
User Profile → My Tickets
├─ Upcoming Events
│  ├─ TKT-001: Tech Conference
│  └─ TKT-002: Workshop
└─ Past Events
   └─ TKT-003: Seminar
```

#### 6. **Update Registration Endpoint** (`server.js`)
```javascript
POST /events/:id/register
Request Body:
{
  username: "john",
  fullName: "John Doe",
  email: "john@email.com",
  quantity: 3,  // NEW
  totalAmount: 1500  // NEW (₹500 × 3)
}

Response:
{
  tickets: ["TKT-001", "TKT-002", "TKT-003"],
  message: "Tickets booked successfully!"
}
```

---

## 💡 Smart Logic (Free vs Paid):

```javascript
if (event.isPaid && event.ticketPrice > 0) {
  // Paid Event Flow
  totalAmount = ticketPrice × quantity
  → Show payment gateway
  → Process payment
  → Generate tickets
} else {
  // Free Event Flow
  totalAmount = 0
  → Skip payment
  → Generate tickets directly
}
```

---

## 🎨 UI Components Needed:

### 1. Ticket Selection Modal
```html
<div id="ticketModal" class="modal">
  <div class="modal-content">
    <h2>Select Tickets</h2>
    <div class="quantity-selector">
      <button id="decreaseQty">-</button>
      <input type="number" id="ticketQty" value="1" min="1" max="10">
      <button id="increaseQty">+</button>
    </div>
    <div class="price-summary">
      <p>Price per ticket: ₹<span id="pricePerTicket">500</span></p>
      <p>Total: ₹<span id="totalAmount">500</span></p>
    </div>
    <button id="proceedCheckout">Proceed to Checkout</button>
  </div>
</div>
```

### 2. Checkout Page
```html
<div class="checkout-container">
  <h1>Checkout</h1>
  <div class="checkout-summary">
    <h3>Event: Tech Conference 2025</h3>
    <p>Tickets: 3 × ₹500 = ₹1500</p>
    <p>Total: ₹1500</p>
  </div>
  
  <div class="user-details">
    <h3>Your Details</h3>
    <p>Name: John Doe</p>
    <p>Email: john@email.com</p>
  </div>
  
  <button id="confirmBooking">Confirm Booking</button>
</div>
```

---

## 🚀 Implementation Priority:

### High Priority (Build First):
1. ✅ **DONE:** Event schema with pricing
2. ✅ **DONE:** Event creation form with Free/Paid
3. ✅ **DONE:** Display pricing badges
4. 🔄 **NEXT:** Replace "Register" → "Get Tickets"
5. 🔄 **NEXT:** Ticket quantity selector
6. 🔄 **NEXT:** Update registration endpoint
7. 🔄 **NEXT:** Generate ticket IDs

### Medium Priority:
8. Checkout page
9. My Tickets page
10. Ticket display with QR codes
11. Email ticket sending

### Low Priority (Future):
12. Payment gateway integration (Razorpay)
13. Invoice generation
14. Refund handling
15. Admin revenue dashboard

---

## 📊 Database Structure After Phase 2:

### Event Document:
```javascript
{
  _id: "event123",
  name: "Tech Conference 2025",
  isPaid: true,
  ticketPrice: 500,
  currency: "INR",
  capacity: 100,
  registeredUsers: [
    {
      username: "john",
      fullName: "John Doe",
      email: "john@email.com",
      quantity: 3,
      tickets: ["TKT-001", "TKT-002", "TKT-003"],
      totalAmount: 1500,
      paymentStatus: "completed",
      registeredAt: "2025-10-20T10:30:00Z"
    }
  ]
}
```

---

## 🎯 Testing Checklist:

### Event Creation:
- [ ] Create free event → No price field shown
- [ ] Create paid event → Price field shown
- [ ] Create paid event without price → Shows error
- [ ] Event card shows correct pricing badge

### Ticket Booking (Phase 2):
- [ ] Free event → Total shows ₹0
- [ ] Paid event → Total calculates correctly
- [ ] Quantity selector works (1-10)
- [ ] Capacity limits enforced
- [ ] Ticket IDs generated correctly

---

## 📝 Notes:

**Current Status:** Phase 1 Complete ✅
- Organizers can mark events as Free or Paid
- Pricing displays correctly on event cards
- Database ready for ticket system

**Next Action:** 
Once you confirm, I'll build Phase 2 (ticket booking system with quantity selector and checkout flow).

**Timeline Estimate:**
- Phase 2 (Ticket Booking): 2-3 hours
- Phase 3 (Payment Integration): 1 day
- Phase 4 (Polish & QR Codes): 2-3 hours

---

Ready to proceed with Phase 2? 🚀
