export class PersonalityManager {
  private config: Record<string, unknown>;

  constructor(config: Record<string, unknown>) {
    this.config = config;
  }

  getSystemPrompt(): string {
    const parts: string[] = [];

    const name = this.getName();
    if (name) {
      parts.push(`You are ${name}.`);
    }

    const identity = this.config.identity;
    if (typeof identity === 'string' && identity) {
      parts.push(identity);
    }

    const traits = this.config.traits;
    if (Array.isArray(traits) && traits.length > 0) {
      parts.push(`Your key personality traits are: ${traits.join(', ')}.`);
    }

    const communicationStyle = this.config.communicationStyle;
    if (typeof communicationStyle === 'string' && communicationStyle) {
      parts.push(`Communication style: ${communicationStyle}`);
    }

    const tone = this.config.tone;
    if (typeof tone === 'string' && tone) {
      parts.push(`Tone: ${tone}`);
    }

    const lore = this.config.lore;
    if (Array.isArray(lore) && lore.length > 0) {
      parts.push(`Background lore:\n${lore.map((item) => `- ${item}`).join('\n')}`);
    }

    const catchphrases = this.config.catchphrases;
    if (Array.isArray(catchphrases) && catchphrases.length > 0) {
      parts.push(
        `You sometimes use these catchphrases: ${catchphrases.map((c) => `"${c}"`).join(', ')}.`
      );
    }

    return parts.join('\n\n');
  }

  getName(): string {
    const name = this.config.name;
    return typeof name === 'string' ? name : '';
  }

  updateConfig(newConfig: Record<string, unknown>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
