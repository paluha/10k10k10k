import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Telegram notification (runs first — works on all platforms)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const answers = body.answers || [];
      const contact = body.contact || {};
      const lang = body.lang || 'en';
      const lines = [
        `🔥 *New Lead — 10K Traffic*`,
        ``,
        ...answers.map((a: { question: string; answer: string }) => `*${a.question}*\n${a.answer}`),
        ``,
        `👤 *${contact.name || '—'}*`,
        `📞 ${contact.phone || '—'}`,
        ...(contact.telegram ? [`✈️ ${contact.telegram}`] : []),
        ...(lang !== 'en' ? [`🌐 ${lang.toUpperCase()}`] : []),
        ...(body.source ? [`📎 ${body.source}`] : []),
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

    // Store leads in a JSON file (local dev only — Vercel has read-only filesystem)
    try {
      const leadsDir = path.join(process.cwd(), 'data');
      const leadsFile = path.join(leadsDir, 'leads.json');
      await fs.mkdir(leadsDir, { recursive: true });
      let leads: unknown[] = [];
      try {
        const existing = await fs.readFile(leadsFile, 'utf-8');
        leads = JSON.parse(existing);
      } catch {
        // File doesn't exist yet
      }
      leads.push({
        ...body,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      await fs.writeFile(leadsFile, JSON.stringify(leads, null, 2));
    } catch {
      // File storage not available (e.g. Vercel read-only filesystem)
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leadsFile = path.join(process.cwd(), 'data', 'leads.json');
    const data = await fs.readFile(leadsFile, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json([]);
  }
}
