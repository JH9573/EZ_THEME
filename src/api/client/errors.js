const statusMessages = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求的资源不存在'
};

export const normalizeRequestError = (error) => {
  if (error.response?.data?.message) {
    error.response.message = error.response.data.message;
    return error;
  }

  if (error.response) {
    const statusCode = error.response.status;
    error.response.message = statusMessages[statusCode] || `请求失败 (${statusCode})`;
    return error;
  }

  if (error.message?.includes('timeout')) {
    error.message = '请求超时';
  } else if (error.message?.includes('Network Error')) {
    error.message = '网络错误，请检查您的网络连接';
  }

  return error;
};
