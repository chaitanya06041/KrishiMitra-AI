"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Sprout,
  Navigation,
  Search,
  User,
  Camera,
  AlertCircle,
  Phone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserProfile,
  selectUserProfile,
} from "@/store/features/userSlice";
import { toast } from "sonner";
import CROP_OPTIONS from "@/data/crops.json";
interface ProfileSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

// const CROP_OPTIONS = [
//     'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Potato',
//     'Tomato', 'Onion', 'Banana', 'Mango', 'Tea', 'Coffee', 'Groundnut',
//     'Sunflower', 'Chickpea', 'Pigeon Pea', 'Mustard', 'Barley', 'Jowar',
//     'Bajra', 'Coconut',
// ];

export default function ProfileSetup({
  onComplete,
  onSkip,
}: ProfileSetupProps) {
  const [location, setLocation] = useState("");
  const [cropPlanted, setCropPlanted] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // New state for image handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const userProfile = useSelector(selectUserProfile);
  const dispatch = useDispatch();

  const filteredCrops = CROP_OPTIONS.filter((crop) =>
    crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setFetchingLocation(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const locationString = `${data.locality || data.city || ""}, ${
            data.principalSubdivision || ""
          }, ${data.countryName || ""}`.trim();
          setLocation(locationString);
        } catch (err) {
          setError("Failed to fetch location details");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        setError(
          "Unable to retrieve your location. Please check browser permissions."
        );
        setFetchingLocation(false);
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!userProfile) {
      setError("No user found to update profile.");
      return;
    }
    setLoading(true);
    setError("");

    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (phone && !phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }
    try {
      let profileImageUrl = null;

      if (selectedFile) {
        const filePath = `public/${userProfile.user_id}/${Date.now()}_${
          selectedFile.name
        }`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        if (!urlData.publicUrl) {
          throw new Error("Could not get public URL for the image.");
        }
        profileImageUrl = urlData.publicUrl;
      }

      const updates = {
        location: location || null,
        crop_planted: cropPlanted || null,
        profile_image_url: profileImageUrl,
        phone: phone || null,
      };

      const { data, error: dbError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userProfile.user_id)
        .select()
        .single();

      if (dbError) throw dbError;

      dispatch(updateUserProfile(data));
      toast.success("Profile Setup Complete!");
      onComplete();
    } catch (err: any) {
      setError(err.message || "Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCrops.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCrops.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectCrop(filteredCrops[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    }
  };

  const handleSelectCrop = (crop: string) => {
    setCropPlanted(crop);
    setSearchTerm(crop);
    setShowDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal shell */}
      <div className="bg-white rounded-3xl w-full max-w-md animate-fadeInUp flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header - stays visible */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Help us personalize your experience
          </p>
        </div>

        {/* Scrollable content */}
        <div className="px-6 py-4 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <div
              className="relative group w-28 h-28 sm:w-32 sm:h-32 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
              />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-md">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 outline-none"
                  placeholder="Enter your location"
                />
              </div>
              <button
                type="button"
                onClick={fetchCurrentLocation}
                disabled={fetchingLocation}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50"
              >
                <Navigation className="w-5 h-5" />
                {fetchingLocation ? "Fetching..." : "Use Current Location"}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 outline-none"
                placeholder="Enter your 10-digit phone number"
              />
            </div>
          </div>

          {/* Crop search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Planted{" "}
              <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCropPlanted("");
                  setShowDropdown(true);
                }}
                onClick={() => setShowDropdown(true)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 outline-none"
                placeholder="Search and select crop"
              />
              {showDropdown && (
                <div className="absolute w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                  {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop, index) => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => handleSelectCrop(crop)}
                        className={`w-full text-left px-4 py-3 ${
                          highlightedIndex === index
                            ? "bg-green-100"
                            : "hover:bg-green-50"
                        }`}
                      >
                        {crop}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No crops found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Add extra bottom padding so scroll doesn't hide content under sticky footer */}
          <div className="h-4" />
        </div>

        {/* Footer - stays visible */}
        <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-t border-gray-100">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
