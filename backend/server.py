# --------------------------------------------------------------------------
# This is the main entry point for the entire application.
# It creates the primary FastAPI app instance and then includes the routers
# from the 'apis' package. This creates a single, unified API with
# clean, modular code organization.
# --------------------------------------------------------------------------

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the routers from the 'apis' package.
# The __init__.py file in the 'apis' directory makes this clean import possible.
from apis import predictions_router, rag_router

# Initialize the main FastAPI application
main_app = FastAPI(
    title="Unified Smart Agriculture API",
    description="A single API providing access to prediction models and a RAG-based chatbot for agriculture.",
    version="1.0.0"
)

# Add CORS middleware to the main application
# This will apply to all included routers.
main_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the routers into the main app with a URL prefix.
# All routes from predictions_api.py will now be under /predict
main_app.include_router(predictions_router, prefix="/predict")

# All routes from rag_api.py will now be under /rag
main_app.include_router(rag_router, prefix="/rag")


@main_app.get("/")
def read_root():
    return {
        "message": "Welcome to the Unified Smart Agriculture API",
        "docs_url": "/docs"
        }

# This block is for convenience, allowing you to run the app directly with `python server.py`
if __name__ == "__main__":
    print("Starting server... Access docs at http://127.0.0.1:8000/docs")
    uvicorn.run("server:main_app", host="0.0.0.0", port=8000, reload=True)
