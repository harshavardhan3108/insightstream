import React, { useState, useEffect } from 'react';
import { Menu, X, House, BookmarkCheck, Clock, User, LogOut, Newspaper } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const items = [
  { key: 'home', title: 'Home', icon: <House size={18} />, to: '/home' },
  { key: 'news', title: 'News', icon: <Newspaper size={18} />, to: '/home/news' },
  { key: 'bookmarks', title: 'Bookmarks', icon: <BookmarkCheck size={18} />, to: '/home/bookmarks' },
  { key: 'history', title: 'History', icon: <Clock size={18} />, to: '/home/history' },
  { key: 'profile', title: 'Profile', icon: <User size={18} />, to: '/home/profile' }
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || mobileMenuOpen ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-white leading-none">InsightStream</div>
                <div className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mt-0.5">Personalized News</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center p-1 rounded-full bg-white/5 border border-white/5">
              {items.map((it) => (
                <NavLink
                  key={it.key}
                  to={it.to}
                  end={it.key === 'home'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {it.icon}
                  <span>{it.title}</span>
                </NavLink>
              ))}
            </div>

            {/* User Info & Actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <div className="text-sm font-medium text-white">{userData.name}</div>
                <div className="text-xs text-blue-400">Premium Member</div>
              </div>
              <button
                onClick={logout}
                className="btn-primary flex items-center gap-2 text-sm !px-5"
              >
                <span>Logout</span>
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-20 left-0 w-full glass-panel border-t border-white/5 overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="p-4 space-y-2">
            {items.map((it) => (
              <NavLink
                key={it.key}
                to={it.to}
                end={it.key === 'home'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`
                }
              >
                {it.icon}
                <span className="font-medium">{it.title}</span>
              </NavLink>
            ))}

            <div className="h-px bg-white/10 my-4" />

            <div className="px-4 py-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{userData.name}</div>
                <div className="text-xs text-gray-500">Signed in</div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;