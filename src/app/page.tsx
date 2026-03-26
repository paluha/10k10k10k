'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

/* ── Helper: fire FB pixel events ── */
const fbEvent = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof (window as unknown as Record<string, unknown>).fbq === 'function') {
    (window as unknown as { fbq: (type: string, event: string, data?: Record<string, unknown>) => void }).fbq('track', event, data);
  }
};

/* ── Quiz Data ── */
const STEPS = [
  {
    label: 'STEP 1 — YOUR BUSINESS',
    title: 'What is your niche?',
    hint: 'We\'ll match you with a strategy that already worked in your industry',
    options: [
      { emoji: '🛍️', text: 'eCommerce / Online Store', sub: 'Fashion, beauty, accessories, consumer goods' },
      { emoji: '🎓', text: 'Online Education', sub: 'Courses, coaching, webinars, schools' },
      { emoji: '💼', text: 'Services', sub: 'Medical, beauty, legal, home services' },
      { emoji: '🏠', text: 'Real Estate / Auto', sub: 'Developers, agencies, dealerships' },
      { emoji: '🍕', text: 'Food & Delivery', sub: 'Restaurants, catering, delivery apps' },
      { emoji: '📦', text: 'Other', sub: 'We\'ll show you how we can help your niche' },
    ],
  },
  {
    label: 'STEP 2 — CURRENT SITUATION',
    title: 'What\'s your current ad situation?',
    hint: 'This helps us understand where to start working with you',
    options: [
      { emoji: '🚫', text: 'No ads yet', sub: 'Starting from scratch — need strategy, creatives, and setup' },
      { emoji: '📉', text: 'Running ads but losing money', sub: 'Spending budget with few or expensive leads' },
      { emoji: '📊', text: 'Getting results, want to scale', sub: 'It works, but I want x2–x3 without losing profitability' },
      { emoji: '🔄', text: 'Switching agencies', sub: 'Current team isn\'t delivering — need real results' },
    ],
  },
  {
    label: 'STEP 3 — BUDGET',
    title: 'What ad budget are you ready to invest?',
    hint: 'Budget determines scale: we\'ll show how many leads/sales you can expect',
    options: [
      { emoji: '💵', text: 'Up to $500/mo', sub: 'Test run — we\'ll find a winning formula' },
      { emoji: '💸', text: '$500 — $2,000/mo', sub: 'Steady lead flow — optimal starting point' },
      { emoji: '💰', text: '$2,000 — $5,000/mo', sub: 'Scaling mode — systematic revenue growth' },
      { emoji: '🚀', text: '$5,000+/mo', sub: 'Aggressive growth — maximum reach and conversions' },
    ],
  },
  {
    label: 'STEP 4 — PLATFORM',
    title: 'Where do you want to run ads?',
    hint: 'We specialize in Meta (Facebook + Instagram) — that\'s 80% of our case studies',
    options: [
      { emoji: '📘', text: 'Facebook + Instagram', sub: 'Our core platform — deepest expertise' },
      { emoji: '🎵', text: 'TikTok Ads', sub: 'For younger audiences and viral content' },
      { emoji: '🔍', text: 'Google Ads / SEO', sub: 'Search + display ads — high-intent traffic' },
      { emoji: '⚡', text: 'Multiple channels', sub: 'Maximum reach across all platforms' },
    ],
  },
  {
    label: 'STEP 5 — GOAL',
    title: 'What\'s the #1 goal right now?',
    hint: 'We\'ll build the entire strategy around your main objective',
    options: [
      { emoji: '🎯', text: 'Get first leads/sales', sub: 'Launch ads and see results within the first week' },
      { emoji: '📉', text: 'Lower cost per lead', sub: 'Same leads but cheaper — funnel optimization' },
      { emoji: '🔥', text: 'Scale x2–x3', sub: 'Increase volume while keeping profitability' },
      { emoji: '🌍', text: 'Enter a new market', sub: 'Europe, US, or new audience — hypothesis testing' },
    ],
  },
];

