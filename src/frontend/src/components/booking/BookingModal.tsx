import React, { useState, useMemo, useEffect } from "react";
import { X, MapPin, Clock, Users, ChevronLeft, Loader2 } from "lucide-react";
import { DatePicker } from "./DatePicker";
import { TimeSlotPicker } from "./TimeSlotPicker";
import { ParticipantSelector } from "./ParticipantSelector";
import {
  CustomerForm,
  CustomerFormData,
  CustomerFormErrors,
  validateCustomerForm,
} from "./CustomerForm";
import { BookingSummary } from "./BookingSummary";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { PaymentForm } from "../payment/PaymentForm";
import {
  useAvailableSlots,
  useTourConfig,
  useCreateBooking,
  useConfirmBooking,
} from "../../hooks/useQueries";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep =
  | "date"
  | "time"
  | "participants"
  | "details"
  | "summary"
  | "payment"
  | "confirmation";

const STEPS: BookingStep[] = [
  "date",
  "time",
  "participants",
  "details",
  "summary",
  "payment",
  "confirmation",
];

const STEP_TITLES: Record<BookingStep, string> = {
  date: "Select Date",
  time: "Select Time",
  participants: "How many people?",
  details: "Your Details",
  summary: "Review Booking",
  payment: "Payment",
  confirmation: "Confirmed!",
};

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState<BookingStep>("date");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Form state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [participantCount, setParticipantCount] = useState(2);
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState<CustomerFormErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Booking state
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Queries
  const { data: tourConfig } = useTourConfig();

  // Get date range for the current month view (full month)
  const dateRange = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const fmt = (d: Date) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    };
    const startDate = fmt(new Date(year, month, 1));
    const endDate = fmt(new Date(year, month + 1, 0));
    return { startDate, endDate };
  }, [currentMonth]);

  const { data: availableSlots, isLoading: slotsLoading } = useAvailableSlots(
    dateRange.startDate,
    dateRange.endDate,
  );

  // Mutations
  const { mutate: createBooking, isPending: isCreatingBooking } =
    useCreateBooking();
  const { mutate: confirmBooking, isPending: isConfirmingBooking } =
    useConfirmBooking();

  // Get available dates (dates that have at least one available slot)
  const availableDates = useMemo(() => {
    if (!availableSlots) return [];
    const dates = new Set<string>();
    availableSlots.forEach((slot) => {
      const available = slot.maxCapacity - slot.bookedCount;
      if (available >= participantCount) {
        dates.add(slot.date);
      }
    });
    return Array.from(dates);
  }, [availableSlots, participantCount]);

  // Get slots for selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!availableSlots || !selectedDate) return [];
    return availableSlots.filter((slot) => slot.date === selectedDate);
  }, [availableSlots, selectedDate]);

  // Get selected slot
  const selectedSlot = useMemo(() => {
    if (!availableSlots || selectedSlotId === null) return null;
    return availableSlots.find((slot) => slot.id === selectedSlotId) || null;
  }, [availableSlots, selectedSlotId]);

  // Max capacity for participant selector
  const maxCapacity = useMemo(() => {
    if (!selectedSlot)
      return tourConfig?.maxCapacity ? Number(tourConfig.maxCapacity) : 12;
    return selectedSlot.maxCapacity - selectedSlot.bookedCount;
  }, [selectedSlot, tourConfig]);

  // Price per person
  const pricePerPerson = tourConfig?.price ? Number(tourConfig.price) : 3500;
  const totalPrice = participantCount * pricePerPerson;

  // Reset slot when date changes
  useEffect(() => {
    setSelectedSlotId(null);
  }, [selectedDate]);

  // Reset participant count when slot changes (if exceeds capacity)
  useEffect(() => {
    if (participantCount > maxCapacity && maxCapacity > 0) {
      setParticipantCount(Math.max(1, maxCapacity));
    }
  }, [maxCapacity, participantCount]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep("date");
        setSelectedDate(null);
        setSelectedSlotId(null);
        setParticipantCount(2);
        setCustomerData({
          name: "",
          email: "",
          phone: "",
          specialRequests: "",
        });
        setFormErrors({});
        setTermsAccepted(false);
        setCreatedBookingId(null);
        setPaymentId(null);
        setPaymentError(null);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepIndex = STEPS.indexOf(currentStep);
  const canGoBack =
    currentStepIndex > 0 &&
    currentStep !== "payment" &&
    currentStep !== "confirmation";
  const isLastStep = currentStep === "confirmation";
  const showProgress = currentStep !== "confirmation";

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentStep === "details") {
      const errors = validateCustomerForm(customerData);
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setFormErrors({});
    }

    if (currentStep === "summary") {
      // Create the booking and move to payment
      handleCreateBooking();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length - 1) {
      // Don't go to payment or confirmation automatically
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleCreateBooking = () => {
    if (!selectedSlotId || !termsAccepted) return;

    createBooking(
      {
        timeSlotId: selectedSlotId,
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone || undefined,
        participantCount,
        specialRequests: customerData.specialRequests || undefined,
      },
      {
        onSuccess: (booking) => {
          setCreatedBookingId(booking.id);
          setCurrentStep("payment");
        },
        onError: (error) => {
          console.error("Booking failed:", error);
          alert("Failed to create booking. Please try again.");
        },
      },
    );
  };

  const handlePaymentSuccess = (pId: string) => {
    setPaymentId(pId);

    if (createdBookingId) {
      confirmBooking(
        { bookingId: createdBookingId, paymentId: pId },
        {
          onSuccess: () => {
            setCurrentStep("confirmation");
          },
          onError: (error) => {
            console.error("Confirm booking failed:", error);
            // Still show confirmation even if backend confirm fails
            // The booking is created, payment is done
            setCurrentStep("confirmation");
          },
        },
      );
    } else {
      setCurrentStep("confirmation");
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case "date":
        return selectedDate !== null;
      case "time":
        return selectedSlotId !== null;
      case "participants":
        return participantCount > 0 && participantCount <= maxCapacity;
      case "details":
        return (
          customerData.name.trim().length > 0 &&
          customerData.email.trim().length > 0
        );
      case "summary":
        return termsAccepted;
      default:
        return false;
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
    return `${hours}.${Math.round(mins / 6)} hours`;
  };

  const progressSteps = STEPS.slice(0, -1); // Exclude confirmation from progress
  const progressIndex = Math.min(currentStepIndex, progressSteps.length - 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center !mt-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={currentStep === "confirmation" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className={`relative px-6 py-6 text-white flex-shrink-0 ${
            currentStep === "confirmation"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
              : "bg-gradient-to-r from-app-accent-500 to-app-accent-600"
          }`}
        >
          <div className="flex items-center justify-between">
            {canGoBack ? (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-9" />
            )}

            <div className="text-center">
              <h2 className="text-xl font-bold">{STEP_TITLES[currentStep]}</h2>
              {showProgress && (
                <p className="text-white/70 text-sm mt-0.5">
                  Step {progressIndex + 1} of {progressSteps.length}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: `${((progressIndex + 1) / progressSteps.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tour Summary (only on first step) */}
          {currentStep === "date" && (
            <div className="flex items-center gap-4 p-4 bg-app-bg-primary rounded-2xl mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-app-accent-400 to-app-accent-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-app-text-primary">
                  {tourConfig?.title || "Zurich Old Town Tour"}
                </h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-app-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tourConfig?.duration
                      ? formatDuration(Number(tourConfig.duration))
                      : "2.5 hours"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Max{" "}
                    {tourConfig?.maxCapacity
                      ? Number(tourConfig.maxCapacity)
                      : 12}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          {currentStep === "date" && (
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={availableDates}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}

          {currentStep === "time" && (
            <TimeSlotPicker
              slots={slotsForSelectedDate.map((slot) => ({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                maxCapacity: slot.maxCapacity,
                bookedCount: slot.bookedCount,
              }))}
              selectedSlotId={selectedSlotId}
              onSelectSlot={setSelectedSlotId}
              participantCount={participantCount}
              isLoading={slotsLoading}
            />
          )}

          {currentStep === "participants" && (
            <ParticipantSelector
              value={participantCount}
              onChange={setParticipantCount}
              max={maxCapacity}
              pricePerPerson={pricePerPerson}
            />
          )}

          {currentStep === "details" && (
            <CustomerForm
              data={customerData}
              onChange={setCustomerData}
              errors={formErrors}
            />
          )}

          {currentStep === "summary" && selectedSlot && (
            <BookingSummary
              tourTitle={tourConfig?.title || "Zurich Old Town Tour"}
              timeSlot={{
                date: selectedSlot.date,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime,
              }}
              participantCount={participantCount}
              pricePerPerson={pricePerPerson}
              customerName={customerData.name}
              customerEmail={customerData.email}
              meetingPoint={tourConfig?.meetingPoint?.name}
              onAcceptTerms={setTermsAccepted}
              termsAccepted={termsAccepted}
            />
          )}

          {currentStep === "payment" && createdBookingId && (
            <>
              {paymentError && (
                <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                  {paymentError}
                </div>
              )}
              <PaymentForm
                bookingId={createdBookingId}
                amount={totalPrice}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                isProcessing={isPaymentProcessing || isConfirmingBooking}
                setIsProcessing={setIsPaymentProcessing}
              />
            </>
          )}

          {currentStep === "confirmation" && selectedSlot && (
            <ConfirmationScreen
              bookingId={createdBookingId?.toString() || "Unknown"}
              tourTitle={tourConfig?.title || "Zurich Old Town Tour"}
              date={selectedSlot.date}
              startTime={selectedSlot.startTime}
              endTime={selectedSlot.endTime}
              participantCount={participantCount}
              totalPrice={totalPrice}
              customerName={customerData.name}
              customerEmail={customerData.email}
              meetingPoint={
                tourConfig?.meetingPoint
                  ? {
                      name: tourConfig.meetingPoint.name,
                      address: tourConfig.meetingPoint.address,
                      instructions: tourConfig.meetingPoint.instructions,
                    }
                  : undefined
              }
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer */}
        {currentStep !== "payment" && currentStep !== "confirmation" && (
          <div className="p-6 border-t border-app-border bg-white flex-shrink-0">
            <button
              onClick={handleNext}
              disabled={!canProceed() || isCreatingBooking}
              className={`
                w-full py-4 font-semibold rounded-2xl transition-all duration-200
                flex items-center justify-center gap-2
                ${
                  canProceed() && !isCreatingBooking
                    ? "bg-app-accent-500 text-white hover:bg-app-accent-600"
                    : "bg-app-bg-secondary text-app-text-tertiary cursor-not-allowed"
                }
              `}
            >
              {isCreatingBooking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Booking...
                </>
              ) : currentStep === "summary" ? (
                "Continue to Payment"
              ) : (
                "Continue"
              )}
            </button>

            {currentStep === "summary" && (
              <p className="text-center text-xs text-app-text-tertiary mt-3">
                Secure payment powered by Stripe
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
