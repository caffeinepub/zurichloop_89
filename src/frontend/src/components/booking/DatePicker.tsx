import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  availableDates?: string[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onSelectDate,
  availableDates = [],
  currentMonth,
  onMonthChange,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysCount; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isAvailable = (date: Date): boolean => {
    if (date < today) return false;
    if (availableDates.length === 0) return date >= today;
    return availableDates.includes(formatDateString(date));
  };

  const isPast = (date: Date): boolean => {
    return date < today;
  };

  const isSelected = (date: Date): boolean => {
    return selectedDate === formatDateString(date);
  };

  const handlePrevMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    onMonthChange(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const canGoPrev =
    currentMonth.getFullYear() > today.getFullYear() ||
    (currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() > today.getMonth());

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-app-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-app-text-secondary" />
        </button>
        <h3 className="text-lg font-semibold text-app-text-primary">
          {monthName}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-app-bg-secondary transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-app-text-secondary" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-app-text-tertiary py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const available = isAvailable(date);
          const past = isPast(date);
          const selected = isSelected(date);
          const isToday = formatDateString(date) === formatDateString(today);

          return (
            <button
              key={formatDateString(date)}
              onClick={() => available && onSelectDate(formatDateString(date))}
              disabled={!available}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-medium
                transition-all duration-200
                ${
                  selected
                    ? "bg-app-accent-500 text-white shadow-lg shadow-app-accent-500/30"
                    : available
                      ? "hover:bg-app-accent-50 text-app-text-primary hover:text-app-accent-600"
                      : past
                        ? "text-app-text-tertiary/50 cursor-not-allowed"
                        : "text-app-text-tertiary cursor-not-allowed"
                }
                ${isToday && !selected ? "ring-2 ring-app-accent-200" : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-app-text-tertiary">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-app-accent-500" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded ring-2 ring-app-accent-200" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
