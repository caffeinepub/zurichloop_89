import React from "react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="w-10 h-10 border-3 border-app-accent-500 border-t-transparent rounded-full animate-spin" />

        {/* Loading text */}
        <p className="text-app-text-secondary text-sm">Loading...</p>
      </div>
    </div>
  );
};
