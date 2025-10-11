import { useState } from 'react';
import { MapPin, Sprout, Navigation, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useDispatch, useSelector } from 'react-redux'; // <-- 1. Import hooks
import { updateUserProfile, selectUserProfile } from '@/store/features/userSlice'; // <-- 2. Import action and selector
import { toast } from "sonner";

interface ProfileSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const CROP_OPTIONS = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Soybean',
  'Potato',
  'Tomato',
  'Onion',
  'Banana',
  'Mango',
  'Tea',
  'Coffee',
  'Groundnut',
  'Sunflower',
  'Chickpea',
  'Pigeon Pea',
  'Mustard',
  'Barley',
  'Jowar',
  'Bajra',
  'Coconut',
];

export default function ProfileSetup({ onComplete, onSkip }: ProfileSetupProps) {
  const [location, setLocation] = useState('');
  const [cropPlanted, setCropPlanted] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();
  const userProfile = useSelector(selectUserProfile);
  const dispatch = useDispatch();

  const filteredCrops = CROP_OPTIONS.filter(crop =>
    crop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const locationString = `${data.locality || data.city || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.trim();
          setLocation(locationString);
        } catch (error) {
          alert('Failed to fetch location details');
        } finally {
          setFetchingLocation(false);
        }
      },
      (error) => {
        alert('Unable to retrieve your location');
        setFetchingLocation(false);
      }
    );
  };

  const handleSave = async () => {
    if (!userProfile) {
      console.error("No user found to update profile.");
      onComplete(); // Exit gracefully
      return;
    }
    setLoading(true);
    try {
      const updates = {
        location: location || null,
        crop_planted: cropPlanted || null,
        updated_at: new Date().toISOString(), // Supabase can also handle this with a trigger
      };

      // Step 1: Update the user's profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userProfile.user_id); // Match the row by user ID

      if (error) throw error;
      
      // Step 2: Dispatch the updated details to the Redux store
      dispatch(updateUserProfile({
        location: updates.location,
        crop_planted: updates.crop_planted,
      }));

      onComplete();

    } catch (error) {
      console.error('Error saving profile:', error);
      // Still call onComplete to close the modal even if there's an error
      onComplete(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fadeInUp">
        <h2 className="text-3xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-gray-600 mb-8">Help us personalize your experience</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="space-y-3">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-colors"
                  placeholder="Enter your location"
                />
              </div>
              <button
                type="button"
                onClick={fetchCurrentLocation}
                disabled={fetchingLocation}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-all disabled:opacity-50"
              >
                <Navigation className="w-5 h-5" />
                {fetchingLocation ? 'Fetching location...' : 'Use Current Location'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Planted <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <Sprout className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={cropPlanted || searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCropPlanted('');
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-colors"
                placeholder="Search and select crop"
              />
              {showDropdown && (
                <div className="absolute w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                  {filteredCrops.length > 0 ? (
                    filteredCrops.map((crop) => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => {
                          setCropPlanted(crop);
                          setSearchTerm(crop);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors"
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

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
