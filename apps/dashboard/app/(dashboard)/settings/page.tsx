export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-muted">Manage your account and preferences</p>
      </div>

      {/* Setting Links */}
      <div className="space-y-3">
        {[
          {
            label: 'Profile',
            description: 'Update your display name, timezone, and avatar',
            href: '/settings/profile',
          },
          {
            label: 'Notifications',
            description: 'Configure alert and digest preferences',
            href: '/settings/notifications',
          },
          {
            label: 'API Keys',
            description: 'Manage API keys for external integrations',
            href: '/settings/api-keys',
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-background-elevated p-5 hover:border-white/10 transition-colors"
          >
            <div>
              <h3 className="text-sm font-semibold text-text-primary">{item.label}</h3>
              <p className="mt-0.5 text-xs text-text-muted">{item.description}</p>
            </div>
            <span className="text-text-muted">&rarr;</span>
          </a>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-danger/20 bg-background-elevated p-6">
        <h2 className="text-sm font-semibold text-danger">Danger Zone</h2>
        <p className="mt-1 text-xs text-text-muted">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button className="mt-4 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10">
          Delete Account
        </button>
      </div>
    </div>
  );
}
