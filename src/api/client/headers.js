export const applyCustomHeaders = (headers, customHeadersConfig) => {
  if (!customHeadersConfig?.enabled || !customHeadersConfig.headers) {
    return headers;
  }

  Object.entries(customHeadersConfig.headers).forEach(([headerName, headerValue]) => {
    headers[headerName] = headerValue;
  });

  return headers;
};
