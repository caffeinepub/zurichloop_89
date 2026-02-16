import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type BookingId = bigint;
export interface TimeSlot {
    id: TimeSlotId;
    startTime: string;
    endTime: string;
    maxCapacity: bigint;
    date: string;
    bookedCount: bigint;
}
export type Time = bigint;
export interface SlotSummary {
    id: bigint;
    startTime: string;
    endTime: string;
    maxCapacity: bigint;
    bookedCount: bigint;
}
export interface DateSlotSummary {
    date: string;
    totalBookings: bigint;
    slots: Array<SlotSummary>;
    totalCapacity: bigint;
}
export interface Coordinates {
    lat: number;
    lng: number;
}
export type TimeSlotId = bigint;
export interface MeetingPoint {
    name: string;
    instructions: string;
    address: string;
    landmark?: string;
    coordinates: Coordinates;
}
export interface TourPhoto {
    id: string;
    alt: string;
    url: string;
    isPrimary: boolean;
}
export interface AdminStats {
    upcomingBookings: bigint;
    cancelledBookings: bigint;
    totalBookings: bigint;
    completedBookings: bigint;
    averageBookingValue: bigint;
    totalRevenue: bigint;
    averageParticipants: bigint;
}
export interface Booking {
    id: BookingId;
    customerName: string;
    status: BookingStatus;
    timeSlotId: TimeSlotId;
    paymentStatus: PaymentStatus;
    customerPhone?: string;
    specialRequests?: string;
    createdAt: Time;
    updatedAt: Time;
    paymentId?: string;
    participantCount: bigint;
    totalPrice: bigint;
    customerEmail: string;
}
export interface TourConfig {
    title: string;
    duration: bigint;
    meetingPoint: MeetingPoint;
    maxCapacity: bigint;
    description: string;
    included: Array<string>;
    isActive: boolean;
    highlights: Array<string>;
    price: bigint;
    subtitle: string;
    photos: Array<TourPhoto>;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum PaymentStatus {
    pending = "pending",
    paid = "paid",
    refunded = "refunded",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAllowedOrigin(origin: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: BookingId): Promise<Booking>;
    checkAvailability(slotId: TimeSlotId, participantCount: bigint): Promise<boolean>;
    completeBooking(bookingId: BookingId): Promise<Booking>;
    confirmBooking(bookingId: BookingId, paymentId: string): Promise<Booking>;
    createBooking(timeSlotId: TimeSlotId, customerName: string, customerEmail: string, customerPhone: string | null, participantCount: bigint, specialRequests: string | null): Promise<Booking>;
    createCheckoutSession(bookingId: BookingId, successUrl: string, cancelUrl: string): Promise<string>;
    createTimeSlot(date: string, startTime: string, endTime: string, maxCapacity: bigint): Promise<TimeSlot>;
    deleteTimeSlot(slotId: TimeSlotId): Promise<boolean>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllSlots(startDate: string, endDate: string): Promise<Array<TimeSlot>>;
    getAllowedOrigins(): Promise<Array<string>>;
    getAvailableCapacity(slotId: TimeSlotId): Promise<bigint>;
    getAvailableSlots(startDate: string, endDate: string): Promise<Array<TimeSlot>>;
    getBooking(bookingId: BookingId): Promise<Booking | null>;
    getBookingStats(): Promise<AdminStats>;
    getBookingsByEmail(email: string): Promise<Array<Booking>>;
    getBookingsBySlot(slotId: TimeSlotId): Promise<Array<Booking>>;
    getCallerUserRole(): Promise<UserRole>;
    getEmailKeyStatus(): Promise<string | null>;
    getRevenueByPeriod(startDate: string, endDate: string): Promise<{
        participantCount: bigint;
        totalRevenue: bigint;
        bookingCount: bigint;
    }>;
    getSenderEmail(): Promise<string | null>;
    getSenderName(): Promise<string>;
    getSlotsForCalendar(startDate: string, endDate: string): Promise<Array<DateSlotSummary>>;
    getStripeKeyStatus(): Promise<string | null>;
    getTimeSlot(slotId: TimeSlotId): Promise<TimeSlot | null>;
    getTourConfig(): Promise<TourConfig>;
    getTourDetails(): Promise<{
        title: string;
        duration: bigint;
        meetingPoint: MeetingPoint;
        maxCapacity: bigint;
        description: string;
        included: Array<string>;
        isActive: boolean;
        highlights: Array<string>;
        photoCount: bigint;
        price: bigint;
        subtitle: string;
    }>;
    getUpcomingBookings(): Promise<Array<Booking>>;
    healthCheck(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    removeAllowedOrigin(origin: string): Promise<void>;
    sendBookingConfirmationEmail(bookingId: BookingId): Promise<string>;
    sendTestEmail(toEmail: string): Promise<string>;
    setEmailApiKey(key: string): Promise<string>;
    setSenderEmail(email: string): Promise<void>;
    setSenderName(name: string): Promise<void>;
    setStripeAuthorization(key: string): Promise<string>;
    transform(arg0: {
        response: {
            status: bigint;
            body: Uint8Array;
            headers: Array<{
                value: string;
                name: string;
            }>;
        };
    }): Promise<{
        status: bigint;
        body: Uint8Array;
        headers: Array<{
            value: string;
            name: string;
        }>;
    }>;
    updateMeetingPoint(name: string, address: string, lat: number, lng: number, instructions: string, landmark: string | null): Promise<MeetingPoint>;
    updateTimeSlot(slotId: TimeSlotId, date: string | null, startTime: string | null, endTime: string | null, maxCapacity: bigint | null): Promise<TimeSlot>;
    updateTourConfig(title: string | null, subtitle: string | null, description: string | null, duration: bigint | null, price: bigint | null, maxCapacity: bigint | null, highlights: Array<string> | null, included: Array<string> | null, isActive: boolean | null): Promise<TourConfig>;
    verifyAndConfirmBooking(sessionId: string, bookingId: BookingId): Promise<Booking>;
    whoami(): Promise<Principal>;
}
