# --------------------------------------------------------------------------
# This file defines the routes for all prediction-related tasks.
# It uses APIRouter to group these routes, which can then be included
# in the main FastAPI application. This is a best practice for modularity.
# --------------------------------------------------------------------------

from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel
import os
import uuid
import shutil
import tempfile
import aiofiles

# Note: Make sure the helper and model files are accessible.
# If you run `uvicorn` from the project root, these imports should work.
from helpers.yield_prediction import predict_yield
from helpers.crop_recommendation import crop_recommendation
from helpers.crop_disease_prediction import predict_crop_disease, ResNet9
from helpers.yield_prediction_numerical_data import predict_yield_using_numeric_data

# --- Pydantic Models for Request Bodies ---

class yield_prediction_request(BaseModel):
    year: int
    area: float
    state: str
    district: str
    season: str
    crop: str

class yield_prediction_request_numerical(BaseModel):
    crop: str
    season: str
    state: str
    area: float
    rainfall: float
    fertilizer: float
    pesticide: float

class crop_recommendation_request(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# --- API Router Definition ---

# Create a router. The `tags` parameter groups all endpoints from this file
# under a "Prediction Models" heading in the automatic API docs.
router = APIRouter(
    tags=["Prediction Models"]
)

# --- API Endpoints ---

@router.post("/predict-yield")
async def predict_yield_endpoint(request: yield_prediction_request):
    try:
        input_data = request.dict()
        predicted_production = predict_yield(input_data)
        if isinstance(predicted_production, str):
            raise HTTPException(status_code=400, detail=predicted_production)
        else:
            return {"production": round(float(predicted_production), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict-yield-numerical")
async def predict_yield_numerical_endpoint(request: yield_prediction_request_numerical):
    try:
        predicted_production = predict_yield_using_numeric_data(
            request.crop, request.season, request.state, request.area,
            request.rainfall, request.fertilizer, request.pesticide
        )
        if isinstance(predicted_production, str):
            raise HTTPException(status_code=400, detail=predicted_production)
        else:
            return {"production": round(float(predicted_production), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/crop-recommendation")
async def crop_recommendation_endpoint(request: crop_recommendation_request):
    try:
        predicted_crop = crop_recommendation(**request.dict())
        if predicted_crop is None:
            raise HTTPException(status_code=400, detail="Invalid input data or model error")
        return {'prediction': predicted_crop}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post('/disease-prediction')
async def disease_prediction_endpoint(file: UploadFile = File(...)):
    temp_dir = tempfile.mkdtemp()
    try:
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.join(temp_dir, unique_filename)

        async with aiofiles.open(temp_file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)

        predicted_disease = predict_crop_disease(temp_file_path)

        if "Error:" in predicted_disease:
             raise HTTPException(status_code=400, detail=predicted_disease)
        
        parts = predicted_disease.split('___')
        crop = parts[0].replace(',_', ' ').replace('_', ' ')
        disease = parts[1].replace('_', ' ').strip()
        return {'crop': crop, 'prediction': disease, 'recommendation': "Test"} # Placeholder recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
