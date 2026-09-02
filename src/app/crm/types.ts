export type LeadStatus =
  | 'NEW'      // Лид
  | 'CALL1'    // Первый звонок
  | 'OFFER'    // Звонок — коммерческое предложение
  | 'DECISION' // Принимается решение
  | 'INVOICE'  // Выставил счёт
  | 'BOOKED'   // Бронь
  | 'CLIENT'   // Клиент → уходит в таблицу клиентов
  | 'BASE';    // База

export type ClientDTO = {
  id: string;
  leadId: string;
  project: string;
  teamlead: string | null;
  targetolog: string | null;
  planAmount: number | null;
  service: string | null;
  launchAt: string | null;
  nextPayAt: string | null;
  payFormat: string | null;
  payMethod: string | null;
  status: string;
  factAmount: number;      // сумма факт — из оплат лида
  lastPayAt: string | null; // дата последней оплаты — из оплат лида
  phone: string | null;
  telegram: string | null;
};

export type QA = { question: string; answer: string };

export type PaymentDTO = {
  id: string;
  amount: number;
  method: string | null;
  screenshot: string | null; // data-url
  paidAt: string;
};

export type LeadDTO = {
  id: string;
  name: string;
  phone: string | null;
  telegram: string | null;
  lang: string;
  niche: string;
  source: string | null;
  utm: Record<string, string> | null;
  answers: QA[] | null;
  status: LeadStatus;
  note: string | null;
  weeklyFee: number;
  soldAt: string | null;
  churnedAt: string | null;
  createdAt: string;
  payments: PaymentDTO[];
};

export type SpendDTO = {
  niche: string;
  weekStart: string; // ISO понедельника (UTC)
  amount: number;
};
