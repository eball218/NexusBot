export interface BotInstance {
  id: string;
  tenantId: string;
  platform: 'twitch' | 'discord';
  status: 'running' | 'stopped' | 'starting' | 'error' | 'suspended';
  processId: string | null;
  startedAt: Date | null;
  stoppedAt: Date | null;
  lastHeartbeatAt: Date | null;
  lastError: string | null;
  errorCount: number;
  restartCount: number;
}

export interface PlatformConnection {
  id: string;
  tenantId: string;
  platform: 'twitch' | 'discord';
  platformUserId: string;
  platformUsername: string | null;
  isActive: boolean;
  connectedAt: Date;
}

export interface PersonalityConfig {
  name: string;
  identity: string;
  traits: string[];
  communicationStyle: {
    tone: string;
    humor: string;
    formality: string;
    verbosity: string;
  };
  lore: string[];
  catchphrases: string[];
  moodModifiers: {
    trigger: string;
    response: string;
  }[];
}
