// Admin dashboard types

// Admin statistics for dashboard
export interface AdminStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number; // In cents
  averageParticipants: number;
  averageBookingValue: number;
}

// Calendar view configuration
export interface CalendarView {
  month: number; // 0-11
  year: number;
  slots: CalendarSlot[];
}

// Calendar slot for display
export interface CalendarSlot {
  date: string;
  slots: SlotSummary[];
  totalBookings: number;
  totalCapacity: number;
}

// Slot summary for calendar display
export interface SlotSummary {
  id: string;
  startTime: string;
  endTime: string;
  bookedCount: number;
  maxCapacity: number;
}

// Revenue report for a time period
export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  bookingCount: number;
  participantCount: number;
  dailyBreakdown: DailyRevenue[];
}

// Daily revenue breakdown
export interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
  participants: number;
}

// Booking filters for admin list
export interface BookingFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  searchQuery?: string;
  sortBy?: "date" | "createdAt" | "customerName" | "status";
  sortOrder?: "asc" | "desc";
}
