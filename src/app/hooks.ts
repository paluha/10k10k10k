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
  { name: 'Анна', city: 'Нью-Йорк', action: 'начала работу — eCommerce' },
  { name: 'Дмитрий', city: 'Майами', action: 'взял бесплатную стратегию — услуги' },
  { name: 'Марина', city: 'Чикаго', action: 'начала работу — онлайн-образование' },
  { name: 'Алексей', city: 'Лос-Анджелес', action: 'взял бесплатную стратегию — недвижимость' },
  { name: 'Ольга', city: 'Хьюстон', action: 'начала работу — доставка еды' },
  { name: 'Игорь', city: 'Бостон', action: 'взял бесплатную стратегию — финансы' },
  { name: 'Светлана', city: 'Сиэтл', action: 'начала работу — красота' },
  { name: 'Максим', city: 'Даллас', action: 'взял бесплатную стратегию — eCommerce' },
  { name: 'Екатерина', city: 'Сан-Франциско', action: 'начала работу — услуги' },
];

const SOCIAL_PROOF_EN = [
  { name: 'Sarah', city: 'New York', action: 'started working — eCommerce' },
  { name: 'James', city: 'Miami', action: 'got free strategy — services' },
  { name: 'Maria', city: 'Chicago', action: 'started working — education' },
  { name: 'David', city: 'Los Angeles', action: 'got free strategy — real estate' },
  { name: 'Emily', city: 'Houston', action: 'started working — food delivery' },
  { name: 'Michael', city: 'Boston', action: 'got free strategy — finance' },
  { name: 'Lisa', city: 'Seattle', action: 'started working — beauty' },
  { name: 'Chris', city: 'Dallas', action: 'got free strategy — eCommerce' },
  { name: 'Jessica', city: 'San Francisco', action: 'started working — services' },
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