/* ── Case Studies ── */
const CASES = [
  {
    name: 'Fire Sushi',
    niche: 'Food Delivery',
    task: 'Attract initial customers to a new sushi delivery service',
    stats: [
      { value: '1,718', label: 'Sales' },
      { value: '$1.21', label: 'Cost / Sale' },
      { value: '823%', label: 'ROI' },
    ],
  },
  {
    name: 'LeoLing',
    niche: 'Language School',
    task: 'Individual lessons & group enrollment — website redesign + funnel',
    stats: [
      { value: '1,009', label: 'Leads' },
      { value: '$3.25', label: 'Cost / Lead' },
      { value: '23%', label: 'Conversion' },
    ],
  },
  {
    name: 'YourCountry',
    niche: 'Employment Agency',
    task: 'European market entry with consistent lead flow',
    stats: [
      { value: '3,345', label: 'Leads' },
      { value: '$1.23', label: 'Cost / Lead' },
      { value: '2,339%', label: 'ROI' },
    ],
  },
  {
    name: 'Gentlemen',
    niche: 'Fashion Brand',
    task: 'Reduce lead cost and increase monthly sales volume',
    stats: [
      { value: '3.7%', label: 'CTR' },
      { value: '11.2%', label: 'Conversion' },
      { value: '$1.20', label: 'Cost / Lead' },
    ],
  },
  {
    name: 'Ocean Sushi',
    niche: 'Food Delivery',
    task: 'Increase purchases and build customer loyalty',
    stats: [
      { value: '$28.5K', label: 'Revenue' },
      { value: '$1.26', label: 'Cost / Sale' },
      { value: '2,599%', label: 'ROAS' },
    ],
  },
  {
    name: 'EnglishWise',
    niche: 'English School',
    task: 'Stable lead flow while maintaining premium positioning',
    stats: [
      { value: '287', label: 'Leads' },
      { value: '$3.20', label: 'Cost / Lead' },
      { value: '62%', label: 'Qualified' },
    ],
  },
];

/* ── Process Steps ── */
const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Audit & Strategy',
    desc: 'We analyze your business, competitors, and audience. Build an ad strategy tailored to your goal — leads, sales, or scale.',
    time: 'Day 1–2',
  },
  {
    num: '02',
    title: 'Creatives & Funnel',
    desc: 'We create 10–30 ad variations (video + images), write converting copy, and set up your landing page.',
    time: 'Day 2–4',
  },
  {
    num: '03',
    title: 'Launch & Test',
    desc: 'We launch campaigns, test audiences, formats, and offers. Find the combinations that deliver the best results.',
    time: 'Day 4–7',
  },
  {
    num: '04',
    title: 'Optimize & Scale',
    desc: 'Kill what doesn\'t work, scale what does. Weekly reports — you see exactly where every dollar goes.',
    time: 'Week 2+',
  },
];

/* ── What's Included ── */
const INCLUDES = [
  { icon: '🎨', title: 'Creative Design', desc: 'Photos, videos, carousels — we create everything, no designer needed' },
  { icon: '✍️', title: 'Copywriting', desc: 'Converting ad copy and landing page text that sells' },
  { icon: '🎯', title: 'Targeting Setup', desc: 'Audience segmentation, lookalikes, retargeting, exclusions' },
  { icon: '📊', title: 'A/B Testing', desc: '100+ variations per campaign — we find the highest-converting formula' },
  { icon: '📈', title: 'Weekly Reports', desc: 'Clear dashboards: spend, leads, conversion, cost — full transparency' },
  { icon: '💬', title: 'Dedicated Manager', desc: 'Direct contact via Telegram/WhatsApp — reply within 1 hour, not tickets' },
  { icon: '🔧', title: 'Technical Setup', desc: 'Pixel, conversions, analytics, UTM tags — we handle all the tech' },
  { icon: '🔄', title: 'Daily Optimization', desc: 'Not "set and forget" — we work on your campaigns every single day' },
];

