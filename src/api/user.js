

import axios from 'axios';

import request from './request';





export function getUserInfo() {

    return request({

        url: '/user/info',

        method: 'get'

    });

}





export function getIpLocationInfo() {

    // 第三方接口必须用裸 axios 请求：共享 request 实例的拦截器
    // 会附加面板的 Authorization 和自定义请求头，不能发给站外服务
    return axios.get('https://myip.ipip.net/json', { timeout: 10000 })

        .then(response => response.data);

}





export function redeemGiftCard(giftcard) {

    return request({

        url: '/user/redeemgiftcard',

        method: 'post',

        data: { giftcard }

    });

}





export function changePassword(data) {

    return request({

        url: '/user/changePassword',

        method: 'post',

        data

    });

}





export function resetSecurity() {

    return request({

        url: '/user/resetSecurity',

        method: 'get'

    });

}





export function updateRemindSettings(data) {

    return request({

        url: '/user/update',

        method: 'post',

        data

    });

}





export function getActiveSession() {

    return request({

        url: '/user/getActiveSession',

        method: 'get'

    });

}





export function getCommConfig() {

    return request({

        url: '/user/comm/config',

        method: 'get'

    });

}





export function getTelegramBotInfo() {

    return request({

        url: '/user/telegram/getBotInfo',

        method: 'get'

    });

}





export function getUserSubscribe() {

    return request({

        url: '/user/getSubscribe',

        method: 'get'

    });

}
