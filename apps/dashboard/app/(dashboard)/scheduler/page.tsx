'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

type Job = {
  id: string;
  name: string;
  schedule: string;
  humanSchedule: string;
  nextRun: string;
  lastStatus: string;
  platform: string;
  enabled: boolean;
};

export default function SchedulerPage() {
  const [jobList, setJobList] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await authApi<Job[]>('/scheduler/jobs');
      setJobList(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  async function toggleJob(id: string) {
    try {
      await authApi(`/scheduler/jobs/${id}/toggle`, { method: 'PATCH' });
      setJobList((prev) =>
        prev.map((j) => (j.id === id ? { ...j, enabled: !j.enabled } : j))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle job');
    }
  }

  async function deleteJob(id: string) {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await authApi(`/scheduler/jobs/${id}`, { method: 'DELETE' });
      setJobList((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
      </div>
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

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {jobList.length === 0 && !error ? (
        <div className="rounded-xl border border-white/5 bg-background-elevated p-12 text-center">
          <p className="text-sm text-text-muted">No scheduled jobs yet. Create one to get started.</p>
        </div>
      ) : (
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

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="text-xs text-text-muted">
                  <p>Next run: <span className="text-text-secondary">{job.nextRun}</span></p>
                </div>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="rounded px-2 py-1 text-xs text-danger hover:bg-danger/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <a href="/scheduler/logs" className="text-sm text-accent-primary hover:underline">
          View execution logs
        </a>
      </div>
    </div>
  );
}