export default function Home() {
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
    fbEvent('ViewContent', { content_name: 'quiz_opened' });
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

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

    // Parse UTM params
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

    const payload = {
      answers: Object.entries(answers).map(([stepIdx, optIdx]) => ({
        question: STEPS[Number(stepIdx)]?.title,
        answer: STEPS[Number(stepIdx)]?.options[optIdx]?.text,
      })),
      contact: contactForm,
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
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // silent fail
    }

    fbEvent('Lead', { content_name: 'quiz_completed' });
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
            <a href="#process">Process</a>
            <a href="#cases">Cases</a>
            <a href="#includes">Services</a>
            <button className={styles.navCta} onClick={openQuiz}>Get Strategy</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Performance Marketing Agency</div>
          <h1 className={styles.heroTitle}>
            We set up ads that bring <span className={styles.heroHighlight}>sales</span>, not just clicks
          </h1>
          <p className={styles.heroSub}>
            We handle everything: strategy, creatives, launch, and optimization of Facebook &amp; Instagram ads.
            You get leads and sales — we&apos;re accountable for results.
          </p>
          <button className={styles.heroCta} onClick={openQuiz}>
            Get a Custom Strategy — Free
          </button>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>50+</span>
              <span className={styles.heroStatLabel}>Projects Launched</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$2M+</span>
              <span className={styles.heroStatLabel}>Ad Spend Managed</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>800%+</span>
              <span className={styles.heroStatLabel}>Average Client ROI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What You Get</h2>
        <p className={styles.sectionSub}>Not just &quot;ad management&quot; — a complete client acquisition system</p>
        <div className={styles.benefitsGrid}>
          {[
            { icon: '📊', title: 'Transparent Results', desc: 'Weekly reports with ROI, cost per lead, and conversion rate. You know exactly what every client costs.' },
            { icon: '🎯', title: 'Proven Funnels', desc: 'We don\'t experiment with your budget — we use formulas that already delivered results in your niche.' },
            { icon: '⚡', title: 'Launch in 48 Hours', desc: 'First campaigns go live in 2 days. First leads — within the first week.' },
            { icon: '🔬', title: '100+ Creatives Per Project', desc: 'We test dozens of variations to find what converts best for your specific audience.' },
            { icon: '💰', title: 'Focus on Profitability', desc: 'We optimize for revenue and sales, not likes and impressions. Every dollar must come back.' },
            { icon: '💬', title: '24/7 Communication', desc: 'Dedicated manager on Telegram. Reply within 1 hour — not through a ticket system.' },
          ].map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW WE WORK ── */}
      <section id="process" className={styles.section}>
        <h2 className={styles.sectionTitle}>How We Work</h2>
        <p className={styles.sectionSub}>From first call to first leads — 4 simple steps</p>
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

      {/* ── CASES ── */}
      <section id="cases" className={styles.section}>
        <h2 className={styles.sectionTitle}>Real Results</h2>
        <p className={styles.sectionSub}>Not promises — numbers from our clients&apos; ad accounts</p>
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

      {/* ── WHAT'S INCLUDED ── */}
      <section id="includes" className={styles.section}>
        <h2 className={styles.sectionTitle}>What&apos;s Included</h2>
        <p className={styles.sectionSub}>Everything in one package — no need to hire a designer, copywriter, or analyst separately</p>
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

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Find out how many clients we can bring your business</h2>
        <p className={styles.ctaBannerSub}>Take a 60-second quiz — we&apos;ll prepare a custom strategy with projected results</p>
        <button className={styles.heroCta} onClick={openQuiz}>Take the Quiz &amp; Get Your Strategy</button>
      </section>

      {/* ── QUIZ ── */}
      {quizOpen && (
        <section ref={quizRef} id="quiz" className={styles.quizSection}>
          <div className={styles.quizProgress}>
            <span className={styles.quizStepLabel}>STEP {step + 1} of {totalSteps}</span>
            <div className={styles.quizProgressBar}>
              <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={styles.quizCard}>
            {submitted ? (
              <div className={styles.quizThankYou}>
                <span className={styles.quizThankYouIcon}>🎉</span>
                <h2 className={styles.quizThankYouTitle}>Application received!</h2>
                <p className={styles.quizThankYouSub}>
                  Our strategist will reach out within 15 minutes with a personalized ad launch plan for your business.
                </p>
                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(0, 210, 106, 0.08)', borderRadius: '12px', border: '1px solid rgba(0, 210, 106, 0.15)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: 'var(--green)' }}>What happens next:</strong><br />
                    1. Quick call (15 min) — we&apos;ll analyze your situation<br />
                    2. We&apos;ll prepare a strategy with lead projections and budget<br />
                    3. If it&apos;s a fit — ads launch within 48 hours
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
                  Next →
                </button>
                {step > 0 && (
                  <button className={styles.quizBack} onClick={prevStep}>
                    ← Back
                  </button>
                )}
              </>
            ) : (
              <>
                <span className={styles.quizLabel}>STEP 6 — ALMOST DONE</span>
                <h2 className={styles.quizTitle}>
                  Leave your contacts — our strategist will reach out in 15 minutes
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '-16px', marginBottom: '20px', lineHeight: 1.5 }}>
                  On the call, we&apos;ll analyze your situation and prepare a launch plan with lead projections, budget, and timeline. It&apos;s free and no-obligation.
                </p>
                <div className={styles.quizForm}>
                  <input
                    className={styles.quizInput}
                    placeholder="Your name *"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                  <input
                    className={styles.quizInput}
                    placeholder="Phone number *"
                    required
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                  <input
                    className={styles.quizInput}
                    placeholder="Telegram @username (optional)"
                    value={contactForm.telegram}
                    onChange={(e) => setContactForm({ ...contactForm, telegram: e.target.value })}
                  />
                  <button
                    className={`${styles.quizSubmit} ${contactForm.name && contactForm.phone ? styles.quizNextActive : ''}`}
                    onClick={handleSubmit}
                    disabled={!contactForm.name || !contactForm.phone}
                  >
                    Get Free Strategy 🔥
                  </button>
                  <a
                    href="https://wa.me/19293800274?text=Hi!%20I%20want%20to%20learn%20more%20about%20your%20ad%20services"
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
                    💬 Or write us on WhatsApp
                  </a>
                </div>
                <button className={styles.quizBack} onClick={prevStep}>
                  ← Back
                </button>
                <div className={styles.quizTrust}>
                  <span>🔒 Confidential</span>
                  <span>⚡ Reply in 15 min</span>
                  <span>🎁 No obligation</span>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>FAQ</h2>
        <div style={{ maxWidth: '700px', margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { q: 'How much do your services cost?', a: 'Pricing depends on scope and ad budget. On the free consultation, we\'ll analyze your situation and give you an exact quote. Average starts from $500/mo for ad management.' },
            { q: 'When will I see first results?', a: 'First leads come within 3–7 days after launch. Optimization and scaling starts week 2. Steady flow — within 2–4 weeks.' },
            { q: 'What if the ads don\'t work?', a: 'In 50+ projects, we\'ve always found a winning formula. If results don\'t match projections in the first 2 weeks, we revise the strategy at no extra cost.' },
            { q: 'Do I need a website?', a: 'Not necessarily. We can work with your Instagram, WhatsApp, Telegram bot, or create a landing page for you. We\'ll pick the best option on the call.' },
            { q: 'Do you work with small budgets?', a: 'Yes, minimum ad budget is $300/mo. That\'s enough for a test run to find a winning formula.' },
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

      {/* ── FINAL CTA ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Ready to get clients from ads?</h2>
        <p className={styles.ctaBannerSub}>First step — free consultation. No obligation, no pressure. Let&apos;s just analyze your situation.</p>
        <button className={styles.heroCta} onClick={openQuiz}>Book a Free Consultation</button>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.footerLinks}>
            <a href="#process">Process</a>
            <a href="#cases">Cases</a>
            <a href="#includes">Services</a>
            <button className={styles.footerCta} onClick={openQuiz}>Get Strategy</button>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} 10K Traffic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
