export default function SystemHealthPage() {
  const services = [
    { name: 'PostgreSQL', status: 'Healthy', responseTime: '3ms', uptime: '99.98%' },
    { name: 'Redis', status: 'Healthy', responseTime: '1ms', uptime: '99.99%' },
    { name: 'Bot Engine', status: 'Healthy', responseTime: '12ms', uptime: '99.95%' },
    { name: 'API', status: 'Healthy', responseTime: '8ms', uptime: '99.97%' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Health</h1>
        <p className="mt-1 text-sm text-text-secondary">Infrastructure status and performance monitoring.</p>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((svc) => (
          <div key={svc.name} className="rounded-lg border border-white/5 bg-background-elevated p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-text-primary">{svc.name}</h3>
              <span className="flex items-center gap-1.5 text-sm text-success">
                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                {svc.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-text-muted">Response Time</p>
                <p className="text-sm font-medium text-text-primary">{svc.responseTime}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Uptime</p>
                <p className="text-sm font-medium text-success">{svc.uptime}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-background-elevated">
          <div className="text-center">
            <div className="text-3xl text-text-muted">&#9776;</div>
            <p className="mt-2 text-sm text-text-muted">Error Rate (24h)</p>
            <p className="text-xs text-text-muted">Chart placeholder</p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-background-elevated">
          <div className="text-center">
            <div className="text-3xl text-text-muted">&#9776;</div>
            <p className="mt-2 text-sm text-text-muted">Resource Usage</p>
            <p className="text-xs text-text-muted">Chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
