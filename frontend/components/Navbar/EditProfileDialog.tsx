import React, { useState } from 'react';
import { X } from 'lucide-react';

interface EditProfileDialogProps {
  onClose: () => void;
}

const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ onClose }) => {
  const user =  {
      id: '1',
      name: 'Demo User',
      email: 'tempmail@gmail.com',
      cropPlanted: 'Rice',
      location: 'Maharashtra',
      weatherAlerts: true,
    };
  const [formData, setFormData] = useState({
    cropPlanted: user?.cropPlanted || '',
    location: user?.location || '',
    weatherAlerts: user?.weatherAlerts || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // updateProfile(formData);
    onClose();
  };

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crop Planted
            </label>
            <input
              type="text"
              value={formData.cropPlanted}
              onChange={(e) => setFormData({ ...formData, cropPlanted: e.target.value })}
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
              checked={formData.weatherAlerts}
              onChange={(e) => setFormData({ ...formData, weatherAlerts: e.target.checked })}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="weatherAlerts" className="ml-2 text-sm text-gray-700">
              Want to get weather alerts?
            </label>
          </div>

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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileDialog;
