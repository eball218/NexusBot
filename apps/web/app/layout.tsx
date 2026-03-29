import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'NexusBot — AI-Powered Moderation & Engagement for Twitch & Discord',
  description:
    'The AI moderation and chatbot platform that learns your community. Protect your space, engage your audience, and never sleep. Free 14-day trial.',
  keywords: ['twitch bot', 'discord bot', 'ai moderation', 'stream moderation', 'chatbot'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
