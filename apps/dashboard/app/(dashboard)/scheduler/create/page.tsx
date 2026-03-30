'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const presets = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Daily at 9 AM', value: '0 9 * * *' },
  { label: 'Daily at 6 PM', value: '0 18 * * *' },
  { label: 'Every Monday', value: '0 9 * * 1' },
  { label: 'Weekdays at 9 AM', value: '0 9 * * 1-5' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'First of month', value: '0 0 1 * *' },
];

export default function SchedulerCreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('');
  const [platform, setPlatform] = useState('discord');
  const [actionType, setActionType] = useState('send_message');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim() || !schedule.trim()) {
      setError('Job name and schedule are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authApi('/scheduler/jobs', {
        method: 'POST',
        body: { name, schedule, platform, actionType, message, channel },
      });
      router.push('/scheduler');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <a href="/scheduler" className="text-sm text-text-muted hover:text-text-secondary">&larr; Back to Scheduler</a>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">Create Job</h1>
        <p className="mt-1 text-sm text-text-muted">Set up a new automated cron job</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-background-elevated p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Job Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daily Stats Post"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        {/* Schedule */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Schedule</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSchedule(preset.value)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  schedule === preset.value
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-white/10 text-text-muted hover:border-white/20 hover:text-text-secondary'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="Or enter custom cron: */5 * * * *"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none font-mono"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="discord">Discord</option>
            <option value="twitch">Twitch</option>
          </select>
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Action Type</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="send_message">Send Message</option>
            <option value="post_announcement">Post Announcement</option>
            <option value="update_title">Update Stream Title</option>
            <option value="run_command">Run Command</option>
            <option value="clear_chat">Clear Chat</option>
          </select>
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Message Content</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Enter the message or content for this action..."
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none resize-none"
          />
        </div>

        {/* Target Channel */}
        <div>
          <label className="block text-sm font-medium text-text-secondary">Target Channel</label>
          <input
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="e.g. #general or #announcements"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Job'}
          </button>
          <a href="/scheduler" className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-text-secondary hover:bg-white/5">
            Cancel
          </a>
        </div>
      </div>
    </div>
  );
}
