// Booking status enumeration
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

// Payment status enumeration
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

// Time slot type for available tour times
export interface TimeSlot {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  maxCapacity: number;
  bookedCount: number;
}

// Booking type for customer reservations
export interface Booking {
  id: string;
  timeSlotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  participantCount: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  specialRequests?: string;
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
}

// Booking creation input (what customer submits)
export interface BookingInput {
  timeSlotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  participantCount: number;
  specialRequests?: string;
}

// Booking summary for confirmation display
export interface BookingSummary {
  booking: Booking;
  timeSlot: TimeSlot;
  tourTitle: string;
  meetingPoint: string;
}
