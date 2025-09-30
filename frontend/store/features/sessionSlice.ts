import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'

export interface SessionState {
  sessionId: string | null
}

// Define the initial state using that type
const initialState: SessionState = {
  sessionId: null,
}

export const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Action to update the session's ID
    updateSession: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    // Action to remove the session's ID
    removeSession: (state) => {
      state.sessionId = null
    },
  },
})

// Export the actions for use in your components
export const { updateSession, removeSession } = sessionSlice.actions

// Selector to get the current session's ID from the state
export const selectSession = (state: RootState) => state.session.sessionId

// Export the reducer to be added to the store
export default sessionSlice.reducer