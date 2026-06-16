import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Heart, Share2, Calendar, Tag, Clock, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { getWorkById, getWorks, getCategories } from '../data/storage'
import ShareModal from '../components/ShareModal'

export default function Detail() {
  const { id } = useParams<{ id: string }>()
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const work = getWorkById(id || '')
  const categories = getCategories()
  const works = getWorks()
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

  // 图片导航函数
  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? work.media.length - 1 : prev - 1
    )
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === work.media.length - 1 ? 0 : prev + 1
    )
  }

  // 键盘导航支持
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isImageModalOpen) {
      if (e.key === 'ArrowLeft') {
        goToPreviousImage()
      } else if (e.key === 'ArrowRight') {
        goToNextImage()
      } else if (e.key === 'Escape') {
        setIsImageModalOpen(false)
      }
    }
  }

  return (
    <div className="min-h-screen py-8" onKeyDown={handleKeyDown} tabIndex={0}>
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
            {/* 主媒体区域 */}
            <div className="relative aspect-video bg-dark-100 rounded-2xl overflow-hidden">
              {currentMedia.type === 'video' ? (
                <div className="relative w-full h-full bg-black">
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    poster={currentMedia.thumbnail}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    onWaiting={() => setIsVideoPlaying(false)}
                    onCanPlay={() => setIsVideoPlaying(true)}
                  />
                  {/* 视频加载提示 */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                        <p className="text-sm">视频加载中...</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 图片展示 - 点击可打开全屏查看
                <div
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <img
                    src={currentMedia.url}
                    alt={work.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                  />
                  {/* 全屏查看提示 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 rounded-full p-4">
                      <Maximize2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 缩略图导航 - 仅图片作品 */}
            {work.media.length > 1 && currentMedia.type !== 'video' && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {work.media.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-primary-500 shadow-lg'
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

      {/* 图片全屏查看模态框 */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setIsImageModalOpen(false)}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setIsImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 图片计数器 */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white text-sm z-10">
            {currentImageIndex + 1} / {work.media.length}
          </div>

          {/* 上一张按钮 */}
          {work.media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPreviousImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              {/* 下一张按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* 当前图片 */}
          <img
            src={currentMedia.url}
            alt={work.title}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 缩略图导航 */}
          {work.media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 px-4 py-2 rounded-full z-10">
              {work.media.map((media, index) => (
                <button
                  key={media.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-white'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={media.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
