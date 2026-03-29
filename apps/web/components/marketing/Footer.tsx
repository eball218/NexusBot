import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Documentation', href: '/docs' },
  ],
  Resources: [
    { label: 'Blog', href: '/blog' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'Status Page', href: '#' },
    { label: 'Support', href: '#' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="text-lg font-bold text-text-primary">NexusBot</span>
            </div>
            <p className="mt-3 text-sm text-text-muted">
              AI-powered moderation and engagement for Twitch and Discord.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} NexusBot. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Built with care and Claude
          </p>
        </div>
      </div>
    </footer>
  );
}
