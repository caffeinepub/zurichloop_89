import React from "react";
import { User, Mail, Phone, MessageSquare } from "lucide-react";

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export interface CustomerFormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

interface CustomerFormProps {
  data: CustomerFormData;
  onChange: (data: CustomerFormData) => void;
  errors?: CustomerFormErrors;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleChange =
    (field: keyof CustomerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...data, [field]: e.target.value });
    };

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-app-text-primary mb-2">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-tertiary" />
          <input
            type="text"
            value={data.name}
            onChange={handleChange("name")}
            placeholder="Enter your full name"
            className={`
              w-full pl-12 pr-4 py-3 border rounded-xl
              placeholder:text-app-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent
              transition-all duration-200
              ${
                errors.name
                  ? "border-rose-300 bg-rose-50"
                  : "border-app-border hover:border-app-accent-300"
              }
            `}
          />
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-rose-500">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-app-text-primary mb-2">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-tertiary" />
          <input
            type="email"
            value={data.email}
            onChange={handleChange("email")}
            placeholder="your@email.com"
            className={`
              w-full pl-12 pr-4 py-3 border rounded-xl
              placeholder:text-app-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent
              transition-all duration-200
              ${
                errors.email
                  ? "border-rose-300 bg-rose-50"
                  : "border-app-border hover:border-app-accent-300"
              }
            `}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-rose-500">{errors.email}</p>
        )}
        <p className="mt-1 text-xs text-app-text-tertiary">
          Confirmation will be sent to this email
        </p>
      </div>

      {/* Phone Field */}
      <div>
        <label className="block text-sm font-medium text-app-text-primary mb-2">
          Phone Number{" "}
          <span className="text-app-text-tertiary">(optional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-app-text-tertiary" />
          <input
            type="tel"
            value={data.phone}
            onChange={handleChange("phone")}
            placeholder="+41 79 123 4567"
            className={`
              w-full pl-12 pr-4 py-3 border rounded-xl
              placeholder:text-app-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent
              transition-all duration-200
              ${
                errors.phone
                  ? "border-rose-300 bg-rose-50"
                  : "border-app-border hover:border-app-accent-300"
              }
            `}
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-rose-500">{errors.phone}</p>
        )}
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-app-text-primary mb-2">
          Special Requests{" "}
          <span className="text-app-text-tertiary">(optional)</span>
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-app-text-tertiary" />
          <textarea
            value={data.specialRequests}
            onChange={handleChange("specialRequests")}
            placeholder="Any dietary requirements, accessibility needs, or special occasions..."
            rows={3}
            className="
              w-full pl-12 pr-4 py-3 border border-app-border rounded-xl
              placeholder:text-app-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent
              hover:border-app-accent-300
              transition-all duration-200
              resize-none
            "
          />
        </div>
      </div>
    </div>
  );
};

// Validation helper
export const validateCustomerForm = (
  data: CustomerFormData,
): CustomerFormErrors => {
  const errors: CustomerFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (data.phone && !/^[+]?[\d\s()-]{6,}$/.test(data.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  return errors;
};
