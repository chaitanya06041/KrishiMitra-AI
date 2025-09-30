import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'

export interface UserState {
  uuid: string | null
}

// Define the initial state using that type
const initialState: UserState = {
  uuid: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Action to update the user's UUID
    updateUser: (state, action: PayloadAction<string>) => {
      state.uuid = action.payload
    },
    // Action to remove the user's UUID
    removeUser: (state) => {
      state.uuid = null
    },
  },
})

// Export the actions for use in your components
export const { updateUser, removeUser } = userSlice.actions

// Selector to get the current user's UUID from the state
export const selectUser = (state: RootState) => state.user.uuid

// Export the reducer to be added to the store
export default userSlice.reducer