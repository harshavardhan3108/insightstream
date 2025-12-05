import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

import config from '../config';

const API = config.API_BASE_URL + '/users'

const Login = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const emailToMatch = (data.email || '').trim().toLowerCase()
      const resp = await axios.get(`${API}?email=${encodeURIComponent(emailToMatch)}`)
      const users = resp.data || []
      const foundUser = users.find((u) => (u.email || '').toLowerCase() === emailToMatch && u.password === data.password)

      if (foundUser) {
        localStorage.setItem('user', JSON.stringify({ id: foundUser.id, name: foundUser.name, email: foundUser.email }))
        navigate('/home', { replace: true })
      } else {
        alert('Invalid email or password')
      }
    } catch (err) {
      console.error('Login error', err)
      alert(`Could not reach login API (${config.API_BASE_URL}). Is the server running?`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleLogin} className="glass-panel p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-4">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Please enter your details to sign in.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
              className="input-field"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <span className="animate-pulse">Signing in...</span> : <>Sign In <LogIn size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login