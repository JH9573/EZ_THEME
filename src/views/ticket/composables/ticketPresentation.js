export const createMarkdownRenderer = async () => {
  const { default: MarkdownIt } = await import('markdown-it');
  return new MarkdownIt({ linkify: true, breaks: true });
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// markdown-it 加载完成前的兜底渲染器：输出会进 v-html，必须转义原文
export const createFallbackRenderer = () => ({
  render: (content) => escapeHtml(content || '').replace(/\n/g, '<br>')
});

export const formatTicketTime = (timestamp) => {
  if (!timestamp) return '--';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

export const formatTicketTimeShort = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : `${date.getMonth() + 1}/${date.getDate()}`;
};

// 创建成功后要选中的工单：按创建时间取最新，时间相同再比 id，不依赖接口返回顺序
export const findNewestTicket = (tickets = []) =>
  tickets.reduce((newest, ticket) => {
    if (!newest) return ticket;

    const createdAt = Number(ticket.created_at) || 0;
    const newestCreatedAt = Number(newest.created_at) || 0;

    if (createdAt !== newestCreatedAt) {
      return createdAt > newestCreatedAt ? ticket : newest;
    }

    return (Number(ticket.id) || 0) > (Number(newest.id) || 0) ? ticket : newest;
  }, null);

export const shouldShowMessageSenderGroup = (messages, index, isAdmin) => {
  if (index === 0) return true;
  const prevMessage = messages[index - 1];
  return Boolean(prevMessage && prevMessage.is_admin !== isAdmin);
};
