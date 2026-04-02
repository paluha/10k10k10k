'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../page.module.css';
import { useScrollReveal, useScrollCounter, useSocialProof, useTypingEffect } from '../hooks';

/* ── Helper: fire FB pixel events ── */
const fbEvent = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).fbq === 'function') {
    (window as unknown as { fbq: (type: string, event: string, data?: Record<string, unknown>) => void }).fbq('track', event, data);
  }
};

/* ── Данные квиза (4 вопроса — все необязательные) ── */
const QUIZ_QUESTIONS = [
  {
    key: 'niche',
    title: 'Ниша',
    options: ['eCommerce', 'Образование', 'Услуги', 'Недвижимость', 'Еда/доставка', 'Другое'],
  },
  {
    key: 'budget',
    title: 'Бюджет',
    options: ['До $500/мес', '$500–$2,000', '$2,000–$5,000', '$5,000+'],
  },
  {
    key: 'problem',
    title: 'Ситуация',
    options: ['Рекламы нет', 'Не окупается', 'Хочу масштаб', 'Меняю подрядчика'],
  },
  {
    key: 'source',
    title: 'Трафик',
    options: ['Facebook/Instagram', 'TikTok', 'Google Ads', 'Комплексно'],
  },
];

/* ── Старый формат для API совместимости ── */
const STEPS = QUIZ_QUESTIONS.map((q, i) => ({
  label: `ШАГ ${i + 1}`,
  title: q.title,
  hint: '',
  options: q.options.map(o => ({ emoji: '', text: o, sub: '' })),
}));

/* ── Кейсы ── */
const CASES = [
  { name: 'Fire Sushi', niche: 'Доставка еды', task: 'Привлечь первых клиентов в новый сервис доставки суши', stats: [{ value: '1,718', label: 'Продаж' }, { value: '$1.21', label: 'Цена продажи' }, { value: '823%', label: 'ROI' }] },
  { name: 'LeoLing', niche: 'Языковая школа', task: 'Набор на индивидуальные уроки и групповые курсы — редизайн сайта + воронка', stats: [{ value: '1,009', label: 'Лидов' }, { value: '$3.25', label: 'Цена лида' }, { value: '23%', label: 'Конверсия' }] },
  { name: 'YourCountry', niche: 'Трудоустройство', task: 'Выход на европейский рынок со стабильным потоком заявок', stats: [{ value: '3,345', label: 'Лидов' }, { value: '$1.23', label: 'Цена лида' }, { value: '2,339%', label: 'ROI' }] },
  { name: 'Gentlemen', niche: 'Бренд одежды', task: 'Снизить цену лида и увеличить ежемесячный объём продаж', stats: [{ value: '3.7%', label: 'CTR' }, { value: '11.2%', label: 'Конверсия' }, { value: '$1.20', label: 'Цена лида' }] },
  { name: 'Ocean Sushi', niche: 'Доставка еды', task: 'Увеличить количество покупок и построить лояльность', stats: [{ value: '$28.5K', label: 'Доход' }, { value: '$1.26', label: 'Цена продажи' }, { value: '2,599%', label: 'ROAS' }] },
  { name: 'EnglishWise', niche: 'Школа английского', task: 'Стабильный поток лидов с сохранением премиум-позиционирования', stats: [{ value: '287', label: 'Лидов' }, { value: '$3.20', label: 'Цена лида' }, { value: '62%', label: 'Квалифиц.' }] },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Аудит и стратегия', desc: 'Анализируем ваш бизнес, конкурентов и аудиторию. Строим рекламную стратегию под вашу цель.', time: 'День 1–2' },
  { num: '02', title: 'Креативы и воронка', desc: 'Создаём 10–30 вариаций креативов, пишем продающие тексты, настраиваем посадочную.', time: 'День 2–4' },
  { num: '03', title: 'Запуск и тестирование', desc: 'Запускаем кампании, тестируем аудитории и офферы. Находим лучшие связки.', time: 'День 4–7' },
  { num: '04', title: 'Оптимизация и масштаб', desc: 'Отключаем неработающее, масштабируем лучшее. Еженедельные отчёты.', time: 'Неделя 2+' },
];

