import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/auth';

// Ручное создание лида из CRM
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      name,
      phone: typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : null,
      telegram: typeof body.telegram === 'string' && body.telegram.trim() ? body.telegram.trim() : null,
      niche: typeof body.niche === 'string' && body.niche.trim() ? body.niche.trim() : 'no-campaign',
      note: typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null,
      lang: 'ru',
      source: 'manual',
    },
  });
  return NextResponse.json(lead);
}
