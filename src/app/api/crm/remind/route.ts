import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAY = 24 * 60 * 60 * 1000;
const STAGE_RU: Record<string, string> = {
  NEW: 'Лид',
  CALL1: '1-й звонок',
  OFFER: 'Звонок-КП',
  DECISION: 'Решение',
  INVOICE: 'Счёт',
  BOOKED: 'Бронь',
};

// Ежедневная сводка-напоминалка в телеграм (Vercel Cron).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json({ error: 'no db' }, { status: 500 });

  const now = Date.now();
  const [clients, leads] = await Promise.all([
    prisma.client.findMany({
      where: { nextPayAt: { not: null }, status: { not: 'закрыт' } },
      select: { project: true, nextPayAt: true, payFormat: true },
    }),
    prisma.lead.findMany({
      where: { status: { in: Object.keys(STAGE_RU) } },
      select: { name: true, status: true, updatedAt: true },
    }),
  ]);

  const fmtD = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });

  // оплаты: сегодня и просроченные
  const payDue = clients
    .filter((c) => c.nextPayAt!.getTime() <= now + DAY)
    .sort((a, b) => a.nextPayAt!.getTime() - b.nextPayAt!.getTime())
    .map((c) => {
      const overdueDays = Math.floor((now - c.nextPayAt!.getTime()) / DAY);
      const when = overdueDays > 0 ? `просрочено ${overdueDays} дн.` : `сегодня-завтра (${fmtD(c.nextPayAt!)})`;
      return `• ${c.project}${c.payFormat ? ` (${c.payFormat})` : ''} — ${when}`;
    });

  // новые лиды без движения сутки+
  const staleNew = leads.filter((l) => l.status === 'NEW' && now - l.updatedAt.getTime() > DAY);
  // горячие стадии (счёт/бронь/решение) без движения 2 дня+
  const staleHot = leads.filter(
    (l) => ['DECISION', 'INVOICE', 'BOOKED'].includes(l.status) && now - l.updatedAt.getTime() > 2 * DAY,
  );

  const lines: string[] = [];
  if (payDue.length) lines.push(`💰 *Оплаты:*`, ...payDue, '');
  if (staleHot.length) {
    lines.push(
      `🔥 *Горячие лиды без движения 2+ дня:*`,
      ...staleHot.map((l) => `• ${l.name} — ${STAGE_RU[l.status]}`),
      '',
    );
  }
  if (staleNew.length) {
    lines.push(`📞 *Новые лиды ждут звонка (${staleNew.length}):*`, ...staleNew.slice(0, 10).map((l) => `• ${l.name}`));
    if (staleNew.length > 10) lines.push(`…и ещё ${staleNew.length - 10}`);
  }

  if (lines.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: 'nothing to remind' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return NextResponse.json({ ok: false, reason: 'telegram not configured' }, { status: 500 });
  }
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: [`⏰ *CRM 10K — напоминалки*`, ''].concat(lines).join('\n'),
      parse_mode: 'Markdown',
    }),
  }).catch(() => null);

  return NextResponse.json({ ok: !!res?.ok, sent: true, payDue: payDue.length, staleNew: staleNew.length, staleHot: staleHot.length });
}
