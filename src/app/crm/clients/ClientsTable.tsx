'use client';

import { useState } from 'react';
import type { ClientDTO } from '../types';

const PROJECT_STATUSES = ['запуск', 'активен', 'пауза', 'закрыт'];

function money(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function dateInputVal(iso: string | null) {
  return iso ? iso.slice(0, 10) : '';
}

function fmtD(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
}

const isOverdue = (c: ClientDTO) =>
  !!c.nextPayAt && c.status !== 'закрыт' && new Date(c.nextPayAt).getTime() <= Date.now();

export function ClientsTable({ initialClients }: { initialClients: ClientDTO[] }) {
  const [clients, setClients] = useState(initialClients);

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/crm/clients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (res?.ok) {
      const updated = await res.json();
      setClients((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updated,
                launchAt: updated.launchAt ?? null,
                nextPayAt: updated.nextPayAt ?? null,
                // журнал оплат и контакты приходят не из client-патча — сохраняем свои
                lastPayAt: c.lastPayAt,
                phone: c.phone,
                telegram: c.telegram,
              }
            : c,
        ),
      );
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить карточку клиента? (лид на доске останется)')) return;
    const res = await fetch(`/api/crm/clients/${id}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const overdue = clients.filter(isOverdue);
  const totPlan = clients.reduce((s, c) => s + (c.planAmount ?? 0), 0);
  const totFact = clients.reduce((s, c) => s + (c.factAmount ?? 0), 0);

  return (
    <>
      {overdue.length > 0 && (
        <div className="overdueBanner">
          💰 Просрочена оплата: {overdue.map((c) => c.project).join(', ')}
        </div>
      )}

      <div className="tableWrap">
        <table className="aTable cTable">
          <thead>
            <tr>
              <th>#</th>
              <th style={{ textAlign: 'left' }}>Проект</th>
              <th>Тимлид</th>
              <th>Таргетолог</th>
              <th>План $</th>
              <th>Факт $</th>
              <th>Услуга</th>
              <th>Запуск</th>
              <th>Оплата</th>
              <th>След. оплата</th>
              <th>Формат</th>
              <th>Статус</th>
              <th>Способ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={c.id} className={isOverdue(c) ? 'overdueRow' : ''}>
                <td className="dim">{i + 1}</td>
                <td style={{ textAlign: 'left', minWidth: 140 }}>
                  <input
                    className="cellInput cellText"
                    defaultValue={c.project}
                    onBlur={(e) => e.target.value.trim() && e.target.value !== c.project && patch(c.id, { project: e.target.value })}
                  />
                  {(c.phone || c.telegram) && (
                    <div className="dim" style={{ fontSize: 11 }}>
                      {c.phone}
                      {c.telegram ? ` · ${c.telegram}` : ''}
                    </div>
                  )}
                </td>
                <td>
                  <input
                    className="cellInput"
                    defaultValue={c.teamlead ?? ''}
                    placeholder="—"
                    onBlur={(e) => e.target.value !== (c.teamlead ?? '') && patch(c.id, { teamlead: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="cellInput"
                    defaultValue={c.targetolog ?? ''}
                    placeholder="—"
                    onBlur={(e) => e.target.value !== (c.targetolog ?? '') && patch(c.id, { targetolog: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="cellInput cellNum"
                    type="number"
                    defaultValue={c.planAmount ?? ''}
                    placeholder="0"
                    onBlur={(e) => patch(c.id, { planAmount: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="cellInput cellNum factInput"
                    type="number"
                    defaultValue={c.factAmount ?? ''}
                    placeholder="0"
                    onBlur={(e) => patch(c.id, { factAmount: e.target.value === '' ? null : Number(e.target.value) })}
                  />
                </td>
                <td>
                  <input
                    className="cellInput"
                    defaultValue={c.service ?? ''}
                    placeholder="—"
                    onBlur={(e) => e.target.value !== (c.service ?? '') && patch(c.id, { service: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="cellInput cellDate"
                    type="date"
                    defaultValue={dateInputVal(c.launchAt)}
                    onBlur={(e) => e.target.value !== dateInputVal(c.launchAt) && patch(c.id, { launchAt: e.target.value })}
                  />
                </td>
                <td className="dim" title="дата последней внесённой оплаты">{fmtD(c.lastPayAt) || '—'}</td>
                <td>
                  <input
                    className="cellInput cellDate"
                    type="date"
                    defaultValue={dateInputVal(c.nextPayAt)}
                    onBlur={(e) => e.target.value !== dateInputVal(c.nextPayAt) && patch(c.id, { nextPayAt: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="cellInput"
                    defaultValue={c.payFormat ?? ''}
                    placeholder="150$/нед"
                    onBlur={(e) => e.target.value !== (c.payFormat ?? '') && patch(c.id, { payFormat: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    className="cellInput cellSel"
                    value={c.status}
                    onChange={(e) => patch(c.id, { status: e.target.value })}
                  >
                    {PROJECT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {!PROJECT_STATUSES.includes(c.status) && <option value={c.status}>{c.status}</option>}
                  </select>
                </td>
                <td>
                  <input
                    className="cellInput"
                    defaultValue={c.payMethod ?? ''}
                    placeholder="zelle..."
                    onBlur={(e) => e.target.value !== (c.payMethod ?? '') && patch(c.id, { payMethod: e.target.value })}
                  />
                </td>
                <td>
                  <button className="payDel" title="удалить карточку клиента" onClick={() => remove(c.id)}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={14} style={{ padding: 22, textAlign: 'center', opacity: 0.5 }}>
                  Пока пусто. Переведи лида в статус «Клиент» на доске — он появится здесь.
                </td>
              </tr>
            )}
            {clients.length > 0 && (
              <tr className="totals">
                <td>{clients.length}</td>
                <td style={{ textAlign: 'left' }}>Итого</td>
                <td colSpan={2}></td>
                <td>{money(totPlan)}</td>
                <td className="pos">{money(totFact)}</td>
                <td colSpan={8}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="dim" style={{ fontSize: 11.5, marginTop: 8 }}>
        «Оплата» — дата последнего платежа со скрином из карточки лида. «След. оплата» — для
        напоминалок: просроченные подсвечиваются и приходят в телеграм.
      </div>
    </>
  );
}
