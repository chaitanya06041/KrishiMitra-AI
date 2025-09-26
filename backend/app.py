from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
import tempfile
import aiofiles
from pydantic import BaseModel

# Helper functions
from helpers.yield_prediction import predict_yield
from helpers.crop_recommendation import crop_recommendation
from helpers.crop_disease_prediction import predict_crop_disease, ResNet9
from helpers.yield_prediction_numerical_data import predict_yield_using_numeric_data


# Input types
# For yield prediction using location
class yield_prediction_request(BaseModel):
    year: int
    area: float
    state: str
    district: str
    season: str
    crop: str

# for yield prediction using numerical data
class yield_prediction_request_numerical(BaseModel):
    crop: str
    season: str
    state: str
    area: float
    rainfall: float
    fertilizer: float
    pesticide: float

# For crop recommendation
class crop_recommendation_request(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float


# ==================================================================================================================

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routes

# Yield prediction
@app.post("/predict-yield")
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
    

# Yield prediction using numerical data like rainfall, pesticides, etc.
@app.post("/predict-yield-numerical")
async def predict_yield_numerical_endpoint(request: yield_prediction_request_numerical):
    try:
        crop = request.crop
        season = request.season
        state = request.state
        area = request.area
        rainfall = request.rainfall
        fertilizer = request.fertilizer
        pesticide = request.pesticide
        predicted_production = predict_yield_using_numeric_data(crop, season, state, area, rainfall, fertilizer, pesticide)
        if(isinstance(predicted_production, str)):
            raise HTTPException(status_code=400, detail=predicted_production)
        else:
            return {"production": round(float(predicted_production), 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# Crop recommendation
@app.post("/crop-recommendation")
async def crop_recommendation_endpoint(request: crop_recommendation_request):
    try:
        N = request.N
        P = request.P
        K = request.K
        temperature = request.temperature
        humidity = request.humidity
        ph = request.ph
        rainfall = request.rainfall
        predicted_crop = crop_recommendation(N=N, P=P, K=K, temperature=temperature, humidity=humidity, ph=ph, rainfall=rainfall)
        if predicted_crop is None:
            raise HTTPException(status_code=400, detail="Invalid input data")
        return {'prediction': predicted_crop}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Crop disease prediction
@app.post('/disease-prediction')
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

        return {'prediction': predicted_disease}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
        
    finally:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)