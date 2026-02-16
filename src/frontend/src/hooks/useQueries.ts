import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Helper hook to get the current principal as a string
export function usePrincipal(): string {
  const { identity } = useInternetIdentity();
  return identity?.getPrincipal().toString() ?? "anonymous";
}

// Health check
export function useHealthCheck() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["healthCheck", principal],
    queryFn: async () => {
      if (!actor) return false;
      return await actor.healthCheck();
    },
    enabled: !!actor,
    staleTime: Infinity,
  });
}

// ==================== Tour Configuration ====================

// Get tour configuration
export function useTourConfig() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["tourConfig"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getTourConfig();
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get tour details (public)
export function useTourDetails() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["tourDetails"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.getTourDetails();
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1000,
  });
}

// Update tour configuration (admin)
export function useUpdateTourConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      subtitle?: string;
      description?: string;
      duration?: number;
      price?: number;
      maxCapacity?: number;
      highlights?: string[];
      included?: string[];
      isActive?: boolean;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.updateTourConfig(
        data.title ?? null,
        data.subtitle ?? null,
        data.description ?? null,
        data.duration !== undefined ? BigInt(data.duration) : null,
        data.price !== undefined ? BigInt(data.price) : null,
        data.maxCapacity !== undefined ? BigInt(data.maxCapacity) : null,
        data.highlights ?? null,
        data.included ?? null,
        data.isActive ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tourConfig"] });
      queryClient.invalidateQueries({ queryKey: ["tourDetails"] });
    },
  });
}

// Update meeting point (admin)
export function useUpdateMeetingPoint() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      address: string;
      lat: number;
      lng: number;
      instructions: string;
      landmark?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.updateMeetingPoint(
        data.name,
        data.address,
        data.lat,
        data.lng,
        data.instructions,
        data.landmark ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tourConfig"] });
      queryClient.invalidateQueries({ queryKey: ["tourDetails"] });
    },
  });
}

// ==================== Time Slot Management ====================

// Get available slots (public)
export function useAvailableSlots(startDate: string, endDate: string) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["availableSlots", startDate, endDate],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const slots = await actor.getAvailableSlots(startDate, endDate);
      return slots.map((slot) => ({
        ...slot,
        id: Number(slot.id),
        maxCapacity: Number(slot.maxCapacity),
        bookedCount: Number(slot.bookedCount),
      }));
    },
    enabled: !!actor && !!startDate && !!endDate,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// Get all slots (admin)
export function useAllSlots(startDate: string, endDate: string) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["allSlots", startDate, endDate],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const slots = await actor.getAllSlots(startDate, endDate);
      return slots.map((slot) => ({
        ...slot,
        id: Number(slot.id),
        maxCapacity: Number(slot.maxCapacity),
        bookedCount: Number(slot.bookedCount),
      }));
    },
    enabled: !!actor && !!startDate && !!endDate,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// Get single time slot
export function useTimeSlot(slotId: number | null) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["timeSlot", slotId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (slotId === null) return null;
      const slot = await actor.getTimeSlot(BigInt(slotId));
      if (slot === null) return null;
      return {
        ...slot,
        id: Number(slot.id),
        maxCapacity: Number(slot.maxCapacity),
        bookedCount: Number(slot.bookedCount),
      };
    },
    enabled: !!actor && slotId !== null,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// Create time slot (admin)
export function useCreateTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      startTime: string;
      endTime: string;
      maxCapacity: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const slot = await actor.createTimeSlot(
        data.date,
        data.startTime,
        data.endTime,
        BigInt(data.maxCapacity),
      );
      return {
        ...slot,
        id: Number(slot.id),
        maxCapacity: Number(slot.maxCapacity),
        bookedCount: Number(slot.bookedCount),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsForCalendar"] });
    },
  });
}

// Update time slot (admin)
export function useUpdateTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      slotId: number;
      date?: string;
      startTime?: string;
      endTime?: string;
      maxCapacity?: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const slot = await actor.updateTimeSlot(
        BigInt(data.slotId),
        data.date ?? null,
        data.startTime ?? null,
        data.endTime ?? null,
        data.maxCapacity !== undefined ? BigInt(data.maxCapacity) : null,
      );
      return {
        ...slot,
        id: Number(slot.id),
        maxCapacity: Number(slot.maxCapacity),
        bookedCount: Number(slot.bookedCount),
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
      queryClient.invalidateQueries({
        queryKey: ["timeSlot", variables.slotId],
      });
      queryClient.invalidateQueries({ queryKey: ["slotsForCalendar"] });
    },
  });
}

