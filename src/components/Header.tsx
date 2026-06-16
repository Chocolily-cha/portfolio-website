import { useState, useEffect } from 'react'
import { Menu, Search, User } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getCategories } from '../data/storage'

interface HeaderProps {
  onToggleSidebar: () => void
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const location = useLocation()
  const categories = getCategories()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const getActiveCategory = () => {
    const match = location.pathname.match(/\/gallery\/(\w+)/)
    return match ? match[1] : null
  }

  const activeCategory = getActiveCategory()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">
              创意作品集
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/gallery/${category.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-gradient-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-100'
                }`}
              >
                {category.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/contact'
                  ? 'bg-gradient-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-100'
              }`}
            >
              联系我
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div
              className={`relative transition-all duration-300 ${
                searchFocused ? 'w-64' : 'w-0 opacity-0'
              }`}
            >
              <input
                type="text"
                placeholder="搜索作品..."
                className="w-full bg-dark-100 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setSearchFocused(!searchFocused)}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 rounded-lg text-sm text-gray-300 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>管理</span>
            </Link>
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-dark-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed inset-0 bg-black/50 z-40" style={{ display: searchFocused ? 'block' : 'none' }}>
        <div className="absolute top-16 left-4 right-4">
          <input
            type="text"
            placeholder="搜索作品..."
            className="w-full bg-dark-100 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            autoFocus
          />
        </div>
      </div>
    </header>
  )
}
