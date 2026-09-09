/**
 * The six product diagrams beside the feature cards.
 *
 * Each one runs a single sequence on one clock rather than a set of
 * independent loops, so the animation shows a mechanism reaching a result
 * instead of dots sliding forever. Durations live in the stylesheet; the
 * per-element offsets that stagger a sequence are set here, because they are
 * indices into a list rather than fixed values.
 *
 * Every panel is wrapped in `data-yz-anim`, which is what lets the
 * IntersectionObserver park it while it is off screen.
 */

import Icon from './Icon';
import type { FeatureViz } from './personalisation';

const delay = (seconds: number) => `animation-delay:${seconds}s`;

/* — 01 Capture, 4.8s clock ————————————————————————————————— */

const CHANNELS = [
  { icon: 'mail', label: 'Email' },
  { icon: 'scanner', label: 'Scan' },
  { icon: 'hub', label: 'EDI' },
  { icon: 'smartphone', label: 'Mobile' },
];

function CaptureViz() {
  return (
    <>
      <div class="ap-capture">
        <div class="ap-capture__channels">
          {CHANNELS.map((c, i) => (
            <div class="ap-capture__row" key={c.label}>
              <span class="ap-capture__label" style={delay(i * 0.35)}>
                <Icon name={c.icon} />
                {c.label}
              </span>
              <span class="ap-capture__rail">
                <span class="ap-capture__dot" style={delay(i * 0.35)} />
              </span>
              <Icon name="check" class="ap-capture__tick" style={delay(i * 0.35)} />
            </div>
          ))}
        </div>

        {/* The hub pulses once per arrival. */}
        <span class="ap-capture__hub-wrap">
          <span class="ap-capture__ring" />
          <span class="ap-capture__hub">
            <Icon name="bolt" />
          </span>
        </span>
      </div>

      <div class="ap-viz__foot">
        <Icon name="inbox" />
        <span>One queue, whatever the channel</span>
      </div>
    </>
  );
}

/* — 02 Coding and matching, 5.6s clock —————————————————————
   Nine layers on one clock. They must all keep the same duration or the
   sequence desynchronises. */

const CODED_ROWS = [
  { label: 'GL account', value: '6110 - Parts' },
  { label: 'Cost center', value: 'Store 04' },
  { label: 'Sales tax', value: '8.25%' },
];

function OcrViz() {
  return (
    <div class="ap-ocr">
      <div class="ap-ocr__card">
        <div class="ap-ocr__card-head">
          <div>
            <div class="ap-ocr__ref">Invoice 88214</div>
            <div class="ap-ocr__vendor">Midwest Parts Supply</div>
          </div>
          <div class="ap-ocr__amount">$4,318.60</div>
        </div>
        <div class="ap-ocr__lines">
          <span style="width:88%" />
          <span style="width:72%" />
          <span style="width:81%" />
          <span style="width:59%" />
        </div>
        <span class="ap-ocr__scan" />
      </div>

      <div class="ap-ocr__rows">
        {CODED_ROWS.map((r, i) => (
          <div class={`ap-ocr__row ap-ocr__row--${i + 1}`} key={r.label}>
            <Icon name="check" />
            <span class="ap-ocr__row-label">{r.label}</span>
            <span class="ap-ocr__row-value">{r.value}</span>
          </div>
        ))}
      </div>

      <div class="ap-ocr__match">
        <span class="ap-ocr__match-label">PO 4471</span>
        <span class="ap-ocr__link" />
        <span class="ap-ocr__match-label">Receipt</span>
        <span class="ap-ocr__check-wrap">
          <span class="ap-ocr__glow" />
          <Icon name="check_circle" class="ap-ocr__check" />
        </span>
      </div>

      <div class="ap-ocr__pill-wrap">
        <span class="ap-ocr__pill">
          <Icon name="bolt" />3-way match - posted touchless
        </span>
      </div>
    </div>
  );
}

/* — 03 Approvals, 5.2s clock ————————————————————————————— */

const APPROVERS = [
  { icon: 'person', name: 'Site manager' },
  { icon: 'supervisor_account', name: 'Controller' },
  { icon: 'verified_user', name: 'CFO' },
];

function WorkflowViz() {
  return (
    <div class="ap-flow">
      {/* The rail fills from one approver to the next, and each badge lands
          in turn — the chain advances rather than a dot passing through. */}
      <div class="ap-flow__chain">
        {APPROVERS.flatMap((a, i) => {
          const node = (
            <span class="ap-flow__node-wrap" key={a.name}>
              <span class="ap-flow__node">
                <Icon name={a.icon} />
              </span>
              <Icon name="check_circle" class="ap-flow__badge" style={delay(i * 0.8)} />
            </span>
          );

          if (i === 0) return [node];

          return [
            <span class="ap-flow__rail" key={`rail-${a.name}`}>
              <span class="ap-flow__fill" style={delay((i - 1) * 0.8)} />
            </span>,
            node,
          ];
        })}
      </div>

      <div class="ap-flow__names">
        {APPROVERS.map((a) => (
          <span key={a.name}>{a.name}</span>
        ))}
      </div>

      {/* The rule appears just before the step it explains. */}
      <div class="ap-flow__notes">
        <span class="ap-flow__rule">Over $5,000 - adds CFO</span>
        <span class="ap-flow__done">
          <Icon name="check_circle" />
          Approved on mobile
        </span>
      </div>
    </div>
  );
}

