import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary">
          <span className="text-lg font-bold text-white">N</span>
        </div>
        <span className="text-xl font-bold text-text-primary">NexusBot</span>
      </Link>
      {children}
    </div>
  );
}
