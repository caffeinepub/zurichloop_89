import React from "react";
import {
  Clock,
  Users,
  MapPin,
  Check,
  Compass,
  Camera,
  Coffee,
} from "lucide-react";

interface TourDetailsProps {
  onBookNow: () => void;
}

export const TourDetails: React.FC<TourDetailsProps> = ({ onBookNow }) => {
  const highlights = [
    "Explore the medieval Altstadt (Old Town)",
    "Visit the iconic Grossmünster cathedral",
    "Walk along the scenic Limmat River",
    "Discover hidden courtyards and guild houses",
    "Learn about Zurich's rich banking history",
    "See the famous Bahnhofstrasse shopping street",
  ];

  const included = [
    "Expert local guide",
    "Walking tour of key landmarks",
    "Historical insights and stories",
    "Small group experience (max 12)",
    "Photo opportunities at scenic spots",
    "Local recommendations for food & drinks",
  ];

  const features = [
    {
      icon: Clock,
      title: "2.5 Hours",
      description: "Perfect duration",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Users,
      title: "Small Groups",
      description: "Max 12 people",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: Compass,
      title: "Expert Guides",
      description: "Local knowledge",
      color: "from-amber-400 to-orange-500",
    },
    {
      icon: Camera,
      title: "Photo Stops",
      description: "Scenic spots",
      color: "from-rose-400 to-pink-500",
    },
  ];

  return (
    <section id="tour" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-app-accent-50 text-app-accent-600 text-sm font-medium rounded-full mb-4">
            About The Tour
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-app-text-primary mb-4">
            Experience Zurich Like a Local
          </h2>
          <p className="text-lg text-app-text-secondary max-w-2xl mx-auto">
            Uncover centuries of history, culture, and hidden treasures as you
            walk through one of Europe's most beautiful cities.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-app-bg-primary rounded-2xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div
                className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-app-text-primary mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-app-text-tertiary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Description */}
          <div>
            <h3 className="text-2xl font-bold text-app-text-primary mb-6">
              Your Journey Through Time
            </h3>
            <div className="prose prose-lg text-app-text-secondary">
              <p className="mb-4">
                Step into the enchanting world of Zurich's Old Town, where every
                cobblestone tells a story. Our carefully curated walking tour
                takes you through narrow medieval alleyways, past centuries-old
                guild houses, and along the picturesque banks of the Limmat
                River.
              </p>
              <p className="mb-4">
                Your expert local guide will bring history to life with
                fascinating tales of the Swiss Reformation, the city's
                transformation into a global financial hub, and the famous
                personalities who called Zurich home—from Zwingli to Einstein.
              </p>
              <p>
                Whether you're a history enthusiast, a photography lover, or
                simply curious about Swiss culture, this tour offers an intimate
                glimpse into what makes Zurich truly special.
              </p>
            </div>

            {/* Highlights */}
            <div id="highlights" className="mt-10">
              <h4 className="text-lg font-bold text-app-text-primary mb-4 flex items-center gap-2">
                <Compass className="w-5 h-5 text-app-accent-500" />
                Tour Highlights
              </h4>
              <ul className="space-y-3">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-app-accent-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-app-accent-600" />
                    </span>
                    <span className="text-app-text-secondary">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - What's Included + Booking Card */}
          <div>
            {/* What's Included */}
            <div
              id="details"
              className="bg-app-bg-primary rounded-3xl p-8 mb-8"
            >
              <h4 className="text-lg font-bold text-app-text-primary mb-6 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-app-accent-500" />
                What's Included
              </h4>
              <ul className="space-y-4">
                {included.map((item, index) => (
                  <li key={index} className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-500" />
                    </span>
                    <span className="text-app-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Booking Card */}
            <div className="bg-gradient-to-br from-app-accent-500 to-app-accent-600 rounded-3xl p-8 text-white">
              <p className="text-white/80 mb-6">
                Join us for an unforgettable journey through Zurich's history
                and culture.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-white/80" />
                  <span>Duration: 2.5 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-white/80" />
                  <span>Group size: Max 12 people</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-white/80" />
                  <span>Meeting: Zurich HB</span>
                </div>
              </div>

              <button
                onClick={onBookNow}
                className="w-full py-4 bg-white text-app-accent-600 font-bold rounded-2xl hover:bg-app-bg-primary transition-colors"
              >
                Book Your Spot
              </button>

              <p className="text-center text-white/60 text-sm mt-4">
                Free cancellation up to 24h before
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
