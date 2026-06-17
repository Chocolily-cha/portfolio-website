import { Eye, Heart, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Work } from '../types'

interface WorkCardProps {
  work: Work
  onShare: (work: Work) => void
}

export default function WorkCard({ work, onShare }: WorkCardProps) {
  const thumbnail = work.media[0]?.url || work.media[0]?.thumbnail

  return (
    <div className="group bg-dark-100 rounded-2xl overflow-hidden card-hover">
      <div className="relative aspect-video overflow-hidden bg-white">
        {work.media[0]?.type === 'video' ? (
          <div className="relative w-full h-full">
            <img
              src={thumbnail}
              alt={work.title}
              className="w-full h-full object-contain"
              loading="lazy"
              style={{ backgroundColor: '#FFFFFF' }}
            />
            {/* 播放按钮覆盖层 - 始终显示在视频缩略图上 */}
            <Link
              to={`/detail/${work.id}`}
              className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-dark-500 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </Link>
            <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
              <span>▶</span>
              <span>视频</span>
            </div>
          </div>
        ) : (
          <Link to={`/detail/${work.id}`}>
            <img
              src={thumbnail}
              alt={work.title}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              style={{ backgroundColor: '#FFFFFF' }}
            />
          </Link>
        )}
        {/* 底部操作栏 - 悬停显示 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onShare(work)
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
          {work.title}
        </h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {work.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {work.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-dark-300 text-gray-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-gray-500 text-sm">
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {work.views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            {work.likes}
          </span>
        </div>
        <Link
          to={`/detail/${work.id}`}
          className="mt-4 block w-full py-2 bg-gradient-primary text-white text-center rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          查看详情
        </Link>
      </div>
    </div>
  )
}
