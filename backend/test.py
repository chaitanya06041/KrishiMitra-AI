# resave_model.py

import torch
# IMPORTANT: Import the ResNet9 class from its actual location.
from helpers.crop_disease_prediction import ResNet9, ImageClassificationBase, ConvBlock, accuracy

# --- Configuration ---
OLD_MODEL_PATH = './models/disease prediction/plant-disease-model-complete.pth'
NEW_MODEL_PATH = './models/disease prediction/plant-disease-model-fixed.pth'

print("Attempting to load the old model...")
# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load the model using the old method. This script is __main__, so it should work.
model = torch.load(OLD_MODEL_PATH, map_location=device, weights_only=False)
print("Old model loaded successfully.")

# Now, save the model again. Pickle will now record the correct import path for ResNet9.
torch.save(model, NEW_MODEL_PATH)
print(f"Model re-saved successfully to: {NEW_MODEL_PATH}")
print("You can now update your prediction script to use the new model path.")