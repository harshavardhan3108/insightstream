import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

const API = 'http://localhost:3000/users'

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
      alert('Could not reach login API (http://localhost:3000). Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleLogin} className="glass-neu p-6 rounded-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-100">Login</h2>

        <label className="block text-sm mb-2 text-gray-300">Email</label>
        <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required className="w-full mb-4" />

        <label className="block text-sm mb-2 text-gray-300">Password</label>
        <div className="relative mb-4">
          <input type={showPass ? 'text' : 'password'} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} required className="w-full pr-10" />
          <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-300" aria-label={showPass ? 'Hide password' : 'Show password'}>
            {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button type="submit" disabled={loading} className="btn-neu w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login