/* — 04 YoozProtect, 5.4s clock ————————————————————————————— */

const FLAGGED = [
  { icon: 'description', name: 'INV-88214', flag: 'Duplicate' },
  { icon: 'edit_document', name: 'Altered amount', flag: 'Flagged' },
];

function FraudViz() {
  return (
    <>
      <div class="ap-fraud">
        <span class="ap-fraud__shield-wrap">
          <span class="ap-fraud__ring" />
          <span class="ap-fraud__ring ap-fraud__ring--b" />
          <span class="ap-fraud__shield">
            <Icon name="shield" />
          </span>
        </span>

        <div class="ap-fraud__docs">
          <div class="ap-fraud__list">
            {FLAGGED.map((f, i) => (
              <div class={`ap-fraud__row${i === 1 ? ' ap-fraud__row--b' : ''}`} key={f.name}>
                <Icon name={f.icon} />
                <span class="ap-fraud__name">{f.name}</span>
                <span class="ap-fraud__flag">{f.flag}</span>
              </div>
            ))}
          </div>
          {/* The scan line sweeps first; the flags land after it, not
              alongside it. */}
          <span class="ap-fraud__sweep" />
        </div>
      </div>

      <div class="ap-viz__foot ap-fraud__clear">
        <Icon name="account_balance" />
        <span>Vendor bank details verified</span>
      </div>
    </>
  );
}

/* — 05 Connectors, 4.4s clock ————————————————————————————— */

const SYNCED = ['Vendors', 'GL & dimensions', 'POs', 'Payments'];

function ConnectViz({ erpLabel }: { erpLabel: string }) {
  return (
    <div class="ap-connect">
      <div class="ap-connect__top">
        <span class="ap-connect__end">
          <Icon name="bolt" />
        </span>

        <span class="ap-connect__rails">
          <span class="ap-connect__rail">
            <span class="ap-connect__dot" />
          </span>
          <span class="ap-connect__rail">
            <span class="ap-connect__dot ap-connect__dot--back" />
          </span>
        </span>

        <span class="ap-connect__end ap-connect__end--erp">
          <Icon name="account_balance" />
        </span>
      </div>

      <div class="ap-connect__labels">
        <span class="ap-connect__side">Yooz</span>
        <span class="ap-connect__mode">Two-way sync</span>
        <span class="ap-connect__side">{erpLabel}</span>
      </div>

      {/* The chips light in sequence behind the dots, so you can see what
          is syncing rather than just that something is. */}
      <div class="ap-connect__chips">
        {SYNCED.map((s, i) => (
          <span class="ap-connect__chip" style={delay(i * 0.3)} key={s}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* — 06 Payment, 5.2s clock ————————————————————————————————— */

const RAILS = [
  { icon: 'swap_horiz', label: 'ACH' },
  { icon: 'receipt_long', label: 'Check' },
];

function PayViz() {
  return (
    <div class="ap-pay">
      {RAILS.map((r, i) => (
        <div class="ap-pay__row" style={delay(i * 0.5)} key={r.label}>
          <Icon name={r.icon} />
          <span class="ap-pay__label">{r.label}</span>
          <Icon name="check" class="ap-pay__ok" style={delay(i * 0.5)} />
        </div>
      ))}

      <div class="ap-pay__row ap-pay__row--card" style={delay(1)}>
        <Icon name="credit_card" />
        <span class="ap-pay__label">Virtual card</span>
        <span class="ap-pay__cashback" style={delay(1)}>
          + cash back
        </span>
      </div>

      <div class="ap-pay__foot">
        <span class="ap-pay__bar">
          <span class="ap-pay__bar-fill" />
        </span>
        <span class="ap-pay__done">
          <Icon name="sync" />
          <span>Reconciled automatically</span>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

/** The header every product panel on a dark card opens with. */
function ProductHead() {
  return (
    <div class="ap-viz__head">
      <span class="ap-viz__head-label">Yooz - live processing</span>
      <span class="ap-viz__ai">
        <span class="ap-viz__ai-dot" />
        AI
      </span>
    </div>
  );
}

interface Props {
  viz: FeatureViz;
  erpLabel: string;
  /** Dark cards render the panel as a raised white product frame. */
  dark: boolean;
}

export default function FeatureVisual({ viz, erpLabel, dark }: Props) {
  return (
    <div class={dark ? 'ap-viz ap-viz--product' : 'ap-viz'} data-yz-anim={viz}>
      {dark && <ProductHead />}
      {viz === 'capture' && <CaptureViz />}
      {viz === 'ocr' && <OcrViz />}
      {viz === 'workflow' && <WorkflowViz />}
      {viz === 'fraud' && <FraudViz />}
      {viz === 'connect' && <ConnectViz erpLabel={erpLabel} />}
      {viz === 'pay' && <PayViz />}
    </div>
  );
}
