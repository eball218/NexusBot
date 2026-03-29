/**
 * Caps/emotes filter — detects excessive capitalization or emote usage.
 */

// Matches common emote patterns: Twitch-style (e.g., Kappa, PogChamp),
// Discord-style (e.g., <:name:id>), and Unicode emoji
const EMOTE_REGEX = /(<a?:\w+:\d+>)|(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

export function checkCapsEmotes(content: string): boolean {
  // Check for excessive caps (>80% of message, minimum 10 chars)
  if (content.length >= 10) {
    const alphaChars = content.replace(/[^a-zA-Z]/g, '');
    if (alphaChars.length > 0) {
      const upperCount = alphaChars.replace(/[^A-Z]/g, '').length;
      if (upperCount / alphaChars.length > 0.8) {
        return true;
      }
    }
  }

  // Check for excessive emotes (more than 10)
  const emoteMatches = content.match(EMOTE_REGEX);
  if (emoteMatches && emoteMatches.length > 10) {
    return true;
  }

  return false;
}
