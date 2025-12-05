import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

const API = 'http://localhost:3000/users'

const Signin = () => {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [data, setData] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSignin = async (e) => {
    e.preventDefault()
    const name = data.name.trim()
    const email = (data.email || '').trim().toLowerCase()
    const password = data.password

    if (!name || !email || !password) {
      alert('All fields are required!')
      return
    }

    setLoading(true)
    try {
      const checkResp = await axios.get(`${API}?email=${encodeURIComponent(email)}`)
      if (checkResp.data && checkResp.data.length > 0) {
        alert('Email already exists. Please use a different email!')
        setLoading(false)
        return
      }

      const createResp = await axios.post(API, { name, email, password, history: [], bookmarks: [] })
      const created = createResp.data

      localStorage.setItem('user', JSON.stringify({ id: created.id, name: created.name, email: created.email }))
      navigate('/home', { replace: true })
    } catch (error) {
      console.error('Signup error:', error)
      alert('Error signing up. Is the server running at http://localhost:3000 ?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSignin} className="glass-panel p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Join InsightStream today.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
              className="input-field"
              placeholder="John Doe"
            />
          </div>

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
                onClick={(e) => { e.preventDefault(); setShowPass((p) => !p) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-purple-500/25">
            {loading ? <span className="animate-pulse">Creating account...</span> : <>Create Account <UserPlus size={18} /></>}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Signin