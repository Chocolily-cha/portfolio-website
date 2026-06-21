export interface Work {
  id: string
  title: string
  description: string
  category: CategoryType
  tags: string[]
  createdAt: string
  updatedAt: string
  media: Media[]
  technicalDetails: TechnicalDetail[]
  views: number
  likes: number
  sortOrder?: number // 自定义排序字段
}

export interface Media {
  id: string
  type: 'image' | 'video' | 'audio'
  url: string
  thumbnail?: string
  title?: string
}

export interface TechnicalDetail {
  label: string
  value: string
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  order: number
}

export type CategoryType = 'ai-animation' | '3d-animation' | 'model' | 'painting' | 'photography' | 'other'

export type SortType = 'latest' | 'oldest' | 'popular'

export interface SearchFilters {
  keyword: string
  category: CategoryType | 'all'
  tags: string[]
  sortBy: SortType
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface AdminUser {
  username: string
  password: string
}

// 标签元数据接口
export interface TagMetadata {
  name: string
  category: CategoryType
  createdAt: string
  usageCount: number
  relatedWorks: string[] // 关联的作品ID列表
}

// 标签同步日志接口
export interface TagSyncLog {
  id: string
  action: 'add' | 'update' | 'delete' | 'merge'
  tagName: string
  category: CategoryType
  timestamp: string
  details: string
  userId?: string
}

// 标签验证结果接口
export interface TagValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}
