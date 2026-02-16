import React, { useState } from "react";
import { HeroSection } from "./tour/HeroSection";
import { TourDetails } from "./tour/TourDetails";
import { PhotoGallery } from "./tour/PhotoGallery";
import { MeetingPoint } from "./tour/MeetingPoint";
import { BookingModal } from "./booking/BookingModal";

interface TourPageProps {
  onAdminLogin?: () => void;
}

export const TourPage: React.FC<TourPageProps> = ({ onAdminLogin }) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookNow = () => {
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <div className="min-h-screen">
      <HeroSection onBookNow={handleBookNow} />
      <TourDetails onBookNow={handleBookNow} />
      <PhotoGallery />
      <MeetingPoint />

      {/* Floating Admin Login */}
      {onAdminLogin && (
        <button
          onClick={onAdminLogin}
          className="fixed bottom-6 right-6 px-5 py-2.5 text-sm font-medium text-white bg-app-accent-500 hover:bg-app-accent-600 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Admin
        </button>
      )}

      {/* Booking Modal */}
      <BookingModal isOpen={isBookingOpen} onClose={handleCloseBooking} />
    </div>
  );
};
