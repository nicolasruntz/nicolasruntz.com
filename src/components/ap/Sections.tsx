/**
 * The content sections between the hero and the footer: four reasons, client
 * proof, pricing, FAQ and the closing slab.
 *
 * Each one carries the `data-yz-sec` marker the side panel tracks.
 */

import { useState } from 'preact/hooks';

import Icon from './Icon';
import { PRICING_INCLUDES, REASONS } from './data';
import { replayAnimation } from './hooks';
import type { Personalisation } from './personalisation';

/** "Get my pricing" and the closing CTA still anchor back to the hero form and
 *  shake it. Whether they should open the modal instead is an open question in
 *  the handoff — sending someone from the page bottom back to the top is
 *  arguable, but it is the behaviour that was signed off. */
function shakeHeroForm() {
  replayAnimation(
    document.getElementById('demo'),
    'yz-shake 560ms cubic-bezier(.2,.6,.2,1)',
  );
}

export function Reasons() {
  return (
    <section class="ap-section" data-yz-sec="reasons">
      <h2 class="ap-h2">
        Four reasons <strong class="ap-stat">7,000+</strong> finance teams switch to Yooz
      </h2>
      <p class="ap-reasons__intro">
        Not a scanning tool bolted onto your ERP. One platform that owns the invoice from the second
        it arrives to the second it clears the bank.
      </p>

      <div class="ap-reasons__grid">
        {REASONS.map((r) => (
          <div class="ap-reason" key={r.title}>
            <span class="ap-reason__medallion">
              <Icon name={r.icon} />
            </span>
            <h3>{r.title}</h3>
            <p>
              {r.bodyA}
              {r.stat && <strong class="ap-stat">{r.stat}</strong>}
              {r.bodyB}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Stories({ p }: { p: Personalisation }) {
  return (
    <section class="ap-section" data-yz-sec="stories">
      <h2 class="ap-h2 ap-stories__title">{p.storiesTitle}</h2>

      <div class="ap-stories__grid">
        {p.stories.map((s) => (
          <div class="ap-story" key={s.key}>
            <div class="ap-story__photo">
              <img
                src={s.photo}
                alt={s.alt}
                width="960"
                height="640"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="ap-story__tags">
              <span class="ap-story__tag">{s.industry}</span>
              <span class="ap-story__tag ap-story__tag--muted">{s.tag}</span>
            </div>

            <p class="ap-story__quote">“{s.quote}”</p>

            <div>
              <div class="ap-story__person">{s.person}</div>
              <div class="ap-story__role">{s.role}</div>
            </div>

            <div class="ap-story__ba">
              <div>
                <div class="ap-story__ba-label">Before</div>
                <div class="ap-story__ba-value">{s.before}</div>
              </div>
              <div>
                <div class="ap-story__ba-label ap-story__ba-label--after">After</div>
                <div class="ap-story__ba-value ap-story__ba-value--after">{s.after}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section class="ap-section" data-yz-sec="pricing">
      <div class="ap-pricing">
        <div class="ap-pricing__col">
          <p class="ap-eyebrow">Pricing</p>
          <h2 class="ap-pricing__title">All-inclusive. No hidden fees.</h2>
          <p class="ap-pricing__body">
            One subscription based on the documents you actually process. Unlimited users, every
            module, every update, support included. We price it against your volume on the demo call
            - nothing to reverse-engineer from a table.
          </p>
          <a href="#demo" class="ap-btn-pink ap-pricing__cta" onClick={shakeHeroForm}>
            Get my pricing
          </a>
        </div>

        <div class="ap-pricing__list">
          {PRICING_INCLUDES.map((label) => (
            <div class="ap-pricing__item" key={label}>
              <Icon name="check_circle" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({ p }: { p: Personalisation }) {
  // Multi-open, nothing open on load: the section starts short and unfolds on
  // demand. One column, so opening an answer never shifts a neighbour.
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (id: string) =>
    setOpen((cur) => (cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id]));

  return (
    <section class="ap-section" data-yz-sec="faq">
      <div class="ap-faq__head">
        <h2 class="ap-h2">Questions buyers actually ask</h2>
        <p class="ap-faq__note">Open as many as you like - nothing collapses on you.</p>
      </div>

      <div class="ap-faq__list">
        {p.faqs.map((f) => {
          const isOpen = open.includes(f.id);
          return (
            <div class="ap-faq__item" key={f.id}>
              <button
                type="button"
                class="ap-faq__trigger"
                aria-expanded={isOpen}
                aria-controls={`ap-faq-${f.id}`}
                onClick={() => toggle(f.id)}
              >
                <span class="ap-faq__q">{f.q}</span>
                <Icon name={isOpen ? 'remove' : 'add'} class="ap-faq__glyph" />
              </button>
              {isOpen && (
                <p class="ap-faq__answer" id={`ap-faq-${f.id}`}>
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FinalCta({ p, ctaLabel }: { p: Personalisation; ctaLabel: string }) {
  return (
    <section class="ap-section" data-yz-sec="close">
      <div class="ap-close">
        <h2>Stop keying invoices this quarter.</h2>
        <p>{p.closingLine}</p>
        <a href="#demo" class="ap-btn-pink ap-close__cta" onClick={shakeHeroForm}>
          {ctaLabel}
          <Icon name="arrow_forward" />
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer class="ap-footer">
      <img src="/yooz/yooz-mark-color.svg" alt="Yooz" width="26" height="26" />
      <p>
        Yooz North America - 8840 Cypress Waters Blvd, Suite 250, Coppell, TX 75019. Lean Financial
        Operations™. SOC 2 Type II · US and Canadian data residency.
      </p>
    </footer>
  );
}
