export function formatRelativeTime(date: Date): string {
  const then = new Date(date).getTime();
  const diffMs = Date.now() - then;
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  }

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) {
    return `${diffWeek} week${diffWeek === 1 ? "" : "s"} ago`;
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
  }

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}
