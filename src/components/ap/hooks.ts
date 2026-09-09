/**
 * Behaviour shared across the landing page: off-screen animation parking, the
 * gated hero parallax, the scroll-tracked active section, and a focus trap for
 * the modal.
 *
 * All of these are effects over the DOM the components have already rendered,
 * so they live here rather than inside any one component.
 */

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';

import { SECTION_KEYS, type SectionKey } from './personalisation';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Parks every looping animation that is off screen.
 *
 * Each animated container carries `data-yz-anim`; a single IntersectionObserver
 * with a 160px margin toggles `data-yz-paused`, which the stylesheet turns into
 * `animation-play-state: paused`. Seven containers hold 31 infinite animations,
 * so without this the whole set repaints continuously for the session — real
 * INP cost on a mid-range phone, on a page paid traffic lands on.
 *
 * Containers are re-scanned after every render (personalisation swaps them in
 * and out), with a WeakSet guarding against double-observation.
 */
export function useAnimationPause(): void {
  const observed = useRef<WeakSet<Element>>(new WeakSet());
  const observer = useRef<IntersectionObserver | null>(null);

  // Deliberately no dependency array: new panels appear whenever the ERP
  // selection rewrites a feature card, and they must be picked up too.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    if (!observer.current) {
      observer.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) entry.target.removeAttribute('data-yz-paused');
            else entry.target.setAttribute('data-yz-paused', '');
          }
        },
        { rootMargin: '160px 0px', threshold: 0 },
      );
    }

    for (const el of document.querySelectorAll('[data-yz-anim]')) {
      if (observed.current.has(el)) continue;
      observed.current.add(el);
      // Start parked; the observer un-parks whatever is actually on screen.
      el.setAttribute('data-yz-paused', '');
      observer.current.observe(el);
    }
  });

  useEffect(() => () => observer.current?.disconnect(), []);
}

/**
 * Writes `--mx` / `--my` on the hero from pointer position, normalised to
 * −0.5…0.5 and throttled through requestAnimationFrame.
 *
 * Gated off entirely on coarse pointers, under 1024px and when the visitor
 * asked for reduced motion — there is no point paying for a parallax nobody
 * can aim.
 */
export function useHeroParallax(ref: RefObject<HTMLElement>) {
  const enabled = useRef(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const mq = (q: string) =>
      typeof window.matchMedia === 'function' && window.matchMedia(q).matches;

    enabled.current =
      mq('(pointer: fine)') && !prefersReducedMotion() && window.innerWidth >= 1024;

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onMouseMove = useCallback(
    (ev: MouseEvent) => {
      if (!enabled.current || !ref.current) return;

      const { clientX, clientY } = ev;
      if (frame.current !== null) return;

      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        const node = ref.current;
        if (!node) return;

        const r = node.getBoundingClientRect();
        node.style.setProperty('--mx', ((clientX - r.left) / r.width - 0.5).toFixed(3));
        node.style.setProperty('--my', ((clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    },
    [ref],
  );

  const onMouseLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--mx', '0');
    node.style.setProperty('--my', '0');
  }, [ref]);

  return { onMouseMove, onMouseLeave };
}

const SECTION_SET = new Set<string>(SECTION_KEYS);

/**
 * Tracks which marked block owns the side panel's copy.
 *
 * Eleven blocks carry `data-yz-sec`. The last one in document order whose top
 * has crossed 45% of the viewport and whose bottom is still on screen wins.
 *
 * Two details that were arrived at the hard way: the scroll handler
 * cancels and reschedules its frame rather than early-returning, so the newest
 * position always wins on a fast flick; and the pick also runs after every
 * render, because scroll-only left the panel one message behind on jumps.
 *
 * An IntersectionObserver approach was tried first and abandoned — a 10%-tall
 * observation band left dead gaps between sections where nothing was detected.
 */
export function useActiveSection(): SectionKey {
  const [section, setSection] = useState<SectionKey>('reasons');
  const frame = useRef<number | null>(null);
  const current = useRef<SectionKey>('reasons');

  const pick = useCallback(() => {
    const mid = window.innerHeight * 0.45;
    let best: SectionKey | null = null;

    for (const el of document.querySelectorAll('[data-yz-sec]')) {
      const key = el.getAttribute('data-yz-sec');
      if (!key || !SECTION_SET.has(key)) continue;

      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > 0) best = key as SectionKey;
    }

    if (best && best !== current.current) {
      current.current = best;
      setSection(best);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        pick();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [pick]);

  // Re-pick after every render, not only on scroll.
  useEffect(() => {
    pick();
  });

  return section;
}

/**
 * Reveals the side panel once the hero is behind you. It stays hidden while
 * 15% or more of the hero is visible — the hero already carries the form.
 */
export function useRevealPastHero(
  heroRef: RefObject<HTMLElement>,
  railRef: RefObject<HTMLElement>,
): void {
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        const rail = railRef.current;
        if (!rail) return;
        for (const entry of entries) {
          if (entry.isIntersecting) rail.removeAttribute('data-shown');
          else rail.setAttribute('data-shown', '');
        }
      },
      { threshold: 0.15 },
    );

    io.observe(hero);
    return () => io.disconnect();
  }, [heroRef, railRef]);
}

/**
 * Replays a one-shot animation by clearing it, forcing reflow, and
 * reassigning — otherwise a second trigger while the first is still running
 * does nothing.
 */
export function replayAnimation(el: HTMLElement | null, value: string): void {
  if (!el || prefersReducedMotion()) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = value;
}

/** Nudges the panel card whenever the section it reflects changes. */
export function useNudgeOnChange(ref: RefObject<HTMLElement>, token: string): void {
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    replayAnimation(ref.current, 'yz-nudge 420ms cubic-bezier(.2,.6,.2,1)');
  }, [ref, token]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab inside the modal while it is open and returns focus to whatever
 * opened it on close. The prototype had neither.
 */
export function useFocusTrap(ref: RefObject<HTMLElement>, active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const returnTo = document.activeElement as HTMLElement | null;
    const node = ref.current;

    // Move focus in, so the first Tab lands inside rather than behind.
    const first = node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key !== 'Tab') return;

      const container = ref.current;
      if (!container) return;

      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;

      const firstItem = items[0]!;
      const lastItem = items[items.length - 1]!;

      if (ev.shiftKey && document.activeElement === firstItem) {
        ev.preventDefault();
        lastItem.focus();
      } else if (!ev.shiftKey && document.activeElement === lastItem) {
        ev.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnTo?.focus?.();
    };
  }, [ref, active]);
}

/** Calls back on Escape while `active`. */
export function useEscape(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onEscape();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, onEscape]);
}

/** Calls back on a pointer press outside `ref` while `active`. */
export function useOutsidePress(
  ref: RefObject<HTMLElement>,
  active: boolean,
  onOutside: () => void,
): void {
  useEffect(() => {
    if (!active) return;

    const onDown = (ev: MouseEvent) => {
      const el = ref.current;
      if (el && !el.contains(ev.target as Node)) onOutside();
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, active, onOutside]);
}
