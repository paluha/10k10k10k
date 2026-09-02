import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClientsTable } from './ClientsTable';
import type { ClientDTO } from '../types';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  if (!(await isAuthed())) redirect('/login');
  if (!prisma) {
    return <div className="dim">База не подключена: задай DATABASE_URL в переменных окружения.</div>;
  }

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      lead: {
        select: {
          phone: true,
          telegram: true,
          payments: { select: { amount: true, paidAt: true }, orderBy: { paidAt: 'desc' } },
        },
      },
    },
  });

  const dto: ClientDTO[] = clients.map((c) => ({
    id: c.id,
    leadId: c.leadId,
    project: c.project,
    teamlead: c.teamlead,
    targetolog: c.targetolog,
    planAmount: c.planAmount,
    service: c.service,
    launchAt: c.launchAt?.toISOString() ?? null,
    nextPayAt: c.nextPayAt?.toISOString() ?? null,
    payFormat: c.payFormat,
    payMethod: c.payMethod,
    status: c.status,
    factAmount: c.lead.payments.reduce((s, p) => s + p.amount, 0),
    lastPayAt: c.lead.payments[0]?.paidAt.toISOString() ?? null,
    phone: c.lead.phone,
    telegram: c.lead.telegram,
  }));

  return <ClientsTable initialClients={dto} />;
}
