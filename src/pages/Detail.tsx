import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Heart, Share2, Calendar, Tag, Clock } from 'lucide-react'
import { getWorkById, works, categories } from '../data/mockData'
import ShareModal from '../components/ShareModal'

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)

  const work = getWorkById(id || '')
  const category = categories.find((c) => c.id === work?.category)
  const relatedWorks = works.filter((w) => w.category === work?.category && w.id !== id).slice(0, 3)

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">作品未找到</h1>
          <Link
            to="/"
            className="text-primary-400 hover:text-primary-300"
          >
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  const currentMedia = work.media[currentImageIndex]

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </Link>
          <span className="text-gray-600">/</span>
          {category && (
            <Link
              to={`/gallery/${category.id}`}
              className="text-primary-400 hover:text-primary-300"
            >
              {category.name}
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative aspect-video bg-dark-100 rounded-2xl overflow-hidden">
              {currentMedia.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={currentMedia.url}
                    poster={currentMedia.thumbnail}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <img
                  src={currentMedia.url}
                  alt={work.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            {work.media.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {work.media.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-primary-500'
                        : 'border-transparent hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={media.url}
                      alt={media.title || work.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  {category && (
                    <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-3">
                      {category.name}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {work.title}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="p-3 bg-dark-100 hover:bg-dark-200 rounded-xl text-gray-400 hover:text-white transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-xl transition-colors ${
                      liked
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-dark-100 hover:bg-dark-200 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Heart className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-gray-500 text-sm">
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {work.views}
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {liked ? likes + work.likes : work.likes}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {work.createdAt}
                </span>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">作品描述</h2>
              <p className="text-gray-400 leading-relaxed">
                {work.description}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">技术细节</h2>
              <div className="space-y-2">
                {work.technicalDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-800">
                    <span className="text-gray-500">{detail.label}</span>
                    <span className="text-gray-300">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-3">标签</h2>
              <div className="flex flex-wrap gap-2">
                {work.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-dark-100 text-gray-400 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {relatedWorks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">相关作品</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorks.map((relatedWork) => (
                <Link
                  key={relatedWork.id}
                  to={`/detail/${relatedWork.id}`}
                  className="group bg-dark-100 rounded-xl overflow-hidden card-hover"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={relatedWork.media[0]?.url}
                      alt={relatedWork.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {relatedWork.media[0]?.type === 'video' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-dark-500 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold line-clamp-1 group-hover:text-primary-400 transition-colors">
                      {relatedWork.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relatedWork.createdAt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ShareModal
        work={work}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  )
}
