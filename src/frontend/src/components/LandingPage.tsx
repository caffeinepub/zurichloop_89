import React from "react";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  isLoggingIn,
}) => {
  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo / Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-app-text-primary mb-2">
            ZurichLoop
          </h1>
          <p className="text-app-text-secondary">
            A decentralized application on the Internet Computer
          </p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow-card p-6 mb-8">
          <p className="text-app-text-secondary">
            Sign in with Internet Identity to get started.
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={onLogin}
          disabled={isLoggingIn}
          className="w-full px-6 py-3 bg-app-accent-500 text-white font-medium rounded-lg hover:bg-app-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoggingIn ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign in with Internet Identity"
          )}
        </button>

        {/* Footer */}
        <p className="mt-8 text-sm text-app-text-tertiary">
          Powered by the Internet Computer
        </p>
      </div>
    </div>
  );
};
