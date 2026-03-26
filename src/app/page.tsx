'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

/* ── Quiz Data ── */
const STEPS = [
  {
    label: 'STEP 1 — YOUR PROJECT',
    title: 'What is your niche?',
    options: [
      { emoji: '🛍️', text: 'eCommerce / Product Business' },
      { emoji: '🎓', text: 'Info Business / Online Courses' },
      { emoji: '💼', text: 'Services (Medical, Beauty, Legal)' },
      { emoji: '🏠', text: 'Real Estate / Auto' },
      { emoji: '💰', text: 'Finance / Crypto / Investments' },
      { emoji: '🍕', text: 'Food & Beverage / Delivery' },
    ],
  },
  {
    label: 'STEP 2 — CURRENT SITUATION',
    title: 'What is your current traffic situation?',
    options: [
      { emoji: '🚫', text: 'No ads yet', sub: 'Just getting started' },
      { emoji: '📉', text: "Running ads, but they don't pay off", sub: 'Burning budget with no results' },
      { emoji: '📊', text: 'Getting results, want to scale', sub: 'Ads work, but slowly' },
      { emoji: '🔄', text: 'Want to switch agency', sub: 'Current team is not delivering' },
    ],
  },
  {
    label: 'STEP 3 — BUDGET',
    title: 'What ad budget are you planning?',
    options: [
      { emoji: '💵', text: 'Up to $500/mo' },
      { emoji: '💸', text: '$500 — $2,000/mo' },
      { emoji: '💰', text: '$2,000 — $5,000/mo' },
      { emoji: '🚀', text: '$5,000+/mo' },
    ],
  },
  {
    label: 'STEP 4 — CHANNEL',
    title: 'Where do you plan to run ads?',
    options: [
      { emoji: '📘', text: 'Facebook / Instagram' },
      { emoji: '🎵', text: 'TikTok Ads' },
      { emoji: '🔍', text: 'Google / SEO', sub: 'Search + display ads' },
      { emoji: '⚡', text: 'I want it all', sub: 'Multiple channels at once' },
    ],
  },
  {
    label: 'STEP 5 — GOAL',
    title: 'What is your main goal this month?',
    options: [
      { emoji: '🎯', text: 'Get my first leads' },
      { emoji: '📉', text: 'Lower my cost per lead' },
      { emoji: '🔥', text: 'Scale what already works' },
      { emoji: '🌍', text: 'Expand to new markets', sub: 'New regions & audiences' },
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

export default function Home() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [contactForm, setContactForm] = useState({ name: '', phone: '', telegram: '' });
  const [submitted, setSubmitted] = useState(false);
  const quizRef = useRef<HTMLDivElement>(null);

  const totalSteps = STEPS.length + 1; // +1 for contact form

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
      // silent fail — we'll add proper error handling later
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
            <a href="#cases">Cases</a>
            <a href="#about">About</a>
            <button className={styles.navCta} onClick={openQuiz}>Get Offer</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Meta Ads Agency</div>
          <h1 className={styles.heroTitle}>
            Scaling your client flow <span className={styles.heroHighlight}>x3</span> without losing profitability
          </h1>
          <p className={styles.heroSub}>
            We bring sales, not clicks. Proven results across 50+ businesses.
          </p>
          <button className={styles.heroCta} onClick={openQuiz}>
            Get a Free Strategy Call
          </button>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>50+</span>
              <span className={styles.heroStatLabel}>Projects</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>$2M+</span>
              <span className={styles.heroStatLabel}>Ad Spend Managed</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>800%+</span>
              <span className={styles.heroStatLabel}>Avg. ROI</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why businesses choose us</h2>
        <div className={styles.benefitsGrid}>
          {[
            { icon: '📊', title: 'ROI-Focused', desc: 'We optimize for revenue, not vanity metrics. Every dollar tracked.' },
            { icon: '🎯', title: 'Proven Funnels', desc: 'Battle-tested ad funnels that convert cold traffic into paying customers.' },
            { icon: '⚡', title: 'Fast Launch', desc: 'Campaigns live within 48 hours. No months of "preparation" phase.' },
            { icon: '🔬', title: 'A/B Testing', desc: '100+ creative variations per campaign. We find what works, fast.' },
            { icon: '📱', title: 'Meta Experts', desc: 'Facebook & Instagram ads are our specialty. Deep platform knowledge.' },
            { icon: '💬', title: 'Transparent', desc: 'Weekly reports, real-time dashboards. You see exactly where your money goes.' },
          ].map((b, i) => (
            <div key={i} className={styles.benefitCard}>
              <span className={styles.benefitIcon}>{b.icon}</span>
              <h3 className={styles.benefitTitle}>{b.title}</h3>
              <p className={styles.benefitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CASES ── */}
      <section id="cases" className={styles.section}>
        <h2 className={styles.sectionTitle}>Case Studies</h2>
        <p className={styles.sectionSub}>Real results from real businesses</p>
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

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Ready to scale your results?</h2>
        <p className={styles.ctaBannerSub}>Take a 60-second quiz and get a custom strategy for your business</p>
        <button className={styles.heroCta} onClick={openQuiz}>Start the Quiz</button>
      </section>

      {/* ── QUIZ ── */}
      {quizOpen && (
        <section ref={quizRef} id="quiz" className={styles.quizSection}>
          {/* Progress bar */}
          <div className={styles.quizProgress}>
            <span className={styles.quizStepLabel}>STEP {step + 1} of {totalSteps}</span>
            <div className={styles.quizProgressBar}>
              <div className={styles.quizProgressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={styles.quizCard}>
            {submitted ? (
              /* ── Thank You ── */
              <div className={styles.quizThankYou}>
                <span className={styles.quizThankYouIcon}>🎉</span>
                <h2 className={styles.quizThankYouTitle}>Thank you!</h2>
                <p className={styles.quizThankYouSub}>
                  We&apos;ll get back to you within 15 minutes with a custom strategy.
                </p>
              </div>
            ) : step < STEPS.length ? (
              /* ── Quiz Steps ── */
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
                  Next →
                </button>
                {step > 0 && (
                  <button className={styles.quizBack} onClick={prevStep}>
                    ← Back
                  </button>
                )}
              </>
            ) : (
              /* ── Contact Form (Step 6) ── */
              <>
                <span className={styles.quizLabel}>STEP 6 — YOUR CONTACTS</span>
                <h2 className={styles.quizTitle}>
                  Leave your contacts — and we&apos;ll reach out within 15 minutes
                </h2>
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
                    Book a Free Consultation 🔥
                  </button>
                </div>
                <button className={styles.quizBack} onClick={prevStep}>
                  ← Back
                </button>
                <div className={styles.quizTrust}>
                  <span>🔒 Confidential</span>
                  <span>⚡ Response in 15 min</span>
                  <span>🎁 Free consultation</span>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      <section id="about" className={styles.section}>
        <h2 className={styles.sectionTitle}>About 10K Traffic</h2>
        <div className={styles.aboutContent}>
          <p>
            We are a performance marketing agency specializing in Meta (Facebook & Instagram) advertising.
            Our team has managed over $2M in ad spend across 50+ businesses in eCommerce, services, education,
            real estate, and food delivery.
          </p>
          <p>
            We don&apos;t just run ads — we build complete acquisition systems: from creative strategy and funnel
            design to conversion optimization and scaling. Every campaign is backed by data, tested with 100+
            creative variations, and optimized weekly.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.logo}>10K<span className={styles.logoAccent}>Traffic</span></span>
          <div className={styles.footerLinks}>
            <a href="#cases">Cases</a>
            <a href="#about">About</a>
            <button className={styles.footerCta} onClick={openQuiz}>Get Offer</button>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} 10K Traffic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
