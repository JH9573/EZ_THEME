export const createMarkdownRenderer = async () => {
  const { default: MarkdownIt } = await import('markdown-it');
  return new MarkdownIt({ linkify: true, breaks: true });
};

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

export const shouldShowMessageSenderGroup = (messages, index, isAdmin) => {
  if (index === 0) return true;
  const prevMessage = messages[index - 1];
  return Boolean(prevMessage && prevMessage.is_admin !== isAdmin);
};
