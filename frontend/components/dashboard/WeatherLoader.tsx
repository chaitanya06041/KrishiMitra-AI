import React from "react";

const WeatherLoader = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-6 w-2/3 bg-gray-200 rounded-md mb-6"></div>

      {/* Current Weather Card Skeleton */}
      <div className="bg-gray-100 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-4 w-1/2 bg-gray-300 rounded-md mb-2"></div>
            <div className="h-12 w-3/4 bg-gray-300 rounded-md mb-3"></div>
            <div className="h-5 w-1/2 bg-gray-300 rounded-md"></div>
          </div>
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-3 w-12 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-16 bg-gray-300 rounded-md mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Skeleton */}
      <div>
        <div className="h-5 w-1/3 bg-gray-200 rounded-md mb-4"></div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 text-center">
              <div className="h-3 w-10 mx-auto bg-gray-300 rounded-md mb-2"></div>
              <div className="w-8 h-8 mx-auto bg-gray-300 rounded-full mb-2"></div>
              <div className="h-3 w-12 mx-auto bg-gray-300 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

      {/* UV Index Skeleton */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-gray-300 rounded-md"></div>
            <div className="h-3 w-3/4 bg-gray-300 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherLoader;
