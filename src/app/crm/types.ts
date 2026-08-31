export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'SOLD' | 'LOST';

export type QA = { question: string; answer: string };

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
};

export type SpendDTO = {
  niche: string;
  weekStart: string; // ISO понедельника (UTC)
  amount: number;
};
