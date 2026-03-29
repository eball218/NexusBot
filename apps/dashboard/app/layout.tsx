import type { Metadata } from 'next';
import './globals.css';
import { TokenHandler } from './TokenHandler';

export const metadata: Metadata = {
  title: 'Dashboard — NexusBot',
  description: 'Manage your NexusBot instance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans">
        <TokenHandler />
        {children}
      </body>
    </html>
  );
}
