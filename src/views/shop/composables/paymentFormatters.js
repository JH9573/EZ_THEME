export const formatPaymentDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

export const formatPaymentAmount = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return `¥${(amount / 100).toFixed(2)}`;
};

export const formatPaymentPeriod = (period) => {
  const periodMap = {
    month_price: '月付',
    quarter_price: '季付',
    half_year_price: '半年付',
    year_price: '年付',
    two_year_price: '两年付',
    three_year_price: '三年付',
    onetime_price: '一次性'
  };
  return periodMap[period] || period;
};

export const formatPaymentTraffic = (gb) => {
  if (!gb) return '-';
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
  return `${gb} GB`;
};

export const calculateHandlingFee = (method, totalAmount) => {
  if (!method || !totalAmount) return 0;
  let fee = 0;
  if (method.handling_fee_fixed) {
    fee += method.handling_fee_fixed;
  }
  if (method.handling_fee_percent) {
    fee += totalAmount * method.handling_fee_percent / 100;
  }
  return Math.round(fee);
};
