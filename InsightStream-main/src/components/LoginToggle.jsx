import React, { useState } from 'react'
import Login from '../pages/Login'
import Signin from '../pages/Signin'

const LoginToggle = () => {
  const [stat, setStat] = useState('login')

  return (
    <div className="min-h-screen w-auto flex items-center justify-center p-6">
      <div className="w-auto md:grid-cols-3 gap-6 rounded-2xl overflow-hidden glass-neu">
        <div className="md:col-span-2 p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-100">InsightStream</h1>
            <p className="text-gray-400 mt-2">Login to access your personalized landscape news stream</p>
          </div>

          <div className="flex gap-2 rounded-xl p-1.5 mb-6 glass">
            <button
              onClick={() => setStat('login')}
              className={`flex-1 p-2 rounded-lg transition-all ${stat === 'login' ? 'neu-inset text-gray-100 font-semibold' : 'text-gray-400 hover:text-gray-300'}`}
              aria-pressed={stat === 'login'}
            >
              Login
            </button>

            <button
              onClick={() => setStat('register')}
              className={`flex-1 p-2 rounded-lg transition-all ${stat === 'register' ? 'neu-inset text-gray-100 font-semibold' : 'text-gray-400 hover:text-gray-300'}`}
              aria-pressed={stat === 'register'}
            >
              Register
            </button>
          </div>

          <div>{stat === 'login' ? <Login /> : <Signin />}</div>
        </div>
      </div>
    </div>
  )
}

export default LoginToggle