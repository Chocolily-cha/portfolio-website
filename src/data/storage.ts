import { categories as defaultCategories, works as defaultWorks } from './mockData';
import { Category, Work, CategoryType } from '../types';

// localStorage 键名
const STORAGE_KEYS = {
  CATEGORIES: 'portfolio_categories',
  WORKS: 'portfolio_works'
};

// 从 localStorage 读取数据
export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

// 保存数据到 localStorage
export const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// 获取分类列表
export const getCategories = (): Category[] => {
  return loadFromStorage(STORAGE_KEYS.CATEGORIES, defaultCategories);
};

// 获取作品列表
export const getWorks = (): Work[] => {
  return loadFromStorage(STORAGE_KEYS.WORKS, defaultWorks);
};

// 保存分类列表
export const saveCategories = (categories: Category[]): void => {
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
};

// 保存作品列表
export const saveWorks = (works: Work[]): void => {
  saveToStorage(STORAGE_KEYS.WORKS, works);
};

// 搜索作品
export const searchWorks = (
  keyword: string,
  category: CategoryType | 'all',
  tags: string[],
  sortBy: 'latest' | 'oldest' | 'popular'
): Work[] => {
  let filtered = getWorks();

  if (category !== 'all') {
    filtered = filtered.filter((work) => work.category === category);
  }

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filtered = filtered.filter(
      (work) =>
        work.title.toLowerCase().includes(lowerKeyword) ||
        work.description.toLowerCase().includes(lowerKeyword)
    );
  }

  if (tags.length > 0) {
    filtered = filtered.filter((work) =>
      tags.some((tag) => work.tags.includes(tag))
    );
  }

  // 排序
  filtered.sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return b.views - a.views;
    }
  });

  return filtered;
};

// 根据 ID 获取作品
export const getWorkById = (id: string): Work | undefined => {
  return getWorks().find((work) => work.id === id);
};

// 获取所有标签
export const getAllTags = (): string[] => {
  const tagsSet = new Set<string>();
  getWorks().forEach((work) => {
    work.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};

// 根据分类获取作品
export const getWorksByCategory = (category: CategoryType): Work[] => {
  return getWorks().filter((work) => work.category === category);
};

// 重置为默认数据
export const resetToDefault = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.WORKS);
};

// 导出存储键名供其他组件使用
export { STORAGE_KEYS };
