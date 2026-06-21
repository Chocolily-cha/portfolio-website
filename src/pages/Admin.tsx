import { useState, useRef, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { Lock, Unlock, Plus, Trash2, Edit3, Save, X, Eye, EyeOff, List, Layout, Image, Video, Sparkles, Box, Grid3x3, Palette, Camera, MoreHorizontal, Layers, Star, Wand2, Code, Palette as Paint, Brush, Zap, Globe, Music, Gamepad2, Award, Crown, Feather, Heart, Sun, Moon, Coffee, BookOpen, PenTool, Upload, RefreshCw, Check, AlertCircle, RotateCcw, Search, Filter, ArrowUpDown, X as CloseIcon, Tag as TagIcon, History, TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getCategories, getWorks, saveCategories, saveWorks, resetToDefault, getAllTags, validateTag, addOrUpdateTagMetadata, batchAddTagsMetadata, getTagSyncLogs, getTagStatistics, clearTagSyncLogs, getSortedWorksByCategory, moveWorkInCategory, deleteCategorySortConfig, getCategorySortConfig } from '../data/storage';
import { saveMediaToIndexedDB, saveThumbnailToIndexedDB } from '../data/mediaStorage';
import { Category, Work, CategoryType, TechnicalDetail, TagValidationResult } from '../types';

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
  const [activeTab, setActiveTab] = useState<'categories' | 'works' | 'tags'>('categories');
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

  // 组件卸载时清理所有对象 URL，防止内存泄漏
  useEffect(() => {
    return () => {
      // 清理所有创建的对象 URL
      objectUrlsRef.current.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn('清理对象 URL 时出错:', error);
        }
      });
      // 清空追踪列表
      objectUrlsRef.current = [];
    };
  }, []);

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
  
  // 追踪所有创建的对象 URL，防止内存泄漏
  const objectUrlsRef = useRef<string[]>([]);

  // 排序和筛选状态
  const [sortBy, setSortBy] = useState<'category' | 'time' | 'name'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // 分类管理界面状态
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSortMode, setIsSortMode] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragWorkId, setDragWorkId] = useState<string | null>(null);

  // 分类相关的标签和技术细节模板
  const categoryTemplates: Record<string, { tags: string[], technicalDetails: TechnicalDetail[] }> = {
    'ai-animation': {
      tags: ['AI生成', '动画', '超现实', '数字艺术', '水墨画', 'MidJourney', 'Stable Diffusion', 'Runway ML'],
      technicalDetails: [
        { label: '生成工具', value: '' },
        { label: '分辨率', value: '' },
        { label: '时长', value: '' },
      ],
    },
    '3d-animation': {
      tags: ['3D动画', '未来城市', '科幻', '海洋', '自然', 'Blender', 'Maya', 'Cycles'],
      technicalDetails: [
        { label: '软件', value: '' },
        { label: '渲染器', value: '' },
        { label: '时长', value: '' },
        { label: '分辨率', value: '' },
      ],
    },
    'model': {
      tags: ['3D模型', '汽车', '复古', '建筑', '科幻', 'Blender', '3ds Max', 'FBX'],
      technicalDetails: [
        { label: '软件', value: '' },
        { label: '面数', value: '' },
        { label: '纹理分辨率', value: '' },
        { label: '格式', value: '' },
      ],
    },
    'painting': {
      tags: ['数字绘画', '星空', '梦幻', '油画', '城市', '风景', 'Procreate', 'Photoshop'],
      technicalDetails: [
        { label: '工具', value: '' },
        { label: '尺寸', value: '' },
        { label: '媒介', value: '' },
        { label: '耗时', value: '' },
      ],
    },
    'photography': {
      tags: ['风景', '自然', '晨雾', '人像', '光影', '艺术', '纪实', '街头', '城市'],
      technicalDetails: [
        { label: '相机', value: '' },
        { label: '镜头', value: '' },
        { label: 'ISO', value: '' },
        { label: '快门', value: '' },
      ],
    },
    'other': {
      tags: ['平面设计', '海报', '品牌', 'UI设计', '移动应用', '用户体验', 'Figma', 'Adobe'],
      technicalDetails: [
        { label: '软件', value: '' },
        { label: '尺寸', value: '' },
        { label: '格式', value: '' },
      ],
    },
  };

  // 获取当前分类的可用标签
  const getCategoryTags = (categoryId: string): string[] => {
    return categoryTemplates[categoryId]?.tags || [];
  };

  // 获取当前分类的默认技术细节模板
  const getCategoryTechnicalDetails = (categoryId: string): TechnicalDetail[] => {
    return categoryTemplates[categoryId]?.technicalDetails || DEFAULT_TECHNICAL_DETAILS;
  };

  // 排序和筛选逻辑
  const getFilteredAndSortedWorks = (): Work[] => {
    let filteredWorks = [...worksList];

    // 按分类筛选
    if (filterCategory !== 'all') {
      filteredWorks = filteredWorks.filter(work => work.category === filterCategory);
    }

    // 按关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filteredWorks = filteredWorks.filter(work => 
        work.title.toLowerCase().includes(keyword) ||
        work.description.toLowerCase().includes(keyword) ||
        work.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        work.technicalDetails.some(td => 
          td.label.toLowerCase().includes(keyword) || 
          td.value.toLowerCase().includes(keyword)
        )
      );
    }

    // 排序
    return filteredWorks.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'category':
          const categoryA = categoriesList.find(c => c.id === a.category)?.name || '';
          const categoryB = categoriesList.find(c => c.id === b.category)?.name || '';
          comparison = categoryA.localeCompare(categoryB, 'zh-CN');
          break;
        case 'time':
          const timeA = new Date(a.updatedAt).getTime();
          const timeB = new Date(b.updatedAt).getTime();
          comparison = timeA - timeB;
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title, 'zh-CN', { sensitivity: 'base' });
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  // 清除筛选条件
  const clearFilters = () => {
    setFilterCategory('all');
    setSearchKeyword('');
    setSortBy('time');
    setSortOrder('desc');
  };

  // 检查是否有活动筛选
  const hasActiveFilters = () => {
    return filterCategory !== 'all' || searchKeyword.trim() !== '' || sortBy !== 'time' || sortOrder !== 'desc';
  };

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

  // 图片压缩选项
  const imageCompressionOptions = {
    maxSizeMB: 1, // 最大 1MB
    maxWidthOrHeight: 1920, // 最大尺寸 1920px
    useWebWorker: true, // 使用 Web Worker 不阻塞主线程
    fileType: 'image/jpeg' as const, // 转换为 JPEG
  };

  // 缩略图压缩选项
  const thumbnailCompressionOptions = {
    maxSizeMB: 0.1, // 最大 100KB
    maxWidthOrHeight: 400, // 缩略图尺寸 400px
    useWebWorker: true,
    fileType: 'image/jpeg' as const,
  };

  // 压缩图片函数
  const compressImage = async (
    file: File,
    options: object = imageCompressionOptions
  ): Promise<File> => {
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('图片压缩失败:', error);
      // 压缩失败时返回原文件
      return file;
    }
  };

  // 生成缩略图函数
  const generateThumbnail = async (file: File): Promise<string> => {
    try {
      const thumbnail = await compressImage(file, thumbnailCompressionOptions);
      const thumbnailUrl = URL.createObjectURL(thumbnail);
      // 追踪对象 URL 以便后续清理
      objectUrlsRef.current.push(thumbnailUrl);
      return thumbnailUrl;
    } catch (error) {
      console.error('缩略图生成失败:', error);
      // 缩略图生成失败时返回原图的 URL
      const originalUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(originalUrl);
      return originalUrl;
    }
  };

  // 获取文件类型
  const getFileType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // 默认为图片
  };

  // 文件上传处理函数 - 已修复内存泄漏
  // 文件上传处理函数 - 已集成图片压缩
  const handleFileUpload = async (file: File, isReplace: boolean = false): Promise<{ url: string; thumbnail?: string } | null> => {
    const setState = isReplace ? setReplaceUploadState : setUploadState;
    const isImage = file.type.startsWith('image/');
    
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
      message: isImage ? '正在压缩和上传...' : '正在上传...',
      fileName: file.name
    });

    return new Promise((resolve) => {
      // 清理函数 - 防止内存泄漏
      const cleanup = () => {
        try {
          clearInterval(progressInterval);
        } catch (error) {
          console.warn('清理资源时出错:', error);
        }
      };

      // 模拟上传进度
      let progress = 0;
      let progressInterval: number | undefined = undefined;
      
      progressInterval = setInterval(() => {
        if (!progressInterval) return; // 防止重复执行
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        setState(prev => ({
          ...prev,
          progress: Math.round(progress)
        }));
      }, 100);

      // 处理文件上传
      const processFile = async () => {
        try {
          let processedFile = file;
          const mediaId = `media-${Date.now()}`;
          
          // 如果是图片，先进行压缩
          if (isImage) {
            setState(prev => ({ ...prev, message: '正在压缩图片...' }));
            processedFile = await compressImage(file, imageCompressionOptions);
            
            // 计算压缩比
            const compressionRatio = ((file.size - processedFile.size) / file.size * 100).toFixed(1);
            console.log(`图片压缩成功！压缩比例: ${compressionRatio}%, 原始大小: ${(file.size / 1024 / 1024).toFixed(2)}MB, 压缩后: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
          }
          
          // 创建对象 URL（比 Base64 更节省内存）
          const objectUrl = URL.createObjectURL(processedFile);
          // 追踪对象 URL 以便后续清理
          objectUrlsRef.current.push(objectUrl);
          
          // 后台同步到 IndexedDB（不影响主流程）
          (async () => {
            try {
              // 保存到 IndexedDB
              await saveMediaToIndexedDB(mediaId, processedFile, processedFile.type);
              console.log(`媒体文件已保存到 IndexedDB: ${mediaId}`);
              
              // 如果是图片，保存缩略图
              if (isImage && processedFile.type.startsWith('image/')) {
                // 生成并保存缩略图
                const thumbnailBlob = await compressImage(processedFile, thumbnailCompressionOptions);
                const thumbnailId = `thumb-${Date.now()}`;
                await saveThumbnailToIndexedDB(thumbnailId, thumbnailBlob, mediaId);
                console.log(`缩略图已保存到 IndexedDB: ${thumbnailId}`);
              }
            } catch (error) {
              console.error('后台保存到 IndexedDB 失败:', error);
            }
          })();
          
          // 如果是图片，生成缩略图
          let thumbnailUrl: string | undefined;
          if (isImage) {
            thumbnailUrl = await generateThumbnail(file);
          }
          
          cleanup();
          
          setState({
            isUploading: false,
            progress: 100,
            status: 'success',
            message: '上传成功！',
            fileName: file.name
          });

          // 3秒后重置状态
          const resetTimeout = setTimeout(() => {
            setState({
              isUploading: false,
              progress: 0,
              status: 'idle',
              message: '',
              fileName: ''
            });
          }, 3000);

          resolve({
            url: objectUrl,
            thumbnail: thumbnailUrl
          });
          
          return () => clearTimeout(resetTimeout);
        } catch (error) {
          cleanup();
          console.error('文件处理失败:', error);
          setState({
            isUploading: false,
            progress: 0,
            status: 'error',
            message: '文件处理失败，请重试',
            fileName: file.name
          });
          resolve(null);
        }
      };

      // 开始处理文件
      processFile();
    });
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await handleFileUpload(file);
    if (result) {
      const fileType = getFileType(file);
      setNewWork({
        ...newWork,
        media: [
          ...(newWork.media || []),
          {
            id: `media-${Date.now()}`,
            type: fileType,
            url: result.url,
            thumbnail: result.thumbnail,
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

    const result = await handleFileUpload(file, true);
    if (result) {
      const fileType = getFileType(file);
      setEditingWork({
        ...editingWork,
        media: [
          {
            id: `media-${Date.now()}`,
            type: fileType,
            url: result.url,
            thumbnail: result.thumbnail,
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
    if (!newWork.title) {
      setError('请填写作品名称');
      return;
    }

    const workId = `work-${Date.now()}`;
    const work: Work = {
      id: workId,
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
    
    // 批量添加所有标签到元数据系统
    if (newWork.tags && newWork.tags.length > 0) {
      const result = batchAddTagsMetadata(newWork.tags, newWork.category as CategoryType || 'other', workId);
      if (result.failed > 0) {
        console.warn('部分标签添加失败:', result.errors);
      }
    }

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
      
      // 更新标签使用计数
      addOrUpdateTagMetadata(tag, newWork.category || 'other', newWork.id);
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

  // 标签验证状态
  const [tagValidationResult, setTagValidationResult] = useState<TagValidationResult | null>(null);
  const [tagFeedback, setTagFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  const handleAddTag = () => {
    if (!tagInput.trim()) {
      setTagFeedback({ type: 'error', message: '请输入标签名称' });
      return;
    }

    // 验证标签
    const existingTags = getAllTags();
    const validation = validateTag(tagInput.trim(), newWork.category || 'other', existingTags);
    setTagValidationResult(validation);

    if (!validation.isValid) {
      setTagFeedback({ type: 'error', message: validation.errors[0] });
      return;
    }

    // 检查是否已存在于当前标签列表
    if (newWork.tags?.includes(tagInput.trim())) {
      setTagFeedback({ type: 'warning', message: '该标签已添加到当前作品' });
      setTagInput('');
      return;
    }

    // 添加到当前作品
    setNewWork({
      ...newWork,
      tags: [...(newWork.tags || []), tagInput.trim()],
    });

    // 更新标签元数据
    const result = addOrUpdateTagMetadata(tagInput.trim(), newWork.category || 'other', newWork.id);

    if (result.success) {
      if (validation.warnings.length > 0) {
        setTagFeedback({ type: 'warning', message: validation.warnings[0] });
      } else {
        setTagFeedback({ type: 'success', message: result.message });
      }
    } else {
      setTagFeedback({ type: 'error', message: result.message });
    }

    setTagInput('');
    setTagValidationResult(null);

    // 3秒后清除反馈消息
    setTimeout(() => setTagFeedback(null), 3000);
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
            <button
              onClick={() => setActiveTab('tags')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeTab === 'tags' ? 'bg-dark-200 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <TagIcon className="w-5 h-5" />
              标签管理
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'categories' ? (
              <>
                {selectedCategory ? (
                  // 分类专属管理界面
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setIsSortMode(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-200 hover:bg-dark-300 rounded-xl text-gray-300 transition-colors"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        返回分类列表
                      </button>
                      <h2 className="text-xl font-semibold text-white">
                        {categoriesList.find(c => c.id === selectedCategory)?.name} - 作品管理
                      </h2>
                    </div>

                    {/* 排序模式切换 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setIsSortMode(!isSortMode)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                            isSortMode ? 'bg-primary-500/20 text-primary-400 border border-primary-500' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'
                          }`}
                        >
                          <ArrowUpDown className="w-4 h-4" />
                          {isSortMode ? '退出排序模式' : '进入排序模式'}
                        </button>
                        {isSortMode && (
                          <>
                            <button
                              onClick={() => {
                                deleteCategorySortConfig(selectedCategory!);
                                setWorksList(getWorks());
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-xl text-yellow-400 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                              恢复默认排序
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => { initNewWorkForm(); setNewWork({ ...newWork, category: selectedCategory as CategoryType }); setShowAddWork(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                        添加作品
                      </button>
                    </div>

                    {/* 分类作品列表 */}
                    <div className="space-y-3">
                      {(() => {
                        const sortedWorks = getSortedWorksByCategory(selectedCategory as CategoryType);
                        return sortedWorks.length > 0 ? (
                          sortedWorks.map((work, index) => (
                            <div
                              key={work.id}
                              className={`flex items-center gap-4 p-4 bg-dark-200 rounded-xl transition-all ${
                                dragOverIndex === index && dragWorkId !== work.id ? 'ring-2 ring-primary-500 bg-dark-300' : ''
                              }`}
                              draggable={isSortMode}
                              onDragStart={() => {
                                setDragWorkId(work.id);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverIndex(index);
                              }}
                              onDragEnd={() => {
                                if (dragWorkId && dragOverIndex !== null && dragWorkId !== work.id) {
                                  const works = getSortedWorksByCategory(selectedCategory as CategoryType);
                                  const currentIndex = works.findIndex(w => w.id === dragWorkId);
                                  if (currentIndex !== -1) {
                                    const direction = dragOverIndex > currentIndex ? 'down' : 'up';
                                    moveWorkInCategory(selectedCategory!, dragWorkId, direction);
                                    setWorksList(getWorks());
                                  }
                                }
                                setDragWorkId(null);
                                setDragOverIndex(null);
                              }}
                            >
                              {/* 排序序号 */}
                              {isSortMode && (
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => {
                                      moveWorkInCategory(selectedCategory!, work.id, 'up');
                                      setWorksList(getWorks());
                                    }}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-dark-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ArrowUpDown className="w-4 h-4 text-gray-400 rotate-[-90deg]" />
                                  </button>
                                  <span className="text-center text-gray-500 text-sm w-6">#{index + 1}</span>
                                  <button
                                    onClick={() => {
                                      moveWorkInCategory(selectedCategory!, work.id, 'down');
                                      setWorksList(getWorks());
                                    }}
                                    disabled={index === sortedWorks.length - 1}
                                    className="p-1 hover:bg-dark-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ArrowUpDown className="w-4 h-4 text-gray-400 rotate-[90deg]" />
                                  </button>
                                </div>
                              )}
                              
                              {/* 缩略图 */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                {work.media[0] && (
                                  <img
                                    src={work.media[0].thumbnail || work.media[0].url}
                                    alt={work.title}
                                    className="w-full h-full object-contain"
                                  />
                                )}
                              </div>
                              
                              {/* 作品信息 */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold truncate">{work.title}</h3>
                                <p className="text-gray-500 text-sm">{work.tags.slice(0, 3).join(', ')}</p>
                              </div>
                              
                              {/* 操作按钮 */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => initEditingWorkForm(work)}
                                  className="p-2 hover:bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors"
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
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">该分类暂无作品</p>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  // 分类列表界面
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
                      {categoriesList.map((category) => {
                        const workCount = worksList.filter(w => w.category === category.id).length;
                        const sortConfig = getCategorySortConfig(category.id);
                        return (
                          <div
                            key={category.id}
                            className="bg-dark-200 rounded-xl p-4 cursor-pointer hover:bg-dark-300 transition-colors group"
                            onClick={() => setSelectedCategory(category.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-semibold group-hover:text-primary-400 transition-colors">
                                  {category.name}
                                </h3>
                                <p className="text-gray-500 text-sm">{category.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-gray-400 text-sm">{workCount} 个作品</span>
                                  {sortConfig?.useCustomSort && (
                                    <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full">
                                      已自定义排序
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCategory(category);
                                  }}
                                  className="p-2 hover:bg-dark-400 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCategory(category.id);
                                  }}
                                  className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            ) : activeTab === 'works' ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white">作品列表</h2>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                      >
                        <CloseIcon className="w-3 h-3" />
                        清除筛选
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                        showFilters ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-200 text-gray-300 hover:bg-dark-300'
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      筛选
                    </button>
                    <button
                      onClick={() => { initNewWorkForm(); setShowAddWork(true); }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      添加作品
                    </button>
                  </div>
                </div>

                {/* 筛选和排序面板 */}
                {showFilters && (
                  <div className="mb-6 p-4 bg-dark-200 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* 搜索框 */}
                      <div className="flex-1">
                        <label className="block text-gray-400 text-sm mb-2">关键词搜索</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="搜索作品名称、描述、标签、技术细节..."
                            className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                          />
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        </div>
                      </div>

                      {/* 分类筛选 */}
                      <div className="sm:w-48">
                        <label className="block text-gray-400 text-sm mb-2">分类筛选</label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="w-full bg-dark-300 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-colors"
                        >
                          <option value="all">全部分类</option>
                          {categoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* 排序方式 */}
                      <div className="flex-1">
                        <label className="block text-gray-400 text-sm mb-2">排序方式</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSortBy('category')}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              sortBy === 'category'
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                                : 'bg-dark-300 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                          >
                            按分类
                          </button>
                          <button
                            onClick={() => setSortBy('time')}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              sortBy === 'time'
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                                : 'bg-dark-300 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                          >
                            按时间
                          </button>
                          <button
                            onClick={() => setSortBy('name')}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              sortBy === 'name'
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500'
                                : 'bg-dark-300 text-gray-400 hover:text-white border border-gray-700'
                            }`}
                          >
                            按名称
                          </button>
                        </div>
                      </div>

                      {/* 排序顺序 */}
                      <div className="sm:w-48">
                        <label className="block text-gray-400 text-sm mb-2">排序顺序</label>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-dark-300 border border-gray-700 rounded-lg text-white hover:bg-dark-400 transition-colors"
                        >
                          <ArrowUpDown className="w-4 h-4" />
                          {sortOrder === 'asc' ? '升序' : '降序'}
                        </button>
                      </div>
                    </div>

                    {/* 筛选结果统计 */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        显示 {getFilteredAndSortedWorks().length} / {worksList.length} 个作品
                      </span>
                    </div>
                  </div>
                )}

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
                      {getFilteredAndSortedWorks().map((work) => (
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
            ) : (
              // 标签管理标签页
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">标签管理</h2>
                </div>

                {/* 标签统计卡片 */}
                {(() => {
                  const stats = getTagStatistics();
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <TagIcon className="w-6 h-6 text-blue-400" />
                          <span className="text-gray-400 text-sm">标签总数</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalTags}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className="w-6 h-6 text-green-400" />
                          <span className="text-gray-400 text-sm">总使用次数</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalUsage}</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-6 h-6 text-purple-400" />
                          <span className="text-gray-400 text-sm">最近添加</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.recentlyAdded.length}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* 热门标签 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-400" />
                    热门标签 Top 10
                  </h3>
                  <div className="bg-dark-200 rounded-xl p-4">
                    {(() => {
                      const stats = getTagStatistics();
                      return stats.mostUsedTags.length > 0 ? (
                        <div className="space-y-3">
                          {stats.mostUsedTags.map((tag, index) => (
                            <div key={tag.name} className="flex items-center justify-between p-3 bg-dark-300 rounded-lg">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-primary-400 w-8">#{index + 1}</span>
                                <div>
                                  <p className="text-white font-medium">{tag.name}</p>
                                  <p className="text-gray-500 text-sm">
                                    {categoriesList.find(c => c.id === tag.category)?.name || tag.category}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">{tag.usageCount} 次</p>
                                <p className="text-gray-500 text-sm">{tag.relatedWorks.length} 个作品</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">暂无标签数据</p>
                      );
                    })()}
                  </div>
                </div>

                {/* 标签同步日志 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-primary-400" />
                      标签同步日志
                    </h3>
                    {getTagSyncLogs().length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm('确定要清除所有日志吗？')) {
                            clearTagSyncLogs();
                          }
                        }}
                        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        清除日志
                      </button>
                    )}
                  </div>
                  <div className="bg-dark-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                    {(() => {
                      const logs = getTagSyncLogs();
                      return logs.length > 0 ? (
                        <div className="space-y-2">
                          {logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 p-3 bg-dark-300 rounded-lg">
                              <div className={`p-2 rounded-lg ${
                                log.action === 'add' ? 'bg-green-500/20 text-green-400' :
                                log.action === 'update' ? 'bg-blue-500/20 text-blue-400' :
                                log.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {log.action === 'add' && <TagIcon className="w-4 h-4" />}
                                {log.action === 'update' && <RefreshCw className="w-4 h-4" />}
                                {log.action === 'delete' && <Trash2 className="w-4 h-4" />}
                                {log.action === 'merge' && <Layers className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-medium">
                                    {log.action === 'add' ? '添加标签' :
                                     log.action === 'update' ? '更新标签' :
                                     log.action === 'delete' ? '删除标签' : '合并标签'}: {log.tagName}
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {new Date(log.timestamp).toLocaleString('zh-CN')}
                                  </span>
                                </div>
                                <p className="text-gray-400 text-sm">{log.details}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  分类: {categoriesList.find(c => c.id === log.category)?.name || log.category}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">暂无同步日志</p>
                      );
                    })()}
                  </div>
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
                <label className="block text-gray-400 text-sm mb-2">作品描述</label>
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
                  onChange={(e) => {
                    const newCategory = e.target.value as CategoryType;
                    // 获取新分类的技术细节模板
                    const newTechnicalDetails = getCategoryTechnicalDetails(newCategory);
                    // 保留已有值但更新标签
                    const updatedTechnicalDetails = newTechnicalDetails.map((template, index) => ({
                      ...template,
                      value: (newWork.technicalDetails?.[index]?.value) || '',
                    }));
                    setNewWork({ 
                      ...newWork, 
                      category: newCategory,
                      technicalDetails: updatedTechnicalDetails,
                    });
                  }}
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
                
                {/* 标签反馈消息 */}
                {tagFeedback && (
                  <div className={`mt-2 p-3 rounded-lg text-sm flex items-start gap-2 ${
                    tagFeedback.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    tagFeedback.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {tagFeedback.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {tagFeedback.type === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    {tagFeedback.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                    <span>{tagFeedback.message}</span>
                  </div>
                )}
                
                {/* 标签验证建议 */}
                {tagValidationResult && tagValidationResult.suggestions.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm">
                    <p className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4" />
                      <strong>提示：</strong>
                    </p>
                    <p className="mt-1">{tagValidationResult.suggestions[0]}</p>
                  </div>
                )}
                
                {/* 显示当前分类的推荐标签 */}
                <div className="mb-3">
                  <p className="text-gray-500 text-xs mb-2">{categoriesList.find(c => c.id === newWork.category)?.name}分类推荐标签：</p>
                  <div className="flex flex-wrap gap-2">
                    {getCategoryTags(newWork.category || 'other')
                      .filter(t => !newWork.tags?.includes(t))
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
                    // 批量更新标签元数据
                    if (editingWork?.tags && editingWork.tags.length > 0) {
                      const result = batchAddTagsMetadata(editingWork.tags, editingWork.category, editingWork.id);
                      if (result.failed > 0) {
                        console.warn('部分标签更新失败:', result.errors);
                      }
                    }
                    
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
