import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { SearchFilters, Work, CategoryType } from '../types'
import { getCategories, searchWorks, getSortedWorksByCategory } from '../data/storage'
import { preloadImages } from '../hooks/useLazyLoad'
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
  const lastPreloadedIndex = useRef<number>(0)
  const preloadedUrls = useRef<Set<string>>(new Set())

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

  // 根据分类获取排序后的作品
  const getWorksForDisplay = (): Work[] => {
    const targetCategory = filters.category === 'all' ? category : filters.category;
    
    // 如果有具体分类且没有其他筛选条件，使用自定义排序
    if (targetCategory && targetCategory !== 'all' && !filters.keyword && filters.tags.length === 0) {
      return getSortedWorksByCategory(targetCategory as CategoryType);
    }
    
    // 否则使用搜索函数
    return searchWorks(
      filters.keyword,
      targetCategory as SearchFilters['category'] || 'all',
      filters.tags,
      filters.sortBy
    );
  };

  const filteredWorks = getWorksForDisplay();
  
  // 图片预加载优化 - 滚动时预加载即将可见的图片
  useEffect(() => {
    const handleScroll = () => {
      // 获取视口高度
      const viewportHeight = window.innerHeight;
      
      // 找出即将进入视口的图片
      const urlsToPreload: string[] = [];
      
      filteredWorks.forEach((work, index) => {
        if (index < lastPreloadedIndex.current + 6) {
          const imageUrl = work.media[0]?.thumbnail || work.media[0]?.url;
          if (imageUrl && !preloadedUrls.current.has(imageUrl)) {
            urlsToPreload.push(imageUrl);
            preloadedUrls.current.add(imageUrl);
          }
        }
      });
      
      // 如果有待预加载的图片，启动预加载
      if (urlsToPreload.length > 0) {
        preloadImages(urlsToPreload).catch(err => {
          console.warn('批量预加载失败:', err);
        });
      }
      
      // 更新已预加载的索引
      lastPreloadedIndex.current = Math.min(lastPreloadedIndex.current + 6, filteredWorks.length);
    };
    
    // 初始加载时预加载前几张图片
    handleScroll();
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [filteredWorks]);
  
  // 重置预加载状态当作品列表变化时
  useEffect(() => {
    lastPreloadedIndex.current = 0;
    preloadedUrls.current.clear();
  }, [filters]);

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
