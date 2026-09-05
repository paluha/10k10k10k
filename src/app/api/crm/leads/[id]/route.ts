import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/auth';

const STATUSES = ['NEW', 'CALL1', 'OFFER', 'DECISION', 'INVOICE', 'BOOKED', 'CLIENT', 'BASE'] as const;
type Status = (typeof STATUSES)[number];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  let becameClient = false;

  if (typeof body.status === 'string' && STATUSES.includes(body.status as Status)) {
    data.status = body.status;
    // первый перевод в CLIENT фиксирует дату начала оплаты
    if (body.status === 'CLIENT') {
      becameClient = true;
      const lead = await prisma.lead.findUnique({ where: { id }, select: { soldAt: true } });
      if (lead && !lead.soldAt) data.soldAt = new Date();
      data.churnedAt = null; // вернули в клиенты = снова платит
    }
  }
  if (typeof body.note === 'string') data.note = body.note;
  if (typeof body.niche === 'string' && body.niche.trim()) data.niche = body.niche.trim();
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if (typeof body.phone === 'string') data.phone = body.phone.trim() || null;
  if (typeof body.telegram === 'string') data.telegram = body.telegram.trim() || null;
  if (Array.isArray(body.answers)) {
    data.answers = body.answers
      .filter(
        (a: unknown): a is { question: string; answer: string } =>
          !!a && typeof (a as { question?: unknown }).question === 'string' && typeof (a as { answer?: unknown }).answer === 'string',
      )
      .map((a: { question: string; answer: string }) => ({ question: a.question.trim(), answer: a.answer.trim() }))
      .filter((a: { question: string; answer: string }) => a.question || a.answer)
      .slice(0, 10);
  }
  if (body.remindAt === null) { data.remindAt = null; data.remindText = null; }
  if (typeof body.remindAt === 'string') {
    const d = new Date(body.remindAt);
    if (!isNaN(d.getTime())) data.remindAt = d;
  }
  if (typeof body.remindText === 'string') data.remindText = body.remindText.trim() || null;
  if (typeof body.weeklyFee === 'number' && body.weeklyFee >= 0) data.weeklyFee = Math.round(body.weeklyFee);
  if (body.churned === true) data.churnedAt = new Date();
  if (body.churned === false) data.churnedAt = null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
  }

  const lead = await prisma.lead.update({ where: { id }, data });

  // CLIENT → авто-создать карточку в таблице клиентов (если ещё нет)
  if (becameClient) {
    await prisma.client.upsert({
      where: { leadId: id },
      update: {},
      create: { leadId: id, project: lead.name },
    });
  }

  return NextResponse.json(lead);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
