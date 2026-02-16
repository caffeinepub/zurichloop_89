# ZurichLoop

## Overview

ZurichLoop is a walking tour booking platform for Zurich's Old Town built on the Internet Computer. It provides a public-facing tour page where visitors browse available dates, select time slots, and complete bookings with Stripe payments — while tour operators manage schedules, pricing, and reservations from a full-featured admin dashboard. The platform also supports automated booking confirmation emails via Resend.

## Authentication System

- Public visitors can view tour details, check availability, and make bookings without authentication
- Admin access requires Internet Identity authentication
- Admin principal stored persistently and checked on all admin operations
- Anonymous principals rejected for admin operations via `requireAdmin()` trap

## User Access

- Public visitors have read access to tour info, slot availability, and can create/view bookings
- Single admin has full control over tour configuration, time slots, bookings, and settings
- No multi-user collaboration — designed for a single tour operator managing one tour
- Bookings are accessible by booking ID or customer email (no per-user data isolation)

## Core Features

### Authentication Flow

- Public tour page displayed on application load — no login required to browse or book
- Admin button triggers Internet Identity authentication
- After login, admin status checked via `isCallerAdmin()` with optional `setAdmin()` call
- Logout returns admin to public tour page
- All admin backend operations check authentication and trap if unauthorized

### Public Booking Flow

Multi-step modal booking process (7 steps):

1. **Date Selection** — Calendar picker with available dates highlighted
2. **Time Slot Selection** — Shows slots for selected date with remaining capacity
3. **Participant Count** — Selector with capacity validation against available spots
4. **Customer Details** — Name, email, phone (optional), special requests
5. **Booking Summary** — Review all details with terms acceptance checkbox
6. **Payment** — Stripe checkout session redirect for payment processing
7. **Confirmation** — Success screen with booking details and confirmation

### Tour Landing Page

- Hero section with floating decorative cards and call-to-action buttons
- Tour details including features, highlights, and what's included
- Photo gallery showcase
- Meeting point information with location details
- Price display and "Book Now" button
- Footer section

### Admin Dashboard

- Statistics cards showing total bookings, upcoming tours, revenue, and average group size
- Quick action buttons for adding slots, viewing bookings, and updating pricing
- Recent bookings list with status badges
- Booking summary breakdown by status (confirmed, pending, completed, cancelled)

### Calendar Manager

- Monthly calendar grid view with navigation
- Visual indicators for dates with slots, bookings, and capacity status
- Click date to view all slots for that day
- Create, edit, and delete time slots from calendar view
- Capacity progress bars showing booking fill rate
- Protection against deleting slots that have existing bookings

### Bookings Management

- View all bookings in admin panel
- Filter and search bookings
- Mark bookings as completed
- Cancel bookings (automatically restores slot capacity)
- View booking details grouped by time slot

### Tour Settings

- Update tour title, subtitle, and description
- Set price per person (in cents, CHF currency)
- Configure tour duration (minutes)
- Set maximum capacity per slot
- Toggle tour active/inactive status
- Manage highlights list and included items list
- Update meeting point details (name, address, coordinates, instructions, landmark)

### Stripe Payment Integration

- Configure Stripe API key (restricted key: `rk_` or secret key: `sk_`)
- Manage allowed origins for checkout redirect URLs
- Create checkout sessions linked to bookings
- Verify payment completion and auto-confirm bookings
- CHF (Swiss Franc) currency support

### Email Notifications

- Configure Resend API key for transactional emails
- Set sender email address and display name
- Send HTML-formatted booking confirmation emails with full booking details
- Send test emails to verify configuration
- Automated confirmation emails after successful payment

## Backend Data Storage

### Data Models

**TimeSlot:**

- ID (Nat)
- Date (Text — YYYY-MM-DD format)
- Start Time (Text — HH:MM format)
- End Time (Text — HH:MM format)
- Max Capacity (Nat)
- Booked Count (Nat)

**Booking:**

