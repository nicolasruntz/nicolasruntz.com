/**
 * The demo request form, used twice: in the hero card and inside the modal.
 *
 * The hero runs the full two-step flow; the modal submits straight to
 * confirmation. Contact fields are held in state rather than left uncontrolled
 * so "Back to my details" does not throw away what was typed — that was a real
 * bug in the prototype.
 *
 * Nothing is posted anywhere. The delay between steps stands in for the
 * request that a backend would make here; see LAUNCH_CHECKLIST in the handoff.
 */

import { useRef, useState } from 'preact/hooks';

import Icon from './Icon';
import { ERPS, INDUSTRIES } from './data';
import type { Personalisation } from './personalisation';

/** Stands in for the round trip a real submit would make. */
const HERO_SUBMIT_MS = 1100;
const MODAL_SUBMIT_MS = 900;

type Step = 'contact' | 'saving' | 'qualify' | 'done';

interface Contact {
  first: string;
  last: string;
  email: string;
  phone: string;
}

const EMPTY: Contact = { first: '', last: '', email: '', phone: '' };

interface Props {
  variant: 'hero' | 'modal';
  p: Personalisation;
  submitLabel: string;
  industryKey: string;
  erpKey: string;
  onIndustryKey: (key: string) => void;
  onErpKey: (key: string) => void;
}

const FIELDS: { name: keyof Contact; label: string; placeholder: string; type: string; autoComplete: string; icon: string; required: boolean }[] = [
  { name: 'first', label: 'First name', placeholder: 'First name', type: 'text', autoComplete: 'given-name', icon: 'person', required: true },
  { name: 'last', label: 'Last name', placeholder: 'Last name', type: 'text', autoComplete: 'family-name', icon: 'person', required: true },
  { name: 'email', label: 'Work email', placeholder: 'you@company.com', type: 'email', autoComplete: 'email', icon: 'mail', required: true },
  { name: 'phone', label: 'Phone, optional', placeholder: '(555) 000-0000 (optional)', type: 'tel', autoComplete: 'tel', icon: 'call', required: false },
];

export default function DemoForm({
  variant,
  p,
  submitLabel,
  industryKey,
  erpKey,
  onIndustryKey,
  onErpKey,
}: Props) {
  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState<Contact>(EMPTY);
  const timer = useRef<number | undefined>(undefined);

  const set = (name: keyof Contact) => (ev: Event) =>
    setContact((c) => ({ ...c, [name]: (ev.target as HTMLInputElement).value }));

  const submitContact = (ev: Event) => {
    ev.preventDefault();
    setStep('saving');
    clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setStep(variant === 'hero' ? 'qualify' : 'done'),
      variant === 'hero' ? HERO_SUBMIT_MS : MODAL_SUBMIT_MS,
    );
  };

  const submitQualify = (ev: Event) => {
    ev.preventDefault();
    setStep('done');
  };

  if (step === 'done') {
    return (
      <div class="ap-form__done">
        <Icon name="check_circle" />
        <h2>Thanks - you're on the list.</h2>
        <p>
          An AP specialist for {p.industryLabel} will call you within one business hour to book a
          30-minute demo run on your own invoices and your {p.erpLabel} setup.
        </p>
      </div>
    );
  }

  if (step === 'saving') {
    return (
      <div class="ap-form__loading">
        <span class="ap-form__spinner" role="status" aria-label="Saving your details" />
        <p>Saving your details…</p>
      </div>
    );
  }

  if (step === 'qualify') {
    return (
      <div class="ap-form__step">
        <div class="ap-form__progress">
          <span class="ap-form__progress-label">Step 2 of 2</span>
          <span class="ap-form__progress-bar" />
        </div>

        <h2 class="ap-form__title">Oh, just one more thing before we jump on a call.</h2>
        <p class="ap-form__sub">{p.step2Sub}</p>

        <form onSubmit={submitQualify}>
          <div class="ap-form__fields">
            <div class="ap-field">
              <Icon name="domain" class="ap-field__icon" />
              <select
                required
                aria-label="Your industry"
                value={industryKey}
                onChange={(ev) => onIndustryKey((ev.target as HTMLSelectElement).value)}
              >
                <option value="">Select your industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
              <Icon name="expand_more" class="ap-field__chevron" />
            </div>

            <div class="ap-field">
              <Icon name="account_balance" class="ap-field__icon" />
              <select
                required
                aria-label="Your ERP, accounting system or DMS"
                value={erpKey}
                onChange={(ev) => onErpKey((ev.target as HTMLSelectElement).value)}
              >
                <option value="">Select your system</option>
                {ERPS.map((e) => (
                  <option key={e.key} value={e.key}>
                    {e.label}
                  </option>
                ))}
              </select>
              <Icon name="expand_more" class="ap-field__chevron" />
            </div>
          </div>

          <button type="submit" class="ap-btn-pink ap-form__submit">
            Confirm
          </button>
        </form>

        <button type="button" class="ap-form__back" onClick={() => setStep('contact')}>
          Back to my details
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 class="ap-form__title">See Yooz on your own invoices</h2>
      <p class="ap-form__sub">
        30 minutes, tailored to {p.industryLabel} and {p.erpLabel}. Nothing to install.
      </p>

      <form onSubmit={submitContact}>
        <div class="ap-form__fields">
          {FIELDS.map((f) => (
            <div class="ap-field" key={f.name}>
              <Icon name={f.icon} class="ap-field__icon" />
              <input
                name={f.name}
                type={f.type}
                required={f.required}
                autoComplete={f.autoComplete}
                aria-label={f.label}
                placeholder={f.placeholder}
                value={contact[f.name]}
                onInput={set(f.name)}
              />
            </div>
          ))}
        </div>

        <button type="submit" class="ap-btn-pink ap-form__submit">
          {submitLabel}
          <Icon name="arrow_forward" />
        </button>
      </form>

      <p class="ap-form__fine">
        US &amp; Canada only. We call back within one business hour. No obligation, no card.
      </p>
    </div>
  );
}
