import { Work, Category, CategoryType } from '../types'

export const categories: Category[] = [
  {
    id: 'ai-animation',
    name: 'AI动画',
    icon: 'Sparkles',
    description: 'AI生成的动画作品',
    order: 1,
  },
  {
    id: '3d-animation',
    name: '三维动画',
    icon: 'Box',
    description: '3D动画作品展示',
    order: 2,
  },
  {
    id: 'model',
    name: '模型',
    icon: 'Grid3x3',
    description: '3D模型作品',
    order: 3,
  },
  {
    id: 'painting',
    name: '绘画',
    icon: 'Palette',
    description: '绘画艺术作品',
    order: 4,
  },
  {
    id: 'photography',
    name: '摄影',
    icon: 'Camera',
    description: '摄影作品集合',
    order: 5,
  },
  {
    id: 'other',
    name: '其它',
    icon: 'MoreHorizontal',
    description: '未归类的创意作品',
    order: 6,
  },
]

export const works: Work[] = [
  {
    id: 'ai-001',
    title: 'AI梦境之旅',
    description: '利用人工智能技术生成的沉浸式动画作品，展现了一个奇幻的梦境世界。画面融合了超现实元素与抽象艺术，营造出独特的视觉体验。',
    category: 'ai-animation',
    tags: ['AI生成', '动画', '超现实'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    media: [
      {
        id: 'm1',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-futuristic-portal-seamless-loop-4273-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '生成工具', value: 'MidJourney + Runway ML' },
      { label: '分辨率', value: '4K' },
      { label: '时长', value: '2:30' },
    ],
    views: 1256,
    likes: 89,
  },
  {
    id: 'ai-002',
    title: '数字水墨幻境',
    description: 'AI驱动的数字水墨动画，将传统东方美学与现代数字技术完美融合。',
    category: 'ai-animation',
    tags: ['AI生成', '水墨画', '数字艺术'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    media: [
      {
        id: 'm2',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-ink-splash-and-spread-in-water-4165-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1443890923422-7819ed4101c0?w=800&h=600&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '生成工具', value: 'Stable Diffusion' },
      { label: '分辨率', value: '4K' },
      { label: '时长', value: '1:45' },
    ],
    views: 892,
    likes: 67,
  },
  {
    id: '3d-001',
    title: '未来城市漫游',
    description: '精心制作的三维动画短片，展示了未来城市的壮丽景象。运用先进的渲染技术，呈现出令人惊叹的视觉效果。',
    category: '3d-animation',
    tags: ['3D动画', '未来城市', '科幻'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
    media: [
      {
        id: 'm3',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-city-s-downtown-4071-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '软件', value: 'Blender 3.6' },
      { label: '渲染器', value: 'Cycles' },
      { label: '时长', value: '3:15' },
      { label: '分辨率', value: '4K' },
    ],
    views: 2156,
    likes: 156,
  },
  {
    id: '3d-002',
    title: '海洋深处',
    description: '探索深海世界的三维动画，展现了神秘的海洋生物和壮观的海底景象。',
    category: '3d-animation',
    tags: ['3D动画', '海洋', '自然'],
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    media: [
      {
        id: 'm4',
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-sunlight-rays-in-the-ocean-4127-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '软件', value: 'Maya + Arnold' },
      { label: '分辨率', value: '4K' },
      { label: '时长', value: '2:00' },
    ],
    views: 1567,
    likes: 112,
  },
  {
    id: 'model-001',
    title: '复古汽车模型',
    description: '精细制作的复古汽车3D模型，包含完整的内部结构和细节纹理。',
    category: 'model',
    tags: ['3D模型', '汽车', '复古'],
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
    media: [
      {
        id: 'm5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
      },
      {
        id: 'm6',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=800&h=600&fit=crop',
      },
      {
        id: 'm7',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544244015-f0b4b6d99010?w=800&h=600&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '软件', value: 'Blender' },
      { label: '面数', value: '150,000' },
      { label: '纹理分辨率', value: '4K' },
      { label: '格式', value: 'FBX, OBJ' },
    ],
    views: 789,
    likes: 54,
  },
  {
    id: 'model-002',
    title: '科幻建筑模型',
    description: '未来派建筑设计的三维模型，展现了独特的建筑美学和创新设计理念。',
    category: 'model',
    tags: ['3D模型', '建筑', '科幻'],
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11',
    media: [
      {
        id: 'm8',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop',
      },
      {
        id: 'm9',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '软件', value: '3ds Max' },
      { label: '面数', value: '200,000' },
      { label: '纹理分辨率', value: '8K' },
      { label: '格式', value: '3DS, FBX' },
    ],
    views: 654,
    likes: 45,
  },
  {
    id: 'painting-001',
    title: '星空夜曲',
    description: '以星空为主题的数字绘画作品，运用独特的色彩搭配和笔触技巧，营造出梦幻般的氛围。',
    category: 'painting',
    tags: ['数字绘画', '星空', '梦幻'],
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
    media: [
      {
        id: 'm10',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '工具', value: 'Procreate' },
      { label: '尺寸', value: '4096 x 4096' },
      { label: '媒介', value: '数字绘画' },
      { label: '耗时', value: '8小时' },
    ],
    views: 1890,
    likes: 145,
  },
  {
    id: 'painting-002',
    title: '城市黄昏',
    description: '描绘城市黄昏景色的油画作品，捕捉了夕阳下城市的独特魅力。',
    category: 'painting',
    tags: ['油画', '城市', '风景'],
    createdAt: '2024-01-09',
    updatedAt: '2024-01-09',
    media: [
      {
        id: 'm11',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '工具', value: '油画颜料' },
      { label: '尺寸', value: '80cm x 60cm' },
      { label: '媒介', value: '画布' },
      { label: '耗时', value: '3天' },
    ],
    views: 1234,
    likes: 98,
  },
  {
    id: 'photo-001',
    title: '山间晨雾',
    description: '清晨山间的迷雾风景，展现了大自然的宁静与美丽。',
    category: 'photography',
    tags: ['风景', '自然', '晨雾'],
    createdAt: '2024-01-16',
    updatedAt: '2024-01-16',
    media: [
      {
        id: 'm12',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '相机', value: 'Sony A7R IV' },
      { label: '镜头', value: '24-70mm f/2.8' },
      { label: 'ISO', value: '100' },
      { label: '快门', value: '1/125s' },
    ],
    views: 2345,
    likes: 189,
  },
  {
    id: 'photo-002',
    title: '人像光影',
    description: '运用光影对比拍摄的人像作品，展现了人物的情感与个性。',
    category: 'photography',
    tags: ['人像', '光影', '艺术'],
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07',
    media: [
      {
        id: 'm13',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '相机', value: 'Canon EOS R5' },
      { label: '镜头', value: '85mm f/1.2' },
      { label: 'ISO', value: '200' },
      { label: '快门', value: '1/500s' },
    ],
    views: 1678,
    likes: 134,
  },
  {
    id: 'photo-003',
    title: '街头纪实',
    description: '城市街头的纪实摄影作品，捕捉了日常生活中的精彩瞬间。',
    category: 'photography',
    tags: ['纪实', '街头', '城市'],
    createdAt: '2024-01-06',
    updatedAt: '2024-01-06',
    media: [
      {
        id: 'm14',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517732306149-e8f829eb588a?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '相机', value: 'Leica Q3' },
      { label: 'ISO', value: '800' },
      { label: '快门', value: '1/250s' },
    ],
    views: 987,
    likes: 76,
  },
  {
    id: 'other-001',
    title: '创意海报设计',
    description: '为品牌活动设计的创意海报，融合了现代设计元素与品牌理念。',
    category: 'other',
    tags: ['平面设计', '海报', '品牌'],
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17',
    media: [
      {
        id: 'm15',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '软件', value: 'Adobe Photoshop' },
      { label: '尺寸', value: 'A3' },
      { label: '格式', value: 'PSD, PNG' },
    ],
    views: 456,
    likes: 34,
  },
  {
    id: 'other-002',
    title: 'UI界面设计',
    description: '移动应用的用户界面设计方案，注重用户体验与视觉美感的平衡。',
    category: 'other',
    tags: ['UI设计', '移动应用', '用户体验'],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
    media: [
      {
        id: 'm16',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=800&fit=crop',
      },
    ],
    technicalDetails: [
      { label: '软件', value: 'Figma' },
      { label: '平台', value: 'iOS/Android' },
      { label: '设计规范', value: 'Material Design' },
    ],
    views: 876,
    likes: 65,
  },
]

export const getAllTags = (): string[] => {
  const tagsSet = new Set<string>()
  works.forEach((work) => {
    work.tags.forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
}

export const getWorksByCategory = (category: CategoryType): Work[] => {
  return works.filter((work) => work.category === category)
}

export const getWorkById = (id: string): Work | undefined => {
  return works.find((work) => work.id === id)
}

export const searchWorks = (keyword: string, category: CategoryType | 'all', tags: string[], sortBy: 'latest' | 'oldest' | 'popular'): Work[] => {
  let filtered = works

  if (category !== 'all') {
    filtered = filtered.filter((work) => work.category === category)
  }

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    filtered = filtered.filter(
      (work) =>
        work.title.toLowerCase().includes(lowerKeyword) ||
        work.description.toLowerCase().includes(lowerKeyword)
    )
  }

  if (tags.length > 0) {
    filtered = filtered.filter((work) =>
      tags.some((tag) => work.tags.includes(tag))
    )
  }

  switch (sortBy) {
    case 'latest':
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'popular':
      return filtered.sort((a, b) => b.views - a.views)
    default:
      return filtered
  }
}
