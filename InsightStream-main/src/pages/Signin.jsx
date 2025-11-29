import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

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
    <form onSubmit={handleSignin} className="w-full glass-neu p-6 rounded-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-100">Register</h2>

      <label className="block text-sm mb-2 text-gray-300">Name</label>
      <input type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required className="w-full mb-4" />

      <label className="block text-sm mb-2 text-gray-300">Email</label>
      <input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required className="w-full mb-4" />

      <label className="block text-sm mb-2 text-gray-300">Password</label>
      <div className="relative mb-4">
        <input type={showPass ? 'text' : 'password'} value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} required className="w-full pr-10" />
        <button type="button" onClick={(e) => { e.preventDefault(); setShowPass((p) => !p) }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-300" aria-label={showPass ? 'Hide password' : 'Show password'}>
          {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="submit" disabled={loading} className="btn-neu w-full">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </form>
  )
}

export default Signin