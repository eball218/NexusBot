/**
 * Custom word filter — checks content against a user-defined regex or word pattern.
 */
export function checkCustomWords(content: string, pattern: string | null): boolean {
  if (!pattern) {
    return false;
  }

  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(content);
  } catch {
    // Invalid regex pattern — skip
    return false;
  }
}
