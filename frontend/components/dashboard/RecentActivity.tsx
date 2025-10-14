'use client'
import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/features/userSlice";
import { createClient } from "@/lib/supabase/client";
import ActivityLoader from "./ActivityLoader";

interface RecentActivityItem {
  history_id: string;
  crop: string;
  disease: string;
  created_at: string;
}

// A simple time-ago utility
const timeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const RecentActivity = () => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector(selectUserProfile);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("history")
        .select("history_id, crop, disease, created_at")
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        setError("Failed to load recent activity. Please try again later.");
        console.error("Error fetching recent activity:", error);
      } else {
        setActivities(data || []);
      }
      setIsLoading(false);
    };

    fetchRecentActivities();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <ActivityLoader />
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Predictions
          </h3>
        </div>
        <div className="flex-grow flex items-center justify-center text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0 && !isLoading) {
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
        {activities.map((activity) => (
          <div
            key={activity.history_id}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-2 rounded-lg ${
                  activity.disease.toLowerCase() === "healthy"
                    ? "bg-green-100"
                    : "bg-orange-100"
                }`}
              >
                {activity.disease.toLowerCase() === "healthy" ? (
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
              <p className="text-xs text-gray-500">{timeAgo(activity.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
