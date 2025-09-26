import os
from dotenv import load_dotenv

# --- LangChain components ---
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

# --- Load environment variables from .env file ---
load_dotenv()

# --- Configuration ---
PINECONE_INDEX_NAME = "smart-agriculture"

def format_docs(docs):
    """
    Helper function to format the retrieved documents into a single string.
    """
    return "\n\n".join(doc.page_content for doc in docs)

def main():
    """
    Main function to set up and run the RAG chain.
    """
    # 1. Initialize the LLM
    # We'll use Gemini Pro for its reasoning capabilities
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)

    # 2. Initialize the Embedding Model
    # This must be the same model used during ingestion
    embeddings_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

    # 3. Initialize the Pinecone Vector Store (as a retriever)
    # This object will handle the connection to your Pinecone index
    vectorstore = PineconeVectorStore(
        index_name=PINECONE_INDEX_NAME,
        embedding=embeddings_model
    )
    # Convert the vector store into a retriever object
    retriever = vectorstore.as_retriever(search_kwargs={'k': 3}) # Retrieve top 3 results

    # 4. Define the Prompt Template
    # This template structures the input to the LLM, telling it how to use the context.
    template = """
    You are an expert agricultural assistant.
    Your task is to answer the user's question based *only* on the following context.
    If the context does not contain the answer, state that you don't have enough information.
    Do not make up information. Be concise and helpful.

    CONTEXT:
    {context}

    QUESTION:
    {question}

    ANSWER:
    """
    prompt = PromptTemplate.from_template(template)

    # 5. Build the RAG Chain using LangChain Expression Language (LCEL)
    # This chain defines the step-by-step flow of data.
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    print("✅ RAG Chatbot is ready. Ask your agricultural questions!")
    print("   Type 'exit' to quit.")

    # 6. Create an interactive loop to ask questions
    while True:
        try:
            question = input("\nYour Question: ")
            if question.lower() == 'exit':
                print("Exiting chatbot. Goodbye!")
                break
            
            print("Thinking...")
            answer = rag_chain.invoke(question)
            print("\nAnswer:", answer)

        except Exception as e:
            print(f"An error occurred: {e}")
            break


if __name__ == "__main__":
    main()