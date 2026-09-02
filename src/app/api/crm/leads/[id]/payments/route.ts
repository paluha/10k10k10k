import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/auth';

// Добавить платёж клиента: сумма, куда платил, скрин (data-url), дата
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: 'bad amount' }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      leadId: id,
      amount,
      method: typeof body.method === 'string' && body.method.trim() ? body.method.trim() : null,
      screenshot:
        typeof body.screenshot === 'string' && body.screenshot.startsWith('data:image')
          ? body.screenshot
          : null,
      paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
    },
  });
  return NextResponse.json(payment);
}