const INCLUDES = [
  { icon: '🎨', title: 'Дизайн креативов', desc: 'Фото, видео, карусели — мы создаём всё сами' },
  { icon: '✍️', title: 'Копирайтинг', desc: 'Продающие тексты для объявлений и лендингов' },
  { icon: '🎯', title: 'Настройка таргетинга', desc: 'Сегментация, lookalike, ретаргетинг' },
  { icon: '📊', title: 'A/B тестирование', desc: '100+ вариаций — находим лучшую связку' },
  { icon: '📈', title: 'Еженедельные отчёты', desc: 'Расход, лиды, конверсия — всё прозрачно' },
  { icon: '💬', title: 'Личный менеджер', desc: 'Telegram/WhatsApp — ответ в течение часа' },
  { icon: '🔧', title: 'Техническая настройка', desc: 'Пиксель, конверсии, аналитика, UTM' },
  { icon: '🔄', title: 'Ежедневная оптимизация', desc: 'Работаем с кампаниями каждый день' },
];

/* ── Before/After data ── */
const BEFORE_AFTER = {
  before: { label: 'До', items: ['Нет стратегии — деньги на ветер', 'Дорогие лиды: $15–30', 'Нет понимания что работает', '0 заявок в неделю'] },
  after: { label: 'После 10K Traffic', items: ['Чёткая стратегия под цель', 'Лиды от $1.20', 'Прозрачные отчёты каждую неделю', '50+ заявок в неделю'] },
};

