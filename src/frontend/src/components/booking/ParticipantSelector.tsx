import React from "react";
import { Minus, Plus, Users } from "lucide-react";

interface ParticipantSelectorProps {
  value: number;
  onChange: (count: number) => void;
  min?: number;
  max: number;
  pricePerPerson: number; // in cents
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max,
  pricePerPerson,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const formatPrice = (cents: number): string => {
    return `CHF ${(cents / 100).toFixed(0)}`;
  };

  const totalPrice = value * pricePerPerson;
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="space-y-4">
      {/* Participant Counter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-app-bg-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-app-text-tertiary" />
          </div>
          <div>
            <p className="font-medium text-app-text-primary">Participants</p>
            <p className="text-xs text-app-text-tertiary">
              {max} spots available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={!canDecrement}
            className={`
              w-10 h-10 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${
                canDecrement
                  ? "border-app-border hover:border-app-accent-300 hover:bg-app-accent-50 text-app-text-primary"
                  : "border-app-border bg-app-bg-secondary text-app-text-tertiary cursor-not-allowed"
              }
            `}
            aria-label="Decrease participants"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-12 text-center text-2xl font-bold text-app-text-primary">
            {value}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={!canIncrement}
            className={`
              w-10 h-10 rounded-full border-2 flex items-center justify-center
              transition-all duration-200
              ${
                canIncrement
                  ? "border-app-border hover:border-app-accent-300 hover:bg-app-accent-50 text-app-text-primary"
                  : "border-app-border bg-app-bg-secondary text-app-text-tertiary cursor-not-allowed"
              }
            `}
            aria-label="Increase participants"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price Calculation */}
      <div className="p-4 bg-app-bg-primary rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-app-text-secondary">
            {value} × {formatPrice(pricePerPerson)}
          </span>
          <span className="text-lg font-bold text-app-text-primary">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <p className="text-xs text-app-text-tertiary">
          Free cancellation up to 24 hours before the tour
        </p>
      </div>

      {/* Warning if near capacity */}
      {max <= 3 && max > 0 && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Only {max} {max === 1 ? "spot" : "spots"} left!
          </span>
        </div>
      )}
    </div>
  );
};
