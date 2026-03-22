import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '10K Traffic — Scale Your Ad Results x3',
  description: 'We bring sales, not clicks. Meta ads management for businesses ready to scale.',
  openGraph: {
    title: '10K Traffic — Scale Your Ad Results x3',
    description: 'We bring sales, not clicks. Meta ads management for businesses ready to scale.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
