import {
  getUserInfo,
  getIpLocationInfo,
  getCommConfig,
  getUserSubscribe
} from '@/api/user';
import { formatUserInfoForTicket, formatDiagnosticInfo } from '@/utils/formatters';
import { TICKET_CONFIG } from '@/utils/baseConfig';

export const isDiagnosticEnabled = () => TICKET_CONFIG.diagnostic?.enabled !== false;

export const buildTicketMessage = async (newTicket, t, images = []) => {
  const diagnosticText = isDiagnosticEnabled()
    ? formatDiagnosticInfo(newTicket.diagnostic, {
        title: t('tickets.diagnostic.title'),
        os: t('tickets.diagnostic.os'),
        client: t('tickets.diagnostic.client'),
        region: t('tickets.diagnostic.region'),
        errorLog: t('tickets.diagnostic.errorLog')
      })
    : '';

  // 图片在界面上以缩略图管理，不出现在输入框里，提交时才拼进正文
  const imagesText = images.length
    ? `\n\n${images.map((url) => `![image](${url})`).join('\n')}`
    : '';

  const message = `${(newTicket.message || '').trim()}${imagesText}${diagnosticText}`;

  if (TICKET_CONFIG.includeUserInfoInTicket === false) {
    return message;
  }

  // 用户信息只是附加内容，这里任何一个接口失败都不应阻断工单提交
  try {
    const [
      userInfoResponse,
      commConfigResponse,
      subscribeResponse,
      ipLocationResponse
    ] = await Promise.all([
      getUserInfo(),
      getCommConfig().catch(() => null),
      getUserSubscribe().catch(() => null),
      getIpLocationInfo().catch(() => null)
    ]);

    if (
      userInfoResponse &&
      commConfigResponse &&
      commConfigResponse.data &&
      commConfigResponse.data.currency_symbol
    ) {
      userInfoResponse.currency_symbol = commConfigResponse.data.currency_symbol;
    }

    const userInfoText = formatUserInfoForTicket(
      userInfoResponse,
      ipLocationResponse,
      subscribeResponse
    );

    return `${message}\n\n${userInfoText}`;
  } catch (error) {
    console.warn('Failed to collect user info for ticket:', error);
    return message;
  }
};
