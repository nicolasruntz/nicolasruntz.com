/**
 * Hero — states the offer, proves it, captures the lead.
 *
 * Four stacked background layers: a skewed sheet carrying three slowly
 * drifting gradient bands, a legibility scrim, and the brand dot pattern. The
 * sheet is the only thing the pointer moves, and only on a fine pointer at
 * desktop width.
 *
 * The ERP wordmark strip and the client quote are alternatives, not siblings:
 * once a system is picked, naming it beats listing others.
 */

import type { RefObject } from 'preact';

import DemoForm from './DemoForm';
import { REVIEW_BADGES } from './data';
import { useHeroParallax } from './hooks';
import type { Personalisation } from './personalisation';

interface Props {
  p: Personalisation;
  ctaLabel: string;
  showBadges: boolean;
  industryKey: string;
  erpKey: string;
  onIndustryKey: (key: string) => void;
  onErpKey: (key: string) => void;
  /** Held by the page: the side panel reveals once this is scrolled past. */
  heroRef: RefObject<HTMLElement>;
}

export default function Hero({
  p,
  ctaLabel,
  showBadges,
  industryKey,
  erpKey,
  onIndustryKey,
  onErpKey,
  heroRef,
}: Props) {
  const parallax = useHeroParallax(heroRef);

  return (
    <section
      id="top"
      class="ap-hero"
      ref={heroRef as RefObject<HTMLElement> as never}
      onMouseMove={parallax.onMouseMove}
      onMouseLeave={parallax.onMouseLeave}
    >
      <div class="ap-hero__bg">
        <div class="ap-hero__sheet" data-yz-anim="hero">
          <div class="ap-hero__band ap-hero__band--a" />
          <div class="ap-hero__band ap-hero__band--b" />
          <div class="ap-hero__band ap-hero__band--c" />
        </div>
        <div class="ap-hero__scrim" />
      </div>
      <div class="ap-hero__dots" />

      <div class="ap-hero__inner">
        <div class="ap-hero__col">
          <div class="ap-hero__eyebrow">
            <span class="ap-hero__eyebrow-dot" />
            <span class="ap-hero__eyebrow-text">{p.heroEyebrow}</span>
          </div>

          <h1 class="ap-hero__title">
            AI accounts payable software
            {p.titleSuffix}
          </h1>
          <div class="ap-hero__rule" />

          {/* Only present once a selection makes it specific. */}
          {p.heroSub && <p class="ap-hero__lead">{p.heroSub}</p>}
          <p class="ap-hero__secondary">
            Capture, code, match, approve, pay and archive every invoice in one platform - and cut
            AP processing time and cost by up to 80%.
          </p>

          {showBadges && (
            <div class="ap-badges">
              {REVIEW_BADGES.map((b) => (
                <div class="ap-badge" key={b.source}>
                  <span class="ap-badge__source">{b.source}</span>
                  <span class="ap-badge__label">{b.label}</span>
                </div>
              ))}
            </div>
          )}

          {p.showStrip ? (
            <div class="ap-hero__strip">
              <p class="ap-hero__strip-label">{p.stripLabel}</p>
              <div class="ap-hero__strip-list">
                {p.heroErpLogos.map((l) => (
                  <span class="ap-hero__wordmark" key={l}>
                    {l}
                  </span>
                ))}
                <span class="ap-hero__strip-more">+ 250 more</span>
              </div>
            </div>
          ) : (
            <figure class="ap-hero__quote">
              <span class="ap-hero__quote-bar" />
              <div>
                <blockquote class="ap-hero__quote-text">“{p.heroQuote.quote}”</blockquote>
                <figcaption class="ap-hero__quote-by">
                  <strong>{p.heroQuote.person}</strong>, {p.heroQuote.role}
                </figcaption>
              </div>
            </figure>
          )}
        </div>

        <div id="demo" class="ap-form-card">
          <DemoForm
            variant="hero"
            p={p}
            submitLabel={ctaLabel}
            industryKey={industryKey}
            erpKey={erpKey}
            onIndustryKey={onIndustryKey}
            onErpKey={onErpKey}
          />
        </div>
      </div>
    </section>
  );
}
