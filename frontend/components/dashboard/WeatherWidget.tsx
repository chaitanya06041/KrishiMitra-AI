'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning, Droplets, Wind } from 'lucide-react';

// NOTE: Using the actual Redux hooks provided.
import { useAppSelector } from '@/store/hooks';
import { selectUserProfile } from '@/store/features/userSlice';


// TypeScript Interfaces for our weather data
interface WeatherInterface {
  temperature: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
}

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: React.ElementType;
}

// Helper to map weather codes to icons and text
const getWeatherInfo = (code: number): { condition: string; icon: React.ElementType } => {
    const weatherMap: { [key: number]: { condition: string; icon: React.ElementType } } = {
        0: { condition: 'Clear Sky', icon: Sun },
        1: { condition: 'Mainly Clear', icon: Sun },
        2: { condition: 'Partly Cloudy', icon: Cloud },
        3: { condition: 'Overcast', icon: Cloud },
        45: { condition: 'Fog', icon: CloudFog },
        48: { condition: 'Depositing Rime Fog', icon: CloudFog },
        51: { condition: 'Light Drizzle', icon: CloudRain },
        53: { condition: 'Moderate Drizzle', icon: CloudRain },
        55: { condition: 'Dense Drizzle', icon: CloudRain },
        61: { condition: 'Slight Rain', icon: CloudRain },
        63: { condition: 'Moderate Rain', icon: CloudRain },
        65: { condition: 'Heavy Rain', icon: CloudRain },
        71: { condition: 'Slight Snowfall', icon: CloudSnow },
        73: { condition: 'Moderate Snowfall', icon: CloudSnow },
        75: { condition: 'Heavy Snowfall', icon: CloudSnow },
        80: { condition: 'Slight Rain Showers', icon: CloudRain },
        81: { condition: 'Moderate Rain Showers', icon: CloudRain },
        82: { condition: 'Violent Rain Showers', icon: CloudRain },
        95: { condition: 'Thunderstorm', icon: CloudLightning },
        96: { condition: 'Thunderstorm with Hail', icon: CloudLightning },
        99: { condition: 'Thunderstorm with Heavy Hail', icon: CloudLightning },
    };
    return weatherMap[code] || { condition: 'Unknown', icon: Sun };
};


const WeatherWidget = () => {
    const [currentWeather, setCurrentWeather] = useState<WeatherInterface | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayLocation, setDisplayLocation] = useState('');
    
    // This uses your Redux selector to get the user's location
    const user = useAppSelector(selectUserProfile);
    const location = user?.location;

    const fetchWeather = useCallback(async (loc: string) => {
        if (!loc) {
            setIsLoading(false);
            setError("Location not provided in user profile.");
            return;
        };
        setIsLoading(true);
        setError(null);
        try {
            // Use only the city name for a more reliable search
            const city = loc.split(',')[0];
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
            const geoData = await geoRes.json();
            if (!geoData.results?.length) throw new Error("Location not found.");

            const { latitude, longitude, name } = geoData.results[0];
            setDisplayLocation(name); // Set the location name from API response

            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
            
            const weatherRes = await fetch(weatherUrl);
            const weatherData = await weatherRes.json();
            if (!weatherData.current || !weatherData.daily) throw new Error("Failed to fetch weather data.");

            const { temperature_2m, relative_humidity_2m, precipitation, weather_code, wind_speed_10m } = weatherData.current;
            const todayUvIndex = weatherData.daily.uv_index_max[0];

            setCurrentWeather({
                temperature: Math.round(temperature_2m),
                condition: getWeatherInfo(weather_code).condition,
                weatherCode: weather_code,
                humidity: relative_humidity_2m,
                windSpeed: Math.round(wind_speed_10m),
                precipitation: precipitation, 
                uvIndex: Math.round(todayUvIndex),
            });

            const processedForecast = weatherData.daily.time.slice(1, 5).map((date: string, index: number) => {
                const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
                const code = weatherData.daily.weather_code[index + 1];
                return {
                    day,
                    high: Math.round(weatherData.daily.temperature_2m_max[index + 1]),
                    low: Math.round(weatherData.daily.temperature_2m_min[index + 1]),
                    condition: getWeatherInfo(code).condition,
                    icon: getWeatherInfo(code).icon,
                };
            });
            setForecast(processedForecast);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (location) {
            fetchWeather(location);
        } else {
             setIsLoading(false);
             setError("Location not found in Redux state.");
        }
    }, [location, fetchWeather]);

    if (isLoading) {
        return (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full items-center justify-center min-h-[480px]">
                <p className="text-gray-600">Fetching weather data...</p>
             </div>
        );
    }

    if (error || !currentWeather) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <div className="bg-red-50 rounded-lg p-6 text-center">
                        <p className="text-red-600 font-medium text-xl">Weather data not available.</p>
                        <p className="text-md text-red-600 mt-2">{error || "Please check your location settings or try again later."}</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const CurrentWeatherIcon = getWeatherInfo(currentWeather.weatherCode).icon;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weather in {displayLocation}</h3>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Current Temperature</p>
                        <h2 className="text-5xl font-bold text-gray-900 mb-2">{currentWeather.temperature}°C</h2>
                        <p className="text-gray-700 font-medium">{currentWeather.condition}</p>
                    </div>
                    <CurrentWeatherIcon className="w-16 h-16 text-blue-400" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-100">
                    <div className="flex items-center space-x-2">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-xs text-gray-600">Humidity</p>
                            <p className="text-sm font-semibold text-gray-900">{currentWeather.humidity}%</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Wind className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-xs text-gray-600">Wind</p>
                            <p className="text-sm font-semibold text-gray-900">{currentWeather.windSpeed} km/h</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CloudRain className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-xs text-gray-600">Rain</p>
                            <p className="text-sm font-semibold text-gray-900">{currentWeather.precipitation} mm</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-700 mb-4">4-Day Forecast</p>
                <div className="grid grid-cols-4 gap-3">
                    {forecast.map((day) => {
                        const Icon = day.icon;
                        return (
                            <div key={day.day} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors duration-200">
                                <p className="text-xs font-medium text-gray-600 mb-2">{day.day}</p>
                                <Icon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                                <div className="flex items-center justify-center space-x-1 text-xs">
                                    <span className="font-semibold text-gray-900">{day.high}°</span>
                                    <span className="text-gray-500">/{day.low}°</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start space-x-3">
                    <Sun className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-900">UV Index: High ({currentWeather.uvIndex} of 11+)</p>
                        <p className="text-xs text-amber-700 mt-1">Consider protective measures during peak hours (10 AM - 4 PM)</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WeatherWidget;

