import React from "react";

type SkeletonProps = React.ComponentProps<"div"> & {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-app-bg-secondary rounded ${className}`}
      {...props}
    />
  );
};

// Calendar skeleton
export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-40 h-6 rounded" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-6 rounded" />
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
};

// Time slots skeleton
export const TimeSlotsSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border border-app-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-32 h-5 rounded" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          <Skeleton className="w-full h-1.5 rounded-full mt-3" />
        </div>
      ))}
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-16 h-8 rounded" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </div>
  );
};

// Booking row skeleton
export const BookingRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-app-border">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-40 h-3 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-4 rounded" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
    </div>
  );
};

// Tour details skeleton
export const TourDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Skeleton className="w-full h-64 rounded-2xl" />

      {/* Title and info */}
      <div className="space-y-3">
        <Skeleton className="w-3/4 h-8 rounded" />
        <Skeleton className="w-1/2 h-5 rounded" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-2/3 h-4 rounded" />
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

// Form field skeleton
export const FormFieldSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="w-24 h-4 rounded" />
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  );
};

// Modal skeleton
export const ModalSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="w-3/4 h-6 rounded mx-auto" />
      <div className="space-y-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
      <Skeleton className="w-full h-12 rounded-xl" />
    </div>
  );
};
