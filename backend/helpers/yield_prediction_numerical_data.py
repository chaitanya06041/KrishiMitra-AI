import tensorflow as tf
import joblib
import pandas as pd
import numpy as np  # Import numpy


def predict_yield_using_numeric_data(crop, season, state, area, rainfall, fertilizer, pesticide):
    try:
        model = tf.keras.models.load_model("./models/yield prediction numerical data/yield_prediction_model_log.h5", custom_objects={'mae': 'mae'})
        preprocessor = joblib.load("./models/yield prediction numerical data/preprocessor.pkl")
        user_input = pd.DataFrame({
            "Crop": [crop],
            "Season": [season],
            "State": [state],
            "Area": [area],
            "Annual_Rainfall": [rainfall],
            "Fertilizer": [fertilizer],
            "Pesticide": [pesticide]
        })
        user_input_preprocessed = preprocessor.transform(user_input)
        predicted_yield_log = model.predict(user_input_preprocessed)

        predicted_yield = np.exp(predicted_yield_log[0][0])
        return predicted_yield
    except Exception as e:
        return f"error: {e}"
