/**
 * The demo form again, opened by the header CTA and by the side panel.
 *
 * Closes on the X, on backdrop click and on Escape. Unlike the prototype it
 * also traps Tab inside the card and returns focus to whatever opened it.
 */

import { useRef } from 'preact/hooks';

import DemoForm from './DemoForm';
import Icon from './Icon';
import { useEscape, useFocusTrap } from './hooks';
import type { Personalisation } from './personalisation';

interface Props {
  p: Personalisation;
  industryKey: string;
  erpKey: string;
  onIndustryKey: (key: string) => void;
  onErpKey: (key: string) => void;
  onClose: () => void;
}

export default function DemoModal({
  p,
  industryKey,
  erpKey,
  onIndustryKey,
  onErpKey,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEscape(true, onClose);
  useFocusTrap(cardRef, true);

  return (
    <div
      class="ap-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Talk to a Yooz specialist"
      onClick={onClose}
    >
      <div class="ap-modal__card" ref={cardRef} onClick={(ev) => ev.stopPropagation()}>
        <div class="ap-modal__head">
          <span class="ap-modal__brand">
            <img src="/yooz/yooz-mark-color.svg" alt="Yooz" width="22" height="22" />
            <span>Yooz specialist</span>
          </span>
          <button type="button" class="ap-modal__close" aria-label="Close" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>

        {/* The submit label stays the adaptive expert label whichever CTA
            opened the modal, matching the hero form. */}
        <DemoForm
          variant="modal"
          p={p}
          submitLabel={p.expertCta}
          industryKey={industryKey}
          erpKey={erpKey}
          onIndustryKey={onIndustryKey}
          onErpKey={onErpKey}
        />
      </div>
    </div>
  );
}
