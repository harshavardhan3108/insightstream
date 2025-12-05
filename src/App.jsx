import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginToggle from './components/LoginToggle'
import DashboardLayout from './components/DashboardLayout'
import Home from './pages/Home'
import News from './pages/News'
import History from './pages/History'
import Bookmarks from './pages/Bookmarks'
import Profile from './pages/Profile'

const isLoggedIn = () => !!localStorage.getItem('user')

const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/" replace />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={isLoggedIn() ? <Navigate to="/home" replace /> : <LoginToggle />} />

      <Route
        path="/home/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="news" element={<News />} />
        <Route path="history" element={<History />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

