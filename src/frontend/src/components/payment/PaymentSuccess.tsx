import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  MapPin,
  Clock,
  Mail,
} from "lucide-react";
import {
  useVerifyAndConfirmBooking,
  useBooking,
  useTimeSlot,
  useSendConfirmationEmail,
} from "../../hooks/useQueries";
import { useActor } from "../../hooks/useActor";

interface PaymentSuccessProps {
  sessionId: string;
  bookingId: number;
  onViewBooking?: () => void;
  onBackToHome?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  sessionId,
  bookingId,
  onViewBooking,
  onBackToHome,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [emailStatus, setEmailStatus] = useState<
    "pending" | "sending" | "sent" | "failed"
  >("pending");
  const hasStartedVerification = useRef(false);

  const { actor } = useActor();
  const verifyMutation = useVerifyAndConfirmBooking();
  const sendEmailMutation = useSendConfirmationEmail();
  const { data: booking, refetch: refetchBooking } = useBooking(bookingId);
  const { data: timeSlot } = useTimeSlot(booking?.timeSlotId ?? null);

  useEffect(() => {
    // Prevent navigation during verification
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (verificationStatus === "verifying") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [verificationStatus]);

  useEffect(() => {
    // Wait for the actor to be available before verifying
    if (!actor || hasStartedVerification.current) return;
    hasStartedVerification.current = true;

    const verifyPayment = async () => {
      try {
        await verifyMutation.mutateAsync({ sessionId, bookingId });
        setVerificationStatus("success");
        refetchBooking();

        // Send confirmation email (non-blocking)
        setEmailStatus("sending");
        try {
          await sendEmailMutation.mutateAsync(bookingId);
          setEmailStatus("sent");
        } catch (emailError) {
          // Email failure shouldn't block the success flow
          console.error("Failed to send confirmation email:", emailError);
          setEmailStatus("failed");
        }
      } catch (error) {
        setVerificationStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed",
        );
      }
    };

    verifyPayment();
  }, [actor, sessionId, bookingId]);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (cents: number) => `CHF ${(cents / 100).toFixed(2)}`;

  if (verificationStatus === "verifying") {
    return (
      <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-app-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-app-accent-500 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-app-text-primary mb-3">
            Verifying Your Payment
          </h1>
          <p className="text-app-text-secondary">
            Please wait while we confirm your booking. Do not close this window.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-app-text-primary mb-3">
            Verification Failed
          </h1>
          <p className="text-app-text-secondary mb-6">
            {errorMessage ||
              "We could not verify your payment. Please contact support."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-app-accent-500 text-white font-medium rounded-xl hover:bg-app-accent-600 transition-colors"
            >
              Try Again
            </button>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="w-full px-6 py-3 border border-app-border text-app-text-primary font-medium rounded-xl hover:bg-app-bg-secondary transition-colors"
              >
                Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-app-text-primary mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-app-text-secondary">
            Your tour has been booked successfully.
            {emailStatus === "sending" && (
              <span className="flex items-center justify-center gap-2 mt-2 text-app-text-tertiary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending confirmation email...
              </span>
            )}
            {emailStatus === "sent" && (
              <span className="block mt-2">
                A confirmation email has been sent to{" "}
                <span className="font-medium text-app-text-primary">
                  {booking?.customerEmail}
                </span>
              </span>
            )}
            {emailStatus === "failed" && (
              <span className="flex items-center justify-center gap-2 mt-2 text-amber-600">
                <Mail className="w-4 h-4" />
                Email could not be sent. Please save your booking reference.
              </span>
            )}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-app-border">
            <div>
              <p className="text-sm text-app-text-tertiary">
                Booking Reference
              </p>
              <p className="text-lg font-bold text-app-text-primary">
                #{bookingId}
              </p>
            </div>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
              Confirmed
            </div>
          </div>

          <div className="space-y-4">
            {/* Date */}
            {timeSlot && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-app-accent-500 mt-0.5" />
                <div>
                  <p className="text-sm text-app-text-tertiary">Date</p>
                  <p className="font-medium text-app-text-primary">
                    {formatDate(timeSlot.date)}
                  </p>
                </div>
              </div>
            )}

            {/* Time */}
            {timeSlot && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-app-accent-500 mt-0.5" />
                <div>
                  <p className="text-sm text-app-text-tertiary">Time</p>
                  <p className="font-medium text-app-text-primary">
                    {formatTime(timeSlot.startTime)} -{" "}
                    {formatTime(timeSlot.endTime)}
                  </p>
                </div>
              </div>
            )}

            {/* Participants */}
            {booking && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-app-accent-500 mt-0.5" />
                <div>
                  <p className="text-sm text-app-text-tertiary">Participants</p>
                  <p className="font-medium text-app-text-primary">
                    {booking.participantCount}{" "}
                    {booking.participantCount === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>
            )}

            {/* Total */}
            {booking && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-app-accent-500 mt-0.5 flex items-center justify-center font-bold text-sm">
                  CHF
                </div>
                <div>
                  <p className="text-sm text-app-text-tertiary">Total Paid</p>
                  <p className="font-medium text-app-text-primary">
                    {formatPrice(booking.totalPrice)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Point Card */}
        <div className="bg-amber-50 rounded-2xl p-6 mb-6 border border-amber-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 mb-1">Meeting Point</p>
              <p className="text-sm text-amber-700">
                Please arrive 10 minutes before the tour start time. Our guide
                will meet you at the designated meeting point.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full px-6 py-4 bg-app-accent-500 text-white font-semibold rounded-2xl hover:bg-app-accent-600 transition-colors"
            >
              Back to Home
            </button>
          )}
          {onViewBooking && (
            <button
              onClick={onViewBooking}
              className="w-full px-6 py-3 border border-app-border text-app-text-primary font-medium rounded-xl hover:bg-app-bg-secondary transition-colors"
            >
              View Booking Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
