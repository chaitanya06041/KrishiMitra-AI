import json

file_path = 'data/weather_alerts.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        alerts = json.load(f)
    # The 'alerts' variable now holds the data from the JSON file.
    # You can uncomment the line below to test it:
    # print(alerts.get("Tomato"))
except FileNotFoundError:
    print(f"Error: The file at '{file_path}' was not found.")
except json.JSONDecodeError:
    print(f"Error: Could not decode JSON from the file at '{file_path}'.")

print(alerts.get('Tomato'))