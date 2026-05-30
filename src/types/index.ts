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
}

export interface Media {
  id: string
  type: 'image' | 'video'
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
