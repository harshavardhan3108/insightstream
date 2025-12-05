import React, { useState } from 'react'
import Login from '../pages/Login'
import Signin from '../pages/Signin'

const LoginToggle = () => {
  const [stat, setStat] = useState('login')

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20 mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">InsightStream</h1>
          <p className="text-gray-400 mt-2 text-lg">Your personal window to the world.</p>
        </div>

        <div className="glass-panel p-2 rounded-2xl flex gap-2 mb-8">
          <button
            onClick={() => setStat('login')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${stat === 'login'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Log In
          </button>
          <button
            onClick={() => setStat('register')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${stat === 'register'
                ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            Sign Up
          </button>
        </div>

        <div>
          {stat === 'login' ? <Login /> : <Signin />}
        </div>
      </div>
    </div>
  )
}

export default LoginToggle