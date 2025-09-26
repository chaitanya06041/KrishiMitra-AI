import os
from dotenv import load_dotenv

# --- LangChain components ---
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore

# --- Load environment variables from .env file ---
load_dotenv()

# --- Configuration ---
# You can change these to match your setup
PDF_DATA_PATH = "./data/"
PINECONE_INDEX_NAME = "smart-agriculture" # The name of your index in Pinecone

def ingest_data():
    """
    This function performs the entire data ingestion pipeline:
    1. Loads PDF documents from a specified directory.
    2. Splits the documents into smaller, manageable chunks.
    3. Creates embeddings for each chunk using Google's model.
    4. Stores the chunks and their embeddings in a Pinecone vector store.
    """
    print("Starting data ingestion process...")

    # 1. Load Documents
    # Using DirectoryLoader to load all PDFs from the specified folder
    print(f"Loading documents from '{PDF_DATA_PATH}'...")
    loader = DirectoryLoader(PDF_DATA_PATH, glob="**/*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    if not documents:
        print("No documents found. Exiting.")
        return
    print(f"Loaded {len(documents)} document(s).")

    # 2. Split Documents into Chunks
    # This splitter is effective for general text.
    # chunk_size is the max number of characters in a chunk.
    # chunk_overlap keeps some text between chunks for better context.
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)
    print(f"Split documents into {len(chunks)} chunks.")

    # 3. Create Embeddings
    # Using Google's free embedding model. It will use the GOOGLE_API_KEY
    # from your .env file automatically.
    print("Initializing embedding model...")
    embeddings_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    print("Embedding model initialized.")

    # 4. Store in Pinecone
    # This is where the magic happens. LangChain's PineconeVectorStore.from_documents
    # will handle creating embeddings for all chunks and uploading them to your index.
    print(f"Storing chunks in Pinecone index '{PINECONE_INDEX_NAME}'...")
    # This might take a few minutes depending on the number of chunks.
    PineconeVectorStore.from_documents(
        chunks,
        embeddings_model,
        index_name=PINECONE_INDEX_NAME
    )
    print("Data ingestion complete!")


if __name__ == "__main__":
    ingest_data()