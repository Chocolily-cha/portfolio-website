import { useState, useEffect, useRef } from 'react';

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

// 懒加载图片 Hook
export const useLazyImage = (
  src: string,
  options: UseLazyLoadOptions & { placeholder?: string } = {}
) => {
  const { placeholder = '', ...lazyOptions } = options;
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  const isVisible = useLazyLoad(imgRef as React.RefObject<HTMLElement>, lazyOptions);
  
  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        setError(null);
      };
      
      img.onerror = (err) => {
        setError(err as Error);
        setIsLoading(false);
        console.error('图片加载失败:', src, err);
      };
      
      img.src = src;
    }
  }, [isVisible, src]);
  
  return {
    imageSrc,
    isLoading,
    error,
    imgRef
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
    urls.forEach((url, index) => {
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
