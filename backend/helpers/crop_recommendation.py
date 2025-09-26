import joblib
import pandas as pd

def load_ml_components():
    try:
        rfc_model = joblib.load('./models/crop recommendation/random_forest_model.joblib')
        svm_model = joblib.load('./models/crop recommendation/svm_model.joblib')
        xgb_model = joblib.load('./models/crop recommendation/xgboost_model.joblib')
        label_encoder = joblib.load('./models/crop recommendation/label_encoder.joblib')
        rainfall_encoder = joblib.load('./models/crop recommendation/rainfall_encoder.joblib')
        ph_encoder = joblib.load('./models/crop recommendation/ph_encoder.joblib')
        scaler = joblib.load('./models/crop recommendation/scaler.joblib')
        return rfc_model, svm_model, xgb_model, label_encoder, rainfall_encoder, ph_encoder, scaler
    except Exception as e:
        return None
   


def crop_recommendation(N, P, K, temperature, humidity, ph, rainfall):
    
    # Load the components
    try:
        rfc_model, svm_model, xgb_model, label_encoder, rainfall_encoder, ph_encoder, scaler = load_ml_components()
    except FileNotFoundError as e:
        print(f"Error loading components: {e}. Ensure all joblib files exist.")
        return None

    # Create a DataFrame with input features
    input_data = pd.DataFrame({
        'N': [N],
        'P': [P],
        'K': [K],
        'temperature': [temperature],
        'humidity': [humidity],
        'ph': [ph],
        'rainfall': [rainfall]
    })

    # Feature engineering (same as in training)
    input_data['NPK'] = (input_data['N'] + input_data['P'] + input_data['K']) / 3
    input_data['THI'] = input_data['temperature'] * input_data['humidity'] / 100

    # Rainfall level categorization
    if rainfall <= 50:
        rainfall_level = 'Low'
    elif rainfall <= 100:
        rainfall_level = 'Medium'
    elif rainfall <= 200:
        rainfall_level = 'High'
    else:
        rainfall_level = 'Very High'

    # pH categorization
    if ph < 5.5:
        ph_category = 'Acidic'
    elif ph <= 7.5:
        ph_category = 'Neutral'
    else:
        ph_category = 'Alkaline'

    # Encode categorical features
    try:
        # Check if the category exists in the encoder's classes before transforming. If does not exist, make it 0.
        if rainfall_level in rainfall_encoder.classes_:
            rainfall_level_encoded = rainfall_encoder.transform([rainfall_level])[0]
        else:
            print(f"Warning: Unseen rainfall category: {rainfall_level}. Defaulting to the first category.")
            rainfall_level_encoded = 0 

        if ph_category in ph_encoder.classes_:
             ph_category_encoded = ph_encoder.transform([ph_category])[0]
        else:
             print(f"Warning: Unseen pH category: {ph_category}. Defaulting to the first category.")
             ph_category_encoded = 0 

    except ValueError as e:
        print(f"Error during encoding: {e}")
        rainfall_level_encoded = 0  # Default
        ph_category_encoded = 0     # Default


    input_data['rainfall_level'] = rainfall_level_encoded
    input_data['ph_category'] = ph_category_encoded

    # Interaction features
    input_data['temp_rain_interaction'] = input_data['temperature'] * input_data['rainfall']
    input_data['ph_rain_interaction'] = input_data['ph'] * input_data['rainfall']

    # Scale the features
    # Ensure the order of columns is the same as during training
    try:
        input_scaled = scaler.transform(input_data)
    except Exception as e:
         print(f"Error during scaling: {e}")
         return None


    # Make predictions with all three models
    rfc_pred = rfc_model.predict(input_scaled)[0]
    svm_pred = svm_model.predict(input_scaled)[0]
    xgb_pred = xgb_model.predict(input_scaled)[0]

    # Get prediction probabilities (if available)
    rfc_proba = None
    xgb_proba = None
    svm_proba = None

    try:
        if hasattr(rfc_model, 'predict_proba'):
            rfc_proba = float(rfc_model.predict_proba(input_scaled)[0].max())
        if hasattr(xgb_model, 'predict_proba'):
            xgb_proba = float(xgb_model.predict_proba(input_scaled)[0].max())
        if hasattr(svm_model, 'predict_proba'): 
            svm_proba = float(svm_model.predict_proba(input_scaled)[0].max())
    except Exception as e:
        print(f"Warning: Could not get prediction probabilities: {e}")

    crop_names = []
    try:
        crop_names.append(label_encoder.inverse_transform([rfc_pred])[0])
        crop_names.append(label_encoder.inverse_transform([svm_pred])[0])
        crop_names.append(label_encoder.inverse_transform([xgb_pred])[0])
    except Exception as e:
        print(f"Error in inverse transform: {e}")
        crop_names = [f"Crop_{rfc_pred}", f"Crop_{svm_pred}", f"Crop_{xgb_pred}"]


    # Create result dictionary
    results = {
        'input_parameters': {
            'N': N, 'P': P, 'K': K,
            'temperature': temperature,
            'humidity': humidity,
            'ph': ph,
            'rainfall': rainfall
        },
        'predictions': {
            'Random_Forest': {
                'crop': crop_names[0],
                'confidence': rfc_proba
            },
            'SVM': {
                'crop': crop_names[1],
                'confidence': svm_proba
            },
            'XGBoost': {
                'crop': crop_names[2],
                'confidence': xgb_proba
            }
        },
        'consensus': {
            'all_agree': len(set(crop_names)) == 1,
            'majority_prediction': max(set(crop_names), key=crop_names.count) if crop_names else "N/A", 
            'agreement_count': max([crop_names.count(crop) for crop in set(crop_names)]) if crop_names else 0 
        }
    }

    return results
