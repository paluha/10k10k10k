'use client';

import { useState } from 'react';
import type { LeadDTO, LeadStatus, PaymentDTO } from './types';

const COLUMNS: { key: LeadStatus; title: string }[] = [
  { key: 'NEW', title: 'Новые' },
  { key: 'CONTACTED', title: 'Связались' },
  { key: 'INTERESTED', title: 'Интерес' },
  { key: 'SOLD', title: 'Купили' },
  { key: 'LOST', title: 'Отказ' },
];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

// скрин оплаты: ужимаем до 1400px по ширине, jpeg — чтобы влезать в лимиты запроса
function fileToDataUrl(file: File, maxW = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

export function Board({ initialLeads }: { initialLeads: LeadDTO[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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
                payments: l.payments,
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

  const addPayment = async (leadId: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/crm/leads/${leadId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);
    if (!res?.ok) return false;
    const pm: PaymentDTO = await res.json();
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, payments: [pm, ...l.payments] } : l)),
    );
    return true;
  };

  const delPayment = async (leadId: string, paymentId: string) => {
    if (!confirm('Удалить платёж?')) return;
    const res = await fetch(`/api/crm/payments/${paymentId}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, payments: l.payments.filter((p) => p.id !== paymentId) } : l,
        ),
      );
    }
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
            <div className="col" key={col.key}>
              <div className="colHead">
                <span>{col.title}</span>
                <span className="colCount">{cards.length}</span>
              </div>
              <div className="colCards">
                {cards.map((l) => {
                  const paid = l.payments.reduce((s, p) => s + p.amount, 0);
                  return (
                    <div className="card" key={l.id} onClick={() => setOpenId(l.id)}>
                      <div className="cardName">{l.name}</div>
                      {l.phone && <div className="cardPhone">{l.phone}</div>}
                      <div className="cardMeta">
                        <span className="badge">{l.niche}</span>
                        {l.status === 'SOLD' && !l.churnedAt && (
                          <span className="badge green">${l.weeklyFee}/нед</span>
                        )}
                        {paid > 0 && <span className="badge green">✓ {money(paid)}</span>}
                        {l.churnedAt && <span className="badge red">отвалился</span>}
                        <span className="badge">{fmtDate(l.createdAt)}</span>
                      </div>
                      <select
                        className="statusSel"
                        value={l.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => patch(l.id, { status: e.target.value })}
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
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
          onAddPayment={(body) => addPayment(open.id, body)}
          onDelPayment={(pid) => delPayment(open.id, pid)}
        />
      )}

      {adding && (
        <AddLeadModal
          onClose={() => setAdding(false)}
          onCreated={(l) => {
            setLeads((prev) => [{ ...l, payments: [] }, ...prev]);
            setAdding(false);
          }}
        />
      )}
    </>
  );
}

function LeadModal({
  lead,
  onClose,
  onPatch,
  onDelete,
  onAddPayment,
  onDelPayment,
}: {
  lead: LeadDTO;
  onClose: () => void;
  onPatch: (body: Record<string, unknown>) => Promise<void>;
  onDelete: () => void;
  onAddPayment: (body: Record<string, unknown>) => Promise<boolean>;
  onDelPayment: (paymentId: string) => void;
}) {
  const [note, setNote] = useState(lead.note ?? '');
  const [nicheVal, setNicheVal] = useState(lead.niche);
  const [fee, setFee] = useState(String(lead.weeklyFee));
  const [saving, setSaving] = useState(false);
  const [shot, setShot] = useState<string | null>(null); // просмотр скрина

  // форма платежа
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [payShot, setPayShot] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const dirty =
    note !== (lead.note ?? '') || nicheVal !== lead.niche || Number(fee) !== lead.weeklyFee;

  const save = async () => {
    setSaving(true);
    await onPatch({ note, niche: nicheVal, weeklyFee: Number(fee) || 0 });
    setSaving(false);
  };

  const submitPayment = async () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) return;
    setPayBusy(true);
    const ok = await onAddPayment({ amount, method: payMethod, screenshot: payShot });
    setPayBusy(false);
    if (ok) {
      setPayAmount('');
      setPayMethod('');
      setPayShot(null);
    }
  };

  const tg = lead.telegram?.replace(/^@/, '');
  const paidTotal = lead.payments.reduce((s, p) => s + p.amount, 0);

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

        {(lead.status === 'SOLD' || lead.payments.length > 0) && (
          <>
            <div className="fieldLabel">
              Оплаты {paidTotal > 0 && <span style={{ color: 'var(--green)' }}>· всего {money(paidTotal)}</span>}
            </div>
            <div className="payList">
              {lead.payments.map((p) => (
                <div className="payRow" key={p.id}>
                  <span className="payDate">{fmtDate(p.paidAt)}</span>
                  <span className="payAmount">{money(p.amount)}</span>
                  <span className="payMethod">{p.method || '—'}</span>
                  {p.screenshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="payThumb"
                      src={p.screenshot}
                      alt="скрин оплаты"
                      onClick={() => setShot(p.screenshot)}
                    />
                  ) : (
                    <span className="dim" style={{ fontSize: 11 }}>без скрина</span>
                  )}
                  <button className="payDel" onClick={() => onDelPayment(p.id)}>
                    ×
                  </button>
                </div>
              ))}

              <div className="payForm">
                <input
                  className="modalInput"
                  type="number"
                  placeholder="Сумма $"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  style={{ width: 90 }}
                />
                <input
                  className="modalInput"
                  placeholder="Куда (zelle, карта...)"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  style={{ flex: 1, minWidth: 120 }}
                />
                <label className="payFile">
                  {payShot ? '🖼 скрин ✓' : '+ скрин'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setPayShot(await fileToDataUrl(f).catch(() => null));
                      e.target.value = '';
                    }}
                  />
                </label>
                <button
                  className="saveBtn"
                  style={{ padding: '9px 14px' }}
                  disabled={!Number(payAmount) || payBusy}
                  onClick={submitPayment}
                >
                  {payBusy ? '...' : '+'}
                </button>
              </div>
            </div>
          </>
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

      {shot && (
        <div className="shotOverlay" onClick={(e) => { e.stopPropagation(); setShot(null); }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shot} alt="скрин оплаты" />
        </div>
      )}
    </div>
  );
}

function AddLeadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (l: LeadDTO) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [nicheVal, setNicheVal] = useState('');
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
