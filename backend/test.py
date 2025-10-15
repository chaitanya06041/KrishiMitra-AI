import json
import os


def load_alerts_data():
    # Construct a path relative to this script file for robustness
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, "data", "weather_alerts.json")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            crop_rules = json.load(f)
    except FileNotFoundError:
        print(f"Error: The file at '{file_path}' was not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from the file at '{file_path}'.")
        return None
    return crop_rules


def check_alerts(crop, weather, crop_rules):
    alerts = []
    if crop not in crop_rules:
        print(f"Warning: No alert rules found for crop '{crop}'.")
        return alerts

    # A robust mapping from rule parameter prefixes to weather data keys
    param_to_weather_key = {
        "temperature": "temperature",
        "humidity": "humidity",
        "rainfall": "rainfall",
        "uv_index": "uv_index",
    }

    rules = crop_rules[crop]
    for param, rule in rules.items():
        # Determine the correct key for the weather data dictionary
        weather_key_prefix = param.split('_', 1)[-1]
        weather_key = param_to_weather_key.get(weather_key_prefix)
        
        val = weather.get(weather_key) if weather_key else None
        if val is None:
            continue

        # if "min" in param and val < rule["value"]:
        #     alerts.append((rule["alert_message"], rule["preventive_measure"]))
        if "min" in param and 'rain' not in param and val < rule["value"]:
            alerts.append((f"{weather_key_prefix} is {val} today", rule["alert_message"], rule["preventive_measure"]))
        elif "max" in param and val > rule["value"]:
            alerts.append((f"{weather_key_prefix} is {val} today", rule["alert_message"], rule["preventive_measure"]))
    
    return alerts


if __name__ == "__main__":
    crop_rules = load_alerts_data()
    weather = {'location': 'Kolhāpur', 'temperature': 24.12, 'humidity': 82.38, 'rainfall': 5.3, 'index': 1.71, 'latitude': 16.69563, 'longitude': 74.23167}
    crop = 'Cotton'
    alerts = check_alerts(crop, weather, crop_rules)
    print(alerts)
