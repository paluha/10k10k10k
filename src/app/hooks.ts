'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Intersection Observer for scroll animations ── */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    // Observe the element itself
    if (el.classList.contains('fade-in-up') || el.classList.contains('stagger-children')) {
      observer.observe(el);
    }

    // Observe children with fade-in-up
    el.querySelectorAll('.fade-in-up, .stagger-children').forEach((child) => {
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ── Animated counter ── */
export function useCounter(end: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let raf: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return count;
}

/* ── Counter that triggers on scroll ── */
export function useScrollCounter(end: number, duration = 2000) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(end, duration, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, count };
}

/* ── Social proof toast ── */
const SOCIAL_PROOF_RU = [
  { name: 'Анна', city: 'Киев', action: 'получила стратегию' },
  { name: 'Дмитрий', city: 'Москва', action: 'запустил рекламу' },
  { name: 'Марина', city: 'Варшава', action: 'получила первые заявки' },
  { name: 'Алексей', city: 'Берлин', action: 'масштабировал x3' },
  { name: 'Ольга', city: 'Прага', action: 'снизила цену лида' },
  { name: 'Игорь', city: 'Тбилиси', action: 'получил стратегию' },
  { name: 'Светлана', city: 'Рига', action: 'запустила рекламу' },
];

const SOCIAL_PROOF_EN = [
  { name: 'Sarah', city: 'New York', action: 'got her strategy' },
  { name: 'James', city: 'London', action: 'launched ads' },
  { name: 'Maria', city: 'Toronto', action: 'got first leads' },
  { name: 'David', city: 'Miami', action: 'scaled x3' },
  { name: 'Emily', city: 'Chicago', action: 'lowered CPL' },
  { name: 'Michael', city: 'LA', action: 'got his strategy' },
  { name: 'Lisa', city: 'Austin', action: 'launched campaigns' },
];

export function useSocialProof(lang: 'ru' | 'en' = 'en') {
  const [toast, setToast] = useState<{ name: string; city: string; action: string } | null>(null);
  const [hiding, setHiding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const pool = lang === 'ru' ? SOCIAL_PROOF_RU : SOCIAL_PROOF_EN;

  const showToast = useCallback(() => {
    const item = pool[Math.floor(Math.random() * pool.length)];
    setToast(item);
    setHiding(false);

    // Hide after 4s
    timeoutRef.current = setTimeout(() => {
      setHiding(true);
      // Remove after animation
      setTimeout(() => setToast(null), 500);
    }, 4000);
  }, [pool]);

  useEffect(() => {
    // First toast after 8s
    const firstTimeout = setTimeout(showToast, 8000);

    // Subsequent toasts every 15-25s
    const interval = setInterval(showToast, 15000 + Math.random() * 10000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showToast]);

  return { toast, hiding };
}

/* ── Typing effect ── */
export function useTypingEffect(text: string, speed = 50, delay = 500) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayed, done };
}
