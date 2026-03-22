'use client';

import { useState, useRef } from 'react';
import styles from '../page.module.css';

/* ── Данные квиза ── */
const STEPS = [
  {
    label: 'ШАГ 1 — ВАШ ПРОЕКТ',
    title: 'Какая у вас ниша?',
    options: [
      { emoji: '🛍️', text: 'eCommerce / товарный бизнес' },
      { emoji: '🎓', text: 'Инфобизнес / онлайн-курсы' },
      { emoji: '💼', text: 'Услуги (медицина, красота, юристы)' },
      { emoji: '🏠', text: 'Недвижимость / авто' },
      { emoji: '💰', text: 'Финансы / крипта / инвестиции' },
      { emoji: '🍕', text: 'Еда и напитки / доставка' },
    ],
  },
  {
    label: 'ШАГ 2 — ТЕКУЩАЯ СИТУАЦИЯ',
    title: 'Какая сейчас ситуация с трафиком?',
    options: [
      { emoji: '🚫', text: 'Рекламы ещё нет', sub: 'Только начинаем' },
      { emoji: '📉', text: 'Реклама есть, но не окупается', sub: 'Сливаем бюджет без результата' },
      { emoji: '📊', text: 'Есть результат, хотим масштаб', sub: 'Реклама работает, но медленно' },
      { emoji: '🔄', text: 'Хочу сменить подрядчика', sub: 'Текущий таргетолог не даёт результата' },
    ],
  },
  {
    label: 'ШАГ 3 — БЮДЖЕТ',
    title: 'Какой рекламный бюджет планируете?',
    options: [
      { emoji: '💵', text: 'До $500/мес' },
      { emoji: '💸', text: '$500 — $2,000/мес' },
      { emoji: '💰', text: '$2,000 — $5,000/мес' },
      { emoji: '🚀', text: '$5,000+/мес' },
    ],
  },
  {
    label: 'ШАГ 4 — КАНАЛ',
    title: 'Где планируете запускать рекламу?',
    options: [
      { emoji: '📘', text: 'Facebook / Instagram' },
      { emoji: '🎵', text: 'TikTok Ads' },
      { emoji: '🔍', text: 'Google / SEO', sub: 'Поиск + контекстная реклама' },
      { emoji: '⚡', text: 'Хочу комплексно', sub: 'Несколько каналов сразу' },
    ],
  },
  {
    label: 'ШАГ 5 — ЦЕЛЬ',
    title: 'Какая главная цель на ближайший месяц?',
    options: [
      { emoji: '🎯', text: 'Получить первые заявки' },
      { emoji: '📉', text: 'Снизить стоимость лида' },
      { emoji: '🔥', text: 'Масштабировать то, что уже работает' },
      { emoji: '🌍', text: 'Выйти на Европу', sub: 'Новые рынки и аудитории' },
    ],
  },
];

/* ── Кейсы ── */
const CASES = [
  {
    name: 'Fire Sushi',
    niche: 'Доставка еды',
    task: 'Привлечь первых клиентов в новый сервис доставки суши',
    stats: [
      { value: '1,718', label: 'Продаж' },
      { value: '$1.21', label: 'Цена продажи' },
      { value: '823%', label: 'ROI' },
    ],
  },
  {
    name: 'LeoLing',
    niche: 'Языковая школа',
    task: 'Индивидуальные уроки и набор на групповые курсы — редизайн сайта + воронка',
    stats: [
      { value: '1,009', label: 'Лидов' },
      { value: '$3.25', label: 'Цена лида' },
      { value: '23%', label: 'Конверсия' },
    ],
  },
  {
    name: 'YourCountry',
    niche: 'Трудоустройство',
    task: 'Выход на европейский рынок со стабильным потоком заявок',
    stats: [
      { value: '3,345', label: 'Лидов' },
      { value: '$1.23', label: 'Цена лида' },
      { value: '2,339%', label: 'ROI' },
    ],
  },
  {
    name: 'Gentlemen',
    niche: 'Бренд одежды',
    task: 'Снизить цену лида и увеличить ежемесячный объём продаж',
    stats: [
      { value: '3.7%', label: 'CTR' },
      { value: '11.2%', label: 'Конверсия' },
      { value: '$1.20', label: 'Цена лида' },
    ],
  },
  {
    name: 'Ocean Sushi',
    niche: 'Доставка еды',
    task: 'Увеличить количество покупок и построить лояльность',
    stats: [
      { value: '$28.5K', label: 'Доход' },
      { value: '$1.26', label: 'Цена продажи' },
      { value: '2,599%', label: 'ROAS' },
    ],
  },
  {
    name: 'EnglishWise',
    niche: 'Школа английского',
    task: 'Стабильный поток лидов с сохранением премиум-позиционирования',
    stats: [
      { value: '287', label: 'Лидов' },
      { value: '$3.20', label: 'Цена лида' },
      { value: '62%', label: 'Квалифиц.' },
    ],
  },
];

