import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  getUserInfo: vi.fn(),
  getIpLocationInfo: vi.fn(),
  getCommConfig: vi.fn(),
  getUserSubscribe: vi.fn()
}));

const configMock = vi.hoisted(() => ({
  TICKET_CONFIG: {
    includeUserInfoInTicket: true,
    diagnostic: { enabled: true }
  }
}));

vi.mock('@/api/user', () => apiMocks);
vi.mock('@/utils/baseConfig', () => configMock);

import { buildTicketMessage } from '@/views/ticket/composables/ticketMessage';

const t = (key) => key;

const baseTicket = () => ({
  subject: '连不上',
  message: '  节点全部超时  ',
  level: '1',
  diagnostic: { os: '', client: '', region: '', errorLog: '' }
});

beforeEach(() => {
  configMock.TICKET_CONFIG.includeUserInfoInTicket = true;
  configMock.TICKET_CONFIG.diagnostic = { enabled: true };

  apiMocks.getUserInfo.mockReset().mockResolvedValue({
    data: { created_at: 1700000000, balance: 0 }
  });
  apiMocks.getCommConfig.mockReset().mockResolvedValue({
    data: { currency_symbol: '$' }
  });
  apiMocks.getUserSubscribe.mockReset().mockResolvedValue({
    data: { plan: { name: '标准套餐' }, transfer_enable: 0, u: 0, d: 0 }
  });
  apiMocks.getIpLocationInfo.mockReset().mockResolvedValue({
    data: { ip: '1.2.3.4', location: ['中国', '上海'] }
  });
});

describe('buildTicketMessage', () => {
  it('正常情况下拼接正文与用户信息', async () => {
    const result = await buildTicketMessage(baseTicket(), t);

    expect(result).toContain('节点全部超时');
    expect(result).toContain('用户信息');
    expect(result).toContain('1.2.3.4');
    expect(result.startsWith('节点全部超时')).toBe(true);
  });

  it('includeUserInfoInTicket 为 false 时不请求接口也不附加用户信息', async () => {
    configMock.TICKET_CONFIG.includeUserInfoInTicket = false;

    const result = await buildTicketMessage(baseTicket(), t);

    expect(result).toBe('节点全部超时');
    expect(apiMocks.getUserInfo).not.toHaveBeenCalled();
    expect(apiMocks.getIpLocationInfo).not.toHaveBeenCalled();
  });

  it('IP 定位接口失败时仍能生成用户信息', async () => {
    apiMocks.getIpLocationInfo.mockRejectedValue(new Error('blocked'));

    const result = await buildTicketMessage(baseTicket(), t);

    expect(result).toContain('用户信息');
    expect(result).toContain('创建工单时的IP：--');
  });

  it('用户信息接口失败时降级为纯正文而不抛错', async () => {
    apiMocks.getUserInfo.mockRejectedValue(new Error('timeout'));

    const result = await buildTicketMessage(baseTicket(), t);

    expect(result).toBe('节点全部超时');
  });

  it('附加已填写的诊断信息', async () => {
    configMock.TICKET_CONFIG.includeUserInfoInTicket = false;

    const ticket = baseTicket();
    ticket.diagnostic.os = 'Windows';
    ticket.diagnostic.errorLog = 'connection refused';

    const result = await buildTicketMessage(ticket, t);

    expect(result).toContain('tickets.diagnostic.title');
    expect(result).toContain('Windows');
    expect(result).toContain('connection refused');
  });

  it('诊断功能关闭时忽略诊断字段', async () => {
    configMock.TICKET_CONFIG.includeUserInfoInTicket = false;
    configMock.TICKET_CONFIG.diagnostic = { enabled: false };

    const ticket = baseTicket();
    ticket.diagnostic.os = 'Windows';

    const result = await buildTicketMessage(ticket, t);

    expect(result).toBe('节点全部超时');
  });
});
