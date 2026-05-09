import { SITE_CONFIG } from '@/utils/baseConfig';

const parseSiteScopedValue = (rawValue, siteName) => {
  if (!rawValue) return '';

  try {
    const parsedValue = JSON.parse(rawValue);
    if (parsedValue && parsedValue.site === siteName) {
      return parsedValue.value;
    }
  } catch (err) {
    return rawValue;
  }

  return '';
};

const readAuthCookieFallback = async () => {
  const cookieAuthData = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_data='));

  if (!cookieAuthData) return '';

  const encodedValue = cookieAuthData.split('=')[1];
  const decodedValue = decodeURIComponent(encodedValue);
  return parseSiteScopedValue(decodedValue, SITE_CONFIG.siteName) || encodedValue;
};

const readCookieValue = (name) => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i += 1) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') cookie = cookie.substring(1);

    if (cookie.indexOf(nameEQ) === 0) {
      const rawValue = cookie.substring(nameEQ.length);
      const decodedValue = decodeURIComponent(rawValue);
      return parseSiteScopedValue(decodedValue, SITE_CONFIG.siteName) || rawValue;
    }
  }

  return '';
};

export const readAuthData = async () => {
  let authData = localStorage.getItem('auth_data');

  if (!authData) {
    authData = readCookieValue('auth_data') || await readAuthCookieFallback();
  }

  if (!authData && window.authDataInStorage) {
    authData = window.authDataInStorage;
  }

  if (!authData) {
    const backupData = localStorage.getItem('cookie_auth_data');
    if (backupData) {
      authData = parseSiteScopedValue(backupData, SITE_CONFIG.siteName) || backupData;
    }
  }

  return authData || '';
};
