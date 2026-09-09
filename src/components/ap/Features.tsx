/**
 * Six features, alternating light and dark cards.
 *
 * Each card carries the `data-yz-sec` marker the side panel tracks. The
 * section header deliberately carries none: it scrolls past too quickly for a
 * message to be readable, so the previous one holds until the first card
 * arrives.
 */

import FeatureVisual from './FeatureVisuals';
import Icon from './Icon';
import type { Feature, Personalisation } from './personalisation';

/** Body copy with its figure emphasised. On the dark cards the emphasis is
 *  brand white, not pink — pink on rich blue is 2.4:1 and fails. */
function Body({ f, dark }: { f: Feature; dark: boolean }) {
  return (
    <p class="ap-feature__body">
      {f.bodyA}
      {f.stat && <strong class={dark ? 'ap-stat--onDark' : 'ap-stat'}>{f.stat}</strong>}
      {f.bodyB}
    </p>
  );
}

function Chips({ chips }: { chips: string[] }) {
  return (
    <div class="ap-feature__chips">
      {chips.map((c) => (
        <span class="ap-feature__chip" key={c}>
          {c}
        </span>
      ))}
    </div>
  );
}

function FigureBlock({ f }: { f: Feature }) {
  return (
    <div class="ap-feature__figure-block">
      <div class="ap-feature__figure">{f.figure}</div>
      <div class="ap-feature__figure-label">{f.figureLabel}</div>
    </div>
  );
}

function FeatureCard({ f, erpLabel }: { f: Feature; erpLabel: string }) {
  const dark = !!f.gradient;

  return (
    <article class={dark ? 'ap-feature ap-feature--dark' : 'ap-feature'} data-yz-sec={f.secKey}>
      {dark && (
        <>
          <div class="ap-feature__gradient" style={`background:${f.gradient}`} />
          <div class="ap-feature__scrim" />
          <div class="ap-feature__dots" />
        </>
      )}

      <div class="ap-feature__col">
        <div class="ap-feature__head">
          <span class="ap-feature__num">{f.num}</span>
          <Icon name={f.icon} class="ap-feature__icon" />
        </div>
        <h3>{f.title}</h3>
        <Body f={f} dark={dark} />
        <Chips chips={f.chips} />
        <FigureBlock f={f} />
      </div>

      <FeatureVisual viz={f.viz} erpLabel={erpLabel} dark={dark} />
    </article>
  );
}

export default function Features({ p }: { p: Personalisation }) {
  return (
    <section class="ap-section">
      <p class="ap-eyebrow">What actually makes it work</p>
      <h2 class="ap-h2 ap-features__title">Six things your current AP stack can't do</h2>

      <div class="ap-features__stack">
        {p.features.map((f) => (
          <FeatureCard key={f.secKey} f={f} erpLabel={p.erpLabel} />
        ))}
      </div>
    </section>
  );
}
