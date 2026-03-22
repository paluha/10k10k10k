'use client';

import { useState, useRef } from 'react';
import styles from '../page.module.css';

/* ── Данные квиза ── */
const STEPS = [
  {
    label: 'КРОК 1 — ВАШ ПРОЄКТ',
    title: 'Яка у вас ніша?',
    options: [
      { emoji: '🛍️', text: 'eCommerce / товарний бізнес' },
      { emoji: '🎓', text: 'Інфобізнес / онлайн-курси' },
      { emoji: '💼', text: 'Послуги (медицина, краса, юристи)' },
      { emoji: '🏠', text: 'Нерухомість / авто' },
      { emoji: '💰', text: 'Фінанси / крипта / інвестиції' },
      { emoji: '🍕', text: 'Їжа та напої / доставка' },
    ],
  },
  {
    label: 'КРОК 2 — ПОТОЧНА СИТУАЦІЯ',
    title: 'Яка зараз ситуація з трафіком?',
    options: [
      { emoji: '🚫', text: 'Реклами ще немає', sub: 'Тільки починаємо' },
      { emoji: '📉', text: 'Реклама є, але не окупається', sub: 'Зливаємо бюджет без результату' },
      { emoji: '📊', text: 'Є результат, хочемо масштаб', sub: 'Реклама працює, але повільно' },
      { emoji: '🔄', text: 'Хочу змінити підрядника', sub: 'Поточний таргетолог не дає результату' },
    ],
  },
  {
    label: 'КРОК 3 — БЮДЖЕТ',
    title: 'Який рекламний бюджет плануєте?',
    options: [
      { emoji: '💵', text: 'До $500/міс' },
      { emoji: '💸', text: '$500 — $2,000/міс' },
      { emoji: '💰', text: '$2,000 — $5,000/міс' },
      { emoji: '🚀', text: '$5,000+/міс' },
    ],
  },
  {
    label: 'КРОК 4 — КАНАЛ',
    title: 'Де плануєте запускати рекламу?',
    options: [
      { emoji: '📘', text: 'Facebook / Instagram' },
      { emoji: '🎵', text: 'TikTok Ads' },
      { emoji: '🔍', text: 'Google / SEO', sub: 'Пошук + контекстна реклама' },
      { emoji: '⚡', text: 'Хочу комплексно', sub: 'Кілька каналів одразу' },
    ],
  },
  {
    label: 'КРОК 5 — ЦІЛЬ',
    title: 'Яка головна ціль на найближчий місяць?',
    options: [
      { emoji: '🎯', text: 'Отримати перші заявки' },
      { emoji: '📉', text: 'Знизити вартість ліда' },
      { emoji: '🔥', text: 'Масштабувати те, що вже працює' },
      { emoji: '🌍', text: 'Вийти на Європу', sub: 'Нові ринки та аудиторії' },
    ],
  },
];

