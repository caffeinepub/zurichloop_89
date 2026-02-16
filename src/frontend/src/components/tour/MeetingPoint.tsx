import React from "react";
import {
  MapPin,
  Clock,
  AlertCircle,
  Navigation,
  Train,
  ExternalLink,
} from "lucide-react";

export const MeetingPoint: React.FC = () => {
  const meetingDetails = {
    name: "Zurich Main Station (Zürich HB)",
    address: "Bahnhofplatz 15, 8001 Zürich, Switzerland",
    exactLocation:
      "Meet at the statue of Alfred Escher in front of the main entrance",
    coordinates: { lat: 47.3775, lng: 8.5402 },
    instructions: [
      "Look for the large statue of Alfred Escher in Bahnhofplatz",
      "Your guide will be holding a blue ZurichLoop sign",
      "Please arrive 10 minutes before the tour starts",
      "Tours depart rain or shine - dress accordingly!",
    ],
    nearbyLandmarks: [
      "Main entrance of Zürich HB",
      "Bahnhofstrasse (famous shopping street)",
      "Tram stops for lines 3, 4, 6, 7, 10, 11, 13, 14, 15, 17",
    ],
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${meetingDetails.coordinates.lat},${meetingDetails.coordinates.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="meeting" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-app-accent-50 text-app-accent-600 text-sm font-medium rounded-full mb-4">
            Meeting Point
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-app-text-primary mb-4">
            Where We Meet
          </h2>
          <p className="text-lg text-app-text-secondary max-w-xl mx-auto">
            Easy to find, right in the heart of Zurich's main transportation
            hub.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Map Placeholder */}
          <div className="relative">
            <div className="aspect-square lg:aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden relative">
              {/* Grid pattern to simulate map */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Street lines simulation */}
              <div className="absolute inset-0">
                <div className="absolute top-1/2 left-0 right-0 h-8 bg-slate-300/60 transform -translate-y-1/2" />
                <div className="absolute top-0 bottom-0 left-1/2 w-8 bg-slate-300/60 transform -translate-x-1/2" />
                <div className="absolute top-1/3 left-1/4 right-1/4 h-4 bg-slate-300/40 transform rotate-12" />
              </div>

              {/* Location Pin */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full">
                <div className="relative animate-bounce">
                  <div className="w-12 h-12 bg-app-accent-500 rounded-full flex items-center justify-center shadow-lg shadow-app-accent-500/30">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-app-accent-500 rotate-45" />
                </div>
                {/* Pulse effect */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-app-accent-500/20 rounded-full animate-ping" />
              </div>

              {/* Station label */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-8 bg-white px-4 py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-app-accent-500" />
                  <span className="text-sm font-medium text-app-text-primary">
                    Zürich HB
                  </span>
                </div>
              </div>

              {/* Open in Maps button */}
              <button
                onClick={openGoogleMaps}
                className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Navigation className="w-4 h-4 text-app-accent-500" />
                <span className="text-sm font-medium text-app-text-primary">
                  Open in Maps
                </span>
                <ExternalLink className="w-3 h-3 text-app-text-tertiary" />
              </button>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-app-bg-primary rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-app-accent-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-app-accent-600" />
                </div>
                <div>
                  <h3 className="font-bold text-app-text-primary mb-1">
                    {meetingDetails.name}
                  </h3>
                  <p className="text-app-text-secondary text-sm">
                    {meetingDetails.address}
                  </p>
                  <p className="text-app-accent-600 font-medium text-sm mt-2">
                    {meetingDetails.exactLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Reminder Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 mb-1">
                    Arrive Early
                  </h3>
                  <p className="text-amber-800 text-sm">
                    Please arrive at least 10 minutes before your tour starts.
                    Late arrivals may miss the tour and won't be eligible for a
                    refund.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white border border-app-border rounded-2xl p-6">
              <h3 className="font-bold text-app-text-primary mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-app-accent-500" />
                How to Find Us
              </h3>
              <ul className="space-y-3">
                {meetingDetails.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-app-accent-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-app-accent-600">
                      {index + 1}
                    </span>
                    <span className="text-app-text-secondary text-sm">
                      {instruction}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nearby Landmarks */}
            <div className="bg-app-bg-secondary rounded-2xl p-6">
              <h4 className="font-medium text-app-text-primary mb-3">
                Nearby Landmarks
              </h4>
              <div className="flex flex-wrap gap-2">
                {meetingDetails.nearbyLandmarks.map((landmark, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-white rounded-full text-sm text-app-text-secondary"
                  >
                    {landmark}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