export default function HomeRu() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [contactForm, setContactForm] = useState({ name: '', phone: '', telegram: '' });
  const [submitted, setSubmitted] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);

  const totalSteps = STEPS.length + 1;

  const openQuiz = () => {
    setQuizOpen(true);
    setStep(0);
    setAnswers({});
    setSubmitted(false);
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const selectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [step]: optionIndex });
  };

  const nextStep = () => {
    if (answers[step] === undefined) return;
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!contactForm.name || !contactForm.phone) return;

    const payload = {
      answers: Object.entries(answers).map(([stepIdx, optIdx]) => ({
        question: STEPS[Number(stepIdx)]?.title,
        answer: STEPS[Number(stepIdx)]?.options[optIdx]?.text,
      })),
      contact: contactForm,
      lang: 'ru',
      timestamp: new Date().toISOString(),
      source: typeof window !== 'undefined' ? window.location.search : '',
    };

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // silent fail
    }

    setSubmitted(true);
  };

  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className={styles.page}>
      {/* ── NAV ── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.navLinks}>
            <a href="#cases">Кейсы</a>
            <a href="#about">О нас</a>
            <button className={styles.navCta} onClick={openQuiz}>Получить оффер</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Агентство Meta Ads</div>
          <h1 className={styles.heroTitle}>
            Масштабируем поток клиентов <span className={styles.heroHighlight}>x3</span> без потери рентабельности
          </h1>
          <p className={styles.heroSub}>
            Мы приносим продажи, а не клики. Проверенные результаты у 50+ бизнесов.
          </p>
          <button className={styles.heroCta} onClick={openQuiz}>
            Бесплатная стратегическая консультация
          </button>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>50+</span>
              <span className={styles.heroStatLabel}>Проектов</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$2M+</span>
              <span className={styles.heroStatLabel}>Рекламного бюджета</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>800%+</span>
              <span className={styles.heroStatLabel}>Средний ROI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ПОЧЕМУ МЫ ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Почему бизнесы выбирают нас</h2>
        <div className={styles.benefitsGrid}>
          {[
            { icon: '📊', title: 'Фокус на ROI', desc: 'Оптимизируем под доход, а не vanity-метрики. Каждый доллар под контролем.' },
            { icon: '🎯', title: 'Проверенные воронки', desc: 'Боевые рекламные воронки, которые превращают холодный трафик в покупателей.' },
            { icon: '⚡', title: 'Быстрый запуск', desc: 'Кампании запускаются за 48 часов. Никаких месяцев "подготовки".' },
            { icon: '🔬', title: 'A/B тестирование', desc: '100+ вариаций креативов на кампанию. Находим то, что работает.' },
            { icon: '📱', title: 'Эксперты Meta', desc: 'Facebook и Instagram реклама — наша специализация. Глубокое знание платформ.' },
            { icon: '💬', title: 'Прозрачность', desc: 'Еженедельные отчёты, дашборды в реальном времени. Вы видите, куда идут деньги.' },
          ].map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КЕЙСЫ ── */}
      <section id="cases" className={styles.section}>
        <h2 className={styles.sectionTitle}>Кейсы</h2>
        <p className={styles.sectionSub}>Реальные результаты реальных бизнесов</p>
        <div className={styles.casesGrid}>
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

      {/* ── CTA БАННЕР ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Готовы масштабировать результаты?</h2>
        <p className={styles.ctaBannerSub}>Пройдите 60-секундный квиз и получите персональную стратегию для вашего бизнеса</p>
        <button className={styles.heroCta} onClick={openQuiz}>Начать квиз</button>
      </section>

      {/* ── КВИЗ ── */}
      {quizOpen && (
        <section ref={quizRef} id="quiz" className={styles.quizSection}>
          <div className={styles.quizProgress}>
            <span className={styles.quizStepLabel}>ШАГ {step + 1} из {totalSteps}</span>
            <div className={styles.quizProgressBar}>
              <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={styles.quizCard}>
            {submitted ? (
              <div className={styles.quizThankYou}>
                <span className={styles.quizThankYouIcon}>🎉</span>
                <h2 className={styles.quizThankYouTitle}>Спасибо!</h2>
                <p className={styles.quizThankYouSub}>
                  Мы свяжемся с вами в течение 15 минут с персональной стратегией.
                </p>
              </div>
            ) : step < STEPS.length ? (
              <>
                <span className={styles.quizLabel}>{STEPS[step].label}</span>
                <h2 className={styles.quizTitle}>{STEPS[step].title}</h2>
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
                <span className={styles.quizLabel}>ШАГ 6 — ВАШИ КОНТАКТЫ</span>
                <h2 className={styles.quizTitle}>
                  Оставьте контакты — и мы свяжемся в течение 15 минут
                </h2>
                <div className={styles.quizForm}>
                  <input
                    className={styles.quizInput}
                    placeholder="Ваше имя"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                  <input
                    className={styles.quizInput}
                    placeholder="+7 / +380 / +49..."
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
                    Записаться на консультацию 🔥
                  </button>
                </div>
                <button className={styles.quizBack} onClick={prevStep}>
                  ← Назад
                </button>
                <div className={styles.quizTrust}>
                  <span>🔒 Конфиденциально</span>
                  <span>⚡ Ответ за 15 мин</span>
                  <span>🎁 Консультация бесплатна</span>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── О НАС ── */}
      <section id="about" className={styles.section}>
        <h2 className={styles.sectionTitle}>О 10K Traffic</h2>
        <div className={styles.aboutContent}>
          <p>
            Мы — агентство перформанс-маркетинга, специализирующееся на рекламе в Meta (Facebook и Instagram).
            Наша команда управляла рекламными бюджетами на сумму более $2M у 50+ бизнесов в сферах eCommerce,
            услуг, образования, недвижимости и доставки еды.
          </p>
          <p>
            Мы не просто запускаем рекламу — мы строим полноценные системы привлечения клиентов: от креативной
            стратегии и дизайна воронок до оптимизации конверсий и масштабирования. Каждая кампания подкреплена
            данными, протестирована 100+ вариациями креативов и оптимизируется еженедельно.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.footerLinks}>
            <a href="#cases">Кейсы</a>
            <a href="#about">О нас</a>
            <button className={styles.footerCta} onClick={openQuiz}>Получить оффер</button>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} 10K Traffic. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
