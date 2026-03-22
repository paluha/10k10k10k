import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Store leads in a JSON file (swap for a DB later)
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
