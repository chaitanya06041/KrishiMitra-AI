# --------------------------------------------------------------------------
# This file defines the routes for the RAG Chatbot.
# Using APIRouter allows these endpoints to be cleanly integrated into the
# main server application.
# --------------------------------------------------------------------------

import os
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_genai import ChatGoogleGenerativeAI

# Adjust the import path for your tools module
from tools.tools import get_tools

load_dotenv()

# --- API Router Definition ---
router = APIRouter(
    tags=["RAG Chatbot"]
)

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    answer: str

# --- Core AI Components Initialization ---
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3, convert_system_message_to_human=True)
tools = get_tools(llm)

# --- Agent Creation ---
agent_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant for agricultural queries. You have access to a set of tools to answer the user's questions."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])
agent = create_tool_calling_agent(llm, tools, agent_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# --- Session Memory Setup ---
store = {}
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

# --- API Endpoints ---
@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        config = {"configurable": {"session_id": request.session_id}}
        response = agent_with_chat_history.invoke({"input": request.message}, config=config)
        return ChatResponse(answer=response['output'])
    except Exception as e:
        print(f"Error during agent invocation: {e}")
        raise HTTPException(status_code=500, detail="Failed to process the request.")

@router.get("/")
def read_root():
    return {"status": "RAG API is running."}
