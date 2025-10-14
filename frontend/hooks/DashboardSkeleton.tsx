// components/skeletons/DashboardSkeleton.tsx
import React from "react";

// Reusable skeleton block for a generic rectangle
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
  ></div>
);

// Skeleton for the StatCard component
const StatCardSkeleton = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col space-y-4">
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock className="w-6 h-6 rounded-full" />
    </div>
    <SkeletonBlock className="h-8 w-1/4" />
  </div>
);

// Skeleton for the Weather Widget
const WeatherCardSkeleton = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-[320px] flex flex-col space-y-4">
    <SkeletonBlock className="h-5 w-1/3 mb-4" /> {/* "Weather in Kolhapur" */}
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-10 w-1/4" /> {/* Temperature */}
      <SkeletonBlock className="h-12 w-12 rounded-full" />{" "}
      {/* Weather Icon */}
    </div>
    <SkeletonBlock className="h-4 w-1/2" /> {/* "Partly Cloudy" */}
    <div className="grid grid-cols-3 gap-4 mt-4">
      <SkeletonBlock className="h-16" /> {/* Humidity */}
      <SkeletonBlock className="h-16" /> {/* Wind */}
      <SkeletonBlock className="h-16" /> {/* Rain */}
    </div>
    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
      <SkeletonBlock className="h-4 w-1/4 mb-2" /> {/* "4-Day Forecast" */}
      <div className="flex justify-between space-x-2">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-20 w-1/4" />
        ))}
      </div>
    </div>
  </div>
);

// Skeleton for the Recent Activity component
const RecentActivitySkeleton = () => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm h-[320px] flex flex-col space-y-4">
    <div className="flex justify-between items-center mb-4">
      <SkeletonBlock className="h-5 w-1/2" /> {/* "Recent Predictions" */}
      <SkeletonBlock className="h-4 w-1/5" /> {/* "View All" */}
    </div>
    <div className="flex-grow space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <SkeletonBlock className="w-6 h-6 rounded-full" />
          <div className="flex-1 space-y-1">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-3 w-3/5" />
          </div>
          <SkeletonBlock className="h-3 w-1/6" />
        </div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <SkeletonBlock className="h-8 w-2/5 mb-2" />{" "}
          {/* Welcome back, Farmer */}
          <SkeletonBlock className="h-5 w-1/2" />{" "}
          {/* Here's what's happening */}
        </div>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherCardSkeleton />
          <RecentActivitySkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;