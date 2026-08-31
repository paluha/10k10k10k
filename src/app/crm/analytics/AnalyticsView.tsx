'use client';

import { useMemo, useState } from 'react';
import type { SpendDTO } from '../types';

type LeadLite = {
  id: string;
  niche: string;
  weeklyFee: number;
  soldAt: string | null;
  churnedAt: string | null;
  createdAt: string;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Понедельник недели в UTC, 00:00
function weekStartUTC(t: number): number {
  const d = new Date(t);
  const day = (d.getUTCDay() + 6) % 7; // 0 = понедельник
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
}

function fmtWeek(ts: number) {
  const a = new Date(ts);
  const b = new Date(ts + 6 * 24 * 60 * 60 * 1000);
  const f = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  return `${f(a)} – ${f(b)}`;
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function AnalyticsView({ leads, initialSpends }: { leads: LeadLite[]; initialSpends: SpendDTO[] }) {
  const [spends, setSpends] = useState(initialSpends);
  const [niche, setNiche] = useState<string>('ALL');

  const niches = useMemo(
    () => [...new Set([...leads.map((l) => l.niche), ...spends.map((s) => s.niche)])].sort(),
    [leads, spends],
  );

  const nicheLeads = niche === 'ALL' ? leads : leads.filter((l) => l.niche === niche);
  const nicheSpends = niche === 'ALL' ? spends : spends.filter((s) => s.niche === niche);

  // Недели: от самой ранней активности до текущей, максимум 16
  const currentWeek = weekStartUTC(Date.now());
  const weeks = useMemo(() => {
    let first = currentWeek;
    for (const l of nicheLeads) first = Math.min(first, weekStartUTC(Date.parse(l.createdAt)));
    for (const s of nicheSpends) first = Math.min(first, weekStartUTC(Date.parse(s.weekStart)));
    const out: number[] = [];
    for (let w = currentWeek; w >= first && out.length < 16; w -= WEEK_MS) out.push(w);
    return out; // свежие сверху
  }, [nicheLeads, nicheSpends, currentWeek]);

  const rows = weeks.map((w) => {
    const wEnd = w + WEEK_MS;
    const created = nicheLeads.filter((l) => {
      const t = Date.parse(l.createdAt);
      return t >= w && t < wEnd;
    }).length;
    const active = nicheLeads.filter((l) => {
      if (!l.soldAt) return false;
      const sold = Date.parse(l.soldAt);
      const churned = l.churnedAt ? Date.parse(l.churnedAt) : null;
      return sold < wEnd && (churned === null || churned > w);
    });
    const revenue = active.reduce((sum, l) => sum + l.weeklyFee, 0);
    const spent = nicheSpends
      .filter((s) => weekStartUTC(Date.parse(s.weekStart)) === w)
      .reduce((sum, s) => sum + s.amount, 0);
    return { week: w, created, clients: active.length, revenue, spent, profit: revenue - spent };
  });

  const total = rows.reduce(
    (acc, r) => ({
      created: acc.created + r.created,
      revenue: acc.revenue + r.revenue,
      spent: acc.spent + r.spent,
    }),
    { created: 0, revenue: 0, spent: 0 },
  );
  const totalProfit = total.revenue - total.spent;
  const payingNow = nicheLeads.filter((l) => l.soldAt && !l.churnedAt).length;

  const saveSpend = async (week: number, value: string) => {
    if (niche === 'ALL') return;
    const amount = Number(value) || 0;
    const weekStart = new Date(week).toISOString();
    const prev = spends;
    // оптимистично
    setSpends((s) => {
      const rest = s.filter((x) => !(x.niche === niche && weekStartUTC(Date.parse(x.weekStart)) === week));
      return [...rest, { niche, weekStart, amount }];
    });
    const res = await fetch('/api/crm/spend', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, weekStart, amount }),
    }).catch(() => null);
    if (!res?.ok) setSpends(prev);
  };

  return (
    <>
      <div className="chips">
        <button className={`chip ${niche === 'ALL' ? 'active' : ''}`} onClick={() => setNiche('ALL')}>
          Все ниши
        </button>
        {niches.map((n) => (
          <button key={n} className={`chip ${niche === n ? 'active' : ''}`} onClick={() => setNiche(n)}>
            {n}
          </button>
        ))}
      </div>

      <div className="statCards">
        <div className="statCard">
          <div className="statLabel">Потрачено</div>
          <div className="statValue">{money(total.spent)}</div>
        </div>
        <div className="statCard">
          <div className="statLabel">Доход</div>
          <div className="statValue">{money(total.revenue)}</div>
        </div>
        <div className="statCard">
          <div className="statLabel">Профит</div>
          <div className={`statValue ${totalProfit >= 0 ? 'green' : 'red'}`}>{money(totalProfit)}</div>
        </div>
        <div className="statCard">
          <div className="statLabel">Платят сейчас</div>
          <div className="statValue green">{payingNow}</div>
        </div>
      </div>

      {niche === 'ALL' && (
        <div className="dim" style={{ fontSize: 12, marginBottom: 10 }}>
          Расход вводится внутри конкретной ниши — выбери нишу сверху.
        </div>
      )}

      <div className="tableWrap">
        <table className="aTable">
          <thead>
            <tr>
              <th>Неделя</th>
              <th>Расход</th>
              <th>Лиды</th>
              <th>CPL</th>
              <th>Клиенты</th>
              <th>Доход</th>
              <th>Профит</th>
              <th>ROI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.week}>
                <td>{fmtWeek(r.week)}</td>
                <td>
                  {niche === 'ALL' ? (
                    <span className={r.spent ? '' : 'dim'}>{money(r.spent)}</span>
                  ) : (
                    <input
                      className="spendInput"
                      type="number"
                      defaultValue={r.spent || ''}
                      placeholder="0"
                      onBlur={(e) => saveSpend(r.week, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                    />
                  )}
                </td>
                <td>{r.created || <span className="dim">—</span>}</td>
                <td>{r.spent && r.created ? money(r.spent / r.created) : <span className="dim">—</span>}</td>
                <td>{r.clients || <span className="dim">—</span>}</td>
                <td>{r.revenue ? money(r.revenue) : <span className="dim">—</span>}</td>
                <td className={r.profit > 0 ? 'pos' : r.profit < 0 ? 'neg' : 'dim'}>{money(r.profit)}</td>
                <td className={r.profit > 0 ? 'pos' : r.profit < 0 ? 'neg' : 'dim'}>
                  {r.spent ? `${Math.round(((r.revenue - r.spent) / r.spent) * 100)}%` : '—'}
                </td>
              </tr>
            ))}
            <tr className="totals">
              <td>Итого</td>
              <td>{money(total.spent)}</td>
              <td>{total.created}</td>
              <td>{total.spent && total.created ? money(total.spent / total.created) : '—'}</td>
              <td></td>
              <td>{money(total.revenue)}</td>
              <td className={totalProfit > 0 ? 'pos' : totalProfit < 0 ? 'neg' : ''}>{money(totalProfit)}</td>
              <td className={totalProfit > 0 ? 'pos' : totalProfit < 0 ? 'neg' : ''}>
                {total.spent ? `${Math.round((totalProfit / total.spent) * 100)}%` : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
