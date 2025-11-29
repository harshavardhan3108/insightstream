import React, { useState } from 'react'
import { Menu, X, House, BookmarkCheck, Clock, User, LogOut, Newspaper } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

const items = [
  { key: 'home', title: 'Home', icon: <House size={18} />, to: '/home' },
  { key: 'news', title: 'News', icon: <Newspaper size={18} />, to: '/home/news' },
  { key: 'bookmarks', title: 'Bookmarks', icon: <BookmarkCheck size={18} />, to: '/home/bookmarks' },
  { key: 'history', title: 'History', icon: <Clock size={18} />, to: '/home/history' },
  { key: 'profile', title: 'Profile', icon: <User size={18} />, to: '/home/profile' }
]

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const userData = JSON.parse(localStorage.getItem("user")) || { name: "Guest" }

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-neu border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center neu-outset">
                <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M12 3v18" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-semibold text-gray-100">InsightStream</div>
                <div className="text-xs text-gray-400">Personalized news</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {items.map((it) => (
                <NavLink
                  key={it.key}
                  to={it.to}
                  end={it.key === 'home'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'neu-inset text-gray-100'
                        : 'text-gray-300 hover:neu-outset-hover'
                    }`
                  }
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    {it.icon}
                  </span>
                  <span className="text-sm font-medium">{it.title}</span>
                </NavLink>
              ))}
            </div>

            {/* User Info & Actions */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-300">Welcome</div>
                <div className="text-xs text-gray-400">{userData.name}</div>
              </div>
              <button
                onClick={logout}
                className="btn-neu px-4 py-2 text-sm font-semibold"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-neu p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/30">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {items.map((it) => (
                <NavLink
                  key={it.key}
                  to={it.to}
                  end={it.key === 'home'}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'neu-inset text-gray-100'
                        : 'text-gray-300 hover:neu-outset-hover'
                    }`
                  }
                >
                  <span className="w-6 h-6 flex items-center justify-center">
                    {it.icon}
                  </span>
                  <span className="text-sm font-medium">{it.title}</span>
                </NavLink>
              ))}
              
              <div className="pt-4 border-t border-gray-700/30 mt-2">
                <div className="px-4 py-2 mb-3">
                  <div className="text-xs font-semibold text-gray-300">Welcome</div>
                  <div className="text-xs text-gray-400">{userData.name}</div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    closeMobileMenu()
                  }}
                  className="w-full btn-neu px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

export default Navbar