import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-app-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-app-text-secondary mb-6">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error display for query errors
interface QueryErrorProps {
  error: Error | null;
  onRetry?: () => void;
  message?: string;
}

export const QueryError: React.FC<QueryErrorProps> = ({
  error,
  onRetry,
  message = "Failed to load data",
}) => {
  if (!error) return null;

  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-app-text-secondary font-medium">{message}</p>
      <p className="text-sm text-app-text-tertiary mt-1">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-app-accent-500 hover:text-app-accent-600 font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="p-8 text-center">
      {icon && (
        <div className="w-16 h-16 bg-app-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-app-text-primary">{title}</h3>
      {description && (
        <p className="text-app-text-secondary mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-6 py-2 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
