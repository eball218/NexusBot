/**
 * Spam filter — checks for repeated characters, excessive caps, and custom patterns.
 */
export function checkSpam(content: string, pattern: string | null): boolean {
  // Check for repeated characters (5+ in a row)
  if (/(.)\1{4,}/.test(content)) {
    return true;
  }

  // Check for all caps (>70% of message when over 10 chars)
  if (content.length > 10) {
    const alphaChars = content.replace(/[^a-zA-Z]/g, '');
    if (alphaChars.length > 0) {
      const upperCount = alphaChars.replace(/[^A-Z]/g, '').length;
      if (upperCount / alphaChars.length > 0.7) {
        return true;
      }
    }
  }

  // Check custom regex pattern if provided
  if (pattern) {
    try {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(content)) {
        return true;
      }
    } catch {
      // Invalid regex pattern — skip
    }
  }

  return false;
}
