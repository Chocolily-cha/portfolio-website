import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark-500 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">巧克力的作品集</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              探索我的创意世界，这里汇集了AI动画、三维动画、3D模型、绘画、摄影等多种艺术形式的作品。感谢您的访问！
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">快速链接</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery/ai-animation"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  AI动画
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery/3d-animation"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  三维动画
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery/model"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  模型
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery/painting"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  绘画
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery/photography"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  摄影
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">关于</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  联系我
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  管理后台
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} 巧克力的作品集. 保留所有权利.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            用
            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            制作
          </p>
        </div>
      </div>
    </footer>
  )
}
