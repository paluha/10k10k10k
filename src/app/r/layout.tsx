import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '10K Traffic — Масштабируем результаты рекламы x3',
  description: 'Мы приносим продажи, а не клики. Управление Meta рекламой для бизнесов, готовых к масштабированию.',
  openGraph: {
    title: '10K Traffic — Масштабируем результаты рекламы x3',
    description: 'Мы приносим продажи, а не клики. Управление Meta рекламой для бизнесов, готовых к масштабированию.',
    type: 'website',
  },
};

export default function RuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
