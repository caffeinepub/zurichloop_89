import React from "react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  MapPin,
  Mail,
  Copy,
  Download,
  CalendarPlus,
  ExternalLink,
} from "lucide-react";

interface ConfirmationScreenProps {
  bookingId: string;
  tourTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  participantCount: number;
  totalPrice: number; // in cents
  customerName: string;
  customerEmail: string;
  meetingPoint?: {
    name: string;
    address: string;
    instructions?: string;
  };
  onClose: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  bookingId,
  tourTitle,
  date,
  startTime,
  endTime,
  participantCount,
  totalPrice,
  customerName,
  customerEmail,
  meetingPoint,
  onClose,
}) => {
  const formatDate = (dateStr: string): string => {
    const [y, m, day] = dateStr.split("-").map(Number);
    const d = new Date(y, m - 1, day);
    return d.toLocaleDateString("en-US", {
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

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
  };

  const handleAddToCalendar = () => {
    // Create ICS file content
    const [yr, mo, dy] = date.split("-").map(Number);
    const dateObj = new Date(yr, mo - 1, dy);
    const [startHours, startMinutes] = startTime.split(":");
    const [endHours, endMinutes] = endTime.split(":");

    dateObj.setHours(parseInt(startHours), parseInt(startMinutes), 0);
    const startISO =
      dateObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    dateObj.setHours(parseInt(endHours), parseInt(endMinutes), 0);
    const endISO =
      dateObj.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ZurichLoop//Tour Booking//EN",
      "BEGIN:VEVENT",
      `DTSTART:${startISO}`,
      `DTEND:${endISO}`,
      `SUMMARY:${tourTitle}`,
      `DESCRIPTION:Booking ID: ${bookingId}\\nParticipants: ${participantCount}`,
      meetingPoint
        ? `LOCATION:${meetingPoint.name}, ${meetingPoint.address}`
        : "",
      `UID:${bookingId}@zurichloop.com`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zurich-tour-${bookingId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-app-text-primary">
          Booking Confirmed!
        </h2>
        <p className="text-app-text-secondary mt-2">
          We've sent a confirmation email to{" "}
          <span className="font-medium">{customerEmail}</span>
        </p>
      </div>

      {/* Booking ID */}
      <div className="flex items-center justify-between p-4 bg-app-bg-primary rounded-xl">
        <div>
          <p className="text-sm text-app-text-tertiary">Booking Reference</p>
          <p className="font-mono font-bold text-app-text-primary">
            {bookingId}
          </p>
        </div>
        <button
          onClick={handleCopyBookingId}
          className="p-2 hover:bg-app-bg-secondary rounded-lg transition-colors"
          title="Copy booking ID"
        >
          <Copy className="w-5 h-5 text-app-text-tertiary" />
        </button>
      </div>

      {/* Booking Details Card */}
      <div className="border border-app-border rounded-2xl overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-app-accent-500 to-app-accent-600 text-white">
          <h3 className="font-bold text-lg">{tourTitle}</h3>
          <p className="text-white/80 mt-1">Booked by {customerName}</p>
        </div>

        <div className="p-5 space-y-4">
          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-app-bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-app-accent-500" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Date</p>
              <p className="font-medium text-app-text-primary">
                {formatDate(date)}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-app-bg-primary flex items-center justify-center">
              <Clock className="w-5 h-5 text-app-accent-500" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Time</p>
              <p className="font-medium text-app-text-primary">
                {formatTime(startTime)} - {formatTime(endTime)}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-app-bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-app-accent-500" />
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
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-app-bg-primary flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-app-accent-500" />
              </div>
              <div>
                <p className="text-sm text-app-text-tertiary">Meeting Point</p>
                <p className="font-medium text-app-text-primary">
                  {meetingPoint.name}
                </p>
                <p className="text-sm text-app-text-secondary">
                  {meetingPoint.address}
                </p>
                {meetingPoint.instructions && (
                  <p className="text-sm text-app-text-secondary mt-1 italic">
                    {meetingPoint.instructions}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Total Paid */}
        <div className="p-5 bg-app-bg-primary border-t border-app-border">
          <div className="flex items-center justify-between">
            <span className="text-app-text-secondary">Total Paid</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="p-4 bg-app-accent-50 rounded-xl border border-app-accent-100">
        <h4 className="font-semibold text-app-text-primary flex items-center gap-2">
          <Mail className="w-4 h-4 text-app-accent-500" />
          What's Next?
        </h4>
        <ul className="mt-3 space-y-2 text-sm text-app-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-app-accent-500 mt-0.5">•</span>
            <span>Check your email for the confirmation with all details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-app-accent-500 mt-0.5">•</span>
            <span>
              Arrive at the meeting point 10 minutes before the tour starts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-app-accent-500 mt-0.5">•</span>
            <span>
              Bring comfortable walking shoes and weather-appropriate clothing
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleAddToCalendar}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-app-border rounded-xl hover:border-app-accent-300 hover:bg-app-bg-secondary transition-colors text-app-text-primary"
        >
          <CalendarPlus className="w-5 h-5" />
          <span className="font-medium">Add to Calendar</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-app-border rounded-xl hover:border-app-accent-300 hover:bg-app-bg-secondary transition-colors text-app-text-primary"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Save / Print</span>
        </button>
      </div>

      {/* Google Maps Link */}
      {meetingPoint && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingPoint.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-app-bg-primary rounded-xl hover:bg-app-bg-secondary transition-colors text-app-text-secondary"
        >
          <MapPin className="w-5 h-5" />
          <span>Open in Google Maps</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full py-4 bg-app-accent-500 text-white font-semibold rounded-2xl hover:bg-app-accent-600 transition-colors"
      >
        Done
      </button>
    </div>
  );
};
