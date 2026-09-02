import { describe, it, expect } from 'vitest';
import {
  createFallbackRenderer,
  findNewestTicket
} from '@/views/ticket/composables/ticketPresentation';

describe('createFallbackRenderer', () => {
  it('转义 HTML，避免 markdown-it 就绪前原文进入 v-html', () => {
    const html = createFallbackRenderer().render(
      '<img src=x onerror="alert(1)">\n第二行'
    );

    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    expect(html).toContain('<br>第二行');
  });

  it('空内容返回空字符串', () => {
    expect(createFallbackRenderer().render('')).toBe('');
    expect(createFallbackRenderer().render(null)).toBe('');
  });
});

describe('findNewestTicket', () => {
  it('按 created_at 取最新，不依赖数组顺序', () => {
    const tickets = [
      { id: 1, created_at: 100 },
      { id: 3, created_at: 300 },
      { id: 2, created_at: 200 }
    ];

    expect(findNewestTicket(tickets).id).toBe(3);
  });

  it('created_at 相同时取 id 最大的', () => {
    const tickets = [
      { id: 7, created_at: 100 },
      { id: 9, created_at: 100 },
      { id: 8, created_at: 100 }
    ];

    expect(findNewestTicket(tickets).id).toBe(9);
  });

  it('空列表返回 null', () => {
    expect(findNewestTicket([])).toBeNull();
    expect(findNewestTicket()).toBeNull();
  });
});
