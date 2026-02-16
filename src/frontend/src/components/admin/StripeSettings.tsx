import React, { useState } from "react";
import {
  Key,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useStripeKeyStatus,
  useSetStripeAuthorization,
  useAllowedOrigins,
  useAddAllowedOrigin,
  useRemoveAllowedOrigin,
} from "../../hooks/useQueries";
import { toast } from "sonner";

function extractTrapMessage(error: unknown): string {
  if (!(error instanceof Error)) return "An error occurred";
  const match = error.message.match(/ic0\.trap` with message:\s*(.*)/i);
  return match?.[1]?.trim() || error.message;
}

export const StripeSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [newOrigin, setNewOrigin] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const { data: keyStatus, isLoading: isLoadingKeyStatus } =
    useStripeKeyStatus();
  const { data: origins, isLoading: isLoadingOrigins } = useAllowedOrigins();
  const setAuthMutation = useSetStripeAuthorization();
  const addOriginMutation = useAddAllowedOrigin();
  const removeOriginMutation = useRemoveAllowedOrigin();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    try {
      await setAuthMutation.mutateAsync(apiKey);
      toast.success("Stripe API key validated and saved");
      setApiKey("");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  const handleAddOrigin = async () => {
    if (!newOrigin.trim()) {
      toast.error("Please enter an origin URL");
      return;
    }

    try {
      await addOriginMutation.mutateAsync(newOrigin);
      toast.success("Origin added successfully");
      setNewOrigin("");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  const handleRemoveOrigin = async (origin: string) => {
    try {
      await removeOriginMutation.mutateAsync(origin);
      toast.success("Origin removed");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text-primary">
          Stripe Settings
        </h1>
        <p className="text-app-text-secondary mt-1">
          Configure your Stripe account for payment processing
        </p>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-app-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Key className="w-5 h-5 text-app-accent-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-app-text-primary">
              Stripe API Key
            </h2>
            <p className="text-sm text-app-text-secondary mt-1">
              Your restricted API key from Stripe Dashboard
            </p>
          </div>
        </div>

        {/* Current Status */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-app-text-primary mb-2">
            Current Status
          </label>
          {isLoadingKeyStatus ? (
            <div className="flex items-center gap-2 text-app-text-tertiary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : keyStatus ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-mono text-sm bg-app-bg-secondary px-3 py-1 rounded">
                {keyStatus}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span>No API key configured</span>
            </div>
          )}
        </div>

        {/* API Key Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              {keyStatus ? "Update API Key" : "Enter API Key"}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_live_... or rk_live_..."
                className="w-full px-4 py-3 pr-12 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-tertiary hover:text-app-text-secondary"
              >
                {showApiKey ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-app-text-tertiary mt-1">
              Use a restricted key starting with{" "}
              <code className="bg-app-bg-secondary px-1 rounded">sk_</code> or{" "}
              <code className="bg-app-bg-secondary px-1 rounded">rk_</code>
            </p>
          </div>

          <button
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || setAuthMutation.isPending}
            className="px-6 py-3 bg-app-accent-500 text-white font-medium rounded-xl hover:bg-app-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {setAuthMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </>
            ) : (
              "Save API Key"
            )}
          </button>
        </div>
      </div>

      {/* Allowed Origins Section */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-app-text-primary">
              Allowed Origins
            </h2>
            <p className="text-sm text-app-text-secondary mt-1">
              Domains allowed for Stripe checkout redirects
            </p>
          </div>
        </div>

        {/* Current Origins */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-app-text-primary mb-3">
            Configured Origins
          </label>
          {isLoadingOrigins ? (
            <div className="flex items-center gap-2 text-app-text-tertiary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : origins && origins.length > 0 ? (
            <div className="space-y-2">
              {origins.map((origin) => (
                <div
                  key={origin}
                  className="flex items-center justify-between px-4 py-3 bg-app-bg-secondary rounded-xl"
                >
                  <span className="font-mono text-sm text-app-text-primary">
                    {origin}
                  </span>
                  <button
                    onClick={() => handleRemoveOrigin(origin)}
                    disabled={removeOriginMutation.isPending}
                    className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-app-text-tertiary text-sm py-4 text-center bg-app-bg-secondary rounded-xl">
              No origins configured yet
            </div>
          )}
        </div>

        {/* Add Origin */}
        <div className="flex gap-3">
          <input
            type="text"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="https://your-domain.com"
            className="flex-1 px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent font-mono text-sm"
          />
          <button
            onClick={handleAddOrigin}
            disabled={!newOrigin.trim() || addOriginMutation.isPending}
            className="px-4 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {addOriginMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
        <p className="text-xs text-app-text-tertiary mt-2">
          For local development, add{" "}
          <code className="bg-app-bg-secondary px-1 rounded">
            http://localhost:3000
          </code>
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-app-text-primary">
                Setup Instructions
              </h2>
              <p className="text-sm text-app-text-secondary">
                How to create a Stripe restricted API key
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-app-text-tertiary transition-transform ${showInstructions ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showInstructions && (
          <div className="mt-6 space-y-4 text-sm text-app-text-secondary">
            <ol className="list-decimal list-inside space-y-3">
              <li>
                Go to{" "}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-app-accent-500 hover:underline inline-flex items-center gap-1"
                >
                  Stripe Dashboard API Keys
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Click "Create restricted key"</li>
              <li>
                Set the following permissions:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    <strong>Checkout Sessions</strong>: Write + Read
                  </li>
                </ul>
              </li>
              <li>
                Copy the key (starts with{" "}
                <code className="bg-app-bg-secondary px-1 rounded">
                  rk_live_
                </code>{" "}
                or{" "}
                <code className="bg-app-bg-secondary px-1 rounded">
                  rk_test_
                </code>
                )
              </li>
              <li>Paste the key above and click "Save API Key"</li>
              <li>Add your domain(s) to allowed origins</li>
            </ol>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="font-medium text-amber-800 mb-2">Testing</p>
              <p className="text-amber-700">
                For testing, use a test mode API key (starting with{" "}
                <code className="bg-amber-100 px-1 rounded">rk_test_</code>) and
                test card number:{" "}
                <code className="bg-amber-100 px-1 rounded font-mono">
                  4242 4242 4242 4242
                </code>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
