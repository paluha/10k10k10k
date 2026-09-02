import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/auth';

const dateOrNull = (v: unknown): Date | null | undefined => {
  if (v === null || v === '') return null;      // явная очистка
  if (typeof v !== 'string') return undefined;  // не трогать
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
};

const strOrNull = (v: unknown): string | null | undefined => {
  if (v === null) return null;
  if (typeof v !== 'string') return undefined;
  return v.trim() || null;
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (typeof body.project === 'string' && body.project.trim()) data.project = body.project.trim();
  for (const f of ['teamlead', 'targetolog', 'service', 'payFormat', 'payMethod'] as const) {
    const v = strOrNull(body[f]);
    if (v !== undefined) data[f] = v;
  }
  if (typeof body.status === 'string' && body.status.trim()) data.status = body.status.trim();
  if (body.planAmount === null) data.planAmount = null;
  if (typeof body.planAmount === 'number' && body.planAmount >= 0) data.planAmount = body.planAmount;
  if (body.factAmount === null) data.factAmount = null;
  if (typeof body.factAmount === 'number' && body.factAmount >= 0) data.factAmount = body.factAmount;
  for (const f of ['launchAt', 'nextPayAt'] as const) {
    const v = dateOrNull(body[f]);
    if (v !== undefined) data[f] = v;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
  }

  const client = await prisma.client.update({ where: { id }, data });
  return NextResponse.json(client);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });
  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
