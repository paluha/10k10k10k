import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/auth';

// Расход на рекламу: upsert одной цифры (ниша, неделя)
export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const niche = typeof body.niche === 'string' ? body.niche.trim() : '';
  const weekStart = body.weekStart ? new Date(body.weekStart) : null;
  const amount = Number(body.amount);

  if (!niche || !weekStart || isNaN(weekStart.getTime()) || isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: 'bad input' }, { status: 400 });
  }

  const row = await prisma.adSpend.upsert({
    where: { niche_weekStart: { niche, weekStart } },
    update: { amount },
    create: { niche, weekStart, amount },
  });
  return NextResponse.json(row);
}
