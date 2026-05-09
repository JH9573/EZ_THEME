const TRAFFIC_UNITS = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
  PB: 1024 ** 5
};

export const formatTrafficSize = (bytes) => {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const parseTrafficTextToBytes = (trafficText) => {
  const match = String(trafficText || '').match(/(\d+(\.\d+)?)\s*([KMGT]?B)/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[3].toUpperCase();
  return value * (TRAFFIC_UNITS[unit] || 1);
};

export const calculateTrafficPercentage = (remainingTraffic, totalTraffic) => {
  const remainingBytes = parseTrafficTextToBytes(remainingTraffic);
  const totalBytes = parseTrafficTextToBytes(totalTraffic);

  if (!remainingBytes || !totalBytes) return 0;
  return Math.max(0, Math.min(100, (remainingBytes / totalBytes) * 100));
};

export const isTrafficBelowThreshold = (remainingTraffic, totalTraffic, threshold) => {
  return calculateTrafficPercentage(remainingTraffic, totalTraffic) <= threshold;
};

export const isTrafficEmpty = (remainingTraffic) => {
  const remainingBytes = parseTrafficTextToBytes(remainingTraffic);
  return remainingBytes !== null && remainingBytes <= 0;
};

export const calculateRemainingDays = (expiredAt) => {
  if (!expiredAt) return '--';
  const now = new Date();
  const expiredDate = new Date(expiredAt * 1000);
  const diffTime = expiredDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
