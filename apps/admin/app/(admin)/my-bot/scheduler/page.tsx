'use client';

import { useState } from 'react';

const initialJobs = [
  { id: 1, name: 'Daily Greeting', schedule: '0 9 * * *', description: 'Post good morning message in #general.', status: 'active', nextRun: '2026-03-29 09:00 UTC' },
  { id: 2, name: 'Weekly Recap', schedule: '0 18 * * 5', description: 'Summarize weekly stats and post in #announcements.', status: 'active', nextRun: '2026-04-03 18:00 UTC' },
  { id: 3, name: 'Stream Reminder', schedule: '0 19 * * 2,4', description: 'Remind community about upcoming streams.', status: 'paused', nextRun: '--' },
  { id: 4, name: 'Cleanup Old Threads', schedule: '0 3 * * 0', description: 'Archive threads older than 30 days.', status: 'active', nextRun: '2026-03-29 03:00 UTC' },
  { id: 5, name: 'Health Check Ping', schedule: '*/15 * * * *', description: 'Ping health endpoint every 15 minutes.', status: 'active', nextRun: '2026-03-28 12:15 UTC' },
];

export default function SchedulerPage() {
  const [jobs, setJobs] = useState(initialJobs);

  const toggleJob = (id: number) => {
    setJobs(
      jobs.map((j) =>
        j.id === id ? { ...j, status: j.status === 'active' ? 'paused' : 'active' } : j
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Scheduler</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage cron jobs for your bot.</p>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="flex items-start justify-between rounded-lg border border-white/5 bg-background-elevated p-5"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-text-primary">{job.name}</h3>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    job.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-text-secondary">{job.description}</p>
              <div className="mt-2 flex gap-4 text-xs text-text-muted">
                <span>
                  Schedule: <span className="font-mono text-text-secondary">{job.schedule}</span>
                </span>
                <span>
                  Next run: <span className="text-text-secondary">{job.nextRun}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleJob(job.id)}
              className={`relative ml-4 h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                job.status === 'active' ? 'bg-success' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  job.status === 'active' ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
