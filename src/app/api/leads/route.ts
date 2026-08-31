import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthed } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const answers = body.answers || [];
    const contact = body.contact || {};
    const lang = body.lang || 'en';
    const utm = body.utm || {};

    // ── Сохранение в CRM (не должно ронять интейк — телеграм уйдёт в любом случае)
    let isDuplicate = false;
    if (prisma) {
      try {
        const phone = (contact.phone || '').trim() || null;
        if (phone) {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const existing = await prisma.lead.findFirst({
            where: { phone, createdAt: { gte: dayAgo } },
            select: { id: true },
          });
          isDuplicate = !!existing;
        }
        if (!isDuplicate) {
          await prisma.lead.create({
            data: {
              name: (contact.name || '').trim() || '—',
              phone: (contact.phone || '').trim() || null,
              telegram: (contact.telegram || '').trim() || null,
              lang,
              niche: (utm.utm_campaign || '').trim() || 'no-campaign',
              source: body.source || null,
              utm,
              answers,
            },
          });
        }
      } catch (e) {
        console.error('CRM save failed:', e);
      }
    }

    // ── Telegram notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const utmParts = [utm.utm_source, utm.utm_medium, utm.utm_campaign].filter(Boolean);
      const lines = [
        `🔥 *New Lead — 10K Traffic*${isDuplicate ? ' (дубль за 24ч, в CRM не добавлен)' : ''}`,
        ``,
        ...answers.map((a: { question: string; answer: string }) => `*${a.question}*\n${a.answer}`),
        ``,
        `👤 *${contact.name || '—'}*`,
        `📞 ${contact.phone || '—'}`,
        ...(contact.telegram ? [`✈️ ${contact.telegram}`] : []),
        ...(lang !== 'en' ? [`🌐 ${lang.toUpperCase()}`] : []),
        ...(body.source ? [`📍 ${body.source}`] : []),
        ...(utmParts.length > 0 ? [`📎 ${utmParts.join(' / ')}`] : []),
        ...(utm.fbclid ? [`🔗 fbclid: ${utm.fbclid.substring(0, 20)}...`] : []),
      ];
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: lines.join('\n'),
            parse_mode: 'Markdown',
          }),
        });
      } catch (e) {
        console.error('Telegram notification failed:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!prisma) return NextResponse.json([]);
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  return NextResponse.json(leads);
}
