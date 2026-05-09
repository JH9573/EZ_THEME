
import axios from 'axios';
import { API_BASE_URL, getApiBaseUrl, isXiaoV2board, isXboard, CUSTOM_HEADERS_CONFIG } from '@/utils/baseConfig';
import { mapApiPath } from './utils/pathMapper';
import { getAvailableApiUrl } from '@/utils/apiAvailabilityChecker';
import { getEncrypUrl, randomIv } from "@/api/utils/encryption";
import { readAuthData } from '@/api/client/authToken';
import { applyCustomHeaders } from '@/api/client/headers';
import { normalizeRequestError } from '@/api/client/errors';

const isEncrypted = window.EZ_CONFIG &&
  window.EZ_CONFIG.API_MIDDLEWARE_ENABLED &&
  window.EZ_CONFIG.API_MIDDLEWARE_KEY &&
  window.EZ_CONFIG.API_MIDDLEWARE_KEY !== '';

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // 只有在加密模式下才添加 X-IV 头
    ...(isEncrypted && { 'X-IV': randomIv() }),
  }
});

const clearExpiredAuthState = () => {
  window.isUserLoggedIn = false;
  window.authDataInStorage = null;
  window.authCookieFailure = false;

  [
    'token',
    'auth_data',
    'cookie_auth_data',
    'userInfo',
    'is_admin',
    'vuex',
    'user',
    'auth'
  ].forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  ['auth_data', 'XSRF-TOKEN', 'laravel_session', 'token'].forEach(name => {
    ['/', '/dashboard', '/user', '/admin'].forEach(path => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
    });
  });
};

request.interceptors.request.use(
  async config => {
      config.baseURL = getApiBaseUrl();
    
    if (window.EZ_CONFIG && window.EZ_CONFIG.API_MIDDLEWARE_ENABLED) {
      const originalUrl = config.url;
      
      const path = originalUrl.startsWith("http") ? mapApiPath(config.url) : `${window.EZ_CONFIG.API_MIDDLEWARE_PATH}/${btoa(getEncrypUrl(config.url))}`
      
      config.url = isEncrypted ? path : mapApiPath(config.url);
      
      if (import.meta.env.DEV) {
        console.log(`API路径映射: ${originalUrl} -> ${config.url}`);
      }
    }
    else if (window.EZ_CONFIG && window.EZ_CONFIG.API_BASE_URLS &&
             Array.isArray(window.EZ_CONFIG.API_BASE_URLS) &&
             window.EZ_CONFIG.API_BASE_URLS.length > 1) {
      const availableApiUrl = getAvailableApiUrl();
      if (availableApiUrl) {
        config.baseURL = availableApiUrl;
      }
    }
    
    if ((isXiaoV2board() || isXboard()) && config.method === 'post' && config.data) {
      const formData = new URLSearchParams();
      for (const key in config.data) {
        if (Object.prototype.hasOwnProperty.call(config.data, key)) {
          formData.append(key, config.data[key]);
        }
      }
      
      config.data = formData;
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    const authData = await readAuthData();
    
    if (authData) {
      config.headers['Authorization'] = authData;
    }
    
    try {
      applyCustomHeaders(config.headers, CUSTOM_HEADERS_CONFIG);
    } catch (error) {
      console.error('应用自定义标头失败:', error);
    }
    
    return config;
  },
  error => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(new Error('请求配置错误'));
  }
);

request.interceptors.response.use(
  async response => {
    try {
      const res = response.data;
      
      if (res && res.message === '未登录或登陆已过期') {
        console.log('检测到登录已过期，执行登出操作');
        clearExpiredAuthState();
        window.location.href = '/#/login';
        return Promise.reject(new Error(res.message));
      }
      
      return res;
    } catch (err) {
      console.error('响应数据处理错误:', err);
      return Promise.reject(new Error('响应数据处理错误'));
    }
  },
  error => {
    console.error('请求错误:', error);
    
    return Promise.reject(normalizeRequestError(error));
  }
);

export default request;
