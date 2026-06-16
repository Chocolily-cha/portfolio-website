import { useState, useEffect } from 'react';
import { Sparkles, Box, Grid3x3, Palette, Camera, MoreHorizontal, ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategories, getWorks } from '../data/storage';
import { Work, Category } from '../types';
import ShareModal from '../components/ShareModal';
import WorkCard from '../components/WorkCard';
const iconMap: Record<string, typeof Sparkles> = {
 Sparkles,
 Box,
 Grid3x3,
 Palette,
 Camera,
 MoreHorizontal,
};
export default function Home() {
 const [shareModalOpen, setShareModalOpen] = useState(false);
 const [selectedWork, setSelectedWork] = useState<Work | null>(null);
 const [categories, setCategories] = useState<Category[]>([]);
 const [works, setWorks] = useState<Work[]>([]);

 // 从 localStorage 加载数据
 useEffect(() => {
   setCategories(getCategories());
   setWorks(getWorks());
 }, []);

 const featuredWorks = works.slice(0, 6);
 const handleShare = (work: Work) => {
 setSelectedWork(work);
 setShareModalOpen(true);
 };
 return (<div className="min-h-screen">
 <section className="relative py-20 lg:py-32 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-dark-500 via-dark-400 to-dark-500"/>
 <div className="absolute inset-0 opacity-30">
 <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl"/>
 <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl"/>
 </div>

 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
 <div className="animate-fade-in">
 <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6">
 创意作品集
 </span>
 <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6">
 探索<span className="text-gradient">无限创意</span>
 </h1>
 <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
 这里汇集了AI动画、三维动画、3D模型、绘画、摄影等多种艺术形式的作品，
 每一件作品都承载着独特的创意与灵感。
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link to="/gallery/ai-animation" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity">
 浏览作品
 <ArrowRight className="w-5 h-5"/>
 </Link>
 <Link to="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark-100 text-white rounded-xl font-semibold hover:bg-dark-200 transition-colors">
 联系我
 </Link>
 </div>
 </div>
 </div>
 </section>

 <section className="py-20 bg-gradient-dark">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">作品分类</h2>
 <p className="text-gray-400">选择一个分类，开始探索创意作品</p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
 {categories.map((category) => {
 const Icon = iconMap[category.icon];
 const workCount = works.filter((w) => w.category === category.id).length;
 return (<Link key={category.id} to={`/gallery/${category.id}`} className="group bg-dark-100 rounded-2xl p-6 text-center card-hover">
 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
 {Icon && <Icon className="w-8 h-8 text-white"/>}
 </div>
 <h3 className="text-white font-semibold mb-1">{category.name}</h3>
 <p className="text-gray-500 text-sm">{workCount} 件作品</p>
 </Link>);
 })}
 </div>
 </div>
 </section>

 <section className="py-20 bg-dark-500">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
 <div>
 <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">精选作品</h2>
 <p className="text-gray-400">展示最新、最受欢迎的创意作品</p>
 </div>
 <Link to="/gallery/ai-animation" className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium">
 查看全部
 <ArrowRight className="w-5 h-5"/>
 </Link>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {featuredWorks.map((work) => (<WorkCard key={work.id} work={work} onShare={handleShare}/>))}
 </div>
 </div>
 </section>

 <section className="py-20 bg-gradient-dark">
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
 <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden group">
 <img src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1200&h=675&fit=crop" alt="展示视频封面" className="w-full h-full object-cover"/>
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
 <button className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
 <Play className="w-8 h-8 text-dark-500 ml-1"/>
 </button>
 </div>
 </div>
 <h3 className="text-2xl font-bold text-white mt-6">作品集展示视频</h3>
 <p className="text-gray-400 mt-2">观看作品集锦，感受创意的力量</p>
 </div>
 </section>

 <section className="py-20 bg-dark-500">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
 <div>
 <div className="text-4xl sm:text-5xl font-bold text-gradient mb-2">100+</div>
 <div className="text-gray-400">作品数量</div>
 </div>
 <div>
 <div className="text-4xl sm:text-5xl font-bold text-gradient mb-2">50K+</div>
 <div className="text-gray-400">浏览次数</div>
 </div>
 <div>
 <div className="text-4xl sm:text-5xl font-bold text-gradient mb-2">10K+</div>
 <div className="text-gray-400">点赞数量</div>
 </div>
 <div>
 <div className="text-4xl sm:text-5xl font-bold text-gradient mb-2">5+</div>
 <div className="text-gray-400">艺术领域</div>
 </div>
 </div>
 </div>
 </section>

 <ShareModal work={selectedWork} isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)}/>
 </div>);
}

