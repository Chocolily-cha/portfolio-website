import { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Plus, Trash2, Edit3, Save, X, Eye, EyeOff, List, Layout, Image, Video, Sparkles, Box, Grid3x3, Palette, Camera, MoreHorizontal, Layers, Star, Wand2, Code, Palette as Paint, Brush, Zap, Globe, Music, Gamepad2, Award, Crown, Feather, Heart, Sun, Moon, Coffee, BookOpen, PenTool, Upload, RefreshCw, Check, AlertCircle, RotateCcw } from 'lucide-react';
import { getCategories, getWorks, saveCategories, saveWorks, resetToDefault, getAllTags } from '../data/storage';
import { Category, Work, CategoryType, TechnicalDetail } from '../types';

// 文件上传状态类型
interface UploadState {
  isUploading: boolean;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message: string;
  fileName: string;
}

// 文件类型配置
const ACCEPTED_FILE_TYPES = {
  image: '.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp',
  video: '.mp4,.webm,.ogg,.mov,.avi',
  audio: '.mp3,.wav,.ogg,.aac,.flac'
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const generateRandomViews = (): number => {
  return Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
};

const generateRandomLikes = (): number => {
  return Math.floor(Math.random() * (300 - 80 + 1)) + 80;
};

const DEFAULT_TECHNICAL_DETAILS: TechnicalDetail[] = [
  { label: '技术栈', value: '' },
  { label: '实现方法', value: '' },
  { label: '开发周期', value: '' },
];

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
  
  // 从 localStorage 读取数据
  const [categoriesList, setCategoriesList] = useState<Category[]>(getCategories);
  const [worksList, setWorksList] = useState<Work[]>(getWorks);

  // 当数据变化时自动保存到 localStorage
  useEffect(() => {
    saveCategories(categoriesList);
  }, [categoriesList]);

  useEffect(() => {
    saveWorks(worksList);
  }, [worksList]);

  const [newWork, setNewWork] = useState<Partial<Work>>({
    title: '',
    description: '',
    category: 'ai-animation',
    tags: [],
    media: [],
    technicalDetails: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [editingWorkTagInput, setEditingWorkTagInput] = useState('');
  const [editingWorkShowTagDropdown, setEditingWorkShowTagDropdown] = useState(false);

  const [availableTags, setAvailableTags] = useState<string[]>(getAllTags());

  useEffect(() => {
    setAvailableTags(getAllTags());
  }, [worksList]);

  // 文件上传相关状态
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    status: 'idle',
    message: '',
    fileName: ''
  });
  const [replaceUploadState, setReplaceUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    status: 'idle',
    message: '',
    fileName: ''
  });
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

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

  // 获取文件类型
  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // 默认为图片
  };

  // 文件上传处理函数
  const handleFileUpload = async (file: File, isReplace: boolean = false): Promise<string | null> => {
    const setState = isReplace ? setReplaceUploadState : setUploadState;
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      setState({
        isUploading: false,
        progress: 0,
        status: 'error',
        message: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`,
        fileName: file.name
      });
      return null;
    }

    // 开始上传
    setState({
      isUploading: true,
      progress: 0,
      status: 'uploading',
      message: '正在上传...',
      fileName: file.name
    });

    return new Promise((resolve) => {
      const reader = new FileReader();
      
      // 模拟上传进度
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        setState(prev => ({
          ...prev,
          progress: Math.round(progress)
        }));
      }, 100);

      reader.onload = () => {
        clearInterval(progressInterval);
        const dataUrl = reader.result as string;
        
        setState({
          isUploading: false,
          progress: 100,
          status: 'success',
          message: '上传成功！',
          fileName: file.name
        });

        // 3秒后重置状态
        setTimeout(() => {
          setState({
            isUploading: false,
            progress: 0,
            status: 'idle',
            message: '',
            fileName: ''
          });
        }, 3000);

        resolve(dataUrl);
      };

      reader.onerror = () => {
        clearInterval(progressInterval);
        setState({
          isUploading: false,
          progress: 0,
          status: 'error',
          message: '上传失败，请重试',
          fileName: file.name
        });
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await handleFileUpload(file);
    if (dataUrl) {
      const fileType = getFileType(file);
      setNewWork({
        ...newWork,
        media: [
          ...(newWork.media || []),
          {
            id: `media-${Date.now()}`,
            type: fileType,
            url: dataUrl,
          },
        ],
      });
    }
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理替换文件选择
  const handleReplaceFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingWork) return;

    const dataUrl = await handleFileUpload(file, true);
    if (dataUrl) {
      const fileType = getFileType(file);
      setEditingWork({
        ...editingWork,
        media: [
          {
            id: `media-${Date.now()}`,
            type: fileType,
            url: dataUrl,
          },
        ],
      });
    }
    // 重置 input
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
    }
    setShowReplaceConfirm(false);
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 触发替换文件选择
  const triggerReplaceFileSelect = () => {
    setShowReplaceConfirm(true);
  };

  // 确认替换
  const confirmReplace = () => {
    replaceFileInputRef.current?.click();
  };

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
      technicalDetails: (newWork.technicalDetails || []).filter(td => td.value.trim() !== ''),
      views: generateRandomViews(),
      likes: generateRandomLikes(),
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
    setShowTagDropdown(false);
    setShowAddWork(false);
    setError('');
    alert('作品添加成功！');
  };

  const handleSelectExistingTag = (tag: string) => {
    if (!newWork.tags?.includes(tag)) {
      setNewWork({
        ...newWork,
        tags: [...(newWork.tags || []), tag],
      });
    }
    setTagInput('');
    setShowTagDropdown(false);
  };

  const handleEditingWorkSelectTag = (tag: string) => {
    if (!editingWork?.tags.includes(tag)) {
      setEditingWork({
        ...editingWork!,
        tags: [...(editingWork!.tags || []), tag],
      });
    }
    setEditingWorkTagInput('');
    setEditingWorkShowTagDropdown(false);
  };

  const handleEditingWorkAddTag = () => {
    if (editingWorkTagInput.trim() && !editingWork?.tags?.includes(editingWorkTagInput.trim())) {
      setEditingWork({
        ...editingWork!,
        tags: [...(editingWork!.tags || []), editingWorkTagInput.trim()],
      });
      setEditingWorkTagInput('');
    }
  };

  const handleEditingWorkRemoveTag = (tag: string) => {
    setEditingWork({
      ...editingWork!,
      tags: editingWork!.tags?.filter((t) => t !== tag) || [],
    });
  };

  const handleAddTechnicalDetail = () => {
    const newDetails = [...(newWork.technicalDetails || []), { label: '', value: '' }];
    setNewWork({ ...newWork, technicalDetails: newDetails });
  };

  const handleUpdateTechnicalDetail = (index: number, field: 'label' | 'value', value: string) => {
    const newDetails = [...(newWork.technicalDetails || [])];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setNewWork({ ...newWork, technicalDetails: newDetails });
  };

  const handleRemoveTechnicalDetail = (index: number) => {
    const newDetails = (newWork.technicalDetails || []).filter((_, i) => i !== index);
    setNewWork({ ...newWork, technicalDetails: newDetails });
  };

  const handleEditingWorkAddTechnicalDetail = () => {
    const newDetails = [...(editingWork!.technicalDetails || []), { label: '', value: '' }];
    setEditingWork({ ...editingWork!, technicalDetails: newDetails });
  };

  const handleEditingWorkUpdateTechnicalDetail = (index: number, field: 'label' | 'value', value: string) => {
    const newDetails = [...(editingWork!.technicalDetails || [])];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setEditingWork({ ...editingWork!, technicalDetails: newDetails });
  };

  const handleEditingWorkRemoveTechnicalDetail = (index: number) => {
    const newDetails = (editingWork!.technicalDetails || []).filter((_, i) => i !== index);
    setEditingWork({ ...editingWork!, technicalDetails: newDetails });
  };

  const initNewWorkForm = () => {
    setNewWork({
      title: '',
      description: '',
      category: 'ai-animation',
      tags: [],
      media: [],
      technicalDetails: DEFAULT_TECHNICAL_DETAILS.map(td => ({ ...td })),
    });
    setTagInput('');
    setShowTagDropdown(false);
    setUploadState({ isUploading: false, progress: 0, status: 'idle', message: '', fileName: '' });
  };

  const initEditingWorkForm = (work: Work) => {
    setEditingWork({
      ...work,
      technicalDetails: work.technicalDetails && work.technicalDetails.length > 0
        ? work.technicalDetails.map(td => ({ ...td }))
        : DEFAULT_TECHNICAL_DETAILS.map(td => ({ ...td })),
    });
    setEditingWorkTagInput('');
    setEditingWorkShowTagDropdown(false);
    setReplaceUploadState({ isUploading: false, progress: 0, status: 'idle', message: '', fileName: '' });
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('确定要重置所有数据吗？这将清除所有自定义数据并恢复默认数据。')) {
                  resetToDefault();
                  setCategoriesList(getCategories());
                  setWorksList(getWorks());
                  alert('数据已重置！');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重置数据
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-100 hover:bg-dark-200 rounded-xl text-gray-300 transition-colors"
            >
              <Lock className="w-4 h-4" />
              退出登录
            </button>
          </div>
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
                    onClick={() => { initNewWorkForm(); setShowAddWork(true); }}
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
                              {categoriesList.find((c) => c.id === work.category)?.name}
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
                                onClick={() => initEditingWorkForm(work)}
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
                <div className="relative flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => { setTagInput(e.target.value); setShowTagDropdown(e.target.value.trim().length > 0); }}
                    onFocus={() => tagInput.trim().length > 0 && setShowTagDropdown(true)}
                    onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="输入标签后按回车添加，或从下方选择已有标签"
                    className="flex-1 bg-dark-200 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-dark-200 text-white rounded-xl hover:bg-dark-300 transition-colors"
                  >
                    添加
                  </button>
                  {showTagDropdown && availableTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !newWork.tags?.includes(t)).length > 0 && (
                    <div className="absolute top-full left-0 right-16 mt-2 bg-dark-200 border border-gray-700 rounded-xl p-2 z-10 max-h-48 overflow-y-auto shadow-lg">
                      <p className="text-gray-500 text-xs mb-2 px-2">点击选择已有标签</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !newWork.tags?.includes(t))
                          .map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleSelectExistingTag(tag)}
                              className="flex items-center gap-1 px-3 py-1 bg-dark-300 text-gray-300 rounded-full text-sm hover:bg-primary-500/20 hover:text-primary-400 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                {availableTags.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs mb-2">快速选择已有标签：</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(t => !newWork.tags?.includes(t))
                        .slice(0, 10)
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleSelectExistingTag(tag)}
                            className="flex items-center gap-1 px-2 py-1 bg-dark-200 text-gray-400 rounded-full text-xs hover:bg-primary-500/20 hover:text-primary-400 transition-colors border border-gray-700"
                          >
                            <Plus className="w-3 h-3" />
                            {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
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
                  {newWork.tags?.length === 0 && (
                    <span className="text-gray-500 text-sm">暂无标签</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">技术细节</label>
                  <button
                    onClick={handleAddTechnicalDetail}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    添加技术项
                  </button>
                </div>
                <div className="space-y-2">
                  {newWork.technicalDetails?.map((td, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={td.label}
                        onChange={(e) => handleUpdateTechnicalDetail(index, 'label', e.target.value)}
                        placeholder="标签（如：技术栈、分辨率、时长）"
                        className="w-32 bg-dark-200 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={td.value}
                        onChange={(e) => handleUpdateTechnicalDetail(index, 'value', e.target.value)}
                        placeholder="值"
                        className="flex-1 bg-dark-200 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <button
                        onClick={() => handleRemoveTechnicalDetail(index)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {newWork.technicalDetails?.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">暂无技术细节，点击上方"添加技术项"按钮添加</p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">建议添加：技术栈、实现方法、开发周期、分辨率、版本等信息</p>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">作品上传</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept={`${ACCEPTED_FILE_TYPES.image},${ACCEPTED_FILE_TYPES.video},${ACCEPTED_FILE_TYPES.audio}`}
                  className="hidden"
                />
                <div
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    uploadState.status === 'error' 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : uploadState.status === 'success'
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-gray-700 hover:border-primary-500 hover:bg-dark-300'
                  }`}
                >
                  {uploadState.isUploading ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
                        <span className="text-white">正在上传...</span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadState.progress}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm">{uploadState.progress}%</span>
                    </div>
                  ) : uploadState.status === 'success' ? (
                    <div className="space-y-2">
                      <Check className="w-8 h-8 text-green-400 mx-auto" />
                      <p className="text-green-400">{uploadState.message}</p>
                      <p className="text-gray-400 text-sm">{uploadState.fileName}</p>
                    </div>
                  ) : uploadState.status === 'error' ? (
                    <div className="space-y-2">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                      <p className="text-red-400">{uploadState.message}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-gray-400">点击或拖拽文件到此处上传</p>
                      <p className="text-gray-500 text-xs">支持图片、视频、音频文件（最大 50MB）</p>
                      <p className="text-gray-500 text-xs">格式：JPG, PNG, GIF, WebP, SVG, MP4, WebM, MP3, WAV 等</p>
                    </div>
                  )}
                </div>
                
                {/* 已上传的媒体列表 */}
                {newWork.media && newWork.media.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-400 text-sm">已上传的文件：</p>
                    <div className="grid grid-cols-2 gap-3">
                      {newWork.media.map((media) => (
                        <div key={media.id} className="relative group bg-dark-200 rounded-lg overflow-hidden">
                          {media.type === 'video' ? (
                            <div className="aspect-video flex items-center justify-center bg-dark-300">
                              <Video className="w-8 h-8 text-primary-400" />
                            </div>
                          ) : media.type === 'audio' ? (
                            <div className="aspect-video flex items-center justify-center bg-dark-300">
                              <Music className="w-8 h-8 text-accent-400" />
                            </div>
                          ) : (
                            <img 
                              src={media.url} 
                              alt="预览" 
                              className="w-full aspect-video object-cover"
                            />
                          )}
                          <div className="p-2 flex items-center justify-between">
                            <span className="text-white text-xs truncate flex-1">
                              {media.type === 'video' ? '视频文件' : media.type === 'audio' ? '音频文件' : '图片文件'}
                            </span>
                            <button
                              onClick={() =>
                                setNewWork({
                                  ...newWork,
                                  media: newWork.media?.filter((m) => m.id !== media.id),
                                })
                              }
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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

              <div>
                <label className="block text-gray-400 text-sm mb-2">标签</label>
                <div className="relative flex gap-2 mb-2">
                  <input
                    type="text"
                    value={editingWorkTagInput}
                    onChange={(e) => { setEditingWorkTagInput(e.target.value); setEditingWorkShowTagDropdown(e.target.value.trim().length > 0); }}
                    onFocus={() => editingWorkTagInput.trim().length > 0 && setEditingWorkShowTagDropdown(true)}
                    onBlur={() => setTimeout(() => setEditingWorkShowTagDropdown(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEditingWorkAddTag();
                      }
                    }}
                    placeholder="输入标签后按回车添加，或从下方选择已有标签"
                    className="flex-1 bg-dark-200 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                  <button
                    onClick={handleEditingWorkAddTag}
                    className="px-4 py-2 bg-dark-200 text-white rounded-xl hover:bg-dark-300 transition-colors"
                  >
                    添加
                  </button>
                  {editingWorkShowTagDropdown && availableTags.filter(t => t.toLowerCase().includes(editingWorkTagInput.toLowerCase()) && !editingWork?.tags?.includes(t)).length > 0 && (
                    <div className="absolute top-full left-0 right-16 mt-2 bg-dark-200 border border-gray-700 rounded-xl p-2 z-10 max-h-48 overflow-y-auto shadow-lg">
                      <p className="text-gray-500 text-xs mb-2 px-2">点击选择已有标签</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTags
                          .filter(t => t.toLowerCase().includes(editingWorkTagInput.toLowerCase()) && !editingWork?.tags?.includes(t))
                          .map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleEditingWorkSelectTag(tag)}
                              className="flex items-center gap-1 px-3 py-1 bg-dark-300 text-gray-300 rounded-full text-sm hover:bg-primary-500/20 hover:text-primary-400 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              {tag}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                {availableTags.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs mb-2">快速选择已有标签：</p>
                    <div className="flex flex-wrap gap-2">
                      {availableTags
                        .filter(t => !editingWork?.tags?.includes(t))
                        .slice(0, 10)
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleEditingWorkSelectTag(tag)}
                            className="flex items-center gap-1 px-2 py-1 bg-dark-200 text-gray-400 rounded-full text-xs hover:bg-primary-500/20 hover:text-primary-400 transition-colors border border-gray-700"
                          >
                            <Plus className="w-3 h-3" />
                            {tag}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {editingWork.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                    >
                      {tag}
                      <button onClick={() => handleEditingWorkRemoveTag(tag)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {editingWork.tags?.length === 0 && (
                    <span className="text-gray-500 text-sm">暂无标签</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">技术细节</label>
                  <button
                    onClick={handleEditingWorkAddTechnicalDetail}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    添加技术项
                  </button>
                </div>
                <div className="space-y-2">
                  {editingWork.technicalDetails?.map((td, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={td.label}
                        onChange={(e) => handleEditingWorkUpdateTechnicalDetail(index, 'label', e.target.value)}
                        placeholder="标签（如：技术栈、分辨率、时长）"
                        className="w-32 bg-dark-200 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <input
                        type="text"
                        value={td.value}
                        onChange={(e) => handleEditingWorkUpdateTechnicalDetail(index, 'value', e.target.value)}
                        placeholder="值"
                        className="flex-1 bg-dark-200 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <button
                        onClick={() => handleEditingWorkRemoveTechnicalDetail(index)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editingWork.technicalDetails?.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">暂无技术细节，点击上方"添加技术项"按钮添加</p>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">建议添加：技术栈、实现方法、开发周期、分辨率、版本等信息</p>
              </div>

              {/* 替换作品功能 */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">替换作品</label>
                <input
                  type="file"
                  ref={replaceFileInputRef}
                  onChange={handleReplaceFileSelect}
                  accept={`${ACCEPTED_FILE_TYPES.image},${ACCEPTED_FILE_TYPES.video},${ACCEPTED_FILE_TYPES.audio}`}
                  className="hidden"
                />
                
                {/* 当前作品预览 */}
                {editingWork.media && editingWork.media.length > 0 && (
                  <div className="mb-4 p-3 bg-dark-200 rounded-lg">
                    <p className="text-gray-400 text-xs mb-2">当前作品：</p>
                    <div className="flex items-center gap-3">
                      {editingWork.media[0].type === 'video' ? (
                        <div className="w-20 h-14 bg-dark-300 rounded flex items-center justify-center">
                          <Video className="w-6 h-6 text-primary-400" />
                        </div>
                      ) : editingWork.media[0].type === 'audio' ? (
                        <div className="w-20 h-14 bg-dark-300 rounded flex items-center justify-center">
                          <Music className="w-6 h-6 text-accent-400" />
                        </div>
                      ) : (
                        <img 
                          src={editingWork.media[0].url} 
                          alt="当前作品" 
                          className="w-20 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          {editingWork.media[0].type === 'video' ? '视频文件' : 
                           editingWork.media[0].type === 'audio' ? '音频文件' : '图片文件'}
                        </p>
                        <p className="text-gray-500 text-xs">点击下方按钮替换</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 替换按钮和上传状态 */}
                <div
                  onClick={triggerReplaceFileSelect}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    replaceUploadState.status === 'error' 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : replaceUploadState.status === 'success'
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-gray-700 hover:border-primary-500 hover:bg-dark-300'
                  }`}
                >
                  {replaceUploadState.isUploading ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 text-primary-400 animate-spin" />
                        <span className="text-white text-sm">正在替换...</span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-primary h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${replaceUploadState.progress}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">{replaceUploadState.progress}%</span>
                    </div>
                  ) : replaceUploadState.status === 'success' ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 text-sm">{replaceUploadState.message}</span>
                    </div>
                  ) : replaceUploadState.status === 'error' ? (
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 text-sm">{replaceUploadState.message}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400 text-sm">点击上传新文件替换当前作品</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2">替换后将保留作品的标题、描述和标签等信息</p>
              </div>

              {/* 替换确认对话框 */}
              {showReplaceConfirm && (
                <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4">
                  <div className="bg-dark-300 rounded-xl p-6 max-w-sm w-full">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                      <h4 className="text-white font-medium">确认替换作品？</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-6">
                      替换后原作品文件将被删除，但作品标题、描述和标签等信息将保留。此操作无法撤销。
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowReplaceConfirm(false)}
                        className="flex-1 py-2 bg-dark-200 text-white rounded-lg hover:bg-dark-100 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={confirmReplace}
                        className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                      >
                        确认替换
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