- ID (Nat)
- Time Slot ID (Nat — reference to parent time slot)
- Customer Name (Text)
- Customer Email (Text)
- Customer Phone (?Text — optional)
- Participant Count (Nat)
- Total Price (Nat — in cents)
- Status (Variant — #pending, #confirmed, #cancelled, #completed)
- Payment Status (Variant — #pending, #paid, #failed, #refunded)
- Payment ID (?Text — Stripe session/payment ID)
- Special Requests (?Text — optional)
- Created timestamp (Time.Time)
- Updated timestamp (Time.Time)

**TourConfig:**

- Title (Text)
- Subtitle (Text)
- Description (Text)
- Duration (Nat — minutes)
- Price (Nat — cents per person)
- Max Capacity (Nat)
- Photos ([TourPhoto])
- Highlights ([Text])
- Included ([Text])
- Meeting Point (MeetingPoint)
- Is Active (Bool)

**TourPhoto:**

- ID (Text)
- URL (Text)
- Alt (Text)
- Is Primary (Bool)

**MeetingPoint:**

- Name (Text)
- Address (Text)
- Coordinates ({ lat: Float, lng: Float })
- Instructions (Text)
- Landmark (?Text — optional)

**AdminStats (computed):**

- Total Bookings (Nat)
- Upcoming Bookings (Nat)
- Completed Bookings (Nat)
- Cancelled Bookings (Nat)
- Total Revenue (Nat)
- Average Participants (Nat)
- Average Booking Value (Nat)

### Storage Implementation

- Uses OrderedMap for efficient data storage and retrieval
- Transient OrderedMap instance for map operations
- Persistent storage for time slots and bookings with preupgrade/postupgrade
- Stable variables for tour config, admin principal, Stripe authorization, allowed origins, and email settings
- Auto-incrementing ID counters for time slots and bookings

## Backend Operations

### System Operations

- `healthCheck()`: Health endpoint returning boolean
- `whoami()`: Returns caller principal
- `transform(response)`: HTTP response transform for IC consensus

### Authentication Operations

- `isCallerAdmin()`: Query to check if caller is admin
- `setAdmin(newAdmin)`: Set or change admin principal
- `requireAuth(caller)`: Private function — traps if anonymous
- `requireAdmin(caller)`: Private function — traps if not admin

### Tour Config Operations

- `getTourConfig()`: Public query returning full tour configuration
- `getTourDetails()`: Public query returning tour details subset
- `updateTourConfig(title, subtitle, description, duration, price, maxCapacity, highlights, included, isActive)`: Admin — update tour settings
- `updateMeetingPoint(name, address, lat, lng, instructions, landmark)`: Admin — update meeting point

### Time Slot Operations

- `createTimeSlot(date, startTime, endTime, maxCapacity)`: Admin — create new time slot, returns slot
- `getTimeSlot(slotId)`: Public query — returns slot or null
- `updateTimeSlot(slotId, date, startTime, endTime, maxCapacity)`: Admin — update slot
- `deleteTimeSlot(slotId)`: Admin — remove slot (only if no bookings exist)
- `getAvailableSlots(startDate, endDate)`: Public query — returns slots with remaining capacity
- `getAllSlots(startDate, endDate)`: Admin query — returns all slots including full ones
- `getAvailableCapacity(slotId)`: Public query — returns remaining capacity count
- `checkAvailability(slotId, participantCount)`: Public query — checks if enough spots available

### Booking Operations

- `createBooking(timeSlotId, customerName, email, phone, participantCount, specialRequests)`: Public — create booking, returns booking
- `getBooking(bookingId)`: Public query — returns booking or null
- `confirmBooking(bookingId, paymentId)`: Public — confirm booking with payment ID
- `cancelBooking(bookingId)`: Public — cancel booking and restore slot capacity
- `completeBooking(bookingId)`: Admin — mark booking as completed
- `getBookingsBySlot(slotId)`: Public query — returns bookings for a slot
- `getUpcomingBookings()`: Admin query — returns future bookings
- `getAllBookings()`: Admin query — returns all bookings
- `getBookingsByEmail(email)`: Public query — returns bookings by customer email

### Statistics Operations

- `getBookingStats()`: Admin query — returns comprehensive admin statistics
- `getRevenueByPeriod(startDate, endDate)`: Admin query — returns revenue for date range
- `getSlotsForCalendar(startDate, endDate)`: Public query — returns slots grouped by date

### Stripe Operations

- `setStripeAuthorization(key)`: Admin — store and validate Stripe API key
- `getStripeKeyStatus()`: Admin query — returns masked key status
- `addAllowedOrigin(origin)`: Admin — add allowed checkout redirect origin
- `removeAllowedOrigin(origin)`: Admin — remove allowed origin
- `getAllowedOrigins()`: Admin query — returns all allowed origins
- `createCheckoutSession(bookingId, successUrl, cancelUrl)`: Public — create Stripe checkout session, returns session URL
- `verifyAndConfirmBooking(sessionId, bookingId)`: Public — verify Stripe payment and confirm booking

### Email Operations

- `setEmailApiKey(key)`: Admin — store Resend API key
- `getEmailKeyStatus()`: Admin query — returns masked key status
- `setSenderEmail(email)`: Admin — set sender email address
- `getSenderEmail()`: Admin query — returns sender email
- `setSenderName(name)`: Admin — set sender display name
- `getSenderName()`: Public query — returns sender name
- `sendBookingConfirmationEmail(bookingId)`: Public — send confirmation email for booking
- `sendTestEmail(toEmail)`: Admin — send test email to verify configuration

## User Interface

### Layout Structure

**Public Tour Page (Default):**

- Navigation bar with app logo, nav links, and admin button
- Hero section with floating decorative cards and CTA buttons
- Tour details section with features, highlights, and inclusions
- Photo gallery
- Meeting point information
- Footer section
- Booking modal overlay (triggered by "Book Now")

**Admin Layout (Authenticated):**

- Fixed left sidebar with:
  - App branding header
  - Navigation menu (Dashboard, Calendar, Bookings, Tour Settings, Stripe Settings, Email Settings)
  - Sign out button at bottom
- Main content area for active admin view
- Mobile: Sidebar becomes toggle overlay with backdrop

### Public Tour Page

- Hero with background gradient, tour title, and subtitle
- Floating cards with tour highlights
- "Book Now" and "View Details" CTA buttons
- Tour features grid with icons
- Highlights list and what's included list
- Photo gallery carousel
- Meeting point card with location details
- Price display with per-person breakdown
- Responsive footer

### Booking Modal

- Multi-step progress indicator showing current step
- Step 1: Calendar date picker with available date highlighting
- Step 2: Time slot cards with start/end time and remaining spots
- Step 3: Participant count selector with capacity validation
- Step 4: Customer form (name, email, phone, special requests)
- Step 5: Booking summary with terms acceptance checkbox
- Step 6: Stripe payment redirect button
- Step 7: Confirmation screen with booking details
- Back/Next navigation between steps
- Close button and backdrop dismissal

### Payment Pages

- **Payment Success**: Verifies payment with backend, shows confirmation with booking details
- **Payment Cancelled**: Shows cancellation message with option to retry

### Admin Dashboard View

- Four statistics cards (total bookings, upcoming tours, revenue, avg group size)
- Quick action buttons grid
- Recent bookings list with status badges (confirmed, pending, completed, cancelled)
- Booking count breakdown by status

### Calendar Manager View

- Month navigation with previous/next buttons
- 7-column calendar grid with day headers
- Date cells with visual indicators:
  - Dots for dates with slots
  - Color coding for capacity status
- Click date to expand slot details panel
- Slot cards with time, capacity bar, and booking count
- "Add Slot" button per date
- Slot editor modal for create/edit

### Bookings List View

- All bookings displayed with:
  - Customer name and email
  - Date and time slot
  - Participant count
  - Total price
  - Status badge (color-coded)
  - Action buttons (complete, cancel)
- Filter and search capabilities

### Tour Settings View

- Form sections for:
  - Title, subtitle, description inputs
  - Price per person (cents) and duration (minutes)
  - Max capacity setting
  - Active/inactive toggle
  - Highlights list editor (add/remove items)
  - Included items list editor (add/remove items)
  - Meeting point details (name, address, coordinates, instructions, landmark)
- Save button with loading state

### Stripe Settings View

- API key input field with validation (accepts `rk_` or `sk_` prefixed keys)
- Masked key display showing configured status
- Allowed origins list with add/remove functionality
- Save and test connection buttons

### Email Settings View

- Resend API key input with masked display
- Sender email and sender name configuration
- Test email functionality
- Save button with loading state

### Interactive Elements

- Modal overlays with backdrop dismissal
- Loading states with disabled buttons and spinners
- Multi-step progress indicators in booking flow
- Capacity progress bars on calendar slots
- Status badges with color coding
- Hover effects on interactive elements
- Skeleton loading placeholders
- Error boundary for graceful error handling

## Design System

### Colors

| Token                | Value     | Usage                                 |
| -------------------- | --------- | ------------------------------------- |
| Background Primary   | `#F8F9FA` | Page background                       |
| Background Secondary | `#F1F3F5` | Section backgrounds                   |
| Background Tertiary  | `#E9ECEF` | Subtle backgrounds                    |
| Surface              | `#FFFFFF` | Cards, panels                         |
| Surface Hover        | `#F8F9FA` | Card hover state                      |
| Surface Active       | `#EFF6FF` | Active selection                      |
| Border               | `#E5E7EB` | Standard borders                      |
| Border Light         | `#F3F4F6` | Subtle borders                        |
| Border Dark          | `#D1D5DB` | Emphasized borders                    |
| Text Primary         | `#1A1A1A` | Headings, titles                      |
| Text Secondary       | `#6B7280` | Labels, descriptions                  |
| Text Tertiary        | `#9CA3AF` | Muted text                            |
| Text Inverse         | `#FFFFFF` | Text on dark backgrounds              |
| Accent               | `#3B82F6` | Primary actions, links, active states |
| Accent Dark          | `#2563EB` | Hover states                          |

### Typography

- Primary font: Inter, system-ui, sans-serif
- Monospace font: JetBrains Mono
- Heading weights: 600 (semibold) to 700 (bold)
- Body weight: 400 (regular) to 500 (medium)
- Size scale: text-sm (labels) to text-7xl (hero heading)

### Spacing

- Base unit: 4px (Tailwind default)
- Card padding: 16px–24px (p-4 to p-6)
- Section padding: 80px–128px (py-20 to py-32)
- Card gap: 16px–24px (gap-4 to gap-6)
- Component gap: 8px–16px (gap-2 to gap-4)

### Components

- Cards: `rounded-xl` to `rounded-2xl`, `shadow-card`, white background
- Buttons: `rounded-lg`, blue accent for primary, hover states with transitions
- Inputs: `rounded-md`, border-gray-300, focus ring with accent color
- Modals: Fixed overlay with `backdrop-blur`, centered, `rounded-xl`, `shadow-xl`
- Progress bars: `rounded-full` with color gradient (green/amber/red for capacity)
- Status badges: Colored pills with variant-specific backgrounds
- Animations: fade-in, slide-up, pulse, bounce for interactive elements

## Mobile Responsive Design

- Full responsive layout using Tailwind breakpoints (sm, md, lg, xl)
- Hero section: Stacked layout on mobile, floating cards visible on desktop (lg+)
- Navigation: Hidden nav links with hamburger menu on mobile, full nav on desktop
- Admin sidebar: Fixed overlay with toggle on mobile, sticky sidebar on desktop (lg+)
- Booking modal: Full-width on mobile, max-width container on desktop
- Dashboard stats: Single column on mobile, 2-column (sm) to 4-column (lg) grid
- Calendar: 7-column grid maintains aspect ratio, font sizes scale on mobile
- Forms: Full width on mobile, constrained on desktop
- Touch-friendly button sizes (minimum 44px tap targets)
- Scrollable modals with proper overflow handling

## State Management

- React hooks (useState) for local component state
- React Query (TanStack Query) for server state:
  - Automatic caching with 5-minute default stale time
  - Loading and error states
  - Mutation handling with query invalidation
  - Slot queries use no cache (always fresh for availability accuracy)
  - Stats queries use 1-minute cache
  - Query keys include principal for authenticated queries
- useInternetIdentity for authentication state
- useActor for canister actor management with principal-based caching
- Cache cleared on logout

## Data Flow

- Frontend makes async calls to backend canister via generated actor
- Public operations use anonymous actor; admin operations use authenticated actor
- React Query manages loading, error, and success states
- Mutations trigger invalidateQueries for affected data (slots, bookings, stats)
- Time conversions between JavaScript and Motoko timestamps
- BigInt handling for Motoko Nat types
- Stripe checkout uses HTTP outcalls from backend canister to Stripe API
- Email sending uses HTTP outcalls from backend canister to Resend API
- Exchange of booking data between frontend, backend, Stripe, and email services
