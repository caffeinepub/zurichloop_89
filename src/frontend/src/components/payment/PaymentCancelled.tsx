import React from "react";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useBooking, useCancelBooking } from "../../hooks/useQueries";

interface PaymentCancelledProps {
  bookingId: number;
  onRetryPayment?: (bookingId: number) => void;
  onBackToHome?: () => void;
}

export const PaymentCancelled: React.FC<PaymentCancelledProps> = ({
  bookingId,
  onRetryPayment,
  onBackToHome,
}) => {
  const { data: booking } = useBooking(bookingId);
  const cancelMutation = useCancelBooking();

  const handleCancelBooking = async () => {
    try {
      await cancelMutation.mutateAsync(bookingId);
      onBackToHome?.();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const formatPrice = (cents: number) => `CHF ${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Cancelled Icon */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-amber-500" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-bold text-app-text-primary mb-3">
          Payment Cancelled
        </h1>
        <p className="text-app-text-secondary mb-8">
          Your payment was not completed. Your booking is still reserved but
          will expire soon if not paid.
        </p>

        {/* Booking Info */}
        {booking && (
          <div className="bg-white rounded-xl p-4 mb-8 border border-app-border text-left">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-app-text-tertiary">
                  Booking #{bookingId}
                </p>
                <p className="font-medium text-app-text-primary">
                  {booking.participantCount}{" "}
                  {booking.participantCount === 1
                    ? "participant"
                    : "participants"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-app-text-tertiary">Total</p>
                <p className="font-bold text-app-text-primary">
                  {formatPrice(booking.totalPrice)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {onRetryPayment && (
            <button
              onClick={() => onRetryPayment(bookingId)}
              className="w-full px-6 py-4 bg-app-accent-500 text-white font-semibold rounded-2xl hover:bg-app-accent-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Payment Again
            </button>
          )}

          <button
            onClick={handleCancelBooking}
            disabled={cancelMutation.isPending}
            className="w-full px-6 py-3 border border-rose-300 text-rose-600 font-medium rounded-xl hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
          </button>

          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full px-6 py-3 text-app-text-secondary font-medium rounded-xl hover:bg-app-bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-app-text-tertiary">
          If you continue to have issues, please contact us for assistance.
        </p>
      </div>
    </div>
  );
};
