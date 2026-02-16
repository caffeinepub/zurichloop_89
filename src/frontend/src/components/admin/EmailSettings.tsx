import React, { useState } from "react";
import {
  Mail,
  Key,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import {
  useEmailKeyStatus,
  useSetEmailApiKey,
  useSenderEmail,
  useSetSenderEmail,
  useSenderName,
  useSetSenderName,
  useSendTestEmail,
} from "../../hooks/useQueries";
import { toast } from "sonner";

function extractTrapMessage(error: unknown): string {
  if (!(error instanceof Error)) return "An error occurred";
  const match = error.message.match(/ic0\.trap` with message:\s*(.*)/i);
  return match?.[1]?.trim() || error.message;
}

export const EmailSettings: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [newSenderEmail, setNewSenderEmail] = useState("");
  const [newSenderName, setNewSenderName] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  const { data: keyStatus, isLoading: isLoadingKeyStatus } =
    useEmailKeyStatus();
  const { data: senderEmail, isLoading: isLoadingSenderEmail } =
    useSenderEmail();
  const { data: senderName, isLoading: isLoadingSenderName } = useSenderName();

  const setApiKeyMutation = useSetEmailApiKey();
  const setSenderEmailMutation = useSetSenderEmail();
  const setSenderNameMutation = useSetSenderName();
  const sendTestEmailMutation = useSendTestEmail();

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    try {
      await setApiKeyMutation.mutateAsync(apiKey);
      toast.success("Email API key validated and saved");
      setApiKey("");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  const handleSaveSenderEmail = async () => {
    if (!newSenderEmail.trim()) {
      toast.error("Please enter a sender email");
      return;
    }

    try {
      await setSenderEmailMutation.mutateAsync(newSenderEmail);
      toast.success("Sender email saved");
      setNewSenderEmail("");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  const handleSaveSenderName = async () => {
    if (!newSenderName.trim()) {
      toast.error("Please enter a sender name");
      return;
    }

    try {
      await setSenderNameMutation.mutateAsync(newSenderName);
      toast.success("Sender name saved");
      setNewSenderName("");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await sendTestEmailMutation.mutateAsync(testEmail);
      toast.success("Test email sent successfully");
      setTestEmail("");
    } catch (error) {
      toast.error(extractTrapMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text-primary">
          Email Settings
        </h1>
        <p className="text-app-text-secondary mt-1">
          Configure your Resend account for email notifications
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
              Resend API Key
            </h2>
            <p className="text-sm text-app-text-secondary mt-1">
              Your API key from Resend Dashboard
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
                placeholder="re_..."
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
              API key must start with{" "}
              <code className="bg-app-bg-secondary px-1 rounded">re_</code>
            </p>
          </div>

          <button
            onClick={handleSaveApiKey}
            disabled={!apiKey.trim() || setApiKeyMutation.isPending}
            className="px-6 py-3 bg-app-accent-500 text-white font-medium rounded-xl hover:bg-app-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {setApiKeyMutation.isPending ? (
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

      {/* Sender Configuration */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-app-text-primary">
              Sender Configuration
            </h2>
            <p className="text-sm text-app-text-secondary mt-1">
              Configure the "From" address for outgoing emails
            </p>
          </div>
        </div>

        {/* Sender Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-app-text-primary mb-2">
            Sender Email
          </label>
          {isLoadingSenderEmail ? (
            <div className="flex items-center gap-2 text-app-text-tertiary mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : senderEmail ? (
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-mono text-sm bg-app-bg-secondary px-3 py-1 rounded">
                {senderEmail}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>Using default: onboarding@resend.dev</span>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="email"
              value={newSenderEmail}
              onChange={(e) => setNewSenderEmail(e.target.value)}
              placeholder="noreply@yourdomain.com"
              className="flex-1 px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSaveSenderEmail}
              disabled={
                !newSenderEmail.trim() || setSenderEmailMutation.isPending
              }
              className="px-4 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {setSenderEmailMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
          <p className="text-xs text-app-text-tertiary mt-2">
            Must be a verified domain in Resend, or use{" "}
            <code className="bg-app-bg-secondary px-1 rounded">
              onboarding@resend.dev
            </code>{" "}
            for testing
          </p>
        </div>

        {/* Sender Name */}
        <div>
          <label className="block text-sm font-medium text-app-text-primary mb-2">
            Sender Name
          </label>
          {isLoadingSenderName ? (
            <div className="flex items-center gap-2 text-app-text-tertiary mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-app-text-secondary">Current:</span>
              <span className="font-medium text-sm bg-app-bg-secondary px-3 py-1 rounded">
                {senderName || "Zurich Loop Tours"}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={newSenderName}
              onChange={(e) => setNewSenderName(e.target.value)}
              placeholder="Your Company Name"
              className="flex-1 px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSaveSenderName}
              disabled={
                !newSenderName.trim() || setSenderNameMutation.isPending
              }
              className="px-4 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {setSenderNameMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-app-text-primary">
              Send Test Email
            </h2>
            <p className="text-sm text-app-text-secondary mt-1">
              Verify your email configuration is working
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendTestEmail}
            disabled={
              !testEmail.trim() || !keyStatus || sendTestEmailMutation.isPending
            }
            className="px-6 py-3 bg-violet-500 text-white font-medium rounded-xl hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sendTestEmailMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Test
              </>
            )}
          </button>
        </div>
        {!keyStatus && (
          <p className="text-xs text-amber-600 mt-2">
            Configure your API key first before sending test emails
          </p>
        )}
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
                How to set up Resend for email notifications
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
                Create a free account at{" "}
                <a
                  href="https://resend.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-app-accent-500 hover:underline inline-flex items-center gap-1"
                >
                  Resend.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Go to{" "}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-app-accent-500 hover:underline inline-flex items-center gap-1"
                >
                  API Keys
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                in the Resend dashboard
              </li>
              <li>
                Click "Create API Key" and give it a name (e.g., "ZurichLoop")
              </li>
              <li>
                Copy the key (starts with{" "}
                <code className="bg-app-bg-secondary px-1 rounded">re_</code>)
              </li>
              <li>Paste the key above and click "Save API Key"</li>
              <li>
                (Optional) Verify your domain in{" "}
                <a
                  href="https://resend.com/domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-app-accent-500 hover:underline inline-flex items-center gap-1"
                >
                  Domains
                  <ExternalLink className="w-3 h-3" />
                </a>{" "}
                for custom sender email
              </li>
              <li>Set your sender email and name above</li>
              <li>Send a test email to verify everything works</li>
            </ol>

            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="font-medium text-emerald-800 mb-2">Free Tier</p>
              <p className="text-emerald-700">
                Resend's free tier includes 3,000 emails/month and 100
                emails/day - perfect for most tour booking scenarios.
              </p>
            </div>

            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="font-medium text-amber-800 mb-2">Testing</p>
              <p className="text-amber-700">
                For testing without a verified domain, use{" "}
                <code className="bg-amber-100 px-1 rounded">
                  onboarding@resend.dev
                </code>{" "}
                as your sender email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
