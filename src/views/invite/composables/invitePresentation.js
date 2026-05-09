export const buildInviteLink = ({ codes, selectedIndex, config, origin }) => {
  if (!codes?.length) return '';

  const code = codes[selectedIndex]?.code;
  if (!code) return '';

  if (config.inviteLinkConfig?.linkMode === 'custom') {
    const customDomain = config.inviteLinkConfig.customDomain || '';
    const domain = customDomain.endsWith('/') ? customDomain.slice(0, -1) : customDomain;
    return `${domain}/#/register?code=${code}`;
  }

  return `${origin}/#/register?code=${code}`;
};

export const formatInviteDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const formatInviteCodeDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const buildDisplayPageNumbers = ({ currentPage, totalPages, isMobile }) => {
  const pages = [];
  const maxVisiblePages = isMobile ? 1 : 3;
  let startPage = Math.max(1, currentPage - maxVisiblePages);
  let endPage = Math.min(totalPages, currentPage + maxVisiblePages);

  if (currentPage <= maxVisiblePages) {
    endPage = Math.min(totalPages, maxVisiblePages * 2 + 1);
  }

  if (currentPage + maxVisiblePages >= totalPages) {
    startPage = Math.max(1, totalPages - maxVisiblePages * 2);
  }

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  return pages;
};
