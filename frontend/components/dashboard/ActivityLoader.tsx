import React from 'react'

const ActivityLoader = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-1/3 bg-gray-200 rounded-md"></div>
            <div className="h-5 w-16 bg-gray-200 rounded-md"></div>
        </div>
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
                            <div className="h-3 w-32 bg-gray-200 rounded-md"></div>
                        </div>
                    </div>
                    <div className="h-3 w-20 bg-gray-200 rounded-md"></div>
                </div>
            ))}
        </div>
    </div>
  )
}

export default ActivityLoader
