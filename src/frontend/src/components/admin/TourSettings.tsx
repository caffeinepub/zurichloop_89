import React, { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  DollarSign,
  Users,
  Clock,
  MapPin,
  FileText,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  Star,
  Package,
} from "lucide-react";
import {
  useTourConfig,
  useUpdateTourConfig,
  useUpdateMeetingPoint,
} from "../../hooks/useQueries";
import { toast } from "sonner";

export const TourSettings: React.FC = () => {
  const { data: tourConfig, isLoading } = useTourConfig();
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateTourConfig();
  const { mutate: updateMeetingPoint, isPending: isUpdatingMeetingPoint } =
    useUpdateMeetingPoint();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    duration: 150,
    price: 3500,
    maxCapacity: 12,
    isActive: true,
    highlights: ["", "", "", "", "", ""],
    included: ["", "", "", "", "", ""],
  });

  const [meetingPointData, setMeetingPointData] = useState({
    name: "",
    address: "",
    lat: 47.3769,
    lng: 8.5417,
    instructions: "",
    landmark: "",
  });

  // Load initial data
  useEffect(() => {
    if (tourConfig) {
      setFormData({
        title: tourConfig.title || "",
        subtitle: tourConfig.subtitle || "",
        description: tourConfig.description || "",
        duration: Number(tourConfig.duration) || 150,
        price: Number(tourConfig.price) || 3500,
        maxCapacity: Number(tourConfig.maxCapacity) || 12,
        isActive: tourConfig.isActive ?? true,
        highlights:
          tourConfig.highlights?.length === 6
            ? tourConfig.highlights
            : [...(tourConfig.highlights || []), ...Array(6).fill("")].slice(
                0,
                6,
              ),
        included:
          tourConfig.included?.length === 6
            ? tourConfig.included
            : [...(tourConfig.included || []), ...Array(6).fill("")].slice(
                0,
                6,
              ),
      });

      if (tourConfig.meetingPoint) {
        setMeetingPointData({
          name: tourConfig.meetingPoint.name || "",
          address: tourConfig.meetingPoint.address || "",
          lat: tourConfig.meetingPoint.coordinates?.lat || 47.3769,
          lng: tourConfig.meetingPoint.coordinates?.lng || 8.5417,
          instructions: tourConfig.meetingPoint.instructions || "",
          landmark: tourConfig.meetingPoint.landmark || "",
        });
      }
    }
  }, [tourConfig]);

  const handleSaveGeneral = () => {
    updateConfig(
      {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        maxCapacity: formData.maxCapacity,
        isActive: formData.isActive,
        highlights: formData.highlights.filter((h) => h.trim()),
        included: formData.included.filter((i) => i.trim()),
      },
      {
        onSuccess: () => toast.success("Tour settings saved!"),
        onError: (error) => toast.error(`Failed to save: ${error.message}`),
      },
    );
  };

  const handleSaveMeetingPoint = () => {
    updateMeetingPoint(
      {
        name: meetingPointData.name,
        address: meetingPointData.address,
        lat: meetingPointData.lat,
        lng: meetingPointData.lng,
        instructions: meetingPointData.instructions,
        landmark: meetingPointData.landmark || undefined,
      },
      {
        onSuccess: () => toast.success("Meeting point saved!"),
        onError: (error) => toast.error(`Failed to save: ${error.message}`),
      },
    );
  };

  const formatPrice = (cents: number): string => {
    return (cents / 100).toFixed(0);
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
  };

  const handleIncludedChange = (index: number, value: string) => {
    const newIncluded = [...formData.included];
    newIncluded[index] = value;
    setFormData({ ...formData, included: newIncluded });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-app-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-text-primary">
          Tour Settings
        </h1>
        <p className="text-app-text-secondary mt-1">
          Configure your tour details and pricing
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-app-text-primary mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-app-accent-500" />
          Basic Information
        </h2>

        <div className="space-y-5">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-app-bg-primary rounded-xl">
            <div>
              <p className="font-medium text-app-text-primary">Tour Active</p>
              <p className="text-sm text-app-text-tertiary">
                Enable or disable bookings
              </p>
            </div>
            <button
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                formData.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-app-bg-secondary text-app-text-tertiary"
              }`}
            >
              {formData.isActive ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span>Inactive</span>
                </>
              )}
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              Tour Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Zurich Old Town Walking Tour"
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="Discover the hidden gems of Zurich"
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Detailed description of your tour..."
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Price, Duration, Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price (CHF)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-tertiary">
                  CHF
                </span>
                <input
                  type="number"
                  value={formatPrice(formData.price)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) * 100 || 0,
                    })
                  }
                  min={0}
                  className="w-full pl-14 pr-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-app-text-tertiary">Per person</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                min={30}
                step={15}
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-app-text-tertiary">
                {Math.floor(formData.duration / 60)}h {formData.duration % 60}m
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Max Capacity
              </label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxCapacity: parseInt(e.target.value) || 1,
                  })
                }
                min={1}
                max={50}
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-app-text-tertiary">
                Per tour slot
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveGeneral}
            disabled={isUpdating}
            className="flex items-center gap-2 px-6 py-3 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-app-text-primary mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Tour Highlights
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-6 h-6 bg-app-accent-100 rounded-full flex items-center justify-center text-sm font-medium text-app-accent-600">
                {index + 1}
              </span>
              <input
                type="text"
                value={highlight}
                onChange={(e) => handleHighlightChange(index, e.target.value)}
                placeholder={`Highlight ${index + 1}`}
                className="flex-1 px-4 py-2.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-app-text-primary mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-500" />
          What's Included
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.included.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <input
                type="text"
                value={item}
                onChange={(e) => handleIncludedChange(index, e.target.value)}
                placeholder={`Included item ${index + 1}`}
                className="flex-1 px-4 py-2.5 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Meeting Point */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-app-text-primary mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-rose-500" />
          Meeting Point
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                Location Name
              </label>
              <input
                type="text"
                value={meetingPointData.name}
                onChange={(e) =>
                  setMeetingPointData({
                    ...meetingPointData,
                    name: e.target.value,
                  })
                }
                placeholder="Zurich Main Station"
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                Landmark/Reference
              </label>
              <input
                type="text"
                value={meetingPointData.landmark}
                onChange={(e) =>
                  setMeetingPointData({
                    ...meetingPointData,
                    landmark: e.target.value,
                  })
                }
                placeholder="Under the main clock"
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              Full Address
            </label>
            <input
              type="text"
              value={meetingPointData.address}
              onChange={(e) =>
                setMeetingPointData({
                  ...meetingPointData,
                  address: e.target.value,
                })
              }
              placeholder="Bahnhofplatz, 8001 Zürich, Switzerland"
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={meetingPointData.lat}
                onChange={(e) =>
                  setMeetingPointData({
                    ...meetingPointData,
                    lat: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app-text-primary mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={meetingPointData.lng}
                onChange={(e) =>
                  setMeetingPointData({
                    ...meetingPointData,
                    lng: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-app-text-primary mb-2">
              Meeting Instructions
            </label>
            <textarea
              value={meetingPointData.instructions}
              onChange={(e) =>
                setMeetingPointData({
                  ...meetingPointData,
                  instructions: e.target.value,
                })
              }
              rows={3}
              placeholder="Describe how to find the meeting point..."
              className="w-full px-4 py-3 border border-app-border rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleSaveMeetingPoint}
            disabled={isUpdatingMeetingPoint}
            className="flex items-center gap-2 px-6 py-3 bg-app-accent-500 text-white rounded-xl hover:bg-app-accent-600 transition-colors disabled:opacity-50"
          >
            {isUpdatingMeetingPoint ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Meeting Point
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
