export interface ModRule {
  id: string;
  tenantId: string;
  ruleType: string;
  pattern: string | null;
  severity: number;
  action: string;
  platforms: string;
  enabled: boolean;
  sortOrder: number;
}

export interface ModAction {
  id: string;
  tenantId: string;
  communityUserId: string;
  platform: string;
  actionType: string;
  reason: string | null;
  durationSeconds: number | null;
  performedBy: string;
  performedAt: Date;
  expiresAt: Date | null;
  active: boolean;
  originalMessage: string | null;
}

export interface ModAppeal {
  id: string;
  tenantId: string;
  modActionId: string;
  communityUserId: string;
  appealMessage: string;
  status: 'pending' | 'approved' | 'denied';
  resolvedBy: string | null;
  resolvedAt: Date | null;
  resolutionNote: string | null;
  createdAt: Date;
}

export interface CommunityUser {
  id: string;
  tenantId: string;
  discordId: string | null;
  twitchId: string | null;
  twitchUsername: string | null;
  discordUsername: string | null;
  isBanned: boolean;
}