/* ── Кейси ── */
const CASES = [
  {
    name: 'Fire Sushi',
    niche: 'Доставка їжі',
    task: 'Залучити перших клієнтів до нового сервісу доставки суші',
    stats: [
      { value: '1,718', label: 'Продажів' },
      { value: '$1.21', label: 'Ціна продажу' },
      { value: '823%', label: 'ROI' },
    ],
  },
  {
    name: 'LeoLing',
    niche: 'Мовна школа',
    task: 'Індивідуальні уроки та набір на групові курси — редизайн сайту + воронка',
    stats: [
      { value: '1,009', label: 'Лідів' },
      { value: '$3.25', label: 'Ціна ліда' },
      { value: '23%', label: 'Конверсія' },
    ],
  },
  {
    name: 'YourCountry',
    niche: 'Працевлаштування',
    task: 'Вихід на європейський ринок зі стабільним потоком заявок',
    stats: [
      { value: '3,345', label: 'Лідів' },
      { value: '$1.23', label: 'Ціна ліда' },
      { value: '2,339%', label: 'ROI' },
    ],
  },
  {
    name: 'Gentlemen',
    niche: 'Бренд одягу',
    task: 'Знизити ціну ліда та збільшити щомісячний обсяг продажів',
    stats: [
      { value: '3.7%', label: 'CTR' },
      { value: '11.2%', label: 'Конверсія' },
      { value: '$1.20', label: 'Ціна ліда' },
    ],
  },
  {
    name: 'Ocean Sushi',
    niche: 'Доставка їжі',
    task: 'Збільшити кількість покупок та побудувати лояльність',
    stats: [
      { value: '$28.5K', label: 'Дохід' },
      { value: '$1.26', label: 'Ціна продажу' },
      { value: '2,599%', label: 'ROAS' },
    ],
  },
  {
    name: 'EnglishWise',
    niche: 'Школа англійської',
    task: 'Стабільний потік лідів зі збереженням преміум-позиціонування',
    stats: [
      { value: '287', label: 'Лідів' },
      { value: '$3.20', label: 'Ціна ліда' },
      { value: '62%', label: 'Кваліфіков.' },
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
            <a href="#cases">Кейси</a>
            <a href="#about">Про нас</a>
            <button className={styles.navCta} onClick={openQuiz}>Отримати оффер</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Агентство Meta Ads</div>
          <h1 className={styles.heroTitle}>
            Масштабуємо потік клієнтів <span className={styles.heroHighlight}>x3</span> без втрати рентабельності
          </h1>
          <p className={styles.heroSub}>
            Ми приносимо продажі, а не кліки. Перевірені результати у 50+ бізнесів.
          </p>
          <button className={styles.heroCta} onClick={openQuiz}>
            Безкоштовна стратегічна консультація
          </button>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>50+</span>
              <span className={styles.heroStatLabel}>Проєктів</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$2M+</span>
              <span className={styles.heroStatLabel}>Рекламного бюджету</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>800%+</span>
              <span className={styles.heroStatLabel}>Середній ROI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ЧОМУ МИ ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Чому бізнеси обирають нас</h2>
        <div className={styles.benefitsGrid}>
          {[
            { icon: '📊', title: 'Фокус на ROI', desc: 'Оптимізуємо під дохід, а не vanity-метрики. Кожен долар під контролем.' },
            { icon: '🎯', title: 'Перевірені воронки', desc: 'Бойові рекламні воронки, які перетворюють холодний трафік у покупців.' },
            { icon: '⚡', title: 'Швидкий запуск', desc: 'Кампанії запускаються за 48 годин. Ніяких місяців "підготовки".' },
            { icon: '🔬', title: 'A/B тестування', desc: '100+ варіацій креативів на кампанію. Знаходимо те, що працює.' },
            { icon: '📱', title: 'Експерти Meta', desc: 'Facebook та Instagram реклама — наша спеціалізація. Глибоке знання платформ.' },
            { icon: '💬', title: 'Прозорість', desc: 'Щотижневі звіти, дашборди в реальному часі. Ви бачите, куди йдуть гроші.' },
          ].map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КЕЙСИ ── */}
      <section id="cases" className={styles.section}>
        <h2 className={styles.sectionTitle}>Кейси</h2>
        <p className={styles.sectionSub}>Реальні результати реальних бізнесів</p>
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
        <h2 className={styles.ctaBannerTitle}>Готові масштабувати результати?</h2>
        <p className={styles.ctaBannerSub}>Пройдіть 60-секундний квіз і отримайте персональну стратегію для вашого бізнесу</p>
        <button className={styles.heroCta} onClick={openQuiz}>Почати квіз</button>
      </section>

      {/* ── КВІЗ ── */}
      {quizOpen && (
        <section ref={quizRef} id="quiz" className={styles.quizSection}>
          <div className={styles.quizProgress}>
            <span className={styles.quizStepLabel}>КРОК {step + 1} з {totalSteps}</span>
            <div className={styles.quizProgressBar}>
              <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={styles.quizCard}>
            {submitted ? (
              <div className={styles.quizThankYou}>
                <span className={styles.quizThankYouIcon}>🎉</span>
                <h2 className={styles.quizThankYouTitle}>Дякуємо!</h2>
                <p className={styles.quizThankYouSub}>
                  Ми зв&apos;яжемось з вами протягом 15 хвилин з персональною стратегією.
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
                  Далі →
                </button>
                {step > 0 && (
                  <button className={styles.quizBack} onClick={prevStep}>
                    ← Назад
                  </button>
                )}
              </>
            ) : (
              <>
                <span className={styles.quizLabel}>КРОК 6 — ВАШІ КОНТАКТИ</span>
                <h2 className={styles.quizTitle}>
                  Залишіть контакти — і ми зв&apos;яжемось протягом 15 хвилин
                </h2>
                <div className={styles.quizForm}>
                  <input
                    className={styles.quizInput}
                    placeholder="Ваше ім'я"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                  <input
                    className={styles.quizInput}
                    placeholder="+380 / +49..."
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                  <input
                    className={styles.quizInput}
                    placeholder="Telegram @нікнейм (необов'язково)"
                    value={contactForm.telegram}
                    onChange={(e) => setContactForm({ ...contactForm, telegram: e.target.value })}
                  />
                  <button
                    className={`${styles.quizSubmit} ${contactForm.name && contactForm.phone ? styles.quizNextActive : ''}`}
                    onClick={handleSubmit}
                    disabled={!contactForm.name || !contactForm.phone}
                  >
                    Записатись на консультацію 🔥
                  </button>
                </div>
                <button className={styles.quizBack} onClick={prevStep}>
                  ← Назад
                </button>
                <div className={styles.quizTrust}>
                  <span>🔒 Конфіденційно</span>
                  <span>⚡ Відповідь за 15 хв</span>
                  <span>🎁 Консультація безкоштовна</span>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── ПРО НАС ── */}
      <section id="about" className={styles.section}>
        <h2 className={styles.sectionTitle}>Про 10K Traffic</h2>
        <div className={styles.aboutContent}>
          <p>
            Ми — агентство перформанс-маркетингу, що спеціалізується на рекламі в Meta (Facebook та Instagram).
            Наша команда керувала рекламними бюджетами на суму понад $2M у 50+ бізнесів у сферах eCommerce,
            послуг, освіти, нерухомості та доставки їжі.
          </p>
          <p>
            Ми не просто запускаємо рекламу — ми будуємо повноцінні системи залучення клієнтів: від креативної
            стратегії та дизайну воронок до оптимізації конверсій та масштабування. Кожна кампанія підкріплена
            даними, протестована 100+ варіаціями креативів та оптимізується щотижня.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.footerLinks}>
            <a href="#cases">Кейси</a>
            <a href="#about">Про нас</a>
            <button className={styles.footerCta} onClick={openQuiz}>Отримати оффер</button>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} 10K Traffic. Всі права захищені.</p>
        </div>
      </footer>
    </div>
  );
}
