/**
 * Header — static, deliberately not sticky.
 *
 * Holds the two pickers that drive every personalised surface on the page, a
 * Reset that appears only once something is picked, and the primary CTA, which
 * opens the modal rather than scrolling anywhere.
 */

import { useRef } from 'preact/hooks';

import Icon from './Icon';
import { ERPS, INDUSTRIES } from './data';
import { useEscape, useOutsidePress } from './hooks';
import type { Personalisation } from './personalisation';

export type OpenPicker = 'industry' | 'erp' | null;

interface Props {
  p: Personalisation;
  industryKey: string;
  erpKey: string;
  open: OpenPicker;
  query: string;
  onOpen: (which: OpenPicker) => void;
  onQuery: (value: string) => void;
  onIndustryKey: (key: string) => void;
  onErpKey: (key: string) => void;
  onReset: () => void;
  onOpenModal: () => void;
}

export default function Header({
  p,
  industryKey,
  erpKey,
  open,
  query,
  onOpen,
  onQuery,
  onIndustryKey,
  onErpKey,
  onReset,
  onOpenModal,
}: Props) {
  const pickersRef = useRef<HTMLDivElement>(null);

  const close = () => onOpen(null);
  useOutsidePress(pickersRef, open !== null, close);
  useEscape(open !== null, close);

  // Picking the chip that is already selected clears it, so the pill row is
  // both the selector and a second way out of a filter.
  const pickIndustry = (key: string) => {
    onIndustryKey(industryKey === key ? '' : key);
    close();
  };

  const pickErp = (key: string) => {
    onErpKey(erpKey === key ? '' : key);
    close();
  };

  const trimmed = query.trim().toLowerCase();
  const systems = ERPS.filter((e) => e.key !== 'other').filter(
    (e) => !trimmed || e.label.toLowerCase().includes(trimmed),
  );

  return (
    <header class="ap-header">
      <div class="ap-header__inner">
        <a href="#top" class="ap-header__logo">
          <img src="/yooz/yooz-mark-color.svg" alt="Yooz" width="30" height="30" />
        </a>

        <div class="ap-pickers" ref={pickersRef}>
          <div class="ap-picker">
            <button
              type="button"
              class="ap-picker__trigger"
              data-picked={p.ind ? '' : undefined}
              aria-label="Choose your industry"
              aria-haspopup="listbox"
              aria-expanded={open === 'industry'}
              onClick={() => onOpen(open === 'industry' ? null : 'industry')}
            >
              <Icon name={p.ind ? p.ind.icon : 'domain'} />
              <span class="ap-picker__value">{p.ind ? p.ind.label : 'Any industry'}</span>
              <Icon
                name={open === 'industry' ? 'expand_less' : 'expand_more'}
                class="ap-picker__chevron"
              />
            </button>

            {open === 'industry' && (
              <div class="ap-picker__panel">
                <p class="ap-picker__label" id="ap-industry-label">
                  Pick your industry
                </p>
                <div class="ap-picker__chips" role="listbox" aria-labelledby="ap-industry-label">
                  {/* The clear affordance leads the list, so removing one
                      filter never means resetting both. */}
                  <button
                    type="button"
                    class="ap-chip"
                    role="option"
                    aria-selected={industryKey === ''}
                    onClick={() => pickIndustry('')}
                  >
                    <Icon name="clear_all" />
                    Any industry
                  </button>

                  {INDUSTRIES.filter((i) => i.key !== 'other').map((i) => (
                    <button
                      type="button"
                      key={i.key}
                      class="ap-chip"
                      role="option"
                      aria-selected={industryKey === i.key}
                      onClick={() => pickIndustry(i.key)}
                    >
                      <Icon name={i.icon} />
                      {i.label}
                    </button>
                  ))}
                </div>
                <p class="ap-picker__note">
                  Another industry? Yooz is industry-agnostic - the AI learns from your own
                  documents, not a template library.
                </p>
              </div>
            )}
          </div>

          <div class="ap-picker">
            <button
              type="button"
              class="ap-picker__trigger"
              data-picked={p.erp ? '' : undefined}
              aria-label="Choose your ERP, accounting system or DMS"
              aria-haspopup="listbox"
              aria-expanded={open === 'erp'}
              onClick={() => onOpen(open === 'erp' ? null : 'erp')}
            >
              <Icon name="account_balance" />
              <span class="ap-picker__value">{p.erp ? p.erp.label : 'Any system'}</span>
              <Icon
                name={open === 'erp' ? 'expand_less' : 'expand_more'}
                class="ap-picker__chevron"
              />
            </button>

            {open === 'erp' && (
              <div class="ap-picker__panel ap-picker__panel--right">
                <p class="ap-picker__label" id="ap-erp-label">
                  Pick your ERP, accounting system or DMS
                </p>
                <input
                  class="ap-picker__search"
                  value={query}
                  onInput={(ev) => onQuery((ev.target as HTMLInputElement).value)}
                  placeholder="Search 250+ systems"
                  aria-label="Search systems"
                />
                <div
                  class="ap-picker__chips ap-picker__chips--scroll"
                  role="listbox"
                  aria-labelledby="ap-erp-label"
                >
                  {/* Hidden while searching, where a "clear" entry among the
                      matches would make no sense. */}
                  {!trimmed && (
                    <button
                      type="button"
                      class="ap-chip"
                      role="option"
                      aria-selected={erpKey === ''}
                      onClick={() => pickErp('')}
                    >
                      Any system
                    </button>
                  )}

                  {systems.map((e) => (
                    <button
                      type="button"
                      key={e.key}
                      class="ap-chip"
                      role="option"
                      aria-selected={erpKey === e.key}
                      onClick={() => pickErp(e.key)}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
                <p class="ap-picker__note">
                  Not listed? 250+ native connectors, and we map custom exports during onboarding.
                </p>
              </div>
            )}
          </div>

          {p.hasSelection && (
            <button type="button" class="ap-reset" aria-label="Reset selection" onClick={onReset}>
              <Icon name="restart_alt" />
              Reset
            </button>
          )}
        </div>

        <span class="ap-header__spacer" />

        <button type="button" class="ap-btn-pink ap-header__cta" onClick={onOpenModal}>
          Get a demo
        </button>
      </div>
    </header>
  );
}
