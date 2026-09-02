'use client';

import { useState } from 'react';
import type { LeadDTO, LeadStatus } from './types';

const COLUMNS: { key: LeadStatus; title: string }[] = [
  { key: 'NEW', title: 'Новые' },
  { key: 'CONTACTED', title: 'Связались' },
  { key: 'INTERESTED', title: 'Интерес' },
  { key: 'SOLD', title: 'Купили' },
  { key: 'LOST', title: 'Отказ' },
];

const ORDER: LeadStatus[] = COLUMNS.map((c) => c.key);

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// клик открывает попап; после перетаскивания — не открывать (как у vodily)
let justDragged = false;

export function Board({ initialLeads }: { initialLeads: LeadDTO[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<LeadStatus | null>(null);

  const open = openId ? leads.find((l) => l.id === openId) ?? null : null;

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/crm/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (res?.ok) {
      const updated = await res.json();
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                ...updated,
                soldAt: updated.soldAt ?? null,
                churnedAt: updated.churnedAt ?? null,
              }
            : l,
        ),
      );
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить лида навсегда?')) return;
    const res = await fetch(`/api/crm/leads/${id}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setOpenId(null);
    }
  };

  const move = (l: LeadDTO, dir: 1 | -1) => {
    const idx = ORDER.indexOf(l.status);
    const next = ORDER[idx + dir];
    if (next) patch(l.id, { status: next });
  };

  return (
    <>
      <div className="chips">
        <button className="chip addChip" onClick={() => setAdding(true)}>
          + Лид
        </button>
        <span className="boardCount">{leads.length} лидов</span>
      </div>

      <div className="board">
        {COLUMNS.map((col) => {
          const cards = leads.filter((l) => l.status === col.key);
          return (
            <div
              className={`col ${overCol === col.key ? 'dragOver' : ''}`}
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.key);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget === e.target) setOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                const id = e.dataTransfer.getData('text/plain') || dragId;
                if (id) {
                  const l = leads.find((x) => x.id === id);
                  if (l && l.status !== col.key) patch(id, { status: col.key });
                }
              }}
            >
              <div className="colHead">
                <span>{col.title}</span>
                <span className="colCount">{cards.length}</span>
              </div>
              <div className="colCards">
                {cards.map((l) => (
                  <div
                    className="card"
                    key={l.id}
                    draggable
                    onDragStart={(e) => {
                      justDragged = true;
                      // setData обязателен: Firefox без него вообще не стартует драг
                      e.dataTransfer.setData('text/plain', l.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDragId(l.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      // сбросить флаг после клика, который браузер шлёт следом за drop
                      setTimeout(() => {
                        justDragged = false;
                      }, 0);
                    }}
                    onClick={() => {
                      if (justDragged) {
                        justDragged = false;
                        return;
                      }
                      setOpenId(l.id);
                    }}
                  >
                    <div className="cardName">{l.name}</div>
                    {l.phone && <div className="cardPhone">{l.phone}</div>}
                    <div className="cardMeta">
                      <span className="badge">{l.niche}</span>
                      {l.status === 'SOLD' && !l.churnedAt && (
                        <span className="badge green">${l.weeklyFee}/нед</span>
                      )}
                      {l.churnedAt && <span className="badge red">отвалился</span>}
                      <span className="badge">{fmtDate(l.createdAt)}</span>
                    </div>
                    <div className="cardMove" onClick={(e) => e.stopPropagation()}>
                      <button className="moveBtn" disabled={col.key === 'NEW'} onClick={() => move(l, -1)}>
                        ◀
                      </button>
                      <button className="moveBtn" disabled={col.key === 'LOST'} onClick={() => move(l, 1)}>
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <LeadModal
          lead={open}
          onClose={() => setOpenId(null)}
          onPatch={(body) => patch(open.id, body)}
          onDelete={() => remove(open.id)}
        />
      )}

      {adding && (
        <AddLeadModal
          defaultNiche=""
          onClose={() => setAdding(false)}
          onCreated={(l) => {
            setLeads((prev) => [l, ...prev]);
            setAdding(false);
          }}
        />
      )}
    </>
  );
}

function AddLeadModal({
  defaultNiche,
  onClose,
  onCreated,
}: {
  defaultNiche: string;
  onClose: () => void;
  onCreated: (l: LeadDTO) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [nicheVal, setNicheVal] = useState(defaultNiche);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/crm/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, telegram, niche: nicheVal, note }),
    }).catch(() => null);
    if (res?.ok) {
      onCreated(await res.json());
    } else {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalName">Новый лид</div>
          <button className="modalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="fieldLabel">Имя *</div>
        <input className="modalInput" autoFocus value={name} onChange={(e) => setName(e.target.value)} />

        <div className="fieldLabel">Телефон</div>
        <input className="modalInput" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1..." />

        <div className="fieldLabel">Telegram</div>
        <input className="modalInput" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />

        <div className="fieldLabel">Ниша</div>
        <input className="modalInput" value={nicheVal} onChange={(e) => setNicheVal(e.target.value)} placeholder="no-campaign" />

        <div className="fieldLabel">Заметка</div>
        <textarea className="modalTextarea" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="modalActions">
          <span />
          <button className="saveBtn" disabled={!name.trim() || saving} onClick={save}>
            {saving ? '...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeadModal({
  lead,
  onClose,
  onPatch,
  onDelete,
}: {
  lead: LeadDTO;
  onClose: () => void;
  onPatch: (body: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
}) {
  const [note, setNote] = useState(lead.note ?? '');
  const [nicheVal, setNicheVal] = useState(lead.niche);
  const [fee, setFee] = useState(String(lead.weeklyFee));
  const [saving, setSaving] = useState(false);

  const dirty =
    note !== (lead.note ?? '') || nicheVal !== lead.niche || Number(fee) !== lead.weeklyFee;

  const save = async () => {
    setSaving(true);
    await onPatch({ note, niche: nicheVal, weeklyFee: Number(fee) || 0 });
    setSaving(false);
  };

  const tg = lead.telegram?.replace(/^@/, '');

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div>
            <div className="modalName">{lead.name}</div>
            <div className="dim" style={{ fontSize: 12, marginTop: 3 }}>
              {new Date(lead.createdAt).toLocaleString('ru-RU')}
              {lead.source ? ` · ${lead.source}` : ''}
              {lead.lang !== 'en' ? ` · ${lead.lang.toUpperCase()}` : ''}
            </div>
          </div>
          <button className="modalClose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="contactRow">
          {lead.phone && (
            <a className="contactLink" href={`tel:${lead.phone}`}>
              📞 {lead.phone}
            </a>
          )}
          {tg && (
            <a className="contactLink" href={`https://t.me/${tg}`} target="_blank" rel="noreferrer">
              ✈️ @{tg}
            </a>
          )}
        </div>

        {lead.answers && lead.answers.length > 0 && (
          <div className="qaList">
            {lead.answers.map((qa, i) => (
              <div className="qa" key={i}>
                <div className="qaQ">{qa.question}</div>
                <div className="qaA">{qa.answer}</div>
              </div>
            ))}
          </div>
        )}

        <div className="fieldLabel">Статус</div>
        <div className="statusRow">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              className={`statusBtn ${lead.status === c.key ? 'active' : ''}`}
              onClick={() => onPatch({ status: c.key })}
            >
              {c.title}
            </button>
          ))}
        </div>

        {lead.status === 'SOLD' && (
          <div className="soldBox">
            <div className="soldRow">
              <span style={{ fontSize: 13, fontWeight: 700 }}>$</span>
              <input
                className="modalInput"
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
              <span style={{ fontSize: 13 }}>в неделю</span>
              {lead.churnedAt ? (
                <button className="unchurnBtn" onClick={() => onPatch({ churned: false })}>
                  Вернулся
                </button>
              ) : (
                <button className="churnBtn" onClick={() => onPatch({ churned: true })}>
                  Отвалился
                </button>
              )}
            </div>
            <div className="dim" style={{ fontSize: 12, marginTop: 8 }}>
              {lead.soldAt && `Платит с ${fmtDate(lead.soldAt)}`}
              {lead.churnedAt && ` · отвалился ${fmtDate(lead.churnedAt)}`}
            </div>
          </div>
        )}

        <div className="fieldLabel">Ниша</div>
        <input className="modalInput" value={nicheVal} onChange={(e) => setNicheVal(e.target.value)} />

        <div className="fieldLabel">Заметка</div>
        <textarea
          className="modalTextarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Как прошёл контакт, о чём договорились..."
        />

        <div className="modalActions">
          <button className="dangerBtn" onClick={onDelete}>
            Удалить
          </button>
          <button className="saveBtn" disabled={!dirty || saving} onClick={save}>
            {saving ? '...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}
