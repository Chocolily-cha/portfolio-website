import { useState, useEffect, useRef } from 'react';

// 图片缓存管理器
class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  
  async preload(src: string): Promise<HTMLImageElement> {
    // 如果已经在缓存中，直接返回
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      img.src = src;
    });
  }
  
  get(src: string): HTMLImageElement | undefined {
    return this.cache.get(src);
  }
  
  has(src: string): boolean {
    return this.cache.has(src);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 全局图片缓存实例
export const imageCache = new ImageCache();

// 预加载图片函数
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return imageCache.preload(src);
};

// 批量预加载图片函数
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => 
    preloadImage(url).catch(err => {
      console.warn('预加载图片失败:', err);
      return null;
    })
  );
  await Promise.all(promises);
};

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = (
  ref: React.RefObject<HTMLElement>,
  options: UseLazyLoadOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    
    if (!element) return;
    
    // 如果已经加载过且只需要触发一次，直接返回
    if (triggerOnce && hasLoaded) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    observer.observe(element);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [ref, threshold, rootMargin, triggerOnce, hasLoaded]);
  
  return isVisible;
};

// 懒加载图片 Hook - 优化版本
export const useLazyImage = (
  src: string,
  options: UseLazyLoadOptions & { placeholder?: string } = {}
) => {
  const { placeholder = '', ...lazyOptions } = options;
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  // 使用 IntersectionObserver 检测元素是否可见
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // 一旦可见就停止观察（单次加载）
          if (lazyOptions.triggerOnce !== false) {
            observer.disconnect();
          }
        } else if (lazyOptions.triggerOnce === false) {
          setIsVisible(false);
        }
      },
      {
        threshold: lazyOptions.threshold || 0.1,
        rootMargin: lazyOptions.rootMargin || '100px', // 提前 100px 开始加载
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [lazyOptions.threshold, lazyOptions.rootMargin, lazyOptions.triggerOnce]);
  
  // 加载图片
  useEffect(() => {
    if (!isVisible || !src) {
      return;
    }
    
    setIsLoading(true);
    setHasError(false);
    
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
    };
    
    img.onerror = () => {
      console.error('图片加载失败:', src);
      setIsLoading(false);
      setHasError(true);
      // 尝试使用原始 URL 作为降级方案
      if (src.startsWith('data:')) {
        setImageSrc(src);
      }
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isVisible, src]);
  
  return {
    imageSrc,
    isLoading,
    hasError,
    containerRef
  };
};

// 批量图片懒加载 Hook
export const useBatchLazyImages = (
  urls: string[],
  options: UseLazyLoadOptions = {}
) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const refs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  
  // 初始化 refs
  useEffect(() => {
    urls.forEach((url) => {
      if (!refs.current.has(url)) {
        refs.current.set(url, { current: null });
      }
    });
  }, [urls]);
  
  // 为每个 URL 设置 IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    refs.current.forEach((ref, url) => {
      const element = ref.current;
      if (!element) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !loadedImages[url]) {
            // 开始加载图片
            setLoadingStates(prev => ({ ...prev, [url]: true }));
            
            const img = new Image();
            img.onload = () => {
              setLoadedImages(prev => ({ ...prev, [url]: img.src }));
              setLoadingStates(prev => ({ ...prev, [url]: false }));
            };
            img.onerror = () => {
              setLoadingStates(prev => ({ ...prev, [url]: false }));
            };
            img.src = url;
            
            if (options.triggerOnce !== false) {
              observer.disconnect();
            }
          }
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '50px',
        }
      );
      
      observer.observe(element);
      observers.push(observer);
    });
    
    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [urls, loadedImages, options]);
  
  return {
    loadedImages,
    loadingStates,
    refs
  };
};

// 视频懒加载 Hook
export const useLazyVideo = (
  src: string,
  options: UseLazyLoadOptions = {}
) => {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useLazyLoad(containerRef as React.RefObject<HTMLElement>, options);
  
  useEffect(() => {
    if (isVisible && src) {
      setVideoSrc(src);
    }
  }, [isVisible, src]);
  
  return {
    videoSrc,
    containerRef
  };
};
