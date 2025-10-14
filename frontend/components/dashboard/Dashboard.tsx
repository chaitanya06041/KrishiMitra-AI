"use client";
import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import WeatherWidget from "./WeatherWidget";
import RecentActivity from "./RecentActivity";
import { Activity, CheckCircle, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUserProfile } from "@/store/features/userSlice";
import { createClient } from "@/lib/supabase/client";

// Skeleton component for the StatCard
const StatCardSkeleton = () => (
  <div className="p-6 bg-gray-100 rounded-xl shadow-sm animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
    </div>
    <div className="mt-4 h-8 bg-gray-300 rounded w-1/2"></div>
  </div>
);

// Generic skeleton block for larger components
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={`bg-gray-100 rounded-xl shadow-sm animate-pulse ${className}`}
  ></div>
);

const Dashboard = () => {
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [healthyCrops, setHealthyCrops] = useState(0);
  const [diseasesDetected, setDiseasesDetected] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector(selectUserProfile);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Use Promise.all to fetch data in parallel
        const [totalResult, healthyResult] = await Promise.all([
          supabase
            .from("history")
            .select("history_id", { count: "exact", head: true })
            .eq("user_id", user.user_id),
          supabase
            .from("history")
            .select("history_id", { count: "exact", head: true })
            .eq("user_id", user.user_id)
            .ilike("disease", "healthy"),
        ]);

        if (totalResult.error) throw totalResult.error;
        if (healthyResult.error) throw healthyResult.error;

        const total = totalResult.count || 0;
        const healthy = healthyResult.count || 0;

        setTotalPredictions(total);
        setHealthyCrops(healthy);
        setDiseasesDetected(total - healthy);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load prediction stats.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Farmer
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your crops today
          </p>
        </div>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : error ? (
            <div className="md:col-span-3 text-center text-red-600 bg-red-50 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              <StatCard
                title="Total Predictions"
                value={totalPredictions}
                icon={<Activity className="w-6 h-6 text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                title="Healthy Crops"
                value={healthyCrops}
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                color="bg-green-50"
              />
              <StatCard
                title="Diseases Detected"
                value={diseasesDetected}
                icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
                color="bg-orange-50"
              />
            </>
          )}
        </div>

        {/* Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              {/* Approximating the heights of your components */}
              <SkeletonBlock className="h-64" />
              <SkeletonBlock className="h-96" />
            </>
          ) : (
            <>
              <WeatherWidget />
              <RecentActivity />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;