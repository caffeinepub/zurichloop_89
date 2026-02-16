import React, { useMemo } from "react";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  useBookingStats,
  useUpcomingBookings,
  useTourConfig,
} from "../../hooks/useQueries";

interface DashboardProps {
  onNavigate: (page: "calendar" | "bookings" | "settings") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { data: stats, isLoading: statsLoading } = useBookingStats();
  const { data: upcomingBookings, isLoading: bookingsLoading } =
    useUpcomingBookings();
  const { data: tourConfig } = useTourConfig();

  // Get today's bookings
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todaysBookings = useMemo(() => {
    if (!upcomingBookings) return [];
    return upcomingBookings
      .filter((booking) => {
        // We'd need slot data to get the date, for now show first 3 confirmed
        return booking.status === "confirmed";
      })
      .slice(0, 3);
  }, [upcomingBookings]);

  const formatPrice = (cents: number): string => {
    return `CHF ${(cents / 100).toLocaleString("en-CH", { minimumFractionDigits: 0 })}`;
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    loading,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    loading?: boolean;
  }) => (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-app-text-tertiary mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-app-bg-secondary rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-app-text-primary">{value}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text-primary">Dashboard</h1>
        <p className="text-app-text-secondary mt-1">
          Overview of your tour business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={<Calendar className="w-6 h-6 text-app-accent-600" />}
          color="bg-app-accent-100"
          loading={statsLoading}
        />
        <StatCard
          title="Upcoming Tours"
          value={stats?.upcomingBookings ?? 0}
          icon={<Clock className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-100"
          loading={statsLoading}
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenue ?? 0)}
          icon={<DollarSign className="w-6 h-6 text-amber-600" />}
          color="bg-amber-100"
          loading={statsLoading}
        />
        <StatCard
          title="Avg. Group Size"
          value={stats?.averageParticipants?.toFixed(1) ?? "0"}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-app-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate("calendar")}
              className="w-full bg-white rounded-xl shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left"
            >
              <div className="w-10 h-10 bg-app-accent-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-app-accent-600" />
              </div>
              <div>
                <p className="font-medium text-app-text-primary">
                  Add Time Slot
                </p>
                <p className="text-sm text-app-text-tertiary">
                  Create new tour schedule
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate("bookings")}
              className="w-full bg-white rounded-xl shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-app-text-primary">
                  View Bookings
                </p>
                <p className="text-sm text-app-text-tertiary">
                  Manage reservations
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className="w-full bg-white rounded-xl shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow text-left"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-app-text-primary">
                  Update Pricing
                </p>
                <p className="text-sm text-app-text-tertiary">
                  Current:{" "}
                  {tourConfig?.price
                    ? formatPrice(Number(tourConfig.price))
                    : "CHF 35"}
                  /person
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-app-text-primary">
              Recent Bookings
            </h2>
            <button
              onClick={() => onNavigate("bookings")}
              className="text-sm text-app-accent-500 hover:text-app-accent-600 font-medium"
            >
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            {bookingsLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-app-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : !upcomingBookings || upcomingBookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-app-text-tertiary mx-auto mb-3" />
                <p className="text-app-text-secondary font-medium">
                  No bookings yet
                </p>
                <p className="text-sm text-app-text-tertiary mt-1">
                  Bookings will appear here once customers make reservations
                </p>
              </div>
            ) : (
              <div className="divide-y divide-app-border">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 hover:bg-app-bg-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
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
                          <p className="text-sm text-app-text-tertiary">
                            {booking.participantCount}{" "}
                            {booking.participantCount === 1
                              ? "person"
                              : "people"}{" "}
                            • {formatPrice(booking.totalPrice)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={booking.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-app-text-primary mb-4">
          Booking Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Confirmed</p>
              <p className="text-xl font-bold text-app-text-primary">
                {stats?.upcomingBookings ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Pending</p>
              <p className="text-xl font-bold text-app-text-primary">0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-app-accent-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-app-accent-600" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Completed</p>
              <p className="text-xl font-bold text-app-text-primary">
                {stats?.completedBookings ?? 0}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-app-text-tertiary">Cancelled</p>
              <p className="text-xl font-bold text-app-text-primary">
                {stats?.cancelledBookings ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
    confirmed: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      label: "Confirmed",
    },
    completed: {
      bg: "bg-app-accent-100",
      text: "text-app-accent-700",
      label: "Completed",
    },
    cancelled: { bg: "bg-rose-100", text: "text-rose-700", label: "Cancelled" },
  }[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};
