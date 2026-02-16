import React, { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  MapPin,
  Menu,
  X,
  CreditCard,
  Mail,
} from "lucide-react";

export type AdminPage =
  | "dashboard"
  | "calendar"
  | "bookings"
  | "settings"
  | "stripe"
  | "email";

interface AdminLayoutProps {
  currentPage: AdminPage;
  onPageChange: (page: AdminPage) => void;
  onLogout: () => void;
  onBackToSite: () => void;
  children: React.ReactNode;
}

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  { id: "calendar", label: "Schedule", icon: <Calendar className="w-5 h-5" /> },
  { id: "bookings", label: "Bookings", icon: <Users className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { id: "stripe", label: "Stripe", icon: <CreditCard className="w-5 h-5" /> },
  { id: "email", label: "Email", icon: <Mail className="w-5 h-5" /> },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPage,
  onPageChange,
  onLogout,
  onBackToSite,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg-primary flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          lg:sticky lg:top-0 lg:h-screen
          w-64 bg-white border-r border-app-border
          transform transition-transform duration-200 lg:transform-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-app-accent-500 to-app-accent-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-app-text-primary">ZurichLoop</h1>
              <p className="text-xs text-app-text-tertiary">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200 text-left
                    ${
                      currentPage === item.id
                        ? "bg-app-accent-50 text-app-accent-600 font-medium"
                        : "text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary"
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-app-border space-y-2">
          <button
            onClick={onBackToSite}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-app-text-secondary hover:bg-app-bg-secondary hover:text-app-text-primary transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            <span>View Public Site</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-app-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-app-bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-app-text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-app-accent-500" />
            <span className="font-bold text-app-text-primary">ZurichLoop</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 opacity-0 pointer-events-none"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
