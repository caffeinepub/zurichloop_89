import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Trash2,
  Edit2,
  Calendar,
} from "lucide-react";
import { useAllSlots, useDeleteTimeSlot } from "../../hooks/useQueries";
import { SlotEditorModal } from "./SlotEditorModal";

export const CalendarManager: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<{
    id?: number;
    date: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
  } | null>(null);

  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteTimeSlot();

  // Get date range for the current month
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

  const { data: slots, isLoading } = useAllSlots(
    dateRange.startDate,
    dateRange.endDate,
  );

  // Group slots by date
  const slotsByDate = useMemo(() => {
    if (!slots) return new Map<string, typeof slots>();
    const map = new Map<string, typeof slots>();
    slots.forEach((slot) => {
      const existing = map.get(slot.date) || [];
      map.set(slot.date, [...existing, slot]);
    });
    return map;
  }, [slots]);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysCount = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysCount; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }, [currentMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
    setSelectedDate(null);
  };

  const handleDeleteSlot = (slotId: number) => {
    if (confirm("Are you sure you want to delete this time slot?")) {
      deleteSlot(slotId);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedDateSlots = selectedDate
    ? slotsByDate.get(selectedDate) || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-app-text-primary">
            Schedule Manager
          </h1>
          <p className="text-app-text-secondary mt-1">
            Create and manage tour time slots
          </p>
        </div>
        <button
          onClick={() =>
            setEditingSlot({
              date: selectedDate || formatDateString(new Date()),
              startTime: "09:00",
              endTime: "11:30",
              maxCapacity: 12,
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-app-bg-secondary transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-app-text-secondary" />
            </button>
            <h2 className="text-lg font-semibold text-app-text-primary">
              {monthName}
            </h2>
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
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-app-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <div key={`empty-${index}`} className="aspect-square" />
                  );
                }

                const dateStr = formatDateString(date);
                const daySlots = slotsByDate.get(dateStr) || [];
                const hasSlots = daySlots.length > 0;
                const isSelected = selectedDate === dateStr;
                const isPast = date < today;
                const isToday =
                  formatDateString(date) === formatDateString(today);

                const totalBooked = daySlots.reduce(
                  (sum, s) => sum + s.bookedCount,
                  0,
                );
                const totalCapacity = daySlots.reduce(
                  (sum, s) => sum + s.maxCapacity,
                  0,
                );

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-xl p-1 flex flex-col items-center justify-center
                      transition-all duration-200 relative
                      ${
                        isSelected
                          ? "bg-app-accent-500 text-white shadow-lg"
                          : isPast
                            ? "text-app-text-tertiary/50 cursor-not-allowed"
                            : "hover:bg-app-bg-secondary text-app-text-primary"
                      }
                      ${isToday && !isSelected ? "ring-2 ring-app-accent-200" : ""}
                    `}
                  >
                    <span className="text-sm font-medium">
                      {date.getDate()}
                    </span>
                    {hasSlots && !isPast && (
                      <div
                        className={`flex items-center gap-0.5 mt-0.5 ${isSelected ? "text-white/80" : "text-app-accent-500"}`}
                      >
                        <span className="text-[10px] font-medium">
                          {daySlots.length}
                        </span>
                        <Clock className="w-2.5 h-2.5" />
                      </div>
                    )}
                    {totalBooked > 0 && !isPast && (
                      <div
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          totalBooked >= totalCapacity
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-app-border text-xs text-app-text-tertiary">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-app-accent-500" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-app-accent-500" />
              <span>Has slots</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Has bookings</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-semibold text-app-text-primary mb-4">
            {selectedDate
              ? (() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  });
                })()
              : "Select a date"}
          </h3>

          {selectedDate ? (
            <>
              {selectedDateSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-app-text-tertiary mx-auto mb-3" />
                  <p className="text-app-text-secondary font-medium">
                    No time slots
                  </p>
                  <p className="text-sm text-app-text-tertiary mt-1">
                    Add a time slot for this date
                  </p>
                  <button
                    onClick={() =>
                      setEditingSlot({
                        date: selectedDate,
                        startTime: "09:00",
                        endTime: "11:30",
                        maxCapacity: 12,
                      })
                    }
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slot</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="border border-app-border rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-app-accent-500" />
                          <span className="font-medium text-app-text-primary">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setEditingSlot({
                                id: slot.id,
                                date: slot.date,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                maxCapacity: slot.maxCapacity,
                              })
                            }
                            className="p-1.5 hover:bg-app-bg-secondary rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-app-text-tertiary" />
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={slot.bookedCount > 0 || isDeleting}
                            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              slot.bookedCount > 0
                                ? "Cannot delete slot with bookings"
                                : "Delete slot"
                            }
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-app-text-secondary">
                        <Users className="w-4 h-4" />
                        <span>
                          {slot.bookedCount}/{slot.maxCapacity} booked
                        </span>
                        {slot.bookedCount >= slot.maxCapacity && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                            Full
                          </span>
                        )}
                      </div>
                      {/* Capacity bar */}
                      <div className="mt-2 h-1.5 bg-app-bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            slot.bookedCount >= slot.maxCapacity
                              ? "bg-rose-500"
                              : slot.bookedCount > 0
                                ? "bg-emerald-500"
                                : "bg-app-bg-tertiary"
                          }`}
                          style={{
                            width: `${(slot.bookedCount / slot.maxCapacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setEditingSlot({
                        date: selectedDate,
                        startTime: "14:00",
                        endTime: "16:30",
                        maxCapacity: 12,
                      })
                    }
                    className="w-full py-3 border-2 border-dashed border-app-border rounded-xl text-app-text-secondary hover:border-app-accent-300 hover:text-app-accent-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Another Slot</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-app-text-tertiary">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Click on a date to view or add time slots</p>
            </div>
          )}
        </div>
      </div>

      {/* Slot Editor Modal */}
      {editingSlot && (
        <SlotEditorModal
          slot={editingSlot}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  );
};
