import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// This layout shows the Navbar and the main content area for protected pages
const DashboardLayout = () => {
  return (
    <div className="min-h-screen text-gray-100">
      <Navbar />
      <main className="pt-20 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout