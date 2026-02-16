import React, { useState } from "react";
import {
  CreditCard,
  Lock,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  useCreateCheckoutSession,
  useStripeKeyStatus,
} from "../../hooks/useQueries";

interface PaymentFormProps {
  bookingId: number;
  amount: number; // in cents
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  onPaymentError,
  isProcessing,
  setIsProcessing,
}) => {
  const [error, setError] = useState<string | null>(null);
  const { data: stripeKeyStatus } = useStripeKeyStatus();
  const createCheckoutSession = useCreateCheckoutSession();

  const formatPrice = (cents: number): string => {
    return `CHF ${(cents / 100).toFixed(2)}`;
  };

  const handleStripeCheckout = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // Use current URL so Stripe redirects back to wherever the user is
      const currentUrl = window.location.href;
      const successUrl = currentUrl;
      const cancelUrl = currentUrl;

      // Create Stripe checkout session
      const { checkoutUrl } = await createCheckoutSession.mutateAsync({
        bookingId,
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initiate payment";
      setError(errorMessage);
      onPaymentError(errorMessage);
      setIsProcessing(false);
    }
  };

  // Check if Stripe is configured
  const isStripeConfigured = !!stripeKeyStatus;

  return (
    <div className="space-y-6">
      {/* Stripe Checkout Info */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-800">Secure Payment via Stripe</p>
          <p className="text-blue-700 mt-0.5">
            You will be redirected to Stripe's secure checkout page to complete
            your payment.
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-rose-800">Payment Error</p>
            <p className="text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Stripe Not Configured Warning */}
      {!isStripeConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">Payment Not Available</p>
            <p className="text-amber-700 mt-0.5">
              Stripe payment processing is not configured. Please contact the
              tour operator.
            </p>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="p-4 bg-app-bg-secondary rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-app-text-secondary">Total Amount</span>
          <span className="text-xl font-bold text-app-text-primary">
            {formatPrice(amount)}
          </span>
        </div>
      </div>

      {/* Pay Button */}
      <button
        type="button"
        onClick={handleStripeCheckout}
        disabled={isProcessing || !isStripeConfigured}
        className={`
          w-full py-4 font-semibold rounded-2xl transition-all duration-200
          flex items-center justify-center gap-2
          ${
            !isProcessing && isStripeConfigured
              ? "bg-app-accent-500 text-white hover:bg-app-accent-600"
              : "bg-app-accent-400 text-white cursor-not-allowed"
          }
        `}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirecting to Stripe...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay {formatPrice(amount)}
            <ExternalLink className="w-4 h-4 ml-1" />
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-app-text-tertiary">
        <Lock className="w-3.5 h-3.5" />
        <span>Secured by Stripe</span>
      </div>

      {/* Payment Methods */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-2 text-app-text-tertiary">
          <span className="text-xs">Accepted:</span>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-app-bg-secondary rounded text-xs font-medium">
              Visa
            </span>
            <span className="px-2 py-1 bg-app-bg-secondary rounded text-xs font-medium">
              Mastercard
            </span>
            <span className="px-2 py-1 bg-app-bg-secondary rounded text-xs font-medium">
              Amex
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
