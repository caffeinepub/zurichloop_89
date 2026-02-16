import React, { useState } from "react";
import { X, Clock, Users, Calendar, Loader2 } from "lucide-react";
import { useCreateTimeSlot, useUpdateTimeSlot } from "../../hooks/useQueries";

interface SlotEditorModalProps {
  slot: {
    id?: number;
    date: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
  };
  onClose: () => void;
}

export const SlotEditorModal: React.FC<SlotEditorModalProps> = ({
  slot,
  onClose,
}) => {
  const isEditing = slot.id !== undefined;

  const [formData, setFormData] = useState({
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    maxCapacity: slot.maxCapacity,
  });

  const { mutate: createSlot, isPending: isCreating } = useCreateTimeSlot();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateTimeSlot();

  const isLoading = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && slot.id) {
      updateSlot(
        {
          slotId: slot.id,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxCapacity: formData.maxCapacity,
        },
        {
          onSuccess: () => onClose(),
          onError: (error) => alert(`Failed to update slot: ${error.message}`),
        },
      );
    } else {
      createSlot(
        {
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          maxCapacity: formData.maxCapacity,
        },
        {
          onSuccess: () => onClose(),
          onError: (error) => alert(`Failed to create slot: ${error.message}`),
        },
      );
    }
  };

  const formatDateDisplay = (dateStr: string): string => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center !mt-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-app-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-app-text-primary">
            {isEditing ? "Edit Time Slot" : "Add Time Slot"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-app-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
              required
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-app-text-tertiary">
              {formatDateDisplay(formData.date)}
            </p>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Maximum Capacity
            </label>
            <input
              type="number"
              value={formData.maxCapacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxCapacity: parseInt(e.target.value) || 1,
                })
              }
              min={1}
              max={50}
              required
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-app-text-tertiary">
              Maximum number of participants for this tour slot
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-sm font-medium text-app-text-primary mb-2">
              Quick Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    startTime: "09:00",
                    endTime: "11:30",
                  })
                }
                className="px-3 py-1.5 text-xs bg-app-bg-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
              >
                Morning (9:00 AM)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    startTime: "14:00",
                    endTime: "16:30",
                  })
                }
                className="px-3 py-1.5 text-xs bg-app-bg-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
              >
                Afternoon (2:00 PM)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    startTime: "17:00",
                    endTime: "19:30",
                  })
                }
                className="px-3 py-1.5 text-xs bg-app-bg-primary rounded-lg hover:bg-app-bg-secondary transition-colors"
              >
                Evening (5:00 PM)
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 border border-app-border rounded-xl text-app-text-secondary hover:bg-app-bg-secondary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Slot"
              ) : (
                "Create Slot"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
