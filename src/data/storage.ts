import { categories as defaultCategories, works as defaultWorks } from './mockData';
import { Category, Work, CategoryType, TagMetadata, TagSyncLog, TagValidationResult } from '../types';

// localStorage 键名
const STORAGE_KEYS = {
  CATEGORIES: 'portfolio_categories',
  WORKS: 'portfolio_works',
  TAG_METADATA: 'portfolio_tag_metadata',
  TAG_SYNC_LOGS: 'portfolio_tag_sync_logs'
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
  localStorage.removeItem(STORAGE_KEYS.TAG_METADATA);
  localStorage.removeItem(STORAGE_KEYS.TAG_SYNC_LOGS);
};

// ==================== 标签管理系统 ====================

// 获取标签元数据
export const getTagMetadata = (): TagMetadata[] => {
  return loadFromStorage(STORAGE_KEYS.TAG_METADATA, []);
};

// 保存标签元数据
export const saveTagMetadata = (metadata: TagMetadata[]): void => {
  saveToStorage(STORAGE_KEYS.TAG_METADATA, metadata);
};

// 获取标签同步日志
export const getTagSyncLogs = (): TagSyncLog[] => {
  return loadFromStorage(STORAGE_KEYS.TAG_SYNC_LOGS, []);
};

// 添加标签同步日志
export const addTagSyncLog = (log: Omit<TagSyncLog, 'id' | 'timestamp'>): void => {
  const logs = getTagSyncLogs();
  const newLog: TagSyncLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog); // 添加到开头
  // 只保留最近100条日志
  const trimmedLogs = logs.slice(0, 100);
  saveToStorage(STORAGE_KEYS.TAG_SYNC_LOGS, trimmedLogs);
};

// 验证标签格式和相关性
export const validateTag = (
  tagName: string,
  category: CategoryType,
  existingTags: string[]
): TagValidationResult => {
  const result: TagValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // 验证标签名称格式
  if (!tagName || tagName.trim().length === 0) {
    result.isValid = false;
    result.errors.push('标签名称不能为空');
    return result;
  }

  const trimmedTag = tagName.trim();
  
  // 检查长度
  if (trimmedTag.length < 2) {
    result.errors.push('标签名称至少需要2个字符');
    result.isValid = false;
  } else if (trimmedTag.length > 20) {
    result.errors.push('标签名称不能超过20个字符');
    result.isValid = false;
  }

  // 检查是否包含非法字符
  const illegalChars = /[<>\"'&]/;
  if (illegalChars.test(trimmedTag)) {
    result.errors.push('标签名称包含非法字符');
    result.isValid = false;
  }

  // 检查是否已存在（不区分大小写）
  const existingLower = existingTags.map(t => t.toLowerCase());
  if (existingLower.includes(trimmedTag.toLowerCase())) {
    result.warnings.push('该标签已存在，将更新其元数据');
  }

  // 提供相似标签建议
  const similarTags = existingTags.filter(tag => {
    const similarity = calculateSimilarity(trimmedTag, tag);
    return similarity > 0.5 && similarity < 1;
  });

  if (similarTags.length > 0) {
    result.suggestions.push(`您可能想使用这些已有标签: ${similarTags.join(', ')}`);
  }

  return result;
};

// 计算字符串相似度（简单实现）
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// 计算编辑距离
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// 添加或更新标签元数据
export const addOrUpdateTagMetadata = (
  tagName: string,
  category: CategoryType,
  workId?: string
): { success: boolean; message: string } => {
  const metadata = getTagMetadata();
  const existingIndex = metadata.findIndex(
    m => m.name.toLowerCase() === tagName.toLowerCase()
  );

  if (existingIndex !== -1) {
    // 更新现有标签
    const existing = metadata[existingIndex];
    
    // 如果标签已属于该分类，则增加使用计数
    if (existing.category === category) {
      existing.usageCount++;
      if (workId && !existing.relatedWorks.includes(workId)) {
        existing.relatedWorks.push(workId);
      }
    } else {
      // 标签属于其他分类，提供警告
      addTagSyncLog({
        action: 'update',
        tagName: existing.name,
        category: existing.category,
        details: `尝试将标签添加到分类 ${category}，但该标签已属于分类 ${existing.category}`
      });
      return {
        success: false,
        message: `标签 "${tagName}" 已存在于分类 "${getCategoryName(existing.category)}" 中`
      };
    }

    metadata[existingIndex] = existing;
    saveTagMetadata(metadata);
    
    addTagSyncLog({
      action: 'update',
      tagName: existing.name,
      category: existing.category,
      details: `更新标签使用计数: ${existing.usageCount}`
    });
    
    return { success: true, message: '标签已更新' };
  } else {
    // 添加新标签
    const newMetadata: TagMetadata = {
      name: tagName.trim(),
      category,
      createdAt: new Date().toISOString(),
      usageCount: 1,
      relatedWorks: workId ? [workId] : []
    };
    
    metadata.push(newMetadata);
    saveTagMetadata(metadata);
    
    addTagSyncLog({
      action: 'add',
      tagName: tagName.trim(),
      category,
      details: '新标签已创建并添加到分类'
    });
    
    return { success: true, message: '新标签已创建' };
  }
};

// 获取分类名称
const getCategoryName = (categoryId: CategoryType): string => {
  const categories = getCategories();
  return categories.find(c => c.id === categoryId)?.name || categoryId;
};

// 批量添加标签到元数据
export const batchAddTagsMetadata = (
  tags: string[],
  category: CategoryType,
  workId?: string
): { success: number; failed: number; errors: string[] } => {
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  tags.forEach(tag => {
    const validation = validateTag(tag, category, getAllTags());
    if (validation.isValid) {
      const result = addOrUpdateTagMetadata(tag, category, workId);
      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(result.message);
      }
    } else {
      failed++;
      errors.push(...validation.errors);
    }
  });

  return { success, failed, errors };
};

// 根据分类获取标签
export const getTagsByCategory = (category: CategoryType): TagMetadata[] => {
  const metadata = getTagMetadata();
  return metadata.filter(m => m.category === category);
};

// 获取标签使用统计
export const getTagStatistics = (): {
  totalTags: number;
  totalUsage: number;
  mostUsedTags: TagMetadata[];
  recentlyAdded: TagMetadata[];
} => {
  const metadata = getTagMetadata();
  const totalTags = metadata.length;
  const totalUsage = metadata.reduce((sum, m) => sum + m.usageCount, 0);
  
  const mostUsedTags = [...metadata]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
  
  const recentlyAdded = [...metadata]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return { totalTags, totalUsage, mostUsedTags, recentlyAdded };
};

// 清除标签同步日志
export const clearTagSyncLogs = (): void => {
  saveToStorage(STORAGE_KEYS.TAG_SYNC_LOGS, []);
};

// 导出存储键名供其他组件使用
export { STORAGE_KEYS };
