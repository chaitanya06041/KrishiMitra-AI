import React from 'react'
import StatCard from './StatCard'
import WeatherWidget from './WeatherWidget'
import RecentActivity from './RecentActivity'
import { Activity, CheckCircle, AlertCircle } from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Farmer</h1>
          <p className="text-gray-600">Here's what's happening with your crops today</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Predictions"
            value={156}
            icon={<Activity className="w-6 h-6 text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Healthy Crops"
            value={124}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Diseases Detected"
            value={32}
            icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
            color="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeatherWidget />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

export default Dashboard
