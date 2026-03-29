import pino from 'pino';
import { checkSpam } from './filters/spam';
import { checkLinks } from './filters/links';
import { checkToxicity } from './filters/toxicity';
import { checkCapsEmotes } from './filters/caps-emotes';
import { checkCustomWords } from './filters/custom-words';

interface ModRule {
  id: string;
  ruleType: string;
  action: string;
  severity: number;
  enabled: boolean;
  pattern: string | null;
  sortOrder: number;
}

interface EvaluateMessage {
  content: string;
  authorId: string;
  platform: string;
}

interface EvaluateResult {
  triggered: boolean;
  rule?: { id: string; ruleType: string; action: string; severity: number };
  reason?: string;
}

export class ModerationEngine {
  private readonly rules: ModRule[];
  private readonly logger: pino.Logger;

  constructor(rules: ModRule[]) {
    this.rules = rules;
    this.logger = pino({ name: 'moderation-engine' });
  }

  async evaluate(message: EvaluateMessage): Promise<EvaluateResult> {
    const enabledRules = this.rules
      .filter((r) => r.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    for (const rule of enabledRules) {
      let triggered = false;
      let reason = '';

      switch (rule.ruleType) {
        case 'spam': {
          triggered = checkSpam(message.content, rule.pattern);
          reason = 'Message flagged as spam';
          break;
        }
        case 'links': {
          triggered = checkLinks(message.content, rule.pattern);
          reason = 'Message contains blocked link';
          break;
        }
        case 'toxicity': {
          const result = await checkToxicity(message.content);
          triggered = result.toxic;
          reason = `Message flagged as toxic (score: ${result.score})`;
          break;
        }
        case 'caps_emotes': {
          triggered = checkCapsEmotes(message.content);
          reason = 'Message has excessive caps or emotes';
          break;
        }
        case 'custom_words': {
          triggered = checkCustomWords(message.content, rule.pattern);
          reason = 'Message matched custom word filter';
          break;
        }
        default: {
          this.logger.warn({ ruleType: rule.ruleType }, 'Unknown rule type');
          continue;
        }
      }

      if (triggered) {
        this.logger.info(
          { ruleId: rule.id, ruleType: rule.ruleType, authorId: message.authorId },
          reason
        );
        return {
          triggered: true,
          rule: {
            id: rule.id,
            ruleType: rule.ruleType,
            action: rule.action,
            severity: rule.severity,
          },
          reason,
        };
      }
    }

    return { triggered: false };
  }
}
