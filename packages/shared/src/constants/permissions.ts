export const ROLES = {
  user: 'user',
  admin: 'admin',
  super_admin: 'super_admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // Bot management
  'bot:read': ['user', 'admin', 'super_admin'],
  'bot:write': ['user', 'admin', 'super_admin'],
  'bot:start': ['user', 'admin', 'super_admin'],
  'bot:stop': ['user', 'admin', 'super_admin'],

  // Moderation
  'moderation:read': ['user', 'admin', 'super_admin'],
  'moderation:write': ['user', 'admin', 'super_admin'],

  // AI / Personality
  'ai:read': ['user', 'admin', 'super_admin'],
  'ai:write': ['user', 'admin', 'super_admin'],

  // Scheduler
  'scheduler:read': ['user', 'admin', 'super_admin'],
  'scheduler:write': ['user', 'admin', 'super_admin'],

  // Billing
  'billing:read': ['user', 'admin', 'super_admin'],
  'billing:write': ['user', 'admin', 'super_admin'],

  // Admin
  'admin:read': ['admin', 'super_admin'],
  'admin:write': ['super_admin'],
  'admin:tenants': ['super_admin'],
  'admin:system': ['super_admin'],
  'admin:impersonate': ['super_admin'],
} as const;

export type Permission = keyof typeof PERMISSIONS;
