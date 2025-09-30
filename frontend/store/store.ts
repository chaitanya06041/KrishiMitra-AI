import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/userSlice'
import sessionReducer from './features/sessionSlice'

// Configure the store
export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      session: sessionReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
