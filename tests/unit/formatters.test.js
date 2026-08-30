import { describe, it, expect } from 'vitest';
import {
  formatUserInfoForTicket,
  formatDiagnosticInfo
} from '@/utils/formatters';

describe('formatUserInfoForTicket', () => {
  const userInfo = {
    data: {
      created_at: 1700000000,
      plan_id: 3,
      expired_at: 1800000000,
      transfer_enable: 100 * 1024 ** 3,
      u: 10 * 1024 ** 3,
      d: 20 * 1024 ** 3,
      balance: 1234
    }
  };

  it('ipInfo 为 null（IP 接口失败降级）时不应抛错', () => {
    expect(() => formatUserInfoForTicket(userInfo, null, null)).not.toThrow();

    const text = formatUserInfoForTicket(userInfo, null, null);
    expect(text).toContain('创建工单时的IP：--');
    expect(text).toContain('创建工单的位置：--');
  });

  it('解析 myip.ipip.net 返回的 IP 与位置信息', () => {
    const ipInfo = {
      data: {
        ip: '1.2.3.4',
        location: ['中国', '广东', '深圳', '', '电信']
      }
    };

    const text = formatUserInfoForTicket(userInfo, ipInfo, null);
    expect(text).toContain('创建工单时的IP：1.2.3.4');
    expect(text).toContain('中国 广东 深圳 电信');
  });

  it('无订阅信息时流量数据回退到用户信息', () => {
    const text = formatUserInfoForTicket(userInfo, null, null);
    // transfer_enable 100GB - 已用 30GB = 剩余 70GB
    expect(text).toContain('剩余流量：70 GB');
    expect(text).toContain('已使用流量：30 GB');
  });

  it('有订阅信息时优先使用订阅数据', () => {
    const subscribe = {
      data: {
        plan: { name: '高级套餐' },
        transfer_enable: 50 * 1024 ** 3,
        u: 0,
        d: 10 * 1024 ** 3,
        expired_at: 1800000000
      }
    };

    const text = formatUserInfoForTicket(userInfo, null, subscribe);
    expect(text).toContain('套餐名称：高级套餐');
    expect(text).toContain('剩余流量：40 GB');
  });

  it('userInfo 为 null 时不应抛错', () => {
    expect(() => formatUserInfoForTicket(null, null, null)).not.toThrow();
  });
});

describe('formatDiagnosticInfo', () => {
  it('全部为空时返回空字符串', () => {
    expect(formatDiagnosticInfo(null)).toBe('');
    expect(
      formatDiagnosticInfo({ os: '', client: '', region: '', errorLog: '' })
    ).toBe('');
    expect(formatDiagnosticInfo({ os: '   ' })).toBe('');
  });

  it('输出已填写的诊断字段', () => {
    const text = formatDiagnosticInfo(
      { os: 'Windows', client: 'Clash Verge', region: '', errorLog: 'boom' },
      { title: '诊断信息', os: '操作系统', client: '使用客户端', errorLog: '错误提示或日志' }
    );

    expect(text).toContain('诊断信息');
    expect(text).toContain('操作系统：Windows');
    expect(text).toContain('使用客户端：Clash Verge');
    expect(text).toContain('错误提示或日志：\nboom');
    expect(text).not.toContain('所在地区');
  });
});
