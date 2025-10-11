"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Plus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar/Navbar";
import { v4 as uuidv4 } from 'uuid';

// --- REDUX IMPORTS ---
import { useSelector, useDispatch } from "react-redux";
import { addMessage, clearMessages } from "@/store/features/chatSlice";
import { selectChatMessages } from "@/store/features/chatSlice";
import { selectSession } from "@/store/features/sessionSlice";
import { updateSession } from "@/store/features/sessionSlice";
import type { AppDispatch } from "@/store/store";

// The Message interface can now be imported from your chatSlice file
// to avoid duplication, but leaving it here is also fine.
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Chatbot = () => {
  // --- REDUX STATE MANAGEMENT ---
  // 1. Get the dispatch function to send actions to the store
  const dispatch = useDispatch<AppDispatch>();
  // 2. Select the messages from the Redux store instead of using local state
  const messages = useSelector(selectChatMessages);
  const sessionId = useSelector(selectSession)

  // --- LOCAL COMPONENT STATE ---
  // This state remains local as it's only relevant to this component's UI
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // This dependency on `messages` from Redux works perfectly

  useEffect(() => {
    if(!sessionId) {
      const newSessionId = uuidv4();
      dispatch(updateSession(newSessionId))
    } 
  }, [])

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    // 3. Dispatch the `addMessage` action for the user's message
    dispatch(addMessage(userMessage));
    setInput("");
    setIsLoading(true);

    // Simulating AI response - replace with actual API integration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Thank you for your question about "${userMessage.content}". I'm here to help you with agricultural advice, crop management, disease identification, and farming best practices. While this is a demo response, in production I would provide detailed, expert guidance based on your specific needs.`,
      };
      // 4. Dispatch the `addMessage` action for the assistant's response
      dispatch(addMessage(assistantMessage));
      setIsLoading(false);
    }, 1000);
  };

  const handleNewChat = () => {
    // 5. Dispatch the `clearMessages` action to reset the chat
    dispatch(clearMessages());
    setInput("");
    const newSessionId = uuidv4();
    dispatch(updateSession(newSessionId))
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* The rest of your JSX remains exactly the same */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-foreground">
              AI Agriculture Assistant
            </h1>
            <Button
              onClick={handleNewChat}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          <div className="container mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div
                  className="mb-6 rounded-full p-4"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 50%))",
                  }}
                >
                  <svg
                    className="h-12 w-12 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground" style={{color: '#093419'}}>
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground" style={{color: '#527A61'}}>
                  Ask me anything about agriculture, crop diseases, farming
                  techniques, or get personalized advice
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "rounded-tr-xs bg-green-600 text-primary-foreground shadow-soft"
                          : "border border-border bg-card text-card-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[80%] rounded-2xl border border-border bg-card px-4 py-3">
                      <div className="flex gap-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="z-10 fixed bottom-32 left-1/2 -translate-x-1/2 rounded-full bg-gray-800/50 cursor-pointer p-3 text-white shadow-large transition-transform hover:scale-110"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        )}

        <div className="bg-card">
          <div className="container mx-auto max-w-3xl px-4 py-4">
            <div className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about crops, diseases, farming techniques..."
                className="max-h-32 min-h-[52px] resize-none rounded-2xl border-border bg-background pr-12 focus-visible:ring-green-600"
                rows={1}
                style={{
                  height: "auto",
                  minHeight: "52px",
                  maxHeight: "128px",
                  overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 128) + "px";
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute bottom-2 right-2 rounded-xl shadow-soft hover:shadow-medium cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(142 76% 36%), hsl(142 76% 50%))",
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;