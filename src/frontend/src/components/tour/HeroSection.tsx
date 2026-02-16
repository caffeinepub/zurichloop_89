import React from "react";
import {
  MapPin,
  Clock,
  Users,
  Star,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface HeroSectionProps {
  onBookNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow }) => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-app-accent-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-app-text-primary">
              ZurichLoop
            </span>
          </div>

          {/* Nav Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#tour"
              className="text-app-text-secondary hover:text-app-text-primary transition-colors"
            >
              The Tour
            </a>
            <a
              href="#highlights"
              className="text-app-text-secondary hover:text-app-text-primary transition-colors"
            >
              Highlights
            </a>
            <a
              href="#details"
              className="text-app-text-secondary hover:text-app-text-primary transition-colors"
            >
              Details
            </a>
            <a
              href="#meeting"
              className="text-app-text-secondary hover:text-app-text-primary transition-colors"
            >
              Meeting Point
            </a>
          </div>

          {/* CTA Button */}
          <button
            onClick={onBookNow}
            className="px-5 py-2.5 bg-app-accent-500 text-white font-medium rounded-full hover:bg-app-accent-600 transition-all hover:shadow-lg hover:shadow-app-accent-500/25"
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-12 lg:pt-20 pb-20">
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-app-text-secondary">
              Walking tours available daily
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-app-text-primary mb-6 tracking-tight">
            <span className="block">DISCOVER ZURICH</span>
            <span className="block text-app-accent-500">ON FOOT!</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-app-text-secondary max-w-2xl mx-auto mb-10">
            Explore hidden gems, historic landmarks, and local favorites with
            our expert-guided walking tour through the heart of Zurich.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBookNow}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-app-accent-500 text-white font-semibold rounded-2xl hover:bg-app-accent-600 transition-all hover:shadow-xl hover:shadow-app-accent-500/30 hover:-translate-y-0.5"
            >
              <Calendar className="w-5 h-5" />
              Check Availability
            </button>
            <a
              href="#tour"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-app-text-primary font-semibold rounded-2xl border border-app-border hover:border-app-border-dark transition-all hover:shadow-lg"
            >
              Learn More
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Floating Cards Layout */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Phone Mockup */}
          <div className="relative mx-auto w-64 sm:w-72 md:w-80">
            <div className="relative bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-slate-900/10">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-b-2xl" />

              {/* Phone Screen */}
              <div className="bg-gradient-to-b from-app-accent-50 to-white rounded-[2rem] overflow-hidden aspect-[9/19]">
                {/* Screen Header */}
                <div className="px-5 pt-10 pb-4">
                  <p className="text-xs text-app-text-tertiary">09:41</p>
                  <h3 className="text-lg font-bold text-app-text-primary mt-3">
                    Plan Your
                  </h3>
                  <h3 className="text-lg font-bold text-app-accent-500">
                    Perfect Tour
                  </h3>
                </div>

                {/* Booking Form Preview */}
                <div className="px-4 space-y-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-app-text-tertiary mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>Starting Point</span>
                    </div>
                    <p className="text-sm font-medium text-app-text-primary">
                      Zurich HB
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-app-text-tertiary mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Date</span>
                    </div>
                    <p className="text-sm font-medium text-app-text-primary">
                      Select a date
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-app-text-tertiary mb-1">
                      <Users className="w-3 h-3" />
                      <span>Guests</span>
                    </div>
                    <p className="text-sm font-medium text-app-text-primary">
                      2 people
                    </p>
                  </div>

                  <button className="w-full py-3 bg-app-accent-500 text-white text-sm font-medium rounded-xl">
                    Search Tours
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card - Left: Tour Preview */}
          <div
            className="absolute left-0 top-8 hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-xl shadow-slate-900/5 w-56 transform -rotate-3 hover:rotate-0 transition-transform">
              <div className="w-full h-28 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl mb-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-app-accent-500" />
                </div>
              </div>
              <h4 className="font-semibold text-app-text-primary text-sm">
                Historic Old Town
              </h4>
              <p className="text-xs text-app-text-tertiary mt-1">
                Medieval streets & architecture
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-app-text-secondary">
                  4.9
                </span>
                <span className="text-xs text-app-text-tertiary">
                  (128 reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Floating Card - Right: Quick Info */}
          <div
            className="absolute right-0 top-16 hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-xl shadow-slate-900/5 w-52 transform rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-app-text-tertiary">Duration</p>
                  <p className="font-bold text-app-text-primary">2.5 Hours</p>
                </div>
              </div>
              <div className="h-px bg-app-border my-3" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-app-text-tertiary">From</span>
                <span className="text-xl font-bold text-app-accent-500">
                  CHF 35
                </span>
              </div>
              <p className="text-xs text-app-text-tertiary text-right">
                per person
              </p>
            </div>
          </div>

          {/* Floating Card - Bottom Left: Feature */}
          <div
            className="absolute left-8 bottom-0 hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="bg-white rounded-2xl px-5 py-4 shadow-xl shadow-slate-900/5 flex items-center gap-4 transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-app-text-primary">
                  Small Groups
                </p>
                <p className="text-sm text-app-text-tertiary">Max 12 people</p>
              </div>
            </div>
          </div>

          {/* Floating Card - Bottom Right: Testimonial */}
          <div
            className="absolute right-4 bottom-8 hidden lg:block animate-fade-in"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="bg-white rounded-2xl p-4 shadow-xl shadow-slate-900/5 w-60 transform rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-app-text-secondary italic">
                "Best way to experience Zurich! Our guide was incredibly
                knowledgeable."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  M
                </div>
                <div>
                  <p className="text-xs font-medium text-app-text-primary">
                    Maria S.
                  </p>
                  <p className="text-xs text-app-text-tertiary">
                    Verified Guest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-app-text-tertiary">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-app-border flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-app-text-tertiary rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};
