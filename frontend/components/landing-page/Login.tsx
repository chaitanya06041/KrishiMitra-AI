import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useDispatch } from 'react-redux'; // <-- 1. Import useDispatch
import { setUser } from '@/store/features/userSlice'; // <-- 2. Import the setUser action

interface LoginProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onClose: () => void;
}

export default function Login({ onSuccess, onSwitchToSignup, onClose }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!user) throw new Error("Login failed, user not found.");

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*') // Select all columns
        .eq('user_id', user.id) // Match the profile ID with the authenticated user's ID
        .single(); // Expect one and only one profile

      if (profileError) {
        // This could happen if the profile wasn't created correctly (e.g., a trigger failed)
        throw new Error(`Could not fetch user profile: ${profileError.message}`);
      }

      dispatch(setUser({
        user_id: user.id,
        email: user.email!, // user.email is guaranteed to exist if login is successful
        location: profileData.location,
        phone: profileData.phone,
        crop_planted: profileData.crop_planted,
        weather_alerts: profileData.weather_alerts,
        profile_image_url: profileData.profile_image_url,
      }));

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-gray-600 mb-8">Login to your KrushiMitra account</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-colors"
                placeholder="farmer@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
