import os
import sys
from langchain.tools import tool, Tool
from langchain_core.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore

# --- System Path Configuration ---
# This ensures Python can find the 'helpers' module from the parent directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# --- Import your actual prediction functions ---
from helpers.yield_prediction import predict_yield as predict_yield_by_location_helper
from helpers.yield_prediction_numerical_data import predict_yield_using_numeric_data as predict_yield_numeric_helper
from helpers.crop_recommendation import crop_recommendation as crop_recommendation_helper

# --- 1. Custom Tools with Real Logic ---
# These tools now call your actual helper functions.
# The docstrings are updated to be very specific for the agent.

@tool
def predict_yield_by_location(year: int, area: float, state: str, district: str, season: str, crop: str) -> str:
    """
    Predicts crop production based on historical and geographical data.
    Use this tool when the user provides a state, district, crop, season, year, and area, but does NOT provide
    numerical data like rainfall, fertilizer, or pesticide amounts.
    """
    print("--- Calling Yield Prediction by Location Tool ---")
    try:
        input_data = {
            "year": year, "area": area, "state": state,
            "district": district, "season": season, "crop": crop
        }
        prediction = predict_yield_by_location_helper(input_data)
        if isinstance(prediction, str):
            return f"Could not generate prediction: {prediction}"
        return f"The predicted production is {round(float(prediction), 2)} units."
    except Exception as e:
        return f"An error occurred: {str(e)}"

@tool
def predict_yield_using_numerical_data(crop: str, season: str, state: str, area: float, rainfall: float, fertilizer: float, pesticide: float) -> str:
    """
    Predicts crop production based on specific numerical environmental and agricultural inputs.
    Use this tool when the user provides numerical data such as rainfall, fertilizer amount, and pesticide amount.
    """
    print("--- Calling Yield Prediction with Numerical Data Tool ---")
    try:
        prediction = predict_yield_numeric_helper(crop, season, state, area, rainfall, fertilizer, pesticide)
        if isinstance(prediction, str):
            return f"Could not generate prediction: {prediction}"
        return f"The predicted production is {round(float(prediction), 2)} units."
    except Exception as e:
        return f"An error occurred: {str(e)}"

@tool
def recommend_crop(N: float, P: float, K: float, temperature: float, humidity: float, ph: float, rainfall: float) -> str:
    """
    Recommends a suitable crop based on soil composition (N, P, K values) and environmental factors
    like temperature, humidity, pH, and rainfall.
    """
    print("--- Calling Crop Recommendation Tool ---")
    try:
        prediction = crop_recommendation_helper(N=N, P=P, K=K, temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall)
        if prediction is None:
            return "Could not recommend a crop based on the provided data. Please check the values."
        return f"The recommended crop is {prediction}."
    except Exception as e:
        return f"An error occurred: {str(e)}"

# --- 2. RAG Tool (No changes here) ---
def create_rag_tool(llm: ChatGoogleGenerativeAI) -> Tool:
    PINECONE_INDEX_NAME = "smart-agriculture"
    embeddings_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    vectorstore = PineconeVectorStore(index_name=PINECONE_INDEX_NAME, embedding=embeddings_model)
    retriever = vectorstore.as_retriever(search_kwargs={'k': 3})
    rag_prompt = ChatPromptTemplate.from_template(
        "You are an agricultural expert. Answer the user's question based *only* on the following context:\n\n{context}\n\nQuestion: {question}"
    )
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    )
    return Tool(
        name="agriculture_knowledge_base",
        func=rag_chain.invoke,
        description="Use this for general questions about farming practices, fertilizers, pesticides, and other agricultural topics. Input should be the user's complete question."
    )

# --- 3. Tool Aggregator ---
def get_tools(llm: ChatGoogleGenerativeAI) -> list:
    rag_tool = create_rag_tool(llm)
    return [
        predict_yield_by_location,
        predict_yield_using_numerical_data,
        recommend_crop,
        rag_tool
    ]

