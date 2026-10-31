/**
 * Formats a number as USD currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Compact countdown calculation using native Date math
 */
export const formatCountdown = (isoTime?: string): string => {
  if (!isoTime) return '—';

  const targetTime = new Date(isoTime).getTime();
  const now = Date.now();
  const diffMs = targetTime - now;

  if (isNaN(targetTime) || diffMs <= 0) {
    return 'Ended';
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
};
