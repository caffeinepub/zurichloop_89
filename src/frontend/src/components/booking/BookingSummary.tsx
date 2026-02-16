import React from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Check,
  AlertCircle,
} from "lucide-react";

interface TimeSlotInfo {
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingSummaryProps {
  tourTitle: string;
  timeSlot: TimeSlotInfo;
  participantCount: number;
  pricePerPerson: number; // in cents
  customerName: string;
  customerEmail: string;
  meetingPoint?: string;
  onAcceptTerms: (accepted: boolean) => void;
  termsAccepted: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  tourTitle,
  timeSlot,
  participantCount,
  pricePerPerson,
  customerName,
  customerEmail,
  meetingPoint,
  onAcceptTerms,
  termsAccepted,
}) => {
  const formatDate = (dateStr: string): string => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (cents: number): string => {
    return `CHF ${(cents / 100).toFixed(2)}`;
  };

  const totalPrice = participantCount * pricePerPerson;

  return (
    <div className="space-y-6">
      {/* Tour Info Card */}
      <div className="bg-gradient-to-br from-app-accent-50 to-white rounded-2xl p-5 border border-app-accent-100">
        <h3 className="font-bold text-app-text-primary mb-4">{tourTitle}</h3>

        <div className="space-y-3">
          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Calendar className="w-4 h-4 text-app-accent-500" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Date</p>
              <p className="font-medium text-app-text-primary">
                {formatDate(timeSlot.date)}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Clock className="w-4 h-4 text-app-accent-500" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Time</p>
              <p className="font-medium text-app-text-primary">
                {formatTime(timeSlot.startTime)} -{" "}
                {formatTime(timeSlot.endTime)}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <Users className="w-4 h-4 text-app-accent-500" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Participants</p>
              <p className="font-medium text-app-text-primary">
                {participantCount}{" "}
                {participantCount === 1 ? "person" : "people"}
              </p>
            </div>
          </div>

          {/* Meeting Point */}
          {meetingPoint && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <MapPin className="w-4 h-4 text-app-accent-500" />
              </div>
              <div>
                <p className="text-sm text-app-text-tertiary">Meeting Point</p>
                <p className="font-medium text-app-text-primary">
                  {meetingPoint}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-app-bg-primary rounded-xl p-4">
        <h4 className="text-sm font-medium text-app-text-tertiary mb-2">
          Booking for
        </h4>
        <p className="font-medium text-app-text-primary">{customerName}</p>
        <p className="text-sm text-app-text-secondary">{customerEmail}</p>
      </div>

      {/* Price Breakdown */}
      <div className="border border-app-border rounded-xl overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-app-text-secondary">
            <span>
              Tour price ({participantCount} × {formatPrice(pricePerPerson)})
            </span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
        <div className="p-4 bg-app-bg-primary border-t border-app-border">
          <div className="flex items-center justify-between">
            <span className="font-bold text-app-text-primary">Total</span>
            <span className="text-2xl font-bold text-app-accent-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onAcceptTerms(e.target.checked)}
            className="sr-only peer"
          />
          <div
            className={`
            w-5 h-5 rounded border-2 flex items-center justify-center
            transition-all duration-200
            ${
              termsAccepted
                ? "bg-app-accent-500 border-app-accent-500"
                : "border-app-border group-hover:border-app-accent-300"
            }
          `}
          >
            {termsAccepted && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        <span className="text-sm text-app-text-secondary leading-relaxed">
          I agree to the{" "}
          <button
            type="button"
            className="text-app-accent-500 hover:text-app-accent-600 underline"
          >
            terms and conditions
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-app-accent-500 hover:text-app-accent-600 underline"
          >
            cancellation policy
          </button>
        </span>
      </label>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">Free cancellation</p>
          <p className="text-amber-700 mt-0.5">
            Cancel up to 24 hours before the tour for a full refund
          </p>
        </div>
      </div>
    </div>
  );
};
