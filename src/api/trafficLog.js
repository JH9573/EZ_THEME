
import request from './request';


export function getTrafficLog() {
  return request({
    url: '/user/stat/getTrafficLog',
    method: 'get'
  });
} 
