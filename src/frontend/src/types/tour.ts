// Tour configuration and details types

// Main tour information
export interface Tour {
  title: string;
  subtitle: string;
  description: string;
  duration: number; // Duration in minutes
  price: number; // Price per person in cents
  maxCapacity: number;
  photos: TourPhoto[];
  highlights: string[];
  included: string[];
  meetingPoint: MeetingPoint;
  isActive: boolean;
}

// Tour photo with metadata
export interface TourPhoto {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

// Tour settings for admin configuration
export interface TourSettings {
  price: number; // Price per person in cents
  maxCapacity: number;
  isActive: boolean;
  duration: number;
}

// Meeting point information
export interface MeetingPoint {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  instructions: string;
  landmark?: string;
}

// Tour preview for cards and listings
export interface TourPreview {
  title: string;
  subtitle: string;
  price: number;
  duration: number;
  primaryPhoto?: string;
  highlightCount: number;
}
