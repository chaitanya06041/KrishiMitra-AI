import joblib
import pandas as pd
import numpy as np

def predict_yield(input_data):
    try:
        # Load the saved model and columns
        model = joblib.load('./models/yield prediction/xgboost_crop_yield_model.pkl')
        model_cols = joblib.load('./models/yield prediction/model_columns.pkl')
        valid_categories = joblib.load('./models/yield prediction/valid_categories.pkl')
    except FileNotFoundError:
        return "Error: Model files not found. Please train and save the model first."

    # Create a DataFrame from the input data
    input_data = {k: v.lower().strip() if isinstance(v, str) else v for k, v in input_data.items()}

    for field in ['state', 'district', 'season', 'crop']:
        if input_data[field] not in valid_categories.get(field + 's', []):
            return f"Error: Invalid {field} '{input_data[field]}'."

        input_df = pd.DataFrame([input_data])

    input_encoded = pd.get_dummies(input_df, columns=['state', 'district', 'season', 'crop'])
    input_aligned = input_encoded.reindex(columns=model_cols, fill_value=0)
    prediction_log = model.predict(input_aligned)
    prediction = np.expm1(prediction_log[0])
    prediction = max(0, prediction)

    return prediction

