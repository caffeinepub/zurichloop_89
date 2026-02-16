import React from "react";
import { Clock, Users } from "lucide-react";

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId: number | null;
  onSelectSlot: (slotId: number) => void;
  participantCount: number;
  isLoading?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  participantCount,
  isLoading = false,
}) => {
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailability = (slot: TimeSlot): number => {
    return slot.maxCapacity - slot.bookedCount;
  };

  const canBook = (slot: TimeSlot): boolean => {
    return getAvailability(slot) >= participantCount;
  };

  const getAvailabilityColor = (slot: TimeSlot) => {
    const available = getAvailability(slot);
    const percentage = available / slot.maxCapacity;

    if (percentage <= 0.2) return "text-rose-500";
    if (percentage <= 0.5) return "text-amber-500";
    return "text-emerald-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-app-bg-secondary rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-app-text-tertiary mx-auto mb-3" />
        <p className="text-app-text-secondary font-medium">
          No tours available
        </p>
        <p className="text-sm text-app-text-tertiary mt-1">
          Please select a different date
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {slots.map((slot) => {
        const available = getAvailability(slot);
        const bookable = canBook(slot);
        const isSelected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            onClick={() => bookable && onSelectSlot(slot.id)}
            disabled={!bookable}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all duration-200
              ${
                isSelected
                  ? "border-app-accent-500 bg-app-accent-50 shadow-lg shadow-app-accent-500/10"
                  : bookable
                    ? "border-app-border hover:border-app-accent-300 hover:bg-app-bg-secondary"
                    : "border-app-border bg-app-bg-secondary opacity-60 cursor-not-allowed"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? "bg-app-accent-500 text-white" : "bg-app-bg-primary text-app-text-tertiary"}
                  `}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`font-semibold ${isSelected ? "text-app-accent-600" : "text-app-text-primary"}`}
                  >
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </p>
                  <p className="text-xs text-app-text-tertiary mt-0.5">
                    Tour duration: 2.5 hours
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`flex items-center gap-1 ${getAvailabilityColor(slot)}`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium text-sm">{available} left</span>
                </div>
                {!bookable && participantCount > available && (
                  <p className="text-xs text-rose-500 mt-0.5">
                    Not enough spots
                  </p>
                )}
              </div>
            </div>

            {/* Availability Bar */}
            <div className="mt-3 h-1.5 bg-app-bg-primary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSelected ? "bg-app-accent-500" : "bg-app-accent-300"
                }`}
                style={{ width: `${(available / slot.maxCapacity) * 100}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};
