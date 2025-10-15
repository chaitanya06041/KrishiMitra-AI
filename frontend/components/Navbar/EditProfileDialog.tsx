import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, MapPin, Sprout, Navigation, Search, User, Camera } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { createClient } from '@/lib/supabase/client';
import { selectUserProfile, updateUserProfile } from '@/store/features/userSlice';
import type { UserProfile } from '@/store/features/userSlice';
import { toast } from "sonner";
import CROP_OPTIONS from '@/data/crops.json'

interface EditProfileDialogProps {
  onClose: () => void;
}

interface updateData {
  crop_planted: string | null;
  location: string | null;
  weather_alerts: boolean;
  profile_image_url: string | null;
}

// const CROP_OPTIONS = [
//     'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Potato',
//     'Tomato', 'Onion', 'Banana', 'Mango', 'Tea', 'Coffee', 'Groundnut',
//     'Sunflower', 'Chickpea', 'Pigeon Pea', 'Mustard', 'Barley', 'Jowar',
//     'Bajra', 'Coconut',
// ];

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ onClose }) => {
  // 1. Connect to Redux
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);
  const supabase = createClient();

  // 2. Local state for the form, initialized from Redux store
  const [formData, setFormData] = useState({
    crop_planted: '',
    location: '',
    weather_alerts: false,
  });

  // New state for image handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Local state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // 3. Populate form when the component mounts with data from Redux
  useEffect(() => {
    if (userProfile) {
      setFormData({
        crop_planted: userProfile.crop_planted || '',
        location: userProfile.location || '',
        weather_alerts: userProfile.weather_alerts || false,
      });
      setSearchTerm(userProfile.crop_planted || '');
      // Set the initial image preview from the user's profile
      setPreviewUrl(userProfile.profile_image_url || null);
    }
  }, [userProfile]);

  const filteredCrops = CROP_OPTIONS.filter(crop =>
    crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const locationString = `${data.locality || data.city || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.trim();
          setFormData(prev => ({ ...prev, location: locationString }));
        } catch (err) {
          setError('Failed to fetch location details');
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        setError('Unable to retrieve your location. Please check browser permissions.');
        setFetchingLocation(false);
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredCrops.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredCrops.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectCrop(filteredCrops[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    }
  };

  const handleSelectCrop = (crop: string) => {
    setFormData({ ...formData, crop_planted: crop });
    setSearchTerm(crop);
    setShowDropdown(false);
  };
  
  // New: Handle file selection from the input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a temporary URL to preview the selected image
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      setError("User not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let profileImageUrl = userProfile.profile_image_url;

      // New: Step 1 - Upload image if a new one is selected
      if (selectedFile) {
        // Use a unique file path based on user_id to easily manage avatars
        const filePath = `public/${userProfile.user_id}/${Date.now()}_${selectedFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Your bucket name
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true, // This will overwrite the file if it already exists
          });

        if (uploadError) throw uploadError;

        // New: Step 2 - Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (!urlData.publicUrl) {
          throw new Error("Could not get public URL for the image.");
        }
        profileImageUrl = urlData.publicUrl;
      }

      const updateData: updateData = {
        weather_alerts: formData.weather_alerts,
        profile_image_url: profileImageUrl,
        crop_planted : null,
        location : null,
      };
      if (formData.crop_planted && formData.crop_planted.trim() !== '') {
        updateData.crop_planted = formData.crop_planted;
      }

      // Conditionally add location if it's a non-empty string
      if (formData.location && formData.location.trim() !== '') {
        updateData.location = formData.location;
}
      // Step 3: Update the data in the Supabase 'profiles' table
      const { data, error: dbError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userProfile.user_id)
        .select()
        .single();

      if (dbError) throw dbError;

      // Step 4: Dispatch the action to update the Redux state
      dispatch(updateUserProfile(data));
      toast.success("Profile Updated Successfully!");
      onClose();

    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || 'Could not save your changes.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!userProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 animate-fadeInUp">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* New: Profile Image Selector */}
          <div className="flex justify-center">
             <div 
              className="relative group w-32 h-32 cursor-pointer"
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
                        <User className="w-16 h-16 text-gray-400"/>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 outline-none"
                  placeholder="e.g., Maharashtra, Punjab"
                />
              </div>
              <button
                type="button"
                onClick={fetchCurrentLocation}
                disabled={fetchingLocation}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50"
              >
                <Navigation className="w-5 h-5" />
                {fetchingLocation ? 'Fetching...' : 'Use Current Location'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Planted</label>
            <div className="relative">
              <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  setFormData({ ...formData, crop_planted: '' });
                }}
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
                        className={`w-full text-left px-4 py-3 ${highlightedIndex === index ? 'bg-green-100' : 'hover:bg-green-50'}`}
                      >
                        {crop}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">No crops found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="weatherAlerts"
              checked={formData.weather_alerts}
              onChange={(e) => setFormData({ ...formData, weather_alerts: e.target.checked })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="weatherAlerts" className="ml-2 text-sm text-gray-700">
              Want to get weather alerts?
            </label>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileDialog;

