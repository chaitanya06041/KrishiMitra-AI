import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'

// 1. Define the Interface for the User Profile Data
export interface UserProfile {
  user_id: string;
  email: string;
  location: string | null;
  crop_planted: string | null;
  weather_alerts: boolean;
  profile_image_url: string | null;
}

// 2. Define the State for this Slice
// The state now only contains the profile object itself.
export interface UserState {
  profile: UserProfile | null;
}

// 3. Define the Initial State
const initialState: UserState = {
  profile: null, // If profile is null, the user is not logged in.
}

// 4. Create the Slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Sets the user profile data in the state.
     * Call this after a successful login or when loading the initial session.
     */
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },

    /**
     * Clears the user profile data from the state by setting it to null.
     * Call this when the user logs out.
     */
    clearUser: (state) => {
      state.profile = null;
    },

    /**
     * Updates one or more fields in the existing user profile.
     * The payload should be an object with the fields to update.
     */
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        // Merge the existing profile with the new partial data
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
})

// 5. Export Actions and Selectors

// Export the actions to be dispatched from your components
export const { setUser, clearUser, updateUserProfile } = userSlice.actions

// Selector to get the user profile object from the state
export const selectUserProfile = (state: RootState) => state.user.profile;

// You can create a selector on-the-fly or in a component to check for authentication
// e.g., const isAuthenticated = useSelector(state => !!state.user.profile);

// Export the reducer to be added to the store
export default userSlice.reducer