import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '10K Traffic — Масштабуємо результати реклами x3',
  description: 'Ми приносимо продажі, а не кліки. Управління Meta рекламою для бізнесів, готових до масштабування.',
  openGraph: {
    title: '10K Traffic — Масштабуємо результати реклами x3',
    description: 'Ми приносимо продажі, а не кліки. Управління Meta рекламою для бізнесів, готових до масштабування.',
    type: 'website',
  },
};

export default function RuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
