export default function ModerationAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <a href="/analytics" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Analytics</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Moderation Analytics</h1>
        <p className="mt-1 text-sm text-text-muted">Enforcement activity and rule performance</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actions Over Time */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Actions Over Time</h3>
          <p className="mt-1 text-xs text-text-muted">Moderation actions taken over the last 30 days</p>
          <div className="mt-4 flex h-56 items-center justify-center rounded-lg border border-dashed border-white/10">
            <p className="text-sm text-text-muted">Chart: Moderation actions over time (stacked bar chart)</p>
          </div>
        </div>

        {/* Rule Trigger Frequency */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Rule Trigger Frequency</h3>
          <p className="mt-1 text-xs text-text-muted">Which rules fire the most</p>
          <div className="mt-4 space-y-3">
            {[
              { rule: 'Spam Filter', triggers: 148, pct: 100 },
              { rule: 'Link Blocklist', triggers: 89, pct: 60 },
              { rule: 'Caps Lock Limit', triggers: 52, pct: 35 },
              { rule: 'Toxic Language', triggers: 34, pct: 23 },
              { rule: 'Emote Spam', triggers: 19, pct: 13 },
            ].map((rule) => (
              <div key={rule.rule}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{rule.rule}</span>
                  <span className="text-text-muted">{rule.triggers} triggers</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${rule.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Repeat Offenders */}
        <div className="rounded-xl border border-white/5 bg-background-elevated p-6">
          <h3 className="text-sm font-semibold text-text-primary">Repeat Offenders</h3>
          <p className="mt-1 text-xs text-text-muted">Users with the most infractions</p>
          <div className="mt-4 space-y-2">
            {[
              { name: 'toxic_user', infractions: 12, lastAction: 'Timeout 30m' },
              { name: 'spam_bot_99', infractions: 8, lastAction: 'Banned' },
              { name: 'edgelord420', infractions: 5, lastAction: 'Warning' },
              { name: 'caps_lover', infractions: 4, lastAction: 'Timeout 5m' },
              { name: 'link_dropper', infractions: 3, lastAction: 'Warning' },
            ].map((user) => (
              <div key={user.name} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                <div>
                  <span className="text-sm text-text-primary">{user.name}</span>
                  <span className="ml-2 text-[10px] text-text-muted">{user.infractions} infractions</span>
                </div>
                <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${
                  user.lastAction === 'Banned' ? 'bg-danger/10 text-danger' :
                  user.lastAction.startsWith('Timeout') ? 'bg-warning/10 text-warning' :
                  'bg-white/5 text-text-muted'
                }`}>{user.lastAction}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
