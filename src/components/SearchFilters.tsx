import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { CategoryType, SortType, SearchFilters as SearchFiltersType } from '../types'
import { categories, getAllTags } from '../data/mockData'

interface SearchFiltersProps {
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const tags = getAllTags()

  const handleKeywordChange = (value: string) => {
    onFiltersChange({ ...filters, keyword: value })
  }

  const handleCategoryChange = (category: CategoryType | 'all') => {
    onFiltersChange({ ...filters, category })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleSortChange = (sortBy: SortType) => {
    onFiltersChange({ ...filters, sortBy })
    setShowFilters(false)
  }

  const clearFilters = () => {
    onFiltersChange({
      keyword: '',
      category: 'all',
      tags: [],
      sortBy: 'latest',
    })
  }

  const hasActiveFilters = filters.keyword || filters.category !== 'all' || filters.tags.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="搜索作品..."
            value={filters.keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-full bg-dark-100 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-gradient-primary text-white'
              : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">筛选</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-dark-100 rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">筛选选项</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                清除筛选
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-gray-400 text-sm mb-3">分类</h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    filters.category === 'all'
                      ? 'bg-gradient-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-200'
                  }`}
                >
                  全部
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id as CategoryType)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      filters.category === category.id
                        ? 'bg-gradient-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 text-sm mb-3">标签</h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-gradient-primary text-white'
                        : 'bg-dark-200 text-gray-400 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 text-sm mb-3">排序</h4>
              <div className="space-y-2">
                {[
                  { value: 'latest' as SortType, label: '最新发布' },
                  { value: 'oldest' as SortType, label: '最早发布' },
                  { value: 'popular' as SortType, label: '热门程度' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      filters.sortBy === option.value
                        ? 'bg-gradient-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
