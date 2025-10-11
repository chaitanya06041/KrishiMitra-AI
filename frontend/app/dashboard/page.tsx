import Dashboard from '@/components/dashboard/Dashboard'
import Navbar from '@/components/Navbar/Navbar'
import React from 'react'

const page = () => {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, hsl(40 20% 97%), hsl(95 30% 95%))',
      }}
    >
      <Navbar />
      <Dashboard />
    </div>
  )
}

export default page
