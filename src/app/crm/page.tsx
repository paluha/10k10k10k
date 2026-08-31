import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Board } from './Board';
import type { LeadDTO, QA } from './types';

export const dynamic = 'force-dynamic';

export default async function CrmPage() {
  if (!(await isAuthed())) redirect('/login');
  if (!prisma) {
    return <div className="dim">База не подключена: задай DATABASE_URL в переменных окружения.</div>;
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 });
  const dto: LeadDTO[] = leads.map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    telegram: l.telegram,
    lang: l.lang,
    niche: l.niche,
    source: l.source,
    utm: (l.utm as Record<string, string> | null) ?? null,
    answers: (l.answers as QA[] | null) ?? null,
    status: l.status,
    note: l.note,
    weeklyFee: l.weeklyFee,
    soldAt: l.soldAt?.toISOString() ?? null,
    churnedAt: l.churnedAt?.toISOString() ?? null,
    createdAt: l.createdAt.toISOString(),
  }));

  return <Board initialLeads={dto} />;
}
