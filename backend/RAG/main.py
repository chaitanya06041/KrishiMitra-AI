import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict

# LangChain imports for agent and memory
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_genai import ChatGoogleGenerativeAI

# Import the function that creates our tools
from tools import get_tools

# --- Load Environment Variables & Initialize FastAPI ---
load_dotenv()
app = FastAPI(
    title="Smart Agriculture Chatbot API",
    description="An API for the RAG-based agricultural agent.",
    version="1.1.0"
)

# --- Pydantic Models for API ---
class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    answer: str

# --- Core AI Components Initialization ---

# Initialize the LLM (the "brain" of the agent)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, convert_system_message_to_human=True)

# Get the list of all tools from our tools.py file
tools = get_tools(llm)

# --- Agent Creation ---

# Create the prompt manually instead of pulling from the hub.
# This is more stable and avoids issues with deprecated or moved hub links.
agent_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. You have access to a set of tools to answer the user's questions."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)

# Create the agent by binding the tools to the LLM
agent = create_tool_calling_agent(llm, tools, agent_prompt)

# Create the Agent Executor, which is the runtime for the agent
# verbose=True is great for debugging as it shows the agent's thought process
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# --- Session Memory Setup ---

# This in-memory store is for demonstration.
# For production, you would replace this with a persistent store like Redis.
store = {}
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

# Wrap the agent executor with memory management capabilities
agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

# --- API Endpoint ---
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Receives a message and session_id, and returns a response from the AI agent.
    The agent will decide whether to use a custom tool or the knowledge base.
    """
    try:
        # The config dictionary is crucial for passing the session_id to the chain
        config = {"configurable": {"session_id": request.session_id}}
        
        # Invoke the agent with the user's input and the session config
        response = agent_with_chat_history.invoke({"input": request.message}, config=config)
        
        # The agent's final answer is in the 'output' key
        return ChatResponse(answer=response['output'])
    except Exception as e:
        print(f"Error during agent invocation: {e}")
        raise HTTPException(status_code=500, detail="Failed to process the request.")

@app.get("/")
def read_root():
    return {"status": "API is running."}

