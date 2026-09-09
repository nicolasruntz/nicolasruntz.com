/**
 * Every personalised surface on the page, derived from the two picker keys.
 *
 * This is a pure function of (industryKey, erpKey, section): given the same
 * selection it always produces the same copy, and nothing in here touches the
 * DOM. The components read the result and render it.
 *
 * Copy is verbatim from the design handoff. Where a sentence is split into
 * `a` / `stat` / `b`, the middle part is the figure rendered in pink — so the
 * emphasis lives in the data rather than in markup the components guess at.
 */

import {
  ERPS,
  INDUSTRIES,
  STORIES,
  SYSTEM_STRIPS,
  type Erp,
  type Industry,
  type Story,
} from './data';

/** The blocks that own the side panel's copy, in document order. */
export const SECTION_KEYS = [
  'reasons',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'stories',
  'pricing',
  'faq',
  'close',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type FeatureViz = 'capture' | 'ocr' | 'workflow' | 'fraud' | 'connect' | 'pay';

export interface Feature {
  secKey: SectionKey;
  num: string;
  viz: FeatureViz;
  icon: string;
  title: string;
  figure: string;
  figureLabel: string;
  /** Body text before the emphasised figure. */
  bodyA: string;
  /** The emphasised figure, or '' when the body carries none. */
  stat: string;
  /** Body text after the emphasised figure. */
  bodyB: string;
  chips: string[];
  /** Dark cards (02, 04, 06) carry a gradient; light cards do not. */
  gradient?: string;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
}

export interface RailCopy {
  eyebrow: string;
  a: string;
  stat: string;
  b: string;
  cta: string;
}

export interface StoryCard extends Story {
  photo: string;
  alt: string;
}

export function findIndustry(key: string): Industry | null {
  return INDUSTRIES.find((i) => i.key === key) ?? null;
}

export function findErp(key: string): Erp | null {
  return ERPS.find((e) => e.key === key) ?? null;
}

/** "Talk to an automotive expert" — the article is computed, not hard-coded. */
function expertLabelFor(ind: Industry | null, erp: Erp | null): string {
  const who = ind ? ind.expert : erp ? erp.label : 'AP';
  return `Talk to ${/^[aeiou]/i.test(who) ? 'an' : 'a'} ${who} expert`;
}

export interface Personalisation {
  ind: Industry | null;
  erp: Erp | null;
  /** Reads inside a sentence; "your industry" when nothing is picked. */
  industryLabel: string;
  /** "your ERP" when nothing is picked. */
  erpLabel: string;
  hasSelection: boolean;

  /** Appended inline to the H1. */
  titleSuffix: string;
  heroEyebrow: string;
  heroSub: string;
  /** The wordmark strip shows only while no system is picked. */
  showStrip: boolean;
  stripLabel: string;
  heroErpLogos: string[];
  /** The client quote replaces the strip once a system is picked. */
  heroQuote: Story;

  storiesTitle: string;
  stories: StoryCard[];

  features: Feature[];
  faqs: Faq[];

  /** Adaptive submit label, shared by the modal and the hero form. */
  expertCta: string;
  step2Sub: string;
  /** Personalised closing line under the final CTA. */
  closingLine: string;

  rail: Record<SectionKey, RailCopy>;
}

export function personalise(industryKey: string, erpKey: string): Personalisation {
  const ind = findIndustry(industryKey);
  const erp = findErp(erpKey);

  const industryLabel = ind ? ind.inlineLabel || ind.label : 'your industry';
  const erpLabel = erp ? erp.label : 'your ERP';

  const primary = ind ? STORIES[ind.story] : STORIES.njtc;
  const other = primary.key === 'njtc' ? STORIES.agas : STORIES.njtc;

  const strip = SYSTEM_STRIPS[ind ? ind.key : 'none'] ?? SYSTEM_STRIPS.none!;
  const expertCta = expertLabelFor(ind, erp);

  let titleSuffix = '';
  if (ind && erp) titleSuffix = ` for ${industryLabel} on ${erp.label}`;
  else if (ind) titleSuffix = ` for ${industryLabel}`;
  else if (erp) titleSuffix = ` for ${erp.label}`;

  // Shorthands used across the panel copy below.
  const who = ind ? ind.expert : null;
  const sys = erp ? erp.label : null;

  const faqs: Faq[] = [
    {
      id: 'integrations',
      q: 'What if my ERP has no Yooz module?',
      a: erp
        ? `Yooz connects to ${erp.label} natively - ${erp.note} Beyond the 250+ named systems, we map your export and import formats during onboarding, so a missing "module" is almost never the blocker people expect.`
        : 'Yooz has 250+ native connectors, and beyond those we map your export and import formats during onboarding. A missing "module" is almost never the blocker people expect - pick your system in the switcher above to see how yours connects.',
    },
    {
      id: 'fit',
      q: ind ? `Is Yooz a fit for ${industryLabel}?` : 'Is Yooz a fit for our industry?',
      a: ind
        ? ind.faq
        : 'Almost certainly. Yooz is industry-agnostic: the AI learns from your own documents and coding history rather than from a fixed template library, and the workflow engine is configured around your entities, sites and approval thresholds.',
    },
    {
      id: 'rollout-live',
      q: 'How long until we are actually live?',
      a: `Days, not quarters - there is no implementation project and no consultants on retainer. Day one your ${
        erp ? `${erp.label} connector` : 'connector'
      } is live and master data starts syncing; week one your chart of accounts, dimensions, entities and approval thresholds are configured with you.`,
    },
    {
      id: 'rollout-onboarding',
      q: 'What does onboarding actually involve on our side?',
      a: 'A few hours of your team, spread over the first week. Role-specific training runs before go-live - administrators, accountants and approvers separately, and approvers typically need minutes. Hypercare support then stays close while volume ramps, tuning the AI and the rules on real production invoices.',
    },
    {
      id: 'ai',
      q: 'What happens to invoices the AI is unsure about?',
      a: 'They are routed as exceptions with the uncertain fields highlighted, alongside the source document. Nothing posts silently, and every correction trains the model on your own documents.',
    },
    {
      id: 'security',
      q: 'How does Yooz stop invoice fraud?',
      a: 'YoozProtect checks every document for duplicates, forged or altered files and atypical amounts, and verifies vendor bank details before payment. Every action is written to an immutable audit trail with legal archiving.',
    },
    {
      id: 'pricing',
      q: 'Do we pay per user?',
      a: 'No. Pricing is based on the volume of documents processed, users are unlimited, and every module, update and support channel is included. We size it with you on the demo call.',
    },
  ];

  const features: Feature[] = [
    {
      secKey: 'f1',
      num: '01',
      viz: 'capture',
      icon: 'scanner',
      title: 'Real-time multichannel capture',
      figure: 'Seconds',
      figureLabel: 'from arrival to extracted, coded data - not an overnight batch',
      bodyA:
        'Email, scan, EDI, mobile photo and supplier portal all land in the same queue. Proprietary AI reads the document, classifies it and splits batches automatically with YoozSmartSplit - no templates to build per vendor, and no per-format setup.',
      stat: '',
      bodyB: '',
      chips: ['Email & scan', 'EDI', 'Mobile capture', 'Supplier portal', 'Auto batch split'],
    },
    {
      secKey: 'f2',
      num: '02',
      viz: 'ocr',
      gradient: 'var(--gradient-blue-pink)',
      icon: 'account_balance',
      title: 'Coding and matching that finish the job',
      figure: 'Up to 80%',
      figureLabel: 'of invoices processed straight through, no human touch',
      bodyA:
        'GL accounts, tax and dimensions are suggested from your own history and get sharper every week - the model is trained on ',
      stat: '300M+',
      bodyB:
        ' invoices already processed. Two-way and three-way matching runs line by line against live PO and goods-receipt data, so quantity and price variances surface before an approver ever sees them.',
      chips: ['Auto GL coding', '2- and 3-way match', 'Line-level', 'Variance flags'],
    },
    {
      secKey: 'f3',
      num: '03',
      viz: 'workflow',
      icon: 'workflow',
      title: 'A workflow engine you can actually change',
      figure: 'No dev',
      figureLabel: 'required to change a rule, a threshold or an approver',
      bodyA:
        'Route by entity, site, cost centre, project, amount threshold or vendor. Parallel and sequential chains, delegations that survive vacations, escalation on stalled approvals, and one-tap mobile approval with the document attached.',
      stat: '',
      bodyB: '',
      chips: ['Multi-entity', 'Multi-site', 'Thresholds', 'Delegation', 'Mobile approval'],
    },
    {
      secKey: 'f4',
      num: '04',
      viz: 'fraud',
      gradient: 'var(--gradient-teal-pink)',
      icon: 'shield',
      title: 'YoozProtect - fraud defence and a clean audit trail',
      figure: '24/7',
      figureLabel: 'screening on every document, before and after approval',
      bodyA:
        'AI detection for forged and altered documents, advanced duplicate detection, atypical amount alerts and vendor bank-detail verification. Every view, edit and approval is written to an immutable trail, and documents sit in compliant legal archiving for the full retention period. ',
      stat: '9 of 10',
      bodyB: ' of the largest audit firms already work in Yooz.',
      chips: [
        'Fake document detection',
        'Duplicates',
        'Bank detail checks',
        'Immutable audit trail',
        'Legal archiving',
      ],
    },
    {
      secKey: 'f5',
      num: '05',
      viz: 'connect',
      icon: 'sync_alt',
      // The only feature card whose whole content swaps on the ERP: title,
      // figure, label and body all name the picked system.
      title: erp ? `A native ${erp.label} connector, both directions` : '250+ native connectors, both directions',
      figure: erp ? 'Two-way' : '250+',
      figureLabel: erp
        ? `sync with ${erp.label}, from vendors through to payments`
        : 'ERP, accounting and DMS systems natively connected',
      bodyA: erp
        ? `Vendors, chart of accounts, dimensions, POs and receipts flow from ${erp.label} into Yooz; coded, approved invoices and payments post back automatically - ${erp.note} It survives your next upgrade.`
        : 'Vendors, chart of accounts, dimensions, POs and receipts flow into Yooz; coded, approved invoices and payments post back automatically. The largest integration range on the market, and it survives your next ERP upgrade.',
      stat: '',
      bodyB: '',
      chips: ['Two-way sync', 'Automatic posting', 'No middleware', 'DMS included'],
    },
    {
      secKey: 'f6',
      num: '06',
      viz: 'pay',
      gradient: 'var(--gradient-pink-teal)',
      icon: 'payments',
      title: 'Payment built in, not bolted on',
      figure: 'Cash back',
      figureLabel: 'earned on virtual-card spend you were paying anyway',
      bodyA:
        'YoozPay executes the payment from the same approval you already gave - ACH, check, virtual card and wire. Virtual cards earn cash back, early-payment discounts stop expiring, and reconciliation is automatic because the payment and the invoice never left the same system.',
      stat: '',
      bodyB: '',
      chips: ['ACH & check', 'Virtual card + cash back', 'Wire', 'Auto reconciliation'],
    },
  ];

  const rail: Record<SectionKey, RailCopy> = {
    reasons: {
      eyebrow: 'Return on automation',
      a: '',
      stat: 'Up to 80%',
      b: ' of the processing time and cost goes, because the steps go - not because the license is cheaper.',
      cta: who ? `See the 80% on ${who} invoices` : sys ? `See the 80% in ${sys}` : 'See the 80% on your invoices',
    },
    f1: {
      eyebrow: 'Capture',
      a: who
        ? `Every ${who} invoice read the day it lands, whichever channel it came in on - `
        : 'Email, scan, EDI, mobile photo and portal in one queue - ',
      stat: '300M+',
      b: ' documents captured so far.',
      cta: 'Send us a hard invoice',
    },
    f2: {
      eyebrow: 'Coding and matching',
      a: sys
        ? `Coded from your own history, matched against live ${sys} POs and receipts - `
        : 'Coded from your own history, matched line by line against live PO data - ',
      stat: 'up to 80%',
      b: ' posts straight through, untouched.',
      cta: 'Watch a 3-way match run',
    },
    f3: {
      eyebrow: 'Approvals',
      a: who
        ? `Routing by entity, site and amount, the way ${who} teams approve. `
        : 'Routing by entity, site, project and amount, changed without a developer. ',
      stat: '600,000+',
      b: ' users approve in Yooz, with no training.',
      cta: 'Map my approval chain',
    },
    f4: {
      // Neither fraud nor payment changes by sector, so 04 and 06 stay neutral
      // rather than carrying a variant that would ring false.
      eyebrow: 'Fraud and audit',
      a: 'Duplicates, altered documents and vendor bank details checked before a dollar moves, ',
      stat: '24/7',
      b: ', before and after approval.',
      cta: 'Test it on a duplicate',
    },
    f5: {
      eyebrow: 'Integration',
      a: sys
        ? `${sys} syncs both ways - vendors, GL, dimensions, POs and payments - and it is one of `
        : 'Vendors, GL, dimensions, POs and payments sync both ways, on ',
      stat: '250+',
      b: sys ? ' native connectors.' : ' systems.',
      cta: sys ? `See the ${sys} connector` : 'Check my system',
    },
    f6: {
      eyebrow: 'Payment',
      a: 'ACH, check, virtual card and wire, executed from the approval you already gave - plus ',
      stat: 'cash back',
      b: ' on card spend you were paying anyway.',
      cta: 'Price my card cash back',
    },
    stories: {
      eyebrow: 'Client proof',
      a: 'We run AP for ',
      stat: '7,000+',
      b: who
        ? ` finance teams. Ask how another ${who} team moved its AP off paper.`
        : ' finance teams. Ask how one your size moved its AP off paper.',
      cta: expertCta,
    },
    pricing: {
      eyebrow: 'Pricing',
      a: 'One subscription on the documents you process, unlimited users, every module. ',
      stat: '15 days',
      b: ' free in a real production environment.',
      cta: 'Get my pricing',
    },
    faq: {
      // The only panel message with no figure — none fitted without becoming
      // a non-sequitur.
      eyebrow: 'Still deciding',
      a:
        who && sys
          ? `Anything specific to ${who} on ${sys} is faster to settle live, with someone who does it every week.`
          : 'Anything left on your list is faster to settle live, with someone who does it every week.',
      stat: '',
      b: '',
      cta: 'Ask it live',
    },
    close: {
      eyebrow: 'Start here',
      a: 'Bring ',
      stat: 'ten',
      b: sys ? ` of your own invoices. We run them on ${sys}.` : ' of your own invoices. We run them live.',
      cta: expertCta,
    },
  };

  return {
    ind,
    erp,
    industryLabel,
    erpLabel,
    hasSelection: !!(ind || erp),

    titleSuffix,
    heroEyebrow: ind ? ind.eyebrow : erp ? `Native ${erp.label} connector` : 'Industry-agnostic',
    heroSub: ind
      ? ind.sub
      : erp
        ? `Yooz plugs straight into ${erp.label} - ${erp.note} Vendors, GL, dimensions, POs and receipts sync both ways, and approved invoices post back automatically.`
        : 'Whatever you run AP on, Yooz plugs straight into it - 250+ native ERP and DMS connectors, two-way sync, automatic posting back. Industry-agnostic by design, configured around your entities and your approval rules.',
    showStrip: !erp,
    stripLabel: erp ? `Native two-way sync with ${erp.label}` : strip.label,
    heroErpLogos: erp
      ? [erp.label, ...strip.list.filter((l) => l !== erp.label).slice(0, 4)]
      : strip.list,
    heroQuote: primary,

    storiesTitle:
      ind && erp
        ? `Proof from ${industryLabel} running ${erp.label}`
        : ind
          ? `Proof from ${industryLabel}`
          : erp
            ? `Proof from teams running ${erp.label}`
            : 'Proof from teams that look like yours',
    stories: [primary, other].map((s) => ({
      ...s,
      photo: `/yooz/story-${s.key}.webp`,
      alt: `${s.person}, ${s.role}`,
    })),

    features,
    faqs,

    expertCta,
    step2Sub:
      ind && erp
        ? 'We picked these up from your selection above - just confirm.'
        : 'Tell us what you run and we tailor the call to it.',
    closingLine: `Bring ten of your own invoices. We'll run them live on ${erpLabel} and show you exactly what stays manual.`,

    rail,
  };
}
