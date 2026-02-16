import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  Users,
  Mail,
  Phone,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  useAllBookings,
  useCancelBooking,
  useCompleteBooking,
  useTimeSlot,
} from "../../hooks/useQueries";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export const BookingsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null,
  );

  const { data: bookings, isLoading } = useAllBookings();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();
  const { mutate: completeBooking, isPending: isCompleting } =
    useCompleteBooking();

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    return bookings.filter((booking) => {
      // Status filter
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerEmail.toLowerCase().includes(query) ||
          booking.id.toString().includes(query)
        );
      }

      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  const formatPrice = (cents: number): string => {
    return `CHF ${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCancel = (bookingId: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      cancelBooking(bookingId);
    }
  };

  const handleComplete = (bookingId: number) => {
    if (confirm("Mark this booking as completed?")) {
      completeBooking(bookingId);
    }
  };

  const statusCounts = useMemo(() => {
    if (!bookings)
      return { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text-primary">Bookings</h1>
        <p className="text-app-text-secondary mt-1">
          Manage customer reservations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or booking ID..."
              className="w-full pl-12 pr-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none pl-4 pr-10 py-3 border border-app-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="confirmed">
                Confirmed ({statusCounts.confirmed})
              </option>
              <option value="completed">
                Completed ({statusCounts.completed})
              </option>
              <option value="cancelled">
                Cancelled ({statusCounts.cancelled})
              </option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-tertiary pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-2xl shadow-card">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-app-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-app-text-tertiary mx-auto mb-3" />
            <p className="text-app-text-secondary font-medium">
              No bookings found
            </p>
            <p className="text-sm text-app-text-tertiary mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Bookings will appear here once customers make reservations"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-app-bg-primary">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-app-text-tertiary">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-app-text-tertiary">
                    Details
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-app-text-tertiary">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-app-text-tertiary">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-app-text-tertiary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filteredBookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onCancel={() => handleCancel(booking.id)}
                    onComplete={() => handleComplete(booking.id)}
                    isSelected={selectedBookingId === booking.id}
                    onSelect={() =>
                      setSelectedBookingId(
                        selectedBookingId === booking.id ? null : booking.id,
                      )
                    }
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface BookingRowProps {
  booking: {
    id: number;
    timeSlotId: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    participantCount: number;
    totalPrice: number;
    status: string;
    paymentStatus: string;
    specialRequests?: string;
    createdAt: number;
  };
  onCancel: () => void;
  onComplete: () => void;
  isSelected: boolean;
  onSelect: () => void;
  formatPrice: (cents: number) => string;
  formatDate: (timestamp: number) => string;
}

const BookingRow: React.FC<BookingRowProps> = ({
  booking,
  onCancel,
  onComplete,
  isSelected,
  onSelect,
  formatPrice,
  formatDate,
}) => {
  const [showActions, setShowActions] = useState(false);
  const { data: timeSlot } = useTimeSlot(booking.timeSlotId);

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
      confirmed: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: CheckCircle2,
      },
      completed: {
        bg: "bg-app-accent-100",
        text: "text-app-accent-700",
        icon: CheckCircle2,
      },
      cancelled: { bg: "bg-rose-100", text: "text-rose-700", icon: XCircle },
    }[status] || { bg: "bg-gray-100", text: "text-gray-700", icon: Clock };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <tr
      className={`hover:bg-app-bg-primary/50 transition-colors ${isSelected ? "bg-app-accent-50" : ""}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-app-bg-secondary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-app-text-primary">
              {booking.customerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-app-text-primary">
              {booking.customerName}
            </p>
            <div className="flex items-center gap-2 text-sm text-app-text-tertiary">
              <Mail className="w-3.5 h-3.5" />
              <span>{booking.customerEmail}</span>
            </div>
            {booking.customerPhone && (
              <div className="flex items-center gap-2 text-sm text-app-text-tertiary">
                <Phone className="w-3.5 h-3.5" />
                <span>{booking.customerPhone}</span>
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          {timeSlot ? (
            <>
              <p className="text-sm text-app-text-primary">
                {new Date(timeSlot.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-app-text-secondary">
                {formatTime(timeSlot.startTime)} -{" "}
                {formatTime(timeSlot.endTime)}
              </p>
            </>
          ) : (
            <p className="text-sm text-app-text-tertiary">Loading...</p>
          )}
          <div className="flex items-center gap-1 text-sm text-app-text-secondary">
            <Users className="w-3.5 h-3.5" />
            <span>
              {booking.participantCount}{" "}
              {booking.participantCount === 1 ? "person" : "people"}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold text-app-text-primary">
          {formatPrice(booking.totalPrice)}
        </p>
        <p className="text-xs text-app-text-tertiary">
          Booked {formatDate(booking.createdAt)}
        </p>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="relative inline-block">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-app-bg-secondary rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-app-text-tertiary" />
          </button>

          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-app-border py-1 z-20">
                <button
                  onClick={() => {
                    onSelect();
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-app-bg-secondary transition-colors"
                >
                  View Details
                </button>
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => {
                      onComplete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    Mark Complete
                  </button>
                )}
                {(booking.status === "pending" ||
                  booking.status === "confirmed") && (
                  <button
                    onClick={() => {
                      onCancel();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