// Delete time slot (admin)
export function useDeleteTimeSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotId: number) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.deleteTimeSlot(BigInt(slotId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
      queryClient.invalidateQueries({ queryKey: ["slotsForCalendar"] });
    },
  });
}

// Check availability
export function useCheckAvailability(
  slotId: number | null,
  participantCount: number,
) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["availability", slotId, participantCount],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (slotId === null) return false;
      return await actor.checkAvailability(
        BigInt(slotId),
        BigInt(participantCount),
      );
    },
    enabled: !!actor && slotId !== null && participantCount > 0,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// Get available capacity
export function useAvailableCapacity(slotId: number | null) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["availableCapacity", slotId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (slotId === null) return 0;
      const capacity = await actor.getAvailableCapacity(BigInt(slotId));
      return Number(capacity);
    },
    enabled: !!actor && slotId !== null,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// ==================== Booking Management ====================

// Create booking
export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      timeSlotId: number;
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      participantCount: number;
      specialRequests?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const booking = await actor.createBooking(
        BigInt(data.timeSlotId),
        data.customerName,
        data.customerEmail,
        data.customerPhone ?? null,
        BigInt(data.participantCount),
        data.specialRequests ?? null,
      );
      return {
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      queryClient.invalidateQueries({ queryKey: ["slotsForCalendar"] });
    },
  });
}

// Get booking by ID
export function useBooking(bookingId: number | null) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (bookingId === null) return null;
      const booking = await actor.getBooking(BigInt(bookingId));
      if (booking === null) return null;
      return {
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      };
    },
    enabled: !!actor && bookingId !== null,
  });
}

// Confirm booking after payment
export function useConfirmBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookingId: number; paymentId: string }) => {
      if (!actor) throw new Error("Actor not available");
      const booking = await actor.confirmBooking(
        BigInt(data.bookingId),
        data.paymentId,
      );
      return {
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
    },
  });
}

// Cancel booking
export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: number) => {
      if (!actor) throw new Error("Actor not available");
      const booking = await actor.cancelBooking(BigInt(bookingId));
      return {
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["allSlots"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      queryClient.invalidateQueries({ queryKey: ["slotsForCalendar"] });
    },
  });
}

// Complete booking (admin)
export function useCompleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: number) => {
      if (!actor) throw new Error("Actor not available");
      const booking = await actor.completeBooking(BigInt(bookingId));
      return {
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
    },
  });
}

// Get bookings by slot
export function useBookingsBySlot(slotId: number | null) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["bookingsBySlot", slotId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      if (slotId === null) return [];
      const bookings = await actor.getBookingsBySlot(BigInt(slotId));
      return bookings.map((booking) => ({
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      }));
    },
    enabled: !!actor && slotId !== null,
  });
}

// Get upcoming bookings (admin)
export function useUpcomingBookings() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["upcomingBookings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const bookings = await actor.getUpcomingBookings();
      return bookings.map((booking) => ({
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      }));
    },
    enabled: !!actor,
    staleTime: 30 * 1000,
  });
}

// Get all bookings (admin)
export function useAllBookings() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const bookings = await actor.getAllBookings();
      return bookings.map((booking) => ({
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      }));
    },
    enabled: !!actor,
  });
}

// Get bookings by email
export function useBookingsByEmail(email: string) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["bookingsByEmail", email],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const bookings = await actor.getBookingsByEmail(email);
      return bookings.map((booking) => ({
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      }));
    },
    enabled: !!actor && !!email,
  });
}

// ==================== Admin Statistics ====================

// Get booking statistics (admin)
export function useBookingStats() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["bookingStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const stats = await actor.getBookingStats();
      return {
        totalBookings: Number(stats.totalBookings),
        upcomingBookings: Number(stats.upcomingBookings),
        completedBookings: Number(stats.completedBookings),
        cancelledBookings: Number(stats.cancelledBookings),
        totalRevenue: Number(stats.totalRevenue),
        averageParticipants: Number(stats.averageParticipants),
        averageBookingValue: Number(stats.averageBookingValue),
      };
    },
    enabled: !!actor,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get revenue by period
export function useRevenueByPeriod(startDate: string, endDate: string) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["revenueByPeriod", startDate, endDate],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const revenue = await actor.getRevenueByPeriod(startDate, endDate);
      return {
        totalRevenue: Number(revenue.totalRevenue),
        bookingCount: Number(revenue.bookingCount),
        participantCount: Number(revenue.participantCount),
      };
    },
    enabled: !!actor && !!startDate && !!endDate,
  });
}

