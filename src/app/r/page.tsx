'use client';

import { useState, useRef } from 'react';
import styles from '../page.module.css';

/* ── Данные квиза ── */
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
    task: 'Набор на индивидуальные уроки и групповые курсы — редизайн сайта + воронка',
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

/* ── Процесс работы ── */
const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Аудит и стратегия',
    desc: 'Анализируем ваш бизнес, конкурентов и аудиторию. Строим рекламную стратегию под вашу цель — заявки, продажи или масштаб.',
    time: 'День 1–2',
  },
  {
    num: '02',
    title: 'Креативы и воронка',
    desc: 'Создаём 10–30 вариаций рекламных креативов (видео + изображения), пишем продающие тексты, настраиваем посадочную страницу.',
    time: 'День 2–4',
  },
  {
    num: '03',
    title: 'Запуск и тестирование',
    desc: 'Запускаем кампании, тестируем аудитории, форматы и офферы. Находим связки, которые дают лучший результат.',
    time: 'День 4–7',
  },
  {
    num: '04',
    title: 'Оптимизация и масштаб',
    desc: 'Отключаем то, что не работает, масштабируем лучшие связки. Еженедельные отчёты — вы видите каждый доллар.',
    time: 'Неделя 2+',
  },
];

/* ── Что входит ── */
const INCLUDES = [
  { icon: '🎨', title: 'Дизайн креативов', desc: 'Фото, видео, карусели — мы создаём всё сами, вам не нужен дизайнер' },
  { icon: '✍️', title: 'Копирайтинг', desc: 'Продающие тексты для объявлений и посадочных страниц' },
  { icon: '🎯', title: 'Настройка таргетинга', desc: 'Сегментация аудиторий, lookalike, ретаргетинг, исключения' },
  { icon: '📊', title: 'A/B тестирование', desc: '100+ вариаций на кампанию — находим самую конверсионную связку' },
  { icon: '📈', title: 'Еженедельные отчёты', desc: 'Понятные дашборды: расход, лиды, конверсия, стоимость — всё прозрачно' },
  { icon: '💬', title: 'Личный менеджер', desc: 'На связи в Telegram/WhatsApp — отвечаем в течение часа, не через тикеты' },
  { icon: '🔧', title: 'Техническая настройка', desc: 'Пиксель, конверсии, аналитика, UTM-метки — настроим всё за вас' },
  { icon: '🔄', title: 'Постоянная оптимизация', desc: 'Не просто "запустили и забыли" — работаем с кампаниями каждый день' },
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
            Настраиваем рекламу, которая приносит <span className={styles.heroHighlight}>продажи</span>, а не просто клики
          </h1>
          <p className={styles.heroSub}>
            Мы берём на себя всё: стратегию, креативы, запуск и оптимизацию рекламы в Facebook и Instagram.
            Вы получаете заявки и продажи — мы отвечаем за результат.
          </p>
          <button className={styles.heroCta} onClick={openQuiz}>
            Получить персональную стратегию — бесплатно
          </button>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>50+</span>
              <span className={styles.heroStatLabel}>Проектов запущено</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$2M+</span>
              <span className={styles.heroStatLabel}>Управляемый бюджет</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>800%+</span>
              <span className={styles.heroStatLabel}>Средний ROI клиентов</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ЧТО ВЫ ПОЛУЧИТЕ ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Что вы получите</h2>
        <p className={styles.sectionSub}>Не просто &quot;настройку рекламы&quot; — а полноценную систему привлечения клиентов</p>
        <div className={styles.benefitsGrid}>
          {[
            { icon: '📊', title: 'Прозрачные результаты', desc: 'Еженедельные отчёты с ROI, стоимостью лида и конверсией. Вы точно знаете, сколько стоит каждый клиент.' },
            { icon: '🎯', title: 'Проверенные воронки', desc: 'Мы не экспериментируем на вашем бюджете — используем связки, которые уже принесли результат в вашей нише.' },
            { icon: '⚡', title: 'Запуск за 48 часов', desc: 'Первые рекламные кампании запускаются за 2 дня. Первые заявки — в течение первой недели.' },
            { icon: '🔬', title: '100+ креативов на проект', desc: 'Тестируем десятки вариаций — находим то, что конвертит лучше всего для вашей аудитории.' },
            { icon: '💰', title: 'Фокус на окупаемость', desc: 'Оптимизируем под продажи и доход, а не лайки и просмотры. Каждый доллар должен возвращаться.' },
            { icon: '💬', title: 'Связь 24/7', desc: 'Личный менеджер в Telegram. Ответ в течение часа, а не через тикет-систему на следующий день.' },
          ].map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── КАК МЫ РАБОТАЕМ ── */}
      <section id="process" className={styles.section}>
        <h2 className={styles.sectionTitle}>Как мы работаем</h2>
        <p className={styles.sectionSub}>От первого звонка до первых заявок — 4 простых шага</p>
        <div className={styles.benefitsGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
      <section id="cases" className={styles.section}>
        <h2 className={styles.sectionTitle}>Реальные результаты</h2>
        <p className={styles.sectionSub}>Не обещания — а цифры из рекламных кабинетов наших клиентов</p>
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

      {/* ── ЧТО ВХОДИТ В РАБОТУ ── */}
      <section id="includes" className={styles.section}>
        <h2 className={styles.sectionTitle}>Что входит в стоимость</h2>
        <p className={styles.sectionSub}>Всё включено — вам не нужно нанимать дизайнера, копирайтера или аналитика отдельно</p>
        <div className={styles.benefitsGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
        <button className={styles.heroCta} onClick={openQuiz}>Пройти квиз и получить стратегию</button>
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
                <h2 className={styles.quizThankYouTitle}>Отлично, заявка принята!</h2>
                <p className={styles.quizThankYouSub}>
                  Наш стратег свяжется с вами в течение 15 минут и подготовит персональный план запуска рекламы для вашего бизнеса.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 210, 106, 0.08)', borderRadius: '12px', border: '1px solid rgba(0, 210, 106, 0.15)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: 'var(--green)' }}>Что будет дальше:</strong><br />
                    1. Короткий звонок (15 мин) — разберём вашу ситуацию<br />
                    2. Подготовим стратегию с прогнозом лидов и бюджетом<br />
                    3. Если всё подходит — запускаем рекламу за 48 часов
                  </p>
                </div>
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
        </section>
      )}

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Частые вопросы</h2>
        <div style={{ maxWidth: '700px', margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: 'Сколько стоят ваши услуги?', a: 'Стоимость зависит от объёма работы и рекламного бюджета. На бесплатной консультации мы разберём вашу ситуацию и назовём точную цену. Средний чек — от $500/мес за управление рекламой.' },
            { q: 'Когда будут первые результаты?', a: 'Первые заявки приходят в течение 3–7 дней после запуска. Оптимизация и масштабирование — со 2-й недели. Стабильный поток — через 2–4 недели.' },
            { q: 'Что если реклама не сработает?', a: 'За 50+ проектов у нас не было случая, когда мы не нашли рабочую связку. Если в первые 2 недели результаты не соответствуют прогнозу — пересматриваем стратегию бесплатно.' },
            { q: 'Нужен ли мне сайт?', a: 'Не обязательно. Мы можем работать с Instagram-аккаунтом, WhatsApp, Telegram-ботом или создать лендинг для вас. Подберём лучший вариант на консультации.' },
            { q: 'Вы работаете с маленькими бюджетами?', a: 'Да, минимальный рекламный бюджет — от $300/мес. Этого достаточно для тестового запуска и поиска рабочей связки.' },
          ].map((faq, i) => (
            <details key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0' }}>
              <summary style={{ padding: '18px 20px', cursor: 'pointer', fontSize: '15px', fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {faq.q}
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', flexShrink: 0, marginLeft: '12px' }}>+</span>
              </summary>
              <p style={{ padding: '0 20px 18px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── ФИНАЛЬНЫЙ CTA ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Готовы получать клиентов из рекламы?</h2>
        <p className={styles.ctaBannerSub}>Первый шаг — бесплатная консультация. Без обязательств, без давления. Просто разберём вашу ситуацию.</p>
        <button className={styles.heroCta} onClick={openQuiz}>Записаться на консультацию</button>
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
    </div>
  );
}
