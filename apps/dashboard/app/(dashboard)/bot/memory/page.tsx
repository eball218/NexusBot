'use client';

export default function MemoryBrowserPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Memory Browser</h1>

      <div className="rounded-xl border border-white/5 bg-background-elevated p-12 text-center">
        <div className="mx-auto max-w-md space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-primary/10">
            <svg className="h-7 w-7 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">No memories yet</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Memories are automatically created as your bot interacts with community members.
            As the AI engine converses with users, it will remember facts, preferences, and
            context to provide more personalized responses over time.
          </p>
          <p className="text-xs text-text-muted">
            Start a conversation with your bot to see memories appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
