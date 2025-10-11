import React from 'react'
import { Sun, Cloud, CloudRain, Droplets, Wind } from 'lucide-react'

const WeatherWidget = () => {
  interface weatherInterface {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    uvIndex: number;
  }
  const currentWeather : weatherInterface | null= {
    temperature: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    precipitation: 30,
    uvIndex: 6,
  };


  const forecast = [
    { day: 'Mon', high: 30, low: 22, condition: 'sunny', icon: Sun },
    { day: 'Tue', high: 28, low: 21, condition: 'cloudy', icon: Cloud },
    { day: 'Wed', high: 26, low: 20, condition: 'rainy', icon: CloudRain },
    { day: 'Thu', high: 27, low: 21, condition: 'sunny', icon: Sun },
  ];

  if (currentWeather === null) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
          {/* <div className="text-xs text-gray-500">Updated 10 mins ago</div> */}
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-red-50 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium text-xl">Weather data not available.</p>
            <p className="text-md text-red-600 mt-2">Please check your location settings or try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Weather Forecast</h3>
        {/* <div className="text-xs text-gray-500">Updated 10 mins ago</div> */}
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Temperature</p>
            <h2 className="text-5xl font-bold text-gray-900 mb-2">{currentWeather.temperature}°C</h2>
            <p className="text-gray-700 font-medium">{currentWeather.condition}</p>
          </div>
          <Cloud className="w-16 h-16 text-blue-400" />
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
              <p className="text-sm font-semibold text-gray-900">{currentWeather.precipitation}%</p>
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
                  <span className="text-gray-500">{day.low}°</span>
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
            <p className="text-sm font-medium text-amber-900">UV Index: High ({currentWeather.uvIndex}/10)</p>
            <p className="text-xs text-amber-700 mt-1">Consider protective measures during peak hours (10 AM - 4 PM)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget
