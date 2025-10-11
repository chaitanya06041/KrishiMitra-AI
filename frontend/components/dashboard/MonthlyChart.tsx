import React from 'react'
import { Calendar } from 'lucide-react'

const MonthlyChart = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const predictions = [12, 19, 15, 25, 22, 30];
  const maxValue = Math.max(...predictions);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Prediction Trends</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Last 6 months</span>
        </div>
      </div>
      <div className="flex items-end justify-between h-48 space-x-4">
        {months.map((month, index) => {
          const height = (predictions[index] / maxValue) * 100;
          return (
            <div key={month} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end h-40">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 transition-all duration-200 cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${predictions[index]} predictions`}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">{month}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthlyChart
