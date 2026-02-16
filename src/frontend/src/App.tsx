import React, { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useActor } from "./hooks/useActor";
import { TourPage } from "./components/TourPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { AdminLayout, AdminPage } from "./components/admin/AdminLayout";
import { Dashboard } from "./components/admin/Dashboard";
import { CalendarManager } from "./components/admin/CalendarManager";
import { BookingsList } from "./components/admin/BookingsList";
import { TourSettings } from "./components/admin/TourSettings";
import { StripeSettings } from "./components/admin/StripeSettings";
import { EmailSettings } from "./components/admin/EmailSettings";
import { PaymentSuccess } from "./components/payment/PaymentSuccess";
import { PaymentCancelled } from "./components/payment/PaymentCancelled";

// Simple URL-based routing helper
function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState({}, "", newPath);
    setPath(newPath);
    setSearchParams(new URLSearchParams(window.location.search));
  };

  return { path, searchParams, navigate };
}

const App: React.FC = () => {
  const { identity, isInitializing, login, isLoggingIn, clear } =
    useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();
  const { path, searchParams, navigate } = useRoute();

  // Track if user explicitly wants to access admin
  const [showAdmin, setShowAdmin] = useState(false);

  // Parse payment page parameters (query-param-based for SPA compatibility)
  const paymentParams = useMemo(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      const sessionId = searchParams.get("session_id");
      const bookingId = searchParams.get("booking_id");
      return {
        type: "success" as const,
        sessionId: sessionId || "",
        bookingId: bookingId ? parseInt(bookingId) : 0,
      };
    }
    if (payment === "cancelled") {
      const bookingId = searchParams.get("booking_id");
      return {
        type: "cancelled" as const,
        bookingId: bookingId ? parseInt(bookingId) : 0,
      };
    }
    return null;
  }, [searchParams]);

  // Clear query cache on logout
  useEffect(() => {
    if (!identity) {
      queryClient.clear();
      setShowAdmin(false);
    }
  }, [identity, queryClient]);

  // Show loading screen during authentication initialization
  if (isInitializing) {
    return <LoadingScreen />;
  }

  // Handle payment success page
  if (
    paymentParams?.type === "success" &&
    paymentParams.sessionId &&
    paymentParams.bookingId
  ) {
    return (
      <PaymentSuccess
        sessionId={paymentParams.sessionId}
        bookingId={paymentParams.bookingId}
        onBackToHome={() => navigate("/")}
      />
    );
  }

  // Handle payment cancelled page
  if (paymentParams?.type === "cancelled" && paymentParams.bookingId) {
    return (
      <PaymentCancelled
        bookingId={paymentParams.bookingId}
        onBackToHome={() => navigate("/")}
        onRetryPayment={(bookingId) => {
          // Navigate back to home with booking retry
          navigate("/");
        }}
      />
    );
  }

  // Show login modal/flow if user clicked admin login but not authenticated
  if (showAdmin && !isAuthenticated) {
    return (
      <AdminLoginPage
        onLogin={login}
        isLoggingIn={isLoggingIn}
        onCancel={() => setShowAdmin(false)}
      />
    );
  }

  // Show admin dashboard if authenticated and showAdmin is true
  if (showAdmin && isAuthenticated) {
    return (
      <AuthenticatedApp
        key={identity?.getPrincipal().toString()}
        onLogout={() => {
          clear();
          setShowAdmin(false);
        }}
        onBackToSite={() => setShowAdmin(false)}
      />
    );
  }

  // Default: Show public tour page
  return <TourPage onAdminLogin={() => setShowAdmin(true)} />;
};

// Admin login page
interface AdminLoginPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  onCancel: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLogin,
  isLoggingIn,
  onCancel,
}) => {
  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back button */}
        <button
          onClick={onCancel}
          className="mb-8 text-app-text-secondary hover:text-app-text-primary transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to site
        </button>

        <div className="text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 bg-app-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-app-text-primary mb-2">
              Admin Portal
            </h1>
            <p className="text-app-text-secondary">
              ZurichLoop Tour Management
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-card p-8">
            <p className="text-app-text-secondary mb-6">
              Sign in with Internet Identity to access the admin dashboard.
            </p>

            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full px-6 py-4 bg-app-accent-500 text-white font-semibold rounded-xl hover:bg-app-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in with Internet Identity"
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-8 text-sm text-app-text-tertiary">
            Powered by the Internet Computer
          </p>
        </div>
      </div>
    </div>
  );
};

// Access denied page
interface AccessDeniedPageProps {
  onLogout: () => void;
  onBackToSite: () => void;
}

const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  onLogout,
  onBackToSite,
}) => {
  return (
    <div className="min-h-screen bg-app-bg-primary flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-app-text-primary mb-2">
            Access Denied
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8 space-y-4">
          <button
            onClick={onBackToSite}
            className="w-full px-6 py-4 bg-app-accent-500 text-white font-semibold rounded-xl hover:bg-app-accent-600 transition-colors"
          >
            Back to Site
          </button>
          <button
            onClick={onLogout}
            className="w-full px-6 py-4 bg-white text-app-text-secondary font-semibold rounded-xl border border-app-border hover:bg-app-bg-secondary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// Authenticated admin app
interface AuthenticatedAppProps {
  onLogout: () => void;
  onBackToSite: () => void;
}

const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
  onLogout,
  onBackToSite,
}) => {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const [adminStatus, setAdminStatus] = useState<
    "loading" | "admin" | "denied"
  >("loading");

  useEffect(() => {
    if (!actor || !identity) return;
    let cancelled = false;

    const verifyAdmin = async () => {
      try {
        const isAdmin = await actor.isCallerAdmin();
        console.log("[AuthenticatedApp] isCallerAdmin returned:", isAdmin);
        try {
          const role = await actor.getCallerUserRole();
          console.log("[AuthenticatedApp] getCallerUserRole returned:", role);
        } catch (roleErr) {
          console.error(
            "[AuthenticatedApp] getCallerUserRole failed:",
            roleErr,
          );
        }
        if (cancelled) return;
        if (isAdmin) {
          setAdminStatus("admin");
        } else {
          setAdminStatus("denied");
        }
      } catch (err) {
        console.error("[AuthenticatedApp] isCallerAdmin failed:", err);
        if (!cancelled) setAdminStatus("denied");
      }
    };

    verifyAdmin();
    return () => {
      cancelled = true;
    };
  }, [actor, identity]);

  if (!actor || adminStatus === "loading") {
    return <LoadingScreen />;
  }

  if (adminStatus === "denied") {
    return <AccessDeniedPage onLogout={onLogout} onBackToSite={onBackToSite} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "calendar":
        return <CalendarManager />;
      case "bookings":
        return <BookingsList />;
      case "settings":
        return <TourSettings />;
      case "stripe":
        return <StripeSettings />;
      case "email":
        return <EmailSettings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={onLogout}
      onBackToSite={onBackToSite}
    >
      {renderPage()}
    </AdminLayout>
  );
};

export default App;
