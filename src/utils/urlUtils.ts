// URL 参数工具函数
export const getUrlParam = (key: string): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

export const isAdminMode = (): boolean => {
  const mode = getUrlParam('mode');
  return mode === 'admin';
};

export const setUrlParam = (key: string, value: string): void => {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
};

export const removeUrlParam = (key: string): void => {
  const params = new URLSearchParams(window.location.search);
  params.delete(key);
  window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
};

// 权限检查工具
export const checkAdminAccess = (): boolean => {
  // 检查登录状态
  const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
  
  // 检查 URL 参数模式
  const isAdminModeParam = isAdminMode();
  
  // 只有满足以下条件之一才能访问管理功能：
  // 1. 已登录
  // 2. URL 参数明确指定 admin 模式
  return isLoggedIn || isAdminModeParam;
};
