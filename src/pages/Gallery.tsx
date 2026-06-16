import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { SearchFilters, Work } from '../types'
import { getCategories, searchWorks } from '../data/storage'
import WorkCard from '../components/WorkCard'
import SearchFiltersComponent from '../components/SearchFilters'
import ShareModal from '../components/ShareModal'

export default function Gallery() {
  const { category } = useParams<{ category: string }>()
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    category: 'all',
    tags: [],
    sortBy: 'latest',
  })
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [categories, setCategories] = useState(getCategories())

  // 监听 storage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      setCategories(getCategories())
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const currentCategory = categories.find((c) => c.id === category)

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
  }

  const handleShare = (work: Work) => {
    setSelectedWork(work)
    setShareModalOpen(true)
  }

  const filteredWorks = searchWorks(
    filters.keyword,
    filters.category === 'all' ? (category as SearchFilters['category']) : filters.category,
    filters.tags,
    filters.sortBy
  )

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {currentCategory?.name || '全部作品'}
              </h1>
              <p className="text-gray-400">
                {currentCategory?.description || '浏览所有创意作品'}
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              共 {filteredWorks.length} 件作品
            </div>
          </div>
        </div>

        <SearchFiltersComponent filters={filters} onFiltersChange={handleFiltersChange} />

        {filteredWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredWorks.map((work) => (
              <WorkCard key={work.id} work={work} onShare={handleShare} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-dark-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">未找到作品</h3>
            <p className="text-gray-400">尝试调整筛选条件或关键词</p>
          </div>
        )}
      </div>

      <ShareModal
        work={selectedWork}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  )
}
