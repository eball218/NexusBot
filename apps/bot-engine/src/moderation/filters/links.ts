/**
 * Link filter — detects URLs in messages, optionally filtering by pattern.
 */
const URL_REGEX = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

export function checkLinks(content: string, pattern: string | null): boolean {
  const urls = content.match(URL_REGEX);
  if (!urls || urls.length === 0) {
    return false;
  }

  // If no pattern provided, block all URLs
  if (!pattern) {
    return true;
  }

  // If pattern provided, only block URLs matching the pattern
  try {
    const regex = new RegExp(pattern, 'i');
    return urls.some((url) => regex.test(url));
  } catch {
    // Invalid regex pattern — fall back to blocking all URLs
    return true;
  }
}
