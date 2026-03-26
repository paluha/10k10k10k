'use client';

import { useState } from 'react';
import styles from '../../page.module.css';

/* ── Helper: fire FB pixel events ── */
const fbEvent = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).fbq === 'function') {
    (window as unknown as { fbq: (type: string, event: string, data?: Record<string, unknown>) => void }).fbq('track', event, data);
  }
};

const STEPS = [
  {
    label: 'ШАГ 1 — ВАШ БИЗНЕС',
    title: 'Какая у вас ниша?',
    hint: 'Мы подберём стратегию, которая уже приносила результат в вашей сфере',
    options: [
      { emoji: '🛍️', text: 'eCommerce / интернет-магазин', sub: 'Одежда, аксессуары, косметика, товарка' },
      { emoji: '🎓', text: 'Онлайн-образование', sub: 'Курсы, менторство, вебинары, школы' },
      { emoji: '💼', text: 'Услуги', sub: 'Медицина, красота, юристы, ремонт' },
      { emoji: '🏠', text: 'Недвижимость / авто', sub: 'Застройщики, агентства, автодилеры' },
      { emoji: '🍕', text: 'Еда и доставка', sub: 'Рестораны, кейтеринг, доставка' },
      { emoji: '📦', text: 'Другое', sub: 'Расскажем, как работать с вашей нишей' },
    ],
  },
  {
    label: 'ШАГ 2 — ТЕКУЩАЯ СИТУАЦИЯ',
    title: 'Какая сейчас ситуация с рекламой?',
    hint: 'Это поможет нам понять, с какого этапа начинать работу',
    options: [
      { emoji: '🚫', text: 'Рекламы ещё нет', sub: 'Хочу запуститься с нуля — нужна стратегия, креативы и настройка' },
      { emoji: '📉', text: 'Реклама есть, но не окупается', sub: 'Деньги уходят, а заявок мало или они дорогие' },
      { emoji: '📊', text: 'Есть результат, хочу масштаб', sub: 'Работает, но хочу x2–x3 без потери рентабельности' },
      { emoji: '🔄', text: 'Меняю подрядчика', sub: 'Текущий таргетолог не справляется — нужен результат' },
    ],
  },
  {
    label: 'ШАГ 3 — БЮДЖЕТ',
    title: 'Какой рекламный бюджет готовы вложить?',
    hint: 'Бюджет определяет масштаб: мы покажем, сколько лидов/продаж можно получить с вашей суммой',
    options: [
      { emoji: '💵', text: 'До $500/мес', sub: 'Тестовый запуск — найдём рабочую связку' },
      { emoji: '💸', text: '$500 — $2,000/мес', sub: 'Стабильный поток заявок — оптимальный старт' },
      { emoji: '💰', text: '$2,000 — $5,000/мес', sub: 'Масштабирование — системный рост продаж' },
      { emoji: '🚀', text: '$5,000+/мес', sub: 'Агрессивный рост — максимум охвата и конверсий' },
    ],
  },
  {
    label: 'ШАГ 4 — ПЛАТФОРМА',
    title: 'Где хотите запускать рекламу?',
    hint: 'Мы специализируемся на Meta (Facebook + Instagram) — это 80% наших кейсов',
    options: [
      { emoji: '📘', text: 'Facebook + Instagram', sub: 'Наша основная платформа — максимум экспертизы' },
      { emoji: '🎵', text: 'TikTok Ads', sub: 'Для молодой аудитории и вирусного контента' },
      { emoji: '🔍', text: 'Google Ads / SEO', sub: 'Поиск + контекстная реклама — горячий трафик' },
      { emoji: '⚡', text: 'Комплексно — несколько каналов', sub: 'Максимальный охват по всем фронтам' },
    ],
  },
  {
    label: 'ШАГ 5 — ЦЕЛЬ',
    title: 'Какую задачу решаем в первую очередь?',
    hint: 'Мы построим стратегию вокруг вашей главной цели',
    options: [
      { emoji: '🎯', text: 'Получить первые заявки/продажи', sub: 'Запустить рекламу и увидеть результат в первую неделю' },
      { emoji: '📉', text: 'Снизить стоимость лида', sub: 'Получать те же заявки, но дешевле — оптимизация воронки' },
      { emoji: '🔥', text: 'Масштабировать x2–x3', sub: 'Увеличить объём, сохранив рентабельность' },
      { emoji: '🌍', text: 'Выйти на новый рынок', sub: 'Европа, США или новая аудитория — тестирование гипотез' },
    ],
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [contactForm, setContactForm] = useState({ name: '', phone: '', telegram: '' });
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = STEPS.length + 1;
  const progress = ((step + 1) / totalSteps) * 100;

  const selectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [step]: optionIndex });
  };

  const nextStep = () => {
    if (answers[step] === undefined) return;
    fbEvent('ViewContent', { content_name: `quiz_step_${step + 2}` });
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!contactForm.name || !contactForm.phone) return;

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

    const payload = {
      answers: Object.entries(answers).map(([stepIdx, optIdx]) => ({
        question: STEPS[Number(stepIdx)]?.title,
        answer: STEPS[Number(stepIdx)]?.options[optIdx]?.text,
      })),
      contact: contactForm,
      lang: 'ru',
      source: 'quiz-direct',
      timestamp: new Date().toISOString(),
      utm: {
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_content: params.get('utm_content') || '',
        utm_term: params.get('utm_term') || '',
        fbclid: params.get('fbclid') || '',
      },
    };

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // silent
    }

    fbEvent('Lead', { content_name: 'quiz_completed' });
    setSubmitted(true);
  };

  return (
    <div className={styles.page} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span className={styles.logo} style={{ fontSize: '26px' }}>10K<span className={styles.logoAccent}>Traffic</span></span>
      </div>

      {/* Quiz container */}
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Progress */}
        <div className={styles.quizProgress}>
          <span className={styles.quizStepLabel}>ШАГ {step + 1} из {totalSteps}</span>
          <div className={styles.quizProgressBar}>
            <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className={styles.quizCard}>
          {submitted ? (
            <div className={styles.quizThankYou}>
              <span className={styles.quizThankYouIcon}>🎉</span>
              <h2 className={styles.quizThankYouTitle}>Отлично, заявка принята!</h2>
              <p className={styles.quizThankYouSub}>
                Наш стратег свяжется с вами в течение 15 минут и подготовит персональный план запуска рекламы.
              </p>
              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 210, 106, 0.08)', borderRadius: '12px', border: '1px solid rgba(0, 210, 106, 0.15)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: 'var(--green)' }}>Что будет дальше:</strong><br />
                  1. Короткий звонок (15 мин) — разберём вашу ситуацию<br />
                  2. Подготовим стратегию с прогнозом лидов и бюджетом<br />
                  3. Если всё подходит — запускаем рекламу за 48 часов
                </p>
              </div>
              <a href="/r" style={{ display: 'inline-block', marginTop: '24px', fontSize: '14px', color: 'var(--green)', textDecoration: 'none' }}>
                ← На главную
              </a>
            </div>
          ) : step < STEPS.length ? (
            <>
              <span className={styles.quizLabel}>{STEPS[step].label}</span>
              <h2 className={styles.quizTitle}>{STEPS[step].title}</h2>
              {STEPS[step].hint && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '24px', lineHeight: 1.5 }}>
                  {STEPS[step].hint}
                </p>
              )}
              <div className={styles.quizOptions}>
                {STEPS[step].options.map((opt, i) => (
                  <button
                    key={i}
                    className={`${styles.quizOption} ${answers[step] === i ? styles.quizOptionActive : ''}`}
                    onClick={() => selectOption(i)}
                  >
                    <span className={styles.quizOptionEmoji}>{opt.emoji}</span>
                    <div className={styles.quizOptionText}>
                      <span className={styles.quizOptionMain}>{opt.text}</span>
                      {opt.sub && <span className={styles.quizOptionSub}>{opt.sub}</span>}
                    </div>
                    <span className={styles.quizOptionCheck}>
                      {answers[step] === i ? '✓' : ''}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className={`${styles.quizNext} ${answers[step] !== undefined ? styles.quizNextActive : ''}`}
                onClick={nextStep}
                disabled={answers[step] === undefined}
              >
                Далее →
              </button>
              {step > 0 && (
                <button className={styles.quizBack} onClick={prevStep}>
                  ← Назад
                </button>
              )}
            </>
          ) : (
            <>
              <span className={styles.quizLabel}>ШАГ 6 — ПОЧТИ ГОТОВО</span>
              <h2 className={styles.quizTitle}>
                Оставьте контакты — стратег свяжется в течение 15 минут
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '20px', lineHeight: 1.5 }}>
                На звонке разберём вашу ситуацию и подготовим план запуска с прогнозом лидов, бюджетом и сроками. Это бесплатно и ни к чему не обязывает.
              </p>
              <div className={styles.quizForm}>
                <input
                  className={styles.quizInput}
                  placeholder="Ваше имя *"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
                <input
                  className={styles.quizInput}
                  placeholder="Номер телефона *"
                  required
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
                <input
                  className={styles.quizInput}
                  placeholder="Telegram @ник (необязательно)"
                  value={contactForm.telegram}
                  onChange={(e) => setContactForm({ ...contactForm, telegram: e.target.value })}
                />
                <button
                  className={`${styles.quizSubmit} ${contactForm.name && contactForm.phone ? styles.quizNextActive : ''}`}
                  onClick={handleSubmit}
                  disabled={!contactForm.name || !contactForm.phone}
                >
                  Получить стратегию бесплатно 🔥
                </button>
                  <a
                    href="https://wa.me/19293800274?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C%20%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5%20%D0%BE%20%D0%B2%D0%B0%D1%88%D0%B8%D1%85%20%D1%83%D1%81%D0%BB%D1%83%D0%B3%D0%B0%D1%85"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(37, 211, 102, 0.08)',
                      border: '1px solid rgba(37, 211, 102, 0.2)',
                      color: '#25D366',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    💬 Или напишите нам в WhatsApp
                  </a>
              </div>
              <button className={styles.quizBack} onClick={prevStep}>
                ← Назад
              </button>
              <div className={styles.quizTrust}>
                <span>🔒 Конфиденциально</span>
                <span>⚡ Ответ за 15 мин</span>
                <span>🎁 Без обязательств</span>
              </div>
            </>
          )}
        </div>

        {/* Trust line */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              50+ проектов · $2M+ управляемого бюджета · 800%+ средний ROI
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