export default function HomeRu() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [contactForm, setContactForm] = useState({ name: '', phone: '', telegram: '' });
  const [submitted, setSubmitted] = useState(false);
  const [shakeNext, setShakeNext] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);
  const contentRef = useScrollReveal();

  const totalSteps = 2; // 2 screens: questions + contacts

  // Animated counters
  const projects = useScrollCounter(50, 1500);
  const budget = useScrollCounter(2, 1500);
  const roi = useScrollCounter(800, 2000);

  // Social proof toasts
  const { toast, hiding } = useSocialProof('ru');

  // Typing effect for hero
  const { displayed: heroTyped, done: typingDone } = useTypingEffect('продажи', 80, 800);

  // Floating CTA on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowFloating(window.scrollY > 600 && !quizOpen);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [quizOpen]);

  const openQuiz = () => {
    setQuizOpen(true);
    setStep(0);
    setAnswers({});
    setSubmitted(false);
    setShowFloating(false);
    fbEvent('ViewContent', { content_name: 'quiz_opened' });
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const selectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [step]: optionIndex });
  };

  const nextStep = () => {
    if (answers[step] === undefined) {
      setShakeNext(true);
      setTimeout(() => setShakeNext(false), 500);
      return;
    }
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
      timestamp: new Date().toISOString(),
      source: typeof window !== 'undefined' ? window.location.pathname : '',
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
      await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch { /* silent */ }

    fbEvent('Lead', { content_name: 'quiz_completed' });
    setSubmitted(true);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className={styles.page} ref={contentRef}>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.navLinks}>
            <a href="#process">Процесс</a>
            <a href="#cases">Кейсы</a>
            <a href="#includes">Услуги</a>
            <button className={styles.navCta} onClick={openQuiz}>Получить стратегию</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Агентство performance-маркетинга</div>
          <h1 className={styles.heroTitle}>
            Настраиваем рекламу, которая приносит{' '}
            <span className={styles.heroHighlight}>
              {heroTyped}{!typingDone && <span className="typing-cursor" />}
            </span>
            {typingDone && ', а не просто клики'}
          </h1>
          <p className={styles.heroSub}>
            Мы берём на себя всё: стратегию, креативы, запуск и оптимизацию рекламы в Facebook и Instagram.
            Вы получаете заявки и продажи — мы отвечаем за результат.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button className={`${styles.heroCta} cta-pulse`} onClick={openQuiz}>
              Получить персональную стратегию — бесплатно
            </button>
            <span className="urgency-badge">
              <span className="dot" />
              Осталось 3 места на эту неделю
            </span>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum} ref={projects.ref}>{projects.count}+</span>
              <span className={styles.heroStatLabel}>Проектов запущено</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum} ref={budget.ref}>${budget.count}M+</span>
              <span className={styles.heroStatLabel}>Управляемый бюджет</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum} ref={roi.ref}>{roi.count}%+</span>
              <span className={styles.heroStatLabel}>Средний ROI клиентов</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ЧТО ВЫ ПОЛУЧИТЕ ── */}
      <section className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Что вы получите</h2>
        <p className={styles.sectionSub}>Не просто &quot;настройку рекламы&quot; — а полноценную систему привлечения клиентов</p>
        <div className={`${styles.benefitsGrid} stagger-children`}>
          {[
            { icon: '📊', title: 'Прозрачные результаты', desc: 'Еженедельные отчёты с ROI, стоимостью лида и конверсией. Вы точно знаете, сколько стоит каждый клиент.' },
            { icon: '🎯', title: 'Проверенные воронки', desc: 'Мы не экспериментируем на вашем бюджете — используем связки, которые уже принесли результат.' },
            { icon: '⚡', title: 'Запуск за 48 часов', desc: 'Первые кампании запускаются за 2 дня. Первые заявки — в течение первой недели.' },
            { icon: '🔬', title: '100+ креативов на проект', desc: 'Тестируем десятки вариаций — находим то, что конвертит лучше всего.' },
            { icon: '💰', title: 'Фокус на окупаемость', desc: 'Оптимизируем под продажи и доход, а не лайки и просмотры.' },
            { icon: '💬', title: 'Связь 24/7', desc: 'Личный менеджер в Telegram. Ответ в течение часа.' },
          ].map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Было → Стало</h2>
        <p className={styles.sectionSub}>Разница между &quot;сам настроил&quot; и работой с агентством</p>
        <div style={{ maxWidth: '800px', margin: '40px auto 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0a0a, #1a0808)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff4444', textTransform: 'uppercase', letterSpacing: '1px' }}>❌ {BEFORE_AFTER.before.label}</span>
            {BEFORE_AFTER.before.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span style={{ color: '#ff4444', fontSize: '16px' }}>✕</span>
                {item}
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, #0a1a0f, #081a0d)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ {BEFORE_AFTER.after.label}</span>
            {BEFORE_AFTER.after.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text)' }}>
                <span style={{ color: 'var(--green)', fontSize: '16px' }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── КАК МЫ РАБОТАЕМ ── */}
      <section id="process" className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Как мы работаем</h2>
        <p className={styles.sectionSub}>От первого звонка до первых заявок — 4 простых шага</p>
        <div className={`${styles.benefitsGrid} stagger-children`} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {PROCESS_STEPS.map((s, i) => (
            <div key={i} className={styles.benefitCard} style={{ position: 'relative' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--green)', opacity: 0.3, position: 'absolute', top: '20px', right: '20px' }}>{s.num}</span>
              <span className={styles.benefitIcon} style={{ fontSize: '12px', color: 'var(--green)', background: 'var(--green-glow)', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>{s.time}</span>
              <h3 className={styles.benefitTitle}>{s.title}</h3>
              <p className={styles.benefitDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КЕЙСЫ ── */}
      <section id="cases" className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Реальные результаты</h2>
        <p className={styles.sectionSub}>Не обещания — а цифры из рекламных кабинетов наших клиентов</p>
        <div className={`${styles.casesGrid} stagger-children`}>
          {CASES.map((c, i) => (
            <div key={i} className={styles.caseCard}>
              <div className={styles.caseHeader}>
                <h3 className={styles.caseName}>{c.name}</h3>
                <span className={styles.caseNiche}>{c.niche}</span>
              </div>
              <p className={styles.caseTask}>{c.task}</p>
              <div className={styles.caseStats}>
                {c.stats.map((s, j) => (
                  <div key={j} className={styles.caseStat}>
                    <span className={styles.caseStatValue}>{s.value}</span>
                    <span className={styles.caseStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ЧТО ВХОДИТ В РАБОТУ ── */}
      <section id="includes" className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Что входит в стоимость</h2>
        <p className={styles.sectionSub}>Всё включено — вам не нужно нанимать дизайнера, копирайтера или аналитика отдельно</p>
        <div className={`${styles.benefitsGrid} stagger-children`} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {INCLUDES.map((item, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{item.icon}</span>
              <h3 className={styles.benefitTitle}>{item.title}</h3>
              <p className={styles.benefitDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA БАННЕР ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Узнайте, сколько клиентов мы можем привести вашему бизнесу</h2>
        <p className={styles.ctaBannerSub}>Пройдите 60-секундный квиз — и мы подготовим персональную стратегию с прогнозом результатов</p>
        <button className={`${styles.heroCta} cta-pulse`} onClick={openQuiz}>Пройти квиз и получить стратегию</button>
      </section>

      {/* ── КВИЗ (2 экрана) ── */}
      {quizOpen && (
        <section ref={quizRef} id="quiz" className={styles.quizSection}>
          {/* Progress */}
          <div className={styles.quizProgress}>
            <div className={styles.quizProgressBar}>
              <div className={styles.quizProgressFill} style={{ width: step === 0 ? '50%' : submitted ? '100%' : '90%' }} />
            </div>
          </div>

          <div className={styles.quizCard}>
            {submitted ? (
              <div className={styles.quizThankYou}>
                <span className={styles.quizThankYouIcon}>🎉</span>
                <h2 className={styles.quizThankYouTitle}>Отлично, заявка принята!</h2>
                <p className={styles.quizThankYouSub}>
                  Наш стратег свяжется с вами в течение 15 минут.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 210, 106, 0.08)', borderRadius: '12px', border: '1px solid rgba(0, 210, 106, 0.15)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: 'var(--green)' }}>Что будет дальше:</strong><br />
                    1. Короткий звонок (15 мин) — разберём ситуацию<br />
                    2. Подготовим стратегию с прогнозом лидов<br />
                    3. Запускаем рекламу за 48 часов
                  </p>
                </div>
              </div>
            ) : step === 0 ? (
              /* ═══ ЭКРАН 1: 4 вопроса на одном экране (все необязательные) ═══ */
              <>
                <h2 className={styles.quizTitle}>Расскажите о вашем бизнесе</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '20px' }}>
                  Необязательно — но поможет подготовить точную стратегию
                </p>

                {QUIZ_QUESTIONS.map((q, qIdx) => (
                  <div key={q.key} style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{q.title}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswers(prev => ({ ...prev, [qIdx]: i }))}
                          style={{
                            padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                            border: answers[qIdx] === i ? '2px solid var(--green)' : '1px solid var(--border)',
                            background: answers[qIdx] === i ? 'rgba(0, 210, 106, 0.08)' : 'var(--bg-option)',
                            color: answers[qIdx] === i ? 'var(--green)' : 'var(--text)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className={`${styles.quizNext} ${styles.quizNextActive}`}
                  onClick={() => { fbEvent('ViewContent', { content_name: 'quiz_step_2' }); setStep(1); }}
                >
                  Далее →
                </button>
              </>
            ) : (
              /* ═══ ЭКРАН 2: Контакты ═══ */
              <>
                <h2 className={styles.quizTitle}>
                  Оставьте контакты — стратег свяжется за 15 минут
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '20px', lineHeight: 1.5 }}>
                  Бесплатно и ни к чему не обязывает.
                </p>
                <div className={styles.quizForm}>
                  <input className={styles.quizInput} placeholder="Ваше имя *" required
                    autoComplete="given-name" name="name"
                    value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                  <input className={styles.quizInput} placeholder="Номер телефона *" required type="tel"
                    autoComplete="tel" name="phone"
                    value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                  <input className={styles.quizInput} placeholder="Telegram @ник (необязательно)"
                    value={contactForm.telegram} onChange={(e) => setContactForm({ ...contactForm, telegram: e.target.value })} />
                  <button
                    className={`${styles.quizSubmit} ${contactForm.name && contactForm.phone ? styles.quizNextActive : ''}`}
                    onClick={handleSubmit}
                    disabled={!contactForm.name || !contactForm.phone}
                  >
                    Получить стратегию бесплатно 🔥
                  </button>
                  <a
                    href="https://wa.me/19293800274?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C%20%D0%BF%D0%BE%D0%B4%D1%80%D0%BE%D0%B1%D0%BD%D0%B5%D0%B5"
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', borderRadius: '12px', background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.2)', color: '#25D366', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    💬 Или напишите нам в WhatsApp
                  </a>
                </div>
                <button className={styles.quizBack} onClick={() => setStep(0)}>← Назад</button>
                <div className={styles.quizTrust}>
                  <span>🔒 Конфиденциально</span>
                  <span>⚡ Ответ за 15 мин</span>
                  <span>🎁 Без обязательств</span>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── КРЕАТИВЫ КАРУСЕЛЬ ── */}
      <section className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Примеры креативов</h2>
        <p className={styles.sectionSub}>Мы создаём рекламные материалы которые конвертят</p>
        <div style={{ overflow: 'hidden', position: 'relative', marginTop: '32px' }}>
          <div style={{
            display: 'flex', gap: '16px', animation: 'scrollCreatives 20s linear infinite',
            width: 'max-content',
          }}>
            {[...Array(2)].map((_, dupeIdx) => (
              [
                { title: 'eCommerce — Реклама товара', desc: 'Карусель + видео для Instagram', color: '#3b82f6' },
                { title: 'Услуги — Генерация лидов', desc: 'Stories + Reels формат', color: '#8b5cf6' },
                { title: 'Еда — Доставка', desc: 'Промо-ролик + геотаргетинг', color: '#ef4444' },
                { title: 'Образование — Набор студентов', desc: 'Lead form + Landing page', color: '#f59e0b' },
                { title: 'Недвижимость — Лиды', desc: 'Каталог + ретаргетинг', color: '#10b981' },
                { title: 'Бренд одежды — Продажи', desc: 'Lookbook + динамический каталог', color: '#ec4899' },
              ].map((item, i) => (
                <div key={`${dupeIdx}-${i}`} style={{
                  minWidth: '260px', padding: '24px', borderRadius: '14px',
                  background: `linear-gradient(135deg, ${item.color}15, ${item.color}05)`,
                  border: `1px solid ${item.color}20`,
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px' }}>🎨</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{item.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              ))
            ))}
          </div>
        </div>
        <style>{`
          @keyframes scrollCreatives {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </section>

      {/* ── FAQ ── */}
      <section className={`${styles.section} fade-in-up`}>
        <h2 className={styles.sectionTitle}>Частые вопросы</h2>
        <div style={{ maxWidth: '700px', margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: 'Сколько стоят ваши услуги?', a: 'Стоимость зависит от объёма работы и рекламного бюджета. На бесплатной консультации мы разберём вашу ситуацию и назовём точную цену. Средний чек — от $500/мес.' },
            { q: 'Когда будут первые результаты?', a: 'Первые заявки — 3–7 дней после запуска. Оптимизация — со 2-й недели. Стабильный поток — через 2–4 недели.' },
            { q: 'Что если реклама не сработает?', a: 'За 50+ проектов мы всегда находили рабочую связку. Если в первые 2 недели результаты не соответствуют прогнозу — пересматриваем стратегию бесплатно.' },
            { q: 'Нужен ли мне сайт?', a: 'Не обязательно. Можем работать с Instagram, WhatsApp, Telegram-ботом или создать лендинг для вас.' },
            { q: 'Вы работаете с маленькими бюджетами?', a: 'Да, минимум — от $300/мес. Достаточно для тестового запуска.' },
          ].map((faq, i) => (
            <details key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <summary style={{ padding: '18px 20px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>+</span>
              </summary>
              <p style={{ padding: '0 20px 18px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── ФИНАЛЬНЫЙ CTA ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Готовы получать клиентов из рекламы?</h2>
        <p className={styles.ctaBannerSub}>Первый шаг — бесплатная консультация. Без обязательств.</p>
        <button className={`${styles.heroCta} cta-pulse`} onClick={openQuiz}>Записаться на консультацию</button>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.footerLinks}>
            <a href="#process">Процесс</a>
            <a href="#cases">Кейсы</a>
            <a href="#includes">Услуги</a>
            <button className={styles.footerCta} onClick={openQuiz}>Получить стратегию</button>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} 10K Traffic. Все права защищены.</p>
        </div>
      </footer>

      {/* ── FLOATING CTA (mobile) ── */}
      <div className={`floating-cta ${showFloating ? 'show' : ''}`}>
        <button className={`${styles.heroCta} cta-pulse`} onClick={openQuiz} style={{ width: '100%', fontSize: '15px', padding: '14px' }}>
          Получить стратегию — бесплатно
        </button>
      </div>

      {/* ── SOCIAL PROOF TOAST ── */}
      {toast && (
        <div className={`social-toast ${hiding ? 'hiding' : ''}`}>
          <span style={{ fontSize: '24px' }}>✅</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{toast.name} из {toast.city}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{toast.action} — только что</div>
          </div>
        </div>
      )}
    </div>
  );
}
