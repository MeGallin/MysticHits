/**
 * Format a date string into a relative time format (e.g., "2 days ago")
 * or a standard formatted date if the date is older than a month
 */
export function formatDateRelative(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    // Less than a day, show hours
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
      // Less than an hour, show minutes
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      if (diffMinutes < 1) {
        return 'just now';
      }
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 30) {
    // Less than a month, show days
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    // More than a month, show formatted date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
