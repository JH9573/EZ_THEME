export const getDeviceType = (ua = '') => {
  const uaLower = ua.toLowerCase();

  if (/iphone|ipad|ios/.test(uaLower)) return 'ios';
  if (/android/.test(uaLower)) return 'android';
  if (/windows/.test(uaLower)) return 'windows';
  if (/macintosh|mac os/.test(uaLower)) return 'macos';
  if (/linux/.test(uaLower)) return 'linux';
  return 'unknown';
};

export const formatDeviceName = (ua = '', labels = {}) => {
  if (!ua) return labels.unknownDevice || 'Unknown Device';

  const uaLower = ua.toLowerCase();
  let browser = labels.unknownBrowser || 'Unknown Browser';

  if (uaLower.includes('edg/') || uaLower.includes('edge/')) {
    browser = 'Edge';
  } else if (uaLower.includes('chrome/') && !uaLower.includes('chromium/')) {
    browser = 'Chrome';
  } else if (uaLower.includes('firefox/')) {
    browser = 'Firefox';
  } else if (uaLower.includes('safari/') && !uaLower.includes('chrome/') && !uaLower.includes('android')) {
    browser = 'Safari';
  } else if (uaLower.includes('opera/') || uaLower.includes('opr/')) {
    browser = 'Opera';
  }

  const deviceType = getDeviceType(ua);
  const deviceMap = {
    ios: uaLower.includes('iphone') ? 'iPhone' : uaLower.includes('ipad') ? 'iPad' : uaLower.includes('ipod') ? 'iPod' : 'iOS',
    android: 'Android',
    windows: 'Windows',
    macos: 'MacOS',
    linux: 'Linux',
    unknown: labels.unknownDevice || 'Unknown Device'
  };

  return `${deviceMap[deviceType]} - ${browser}`;
};

export const formatProfileTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const numTimestamp = Number(timestamp);
  if (Number.isNaN(numTimestamp) || numTimestamp < 0 || numTimestamp > 4102444800) return '';
  const date = new Date(numTimestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
