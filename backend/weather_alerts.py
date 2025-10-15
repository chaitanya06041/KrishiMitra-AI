import requests
import json
import os
from datetime import date

def get_todays_avg_weather(city_name: str):
    # Step 1: Get coordinates from Open-Meteo Geocoding API
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}&count=1"
    geo_res = requests.get(geo_url)
    geo_data = geo_res.json()

    if not geo_data.get("results"):
        raise ValueError("Location not found.")

    latitude = geo_data["results"][0]["latitude"]
    longitude = geo_data["results"][0]["longitude"]
    location_name = geo_data["results"][0]["name"]

    # Step 2: Fetch hourly data for today
    weather_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&longitude={longitude}"
        f"&hourly=temperature_2m,relative_humidity_2m,precipitation,uv_index"
        f"&timezone=auto"
    )
    weather_res = requests.get(weather_url)
    weather_data = weather_res.json()

    hourly = weather_data.get("hourly", {})
    times = hourly.get("time", [])

    # Step 3: Filter only today’s data
    today_str = date.today().isoformat()
    today_indices = [i for i, t in enumerate(times) if t.startswith(today_str)]

    if not today_indices:
        raise ValueError("No weather data available for today.")

    # Extract today’s values
    temps = [hourly["temperature_2m"][i] for i in today_indices]
    hums = [hourly["relative_humidity_2m"][i] for i in today_indices]
    rains = [hourly["precipitation"][i] for i in today_indices]
    uvs = [hourly["uv_index"][i] for i in today_indices if hourly["uv_index"][i] is not None]

    # Step 4: Calculate averages and totals
    avg_temp = sum(temps) / len(temps)
    avg_humidity = sum(hums) / len(hums)
    total_rain = sum(rains)
    avg_uv = sum(uvs) / len(uvs) if uvs else 0

    # Step 5: Return formatted data
    return {
        "location": location_name,
        "temperature": round(avg_temp, 2),
        "humidity": round(avg_humidity, 2),
        "rainfall": round(total_rain, 2),
        "index": round(avg_uv, 2),
        "latitude": latitude,
        "longitude": longitude,
    }

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

def get_alerts(crop, location):
    weather_data = get_todays_avg_weather(location)
    print(weather_data)
    crop_rules = load_alerts_data()
    if not crop_rules:
        return ""
    alert = check_alerts(crop, weather_data, crop_rules)
    if not alert:
        return ""
    return alert



if __name__ == "__main__":
    city = "Sangli"
    crop = "Lentil"
    print(get_alerts(crop, city))