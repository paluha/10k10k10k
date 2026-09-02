import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AnalyticsView } from './AnalyticsView';
import type { SpendDTO } from '../types';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  if (!(await isAuthed())) redirect('/login');
  if (!prisma) {
    return <div className="dim">База не подключена: задай DATABASE_URL в переменных окружения.</div>;
  }

  const [leads, spends, payments] = await Promise.all([
    prisma.lead.findMany({
      select: {
        id: true,
        niche: true,
        weeklyFee: true,
        soldAt: true,
        churnedAt: true,
        createdAt: true,
      },
    }),
    prisma.adSpend.findMany(),
    prisma.payment.findMany({ select: { amount: true, paidAt: true, lead: { select: { niche: true } } } }),
  ]);

  const leadsDto = leads.map((l) => ({
    id: l.id,
    niche: l.niche,
    weeklyFee: l.weeklyFee,
    soldAt: l.soldAt?.toISOString() ?? null,
    churnedAt: l.churnedAt?.toISOString() ?? null,
    createdAt: l.createdAt.toISOString(),
  }));
  const spendsDto: SpendDTO[] = spends.map((s) => ({
    niche: s.niche,
    weekStart: s.weekStart.toISOString(),
    amount: s.amount,
  }));
  const paymentsDto = payments.map((p) => ({
    amount: p.amount,
    paidAt: p.paidAt.toISOString(),
    niche: p.lead.niche,
  }));

  return <AnalyticsView leads={leadsDto} initialSpends={spendsDto} payments={paymentsDto} />;
}
