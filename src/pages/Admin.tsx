import { useState } from 'react';
import { Lock, Unlock, Plus, Trash2, Edit3, Save, X, Eye, EyeOff, List, Layout, Settings, Image, Video, Sparkles, Box, Grid3x3, Palette, Camera, MoreHorizontal, Layers, Star, Wand2, Code, Palette as Paint, Brush, Zap, Globe, Music, Gamepad2, Award, Crown, Feather, Heart, Sun, Moon, Coffee, BookOpen, PenTool } from 'lucide-react';
import { categories, works } from '../data/mockData';
import { Category, Work, CategoryType } from '../types';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'works'>('categories');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: 'Sparkles',
  });
  const [categoriesList, setCategoriesList] = useState(categories);
  const [worksList, setWorksList] = useState(works);

  const [newWork, setNewWork] = useState<Partial<Work>>({
    title: '',
    description: '',
    category: 'ai-animation',
    tags: [],
    media: [],
    technicalDetails: [],
  });
  const [tagInput, setTagInput] = useState('');

  // 扩展图标库
  const icons = [
    { name: 'Sparkles', component: Sparkles },
    { name: 'Box', component: Box },
    { name: 'Grid3x3', component: Grid3x3 },
    { name: 'Palette', component: Palette },
    { name: 'Camera', component: Camera },
    { name: 'MoreHorizontal', component: MoreHorizontal },
    { name: 'Image', component: Image },
    { name: 'Video', component: Video },
    { name: 'Layers', component: Layers },
    { name: 'Star', component: Star },
    { name: 'Wand2', component: Wand2 },
    { name: 'Code', component: Code },
    { name: 'Paint', component: Paint },
    { name: 'Brush', component: Brush },
    { name: 'Zap', component: Zap },
    { name: 'Globe', component: Globe },
    { name: 'Music', component: Music },
    { name: 'Gamepad2', component: Gamepad2 },
    { name: 'Award', component: Award },
    { name: 'Crown', component: Crown },
    { name: 'Feather', component: Feather },
    { name: 'Heart', component: Heart },
    { name: 'Sun', component: Sun },
    { name: 'Moon', component: Moon },
    { name: 'Coffee', component: Coffee },
    { name: 'BookOpen', component: BookOpen },
    { name: 'PenTool', component: PenTool },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('密码错误，请输入正确的密码');
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      setError('请填写分类名称');
      return;
    }
    const category: Category = {
      id: newCategory.name.toLowerCase().replace(/\s+/g, '-'),
      name: newCategory.name || '',
      description: newCategory.description || '',
      icon: newCategory.icon || 'Sparkles',
      order: categoriesList.length + 1,
    };
    setCategoriesList([...categoriesList, category]);
    setNewCategory({ name: '', description: '', icon: 'Sparkles' });
    setShowAddCategory(false);
    setError('');
  };

  // 编辑分类
  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = () => {
    if (!editingCategory?.name) {
      setError('请填写分类名称');
      return;
    }
    setCategoriesList(
      categoriesList.map((c) =>
        c.id === editingCategory?.id ? editingCategory : c
      )
    );
    setEditingCategory(null);
    setError('');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('确定要删除这个分类吗？')) {
      setCategoriesList(categoriesList.filter((c) => c.id !== categoryId));
    }
  };

  const handleAddWork = () => {
    if (!newWork.title || !newWork.description) {
      setError('请填写作品名称和描述');
      return;
    }

    const work: Work = {
      id: `work-${Date.now()}`,
      title: newWork.title || '',
      description: newWork.description || '',
      category: newWork.category as CategoryType || 'other',
      tags: newWork.tags || [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      media: newWork.media || [],
      technicalDetails: newWork.technicalDetails || [],
      views: 0,
      likes: 0,
    };

    setWorksList([...worksList, work]);
    setNewWork({
      title: '',
      description: '',
      category: 'ai-animation',
      tags: [],
      media: [],
      technicalDetails: [],
    });
    setTagInput('');
    setShowAddWork(false);
    setError('');
    alert('作品添加成功！');
  };

  const handleDeleteWork = (workId: string) => {
    if (confirm('确定要删除这个作品吗？')) {
      setWorksList(worksList.filter((w) => w.id !== workId));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newWork.tags?.includes(tagInput.trim())) {
      setNewWork({
        ...newWork,
        tags: [...(newWork.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewWork({
      ...newWork,
      tags: newWork.tags?.filter((t) => t !== tag) || [],
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-dark-100 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">管理后台</h1>
            <p className="text-gray-400 mt-2">请输入密码以访问管理界面</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Unlock className="w-5 h-5" />
              登录
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            提示：默认密码为 <code className="text-gray-400">admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">管理后台</h1>
            <p className="text-gray-400">管理作品分类和作品内容</p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 rounded-xl text-gray-300 transition-colors"
          >
            <Lock className="w-4 h-4" />
            退出登录
          </button>
        </div>

        <div className="bg-dark-100 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeTab === 'categories' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layout className="w-5 h-5" />
              分类管理
            </button>
            <button
              onClick={() => setActiveTab('works')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeTab === 'works' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
              作品管理
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'categories' ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">作品分类</h2>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    添加分类
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesList.map((category) => (
                    <div key={category.id} className="bg-dark-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{category.name}</h3>
                        <p className="text-gray-500 text-sm">{category.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 hover:bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">作品列表</h2>
                  <button
                    onClick={() => setShowAddWork(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    添加作品
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">作品名称</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">分类</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">创建时间</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">浏览量</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {worksList.map((work) => (
                        <tr key={work.id} className="border-b border-gray-800">
                          <td className="py-3 px-4">
                            <span className="text-white font-medium">{work.title}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400">
                              {categories.find((c) => c.id === work.category)?.name}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400">{work.createdAt}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-gray-400">{work.views}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingWork(work)}
                                className="p-2 hover:bg-dark-200 rounded-lg text-gray-400 hover:text-white transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWork(work.id)}
                                className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAddCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-400 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">添加新分类</h3>
              <button
                onClick={() => setShowAddCategory(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">分类名称 *</label>
                <input
                  type="text"
                  value={newCategory.name || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">分类描述 *</label>
                <textarea
                  value={newCategory.description || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">图标</label>
                <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-dark-200 rounded-lg">
                  {icons.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.name}
                        onClick={() => setNewCategory({ ...newCategory, icon: icon.name })}
                        className={`p-3 rounded-lg transition-colors ${
                          newCategory.icon === icon.name
                            ? 'bg-primary-500/20 text-primary-400 border-2 border-primary-500'
                            : 'bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-100'
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="w-5 h-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-3 bg-dark-200 text-white rounded-xl font-medium hover:bg-dark-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddWork && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-400 rounded-2xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">添加新作品</h3>
              <button
                onClick={() => setShowAddWork(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-gray-400 text-sm mb-2">作品名称 *</label>
                <input
                  type="text"
                  value={newWork.title || ''}
                  onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">作品描述 *</label>
                <textarea
                  value={newWork.description || ''}
                  onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                  rows={4}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">分类</label>
                <select
                  value={newWork.category || 'other'}
                  onChange={(e) => setNewWork({ ...newWork, category: e.target.value as CategoryType })}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">标签</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="输入标签后按回车添加"
                    className="flex-1 bg-dark-200 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-dark-200 text-white rounded-xl hover:bg-dark-300 transition-colors"
                  >
                    添加
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newWork.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                    >
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">媒体链接（图片或视频URL）</label>
                <input
                  type="text"
                  placeholder="输入媒体URL，按回车添加"
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const url = input.value.trim();
                      if (url) {
                        setNewWork({
                          ...newWork,
                          media: [
                            ...(newWork.media || []),
                            {
                              id: `media-${Date.now()}`,
                              type: url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image',
                              url: url,
                            },
                          ],
                        });
                        input.value = '';
                      }
                    }
                  }}
                />
                {newWork.media && newWork.media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newWork.media.map((media) => (
                      <div key={media.id} className="flex items-center gap-2 bg-dark-200 px-3 py-1 rounded-lg">
                        {media.type === 'video' ? (
                          <Video className="w-4 h-4 text-primary-400" />
                        ) : (
                          <Image className="w-4 h-4 text-accent-400" />
                        )}
                        <span className="text-white text-sm truncate max-w-[150px]">{media.url}</span>
                        <button
                          onClick={() =>
                            setNewWork({
                              ...newWork,
                              media: newWork.media?.filter((m) => m.id !== media.id),
                            })
                          }
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-dark-400">
                <button
                  onClick={() => setShowAddWork(false)}
                  className="flex-1 py-3 bg-dark-200 text-white rounded-xl font-medium hover:bg-dark-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddWork}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  保存作品
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑分类模态框 */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-dark-400 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">编辑分类</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">分类名称 *</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">分类描述</label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">图标</label>
                <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-dark-200 rounded-lg">
                  {icons.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <button
                        key={icon.name}
                        onClick={() => setEditingCategory({ ...editingCategory, icon: icon.name })}
                        className={`p-3 rounded-lg transition-colors ${
                          editingCategory.icon === icon.name
                            ? 'bg-primary-500/20 text-primary-400 border-2 border-primary-500'
                            : 'bg-dark-300 text-gray-400 hover:text-white hover:bg-dark-100'
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="w-5 h-5 mx-auto" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-3 bg-dark-200 text-white rounded-xl font-medium hover:bg-dark-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑作品模态框 */}
      {editingWork && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-400 rounded-2xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">编辑作品</h3>
              <button
                onClick={() => setEditingWork(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-300 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-gray-400 text-sm mb-2">作品名称 *</label>
                <input
                  type="text"
                  value={editingWork.title || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">作品描述 *</label>
                <textarea
                  value={editingWork.description || ''}
                  onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                  rows={4}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">分类</label>
                <select
                  value={editingWork.category || 'other'}
                  onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value as CategoryType })}
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-dark-400">
                <button
                  onClick={() => setEditingWork(null)}
                  className="flex-1 py-3 bg-dark-200 text-white rounded-xl font-medium hover:bg-dark-300 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setWorksList(
                      worksList.map((w) =>
                        w.id === editingWork?.id ? editingWork : w
                      )
                    );
                    setEditingWork(null);
                    alert('作品更新成功！');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  保存作品
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
