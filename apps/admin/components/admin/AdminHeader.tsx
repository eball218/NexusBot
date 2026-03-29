'use client';

import { useState } from 'react';

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-background-secondary px-6">
      {/* Left: Label */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-text-primary">Admin Panel</span>
      </div>

      {/* Center: Search */}
      <div className="mx-4 flex max-w-md flex-1 items-center">
        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search tenants, users, bots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-white/5 bg-background py-1.5 pl-9 pr-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/30"
          />
        </div>
      </div>

      {/* Right: Health + User */}
      <div className="flex items-center gap-5">
        {/* System Health Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-xs text-text-secondary">All Systems Operational</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary/20 text-xs font-bold text-accent-primary">
            SA
          </div>
          <span className="text-sm font-medium text-text-primary">Super Admin</span>
        </div>
      </div>
    </header>
  );
}
