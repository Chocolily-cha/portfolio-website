import { X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getCategories } from '../data/storage'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const categories = getCategories()

  const getActiveCategory = () => {
    const match = location.pathname.match(/\/gallery\/(\w+)/)
    return match ? match[1] : null
  }

  const activeCategory = getActiveCategory()

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-dark-400 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <span className="text-xl font-bold text-white">创意作品集</span>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            to="/"
            onClick={onClose}
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/'
                ? 'bg-gradient-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-300'
            }`}
          >
            首页
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/gallery/${category.id}`}
              onClick={onClose}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
            >
              {category.name}
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={onClose}
            className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              location.pathname === '/contact'
                ? 'bg-gradient-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-300'
            }`}
          >
            联系我
          </Link>
          <Link
            to="/admin"
            onClick={onClose}
            className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-300 transition-all"
          >
            管理后台
          </Link>
        </nav>
      </div>
    </>
  )
}
