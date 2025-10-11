import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'

// Define the interface for a single message object
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Define the state for this slice
export interface ChatState {
  messages: Message[];
}

// Define the initial state using that type
const initialState: ChatState = {
  messages: [],
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Action to add a new message to the array
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    // Action to replace all messages (e.g., loading a past chat)
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    // Action to clear all messages from the array
    clearMessages: (state) => {
      state.messages = []
    },
  },
})

// Export the actions for use in your components
export const { addMessage, setMessages, clearMessages } = chatSlice.actions

// Selector to get the current array of chat messages from the state
export const selectChatMessages = (state: RootState) => state.chat.messages

// Export the reducer to be added to the store
export default chatSlice.reducer