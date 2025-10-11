import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'
import sessionReducer from './features/sessionSlice'
import chatReducer from './features/chatSlice' // 1. Import the new reducer

// Configure the store
export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      session: sessionReducer,
      chat: chatReducer, // 2. Add it to the store's reducers
    },
  })
}

// These types will automatically update, no changes needed here
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']