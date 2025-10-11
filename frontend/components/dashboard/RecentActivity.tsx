import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface RecentActivityItem {
  id: string;
  crop: string;
  disease: string;
  confidence: number;
  date: string;
  status: "healthy" | "disease";
}

const RecentActivity = () => {
  const activities: RecentActivityItem[] = [
    { id: '1', crop: 'Tomato', disease: 'Late Blight', confidence: 92, date: '2 hours ago', status: 'disease' },
    { id: '2', crop: 'Rice', disease: 'Healthy', confidence: 98, date: '5 hours ago', status: 'healthy' },
    { id: '3', crop: 'Wheat', disease: 'Rust', confidence: 85, date: '1 day ago', status: 'disease' },
    { id: '4', crop: 'Corn', disease: 'Healthy', confidence: 96, date: '2 days ago', status: 'healthy' },
  ];

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Predictions
          </h3>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            View All
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">No recent predictions yet.</p>
            <p className="text-sm mt-1">Click here to get started</p>
          </div>
        </div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Predictions
        </h3>
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-lg ${
                  activity.status === "healthy"
                    ? "bg-green-100"
                    : "bg-orange-100"
                }`}
              >
                {activity.status === "healthy" ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{activity.crop}</p>
                <p className="text-sm text-gray-600">{activity.disease}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {activity.confidence}%
              </p>
              <p className="text-xs text-gray-500">{activity.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
