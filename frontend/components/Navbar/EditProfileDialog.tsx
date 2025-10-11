import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { createClient } from '@/lib/supabase/client';
import { selectUserProfile, updateUserProfile } from '@/store/features/userSlice';
import type { UserProfile } from '@/store/features/userSlice';
import { toast } from "sonner";

interface EditProfileDialogProps {
  onClose: () => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ onClose }) => {
  // 1. Connect to Redux
  const dispatch = useDispatch();
  const userProfile = useSelector(selectUserProfile);

  // 2. Local state for the form, initialized from Redux store
  const [formData, setFormData] = useState({
    crop_planted: '',
    location: '',
    weather_alerts: false,
  });

  // Local state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 3. Populate form when the component mounts with data from Redux
  useEffect(() => {
    if (userProfile) {
      setFormData({
        crop_planted: userProfile.crop_planted || '',
        location: userProfile.location || '',
        weather_alerts: userProfile.weather_alerts || false,
      });
    }
  }, [userProfile]); // This effect runs when userProfile is loaded

  // Supabase client instance
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      setError("User not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Update the data in the Supabase 'profiles' table
      const { data, error: dbError } = await supabase
        .from('profiles')
        .update({
          crop_planted: formData.crop_planted,
          location: formData.location,
          weather_alerts: formData.weather_alerts,
        })
        .eq('user_id', userProfile.user_id) // Ensure we only update the correct user
        .select() // Return the updated row
        .single();

      if (dbError) throw dbError;

      // Step 2: Dispatch the action to update the Redux state
      // We use the data returned from Supabase to ensure consistency
      dispatch(updateUserProfile(data));
        toast.success("Profile Updated Successfully!");
      // Step 3: Close the dialog on success
      onClose();

    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.message || 'Could not save your changes.');
    } finally {
      setLoading(false);
    }
  };
  
  // If for some reason the dialog is rendered without a logged-in user, show nothing.
  if (!userProfile) {
      return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Using snake_case to match the database and Redux state */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Planted
            </label>
            <input
              type="text"
              value={formData.crop_planted}
              onChange={(e) => setFormData({ ...formData, crop_planted: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Rice, Wheat, Cotton"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Maharashtra, Punjab"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="weatherAlerts"
              checked={formData.weather_alerts}
              onChange={(e) => setFormData({ ...formData, weather_alerts: e.target.checked })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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