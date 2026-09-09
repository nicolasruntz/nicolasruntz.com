/**
 * The contextual side panel.
 *
 * It is **not** a chat widget. An earlier iteration gave it an avatar, an
 * "Online now" dot, a message bubble and a composer-shaped button; that was
 * removed as deceptive, because nothing behind it is conversational. It
 * summarises what the page has been tailored to, and it converts.
 *
 * It stays fixed rather than sticky, and out of flow entirely: as a flex item
 * it dropped to the end of the flow below the wrap threshold and resolved its
 * offset against the bottom of the wrapper, pinning it thousands of pixels
 * down the page at every tablet and phone width.
 *
 * Below 1030px it collapses to a launcher — button only. All of the message
 * copy here is invisible at those widths; that was the accepted trade so the
 * CTA stays reachable instead of being buried at the bottom of the page.
 */

import type { RefObject } from 'preact';
import { useRef } from 'preact/hooks';

import Icon from './Icon';
import { useNudgeOnChange } from './hooks';
import type { Personalisation, SectionKey } from './personalisation';

interface Props {
  p: Personalisation;
  section: SectionKey;
  onOpenModal: () => void;
  railRef: RefObject<HTMLElement>;
}

export default function SidePanel({ p, section, onOpenModal, railRef }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const copy = p.rail[section];

  // A small shift on every swap, so the panel visibly reacts to what is being
  // read. Applied to the card, not the panel: the panel carries
  // translateY(-50%) that an animation would override.
  useNudgeOnChange(cardRef, section);

  return (
    <aside class="ap-rail" ref={railRef as RefObject<HTMLElement> as never}>
      <div class="ap-rail__card" ref={cardRef}>
        <p class="ap-rail__eyebrow">{copy.eyebrow}</p>

        <p class="ap-rail__msg">
          {copy.a}
          {copy.stat && <strong class="ap-stat">{copy.stat}</strong>}
          {copy.b}
        </p>

        {/* Each row appears only if its own value is set — never a placeholder,
            and never a mention of a selection that was not made. */}
        <div class="ap-rail__recap">
          {p.ind && (
            <span class="ap-rail__recap-row ap-rail__recap-row--first">
              <Icon name="domain" />
              <span>{p.ind.label}</span>
            </span>
          )}
          {p.erp && (
            <span class="ap-rail__recap-row">
              <Icon name="account_balance" />
              <span>{p.erp.label}</span>
            </span>
          )}
        </div>

        <button type="button" class="ap-btn-pink ap-rail__btn" onClick={onOpenModal}>
          {copy.cta}
          <Icon name="arrow_forward" />
        </button>

        <p class="ap-rail__note">US and Canada. We reply within one business hour.</p>
      </div>
    </aside>
  );
}
