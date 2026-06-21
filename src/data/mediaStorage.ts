import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'portfolio-media-db';
const DB_VERSION = 1;
const STORE_NAME = 'media-files';
const THUMBNAIL_STORE = 'thumbnails';

interface MediaRecord {
  id: string;
  blob: Blob;
  type: string;
  name: string;
  size: number;
  createdAt: string;
}

interface ThumbnailRecord {
  id: string;
  blob: Blob;
  parentId: string;
  createdAt: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

// 初始化数据库
export const initMediaDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 创建媒体文件存储
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const mediaStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          mediaStore.createIndex('createdAt', 'createdAt');
          mediaStore.createIndex('type', 'type');
        }
        
        // 创建缩略图存储
        if (!db.objectStoreNames.contains(THUMBNAIL_STORE)) {
          const thumbStore = db.createObjectStore(THUMBNAIL_STORE, { keyPath: 'id' });
          thumbStore.createIndex('parentId', 'parentId');
        }
      },
    });
  }
  return dbPromise;
};

// 保存媒体文件到 IndexedDB
export const saveMediaToIndexedDB = async (
  id: string,
  file: File | Blob,
  type: string
): Promise<void> => {
  const db = await initMediaDB();
  const record: MediaRecord = {
    id,
    blob: file instanceof File ? file : file,
    type,
    name: file instanceof File ? file.name : 'unknown',
    size: file.size,
    createdAt: new Date().toISOString(),
  };
  await db.put(STORE_NAME, record);
};

// 保存缩略图到 IndexedDB
export const saveThumbnailToIndexedDB = async (
  id: string,
  blob: Blob,
  parentId: string
): Promise<void> => {
  const db = await initMediaDB();
  const record: ThumbnailRecord = {
    id,
    blob,
    parentId,
    createdAt: new Date().toISOString(),
  };
  await db.put(THUMBNAIL_STORE, record);
};

// 从 IndexedDB 获取媒体文件
export const getMediaFromIndexedDB = async (id: string): Promise<Blob | null> => {
  try {
    const db = await initMediaDB();
    const record = await db.get(STORE_NAME, id);
    return record?.blob || null;
  } catch (error) {
    console.error('获取媒体文件失败:', error);
    return null;
  }
};

// 从 IndexedDB 获取缩略图
export const getThumbnailFromIndexedDB = async (id: string): Promise<Blob | null> => {
  try {
    const db = await initMediaDB();
    const record = await db.get(THUMBNAIL_STORE, id);
    return record?.blob || null;
  } catch (error) {
    console.error('获取缩略图失败:', error);
    return null;
  }
};

// 删除媒体文件
export const deleteMediaFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const db = await initMediaDB();
    await db.delete(STORE_NAME, id);
  } catch (error) {
    console.error('删除媒体文件失败:', error);
  }
};

// 删除缩略图
export const deleteThumbnailFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const db = await initMediaDB();
    await db.delete(THUMBNAIL_STORE, id);
  } catch (error) {
    console.error('删除缩略图失败:', error);
  }
};

// 获取所有媒体文件的大小
export const getAllMediaSize = async (): Promise<number> => {
  try {
    const db = await initMediaDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const all = await store.getAll();
    return all.reduce((sum, record) => sum + record.size, 0);
  } catch (error) {
    console.error('获取媒体大小失败:', error);
    return 0;
  }
};

// 获取媒体统计信息
export const getMediaStatistics = async (): Promise<{
  totalCount: number;
  totalSize: number;
  byType: Record<string, number>;
}> => {
  try {
    const db = await initMediaDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const all = await store.getAll();
    
    const byType: Record<string, number> = {};
    let totalSize = 0;
    
    all.forEach((record: MediaRecord) => {
      totalSize += record.size;
      byType[record.type] = (byType[record.type] || 0) + 1;
    });
    
    return {
      totalCount: all.length,
      totalSize,
      byType,
    };
  } catch (error) {
    console.error('获取媒体统计失败:', error);
    return {
      totalCount: 0,
      totalSize: 0,
      byType: {},
    };
  }
};

// 清理所有媒体文件
export const clearAllMedia = async (): Promise<void> => {
  try {
    const db = await initMediaDB();
    await db.clear(STORE_NAME);
    await db.clear(THUMBNAIL_STORE);
    console.log('所有媒体文件已清理');
  } catch (error) {
    console.error('清理媒体文件失败:', error);
  }
};

// 根据父 ID 获取所有缩略图
export const getThumbnailsByParentId = async (parentId: string): Promise<ThumbnailRecord[]> => {
  try {
    const db = await initMediaDB();
    const tx = db.transaction(THUMBNAIL_STORE, 'readonly');
    const index = tx.objectStore(THUMBNAIL_STORE).index('parentId');
    return await index.getAll(parentId);
  } catch (error) {
    console.error('获取缩略图失败:', error);
    return [];
  }
};

// 存储管理器 - 统一接口
export const mediaStorage = {
  // 保存文件
  async save(id: string, file: File | Blob, type: string, parentId?: string): Promise<void> {
    await saveMediaToIndexedDB(id, file, type);
    
    // 如果提供了父 ID，同时保存缩略图（如果文件是图片）
    if (parentId && type.startsWith('image/') && file instanceof Blob) {
      // 注意：实际缩略图生成应在上传前完成，这里只是示例
      // 缩略图应该单独保存
    }
  },
  
  // 获取文件
  async get(id: string): Promise<Blob | null> {
    return await getMediaFromIndexedDB(id);
  },
  
  // 删除文件
  async delete(id: string): Promise<void> {
    await deleteMediaFromIndexedDB(id);
    await deleteThumbnailFromIndexedDB(id);
  },
  
  // 获取统计
  async getStats() {
    return await getMediaStatistics();
  },
  
  // 清理所有
  async clear() {
    await clearAllMedia();
  },
};

// 导出数据库实例获取函数（供高级用法）
export const getMediaDB = () => initMediaDB();
