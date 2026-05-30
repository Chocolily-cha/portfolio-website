import { useEffect, useState } from 'react'
import { X, Copy, Check, Share2 } from 'lucide-react'
import { Work } from '../types'

interface ShareModalProps {
  work: Work | null
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ work, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCopied(false)
    }
  }, [isOpen])

  const handleCopyLink = async () => {
    if (!work) return
    const url = `${window.location.origin}/detail/${work.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async (platform: string) => {
    if (!work) return
    const url = `${window.location.origin}/detail/${work.id}`
    const title = work.title

    let shareUrl = ''
    switch (platform) {
      case 'wechat':
        shareUrl = `https://share.api.weibo.cn/share/2?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        break
      case 'weibo':
        shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  if (!work) return null

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        <div
          className={`bg-dark-400 rounded-2xl w-full max-w-md p-6 transform transition-all duration-300 ${
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              分享作品
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">作品链接</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/detail/${work.id}`}
                className="flex-1 bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-200 text-gray-300 hover:bg-dark-300'
                }`}
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm mt-2">链接已复制到剪贴板</p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">分享到社交平台</p>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleShare('wechat')}
                className="flex flex-col items-center gap-2 p-3 bg-dark-200 hover:bg-dark-300 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">微</span>
                </div>
                <span className="text-gray-400 text-xs">微信</span>
              </button>
              <button
                onClick={() => handleShare('weibo')}
                className="flex flex-col items-center gap-2 p-3 bg-dark-200 hover:bg-dark-300 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">微</span>
                </div>
                <span className="text-gray-400 text-xs">微博</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-3 bg-dark-200 hover:bg-dark-300 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">f</span>
                </div>
                <span className="text-gray-400 text-xs">Facebook</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-2 p-3 bg-dark-200 hover:bg-dark-300 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-sky-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-gray-400 text-xs">Twitter</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            关闭
          </button>
        </div>
      </div>
    </>
  )
}