// Get slots for calendar
export function useSlotsForCalendar(startDate: string, endDate: string) {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["slotsForCalendar", startDate, endDate],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const data = await actor.getSlotsForCalendar(startDate, endDate);
      return data.map((day) => ({
        date: day.date,
        slots: day.slots.map((slot) => ({
          id: Number(slot.id),
          startTime: slot.startTime,
          endTime: slot.endTime,
          bookedCount: Number(slot.bookedCount),
          maxCapacity: Number(slot.maxCapacity),
        })),
        totalBookings: Number(day.totalBookings),
        totalCapacity: Number(day.totalCapacity),
      }));
    },
    enabled: !!actor && !!startDate && !!endDate,
    staleTime: 0,
    refetchOnMount: "always",
  });
}

// ==================== Admin Check ====================

// Check if caller is admin
export function useIsAdmin() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["isAdmin", principal],
    queryFn: async () => {
      if (!actor) return false;
      return await actor.isCallerAdmin();
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Stripe Configuration ====================

// Get Stripe key status (admin)
export function useStripeKeyStatus() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["stripeKeyStatus", principal],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getStripeKeyStatus();
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60 * 1000,
  });
}

// Set Stripe authorization (admin)
export function useSetStripeAuthorization() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.setStripeAuthorization(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripeKeyStatus"] });
    },
  });
}

// Get allowed origins (admin)
export function useAllowedOrigins() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["allowedOrigins", principal],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAllowedOrigins();
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60 * 1000,
  });
}

// Add allowed origin (admin)
export function useAddAllowedOrigin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (origin: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.addAllowedOrigin(origin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowedOrigins"] });
    },
  });
}

// Remove allowed origin (admin)
export function useRemoveAllowedOrigin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (origin: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.removeAllowedOrigin(origin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowedOrigins"] });
    },
  });
}

// ==================== Stripe Payment ====================

// Create checkout session
export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      bookingId: number;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const response = await actor.createCheckoutSession(
        BigInt(data.bookingId),
        data.successUrl,
        data.cancelUrl,
      );
      // Parse the checkout URL from Stripe response
      const urlMatch = response.match(/"url"\s*:\s*"([^"]+)"/);
      if (!urlMatch) {
        throw new Error("Failed to extract checkout URL from Stripe response");
      }
      // Unescape the URL (Stripe escapes forward slashes)
      const checkoutUrl = urlMatch[1].replace(/\\\//g, "/");
      return { checkoutUrl, rawResponse: response };
    },
  });
}

// Verify and confirm booking after Stripe payment
export function useVerifyAndConfirmBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { sessionId: string; bookingId: number }) => {
      if (!actor) throw new Error("Actor not available");
      const booking = await actor.verifyAndConfirmBooking(
        data.sessionId,
        BigInt(data.bookingId),
      );
      return {
        ...booking,
        id: Number(booking.id),
        timeSlotId: Number(booking.timeSlotId),
        participantCount: Number(booking.participantCount),
        totalPrice: Number(booking.totalPrice),
        createdAt: Number(booking.createdAt),
        updatedAt: Number(booking.updatedAt),
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
      queryClient.invalidateQueries({ queryKey: ["upcomingBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
    },
  });
}

// ==================== Email Configuration ====================

// Get Email API key status (admin)
export function useEmailKeyStatus() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["emailKeyStatus", principal],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getEmailKeyStatus();
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60 * 1000,
  });
}

// Set Email API key (admin)
export function useSetEmailApiKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.setEmailApiKey(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emailKeyStatus"] });
    },
  });
}

// Get sender email (admin)
export function useSenderEmail() {
  const { actor } = useActor();
  const principal = usePrincipal();

  return useQuery({
    queryKey: ["senderEmail", principal],
    queryFn: async () => {
      if (!actor) return null;
      return await actor.getSenderEmail();
    },
    enabled: !!actor && principal !== "anonymous",
    staleTime: 60 * 1000,
  });
}

// Set sender email (admin)
export function useSetSenderEmail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.setSenderEmail(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senderEmail"] });
    },
  });
}

// Get sender name
export function useSenderName() {
  const { actor } = useActor();

  return useQuery({
    queryKey: ["senderName"],
    queryFn: async () => {
      if (!actor) return "Zurich Loop Tours";
      return await actor.getSenderName();
    },
    enabled: !!actor,
    staleTime: 60 * 1000,
  });
}

// Set sender name (admin)
export function useSetSenderName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.setSenderName(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["senderName"] });
    },
  });
}

// ==================== Email Sending ====================

// Send confirmation email
export function useSendConfirmationEmail() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (bookingId: number) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.sendBookingConfirmationEmail(BigInt(bookingId));
    },
  });
}

// Send test email (admin)
export function useSendTestEmail() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (toEmail: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.sendTestEmail(toEmail);
    },
  });
}
