'use client';

import { useState } from 'react';

const jobs = [
  { id: 1, name: 'Daily Stats Post', schedule: '0 9 * * *', humanSchedule: 'Every day at 9:00 AM', nextRun: '2026-03-29 09:00', lastStatus: 'success', platform: 'Discord', enabled: true },
  { id: 2, name: 'Weekly Recap', schedule: '0 12 * * 1', humanSchedule: 'Every Monday at 12:00 PM', nextRun: '2026-03-30 12:00', lastStatus: 'success', platform: 'Twitch', enabled: true },
  { id: 3, name: 'Hourly Chat Purge', schedule: '0 * * * *', humanSchedule: 'Every hour', nextRun: '2026-03-28 17:00', lastStatus: 'failed', platform: 'Discord', enabled: false },
  { id: 4, name: 'Stream Reminder', schedule: '0 18 * * 2,4,6', humanSchedule: 'Tue, Thu, Sat at 6:00 PM', nextRun: '2026-03-28 18:00', lastStatus: 'success', platform: 'Twitch', enabled: true },
  { id: 5, name: 'Follower Milestone Check', schedule: '*/30 * * * *', humanSchedule: 'Every 30 minutes', nextRun: '2026-03-28 16:30', lastStatus: 'success', platform: 'Discord', enabled: true },
  { id: 6, name: 'Nightly Backup Export', schedule: '0 3 * * *', humanSchedule: 'Every day at 3:00 AM', nextRun: '2026-03-29 03:00', lastStatus: 'success', platform: 'Discord', enabled: true },
];

export default function SchedulerPage() {
  const [jobList, setJobList] = useState(jobs);

  function toggleJob(id: number) {
    setJobList((prev) =>
      prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Scheduler</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your automated cron jobs</p>
        </div>
        <a
          href="/scheduler/create"
          className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Create Job
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobList.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-white/5 bg-background-elevated p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-text-primary">{job.name}</h3>
                <p className="mt-0.5 text-xs text-text-muted">{job.humanSchedule}</p>
              </div>
              <button
                onClick={() => toggleJob(job.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                  job.enabled ? 'bg-accent-primary' : 'bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ${
                    job.enabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  job.platform === 'Discord'
                    ? 'bg-[#5865F2]/10 text-[#5865F2]'
                    : 'bg-[#9146FF]/10 text-[#9146FF]'
                }`}
              >
                {job.platform}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  job.lastStatus === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${job.lastStatus === 'success' ? 'bg-success' : 'bg-danger'}`} />
                {job.lastStatus === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>

            <div className="border-t border-white/5 pt-3 text-xs text-text-muted">
              <p>Next run: <span className="text-text-secondary">{job.nextRun}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <a href="/scheduler/logs" className="text-sm text-accent-primary hover:underline">
          View execution logs
        </a>
      </div>
    </div>
  );
}
