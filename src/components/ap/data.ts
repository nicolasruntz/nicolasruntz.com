/**
 * The two personalisation tables the page ships with, plus the system strips
 * and client stories they select from. Everything here is content, verbatim
 * from the design handoff — no value is derived or reworded at runtime.
 *
 * Nothing is fetched: all personalisation is client-side from these tables.
 */

export interface Industry {
  key: string;
  /** Shown in the picker and the step-2 select. */
  label: string;
  /** Reads inside a sentence ("for automotive dealer groups"). */
  inlineLabel: string;
  /** Fills "Talk to a/an … expert". */
  expert: string;
  icon: string;
  /** Hero badge line. */
  eyebrow: string;
  /** Hero lead paragraph. */
  sub: string;
  /** Which client story leads the proof section. */
  story: StoryKey;
  /** Answer to the "is Yooz a fit for …" question. */
  faq: string;
}

export interface Erp {
  key: string;
  label: string;
  /** Sentence fragment describing how this system connects. Every entry has
   *  its own, so no personalised copy falls back to a generic template. */
  note: string;
}

export type StoryKey = 'njtc' | 'agas';

export interface Story {
  key: StoryKey;
  industry: string;
  tag: string;
  quote: string;
  person: string;
  role: string;
  before: string;
  after: string;
}

export interface SystemStrip {
  label: string;
  list: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    key: 'auto',
    label: 'Automotive & dealerships',
    inlineLabel: 'automotive dealer groups',
    expert: 'automotive',
    icon: 'directions_car',
    eyebrow: 'Built for dealership AP',
    sub: 'Yooz reads every parts, floor-plan and body-shop invoice the day it lands - across every rooftop, straight into your DMS.',
    story: 'njtc',
    faq: 'Yes. Multi-rooftop groups run one Yooz tenant with separate entities, separate approval chains and one consolidated view - dealership-level controllers only see their own store.',
  },
  {
    key: 'truck',
    label: 'Heavy-duty truck',
    inlineLabel: 'heavy-duty truck dealers',
    expert: 'heavy-truck',
    icon: 'local_shipping',
    eyebrow: 'Built for heavy-truck dealer groups',
    sub: 'Parts, service and unit invoices captured the day they land, matched line by line, posted to your DMS without re-keying.',
    story: 'njtc',
    faq: 'Yes. Heavy-truck groups run multiple stores in one tenant with per-branch approval chains, and Yooz handles the parts-invoice line volume that generic AP tools choke on.',
  },
  {
    key: 'mfg',
    label: 'Manufacturing',
    inlineLabel: 'manufacturers',
    expert: 'manufacturing',
    icon: 'precision_manufacturing',
    eyebrow: 'Built for manufacturing finance',
    sub: 'Three-way match against POs and goods receipts, line-level, at plant volume - with variances flagged before they hit the ledger.',
    story: 'agas',
    faq: 'Yes. Multi-plant, multi-entity and multi-currency are standard, and PO/GR data syncs both ways so matching happens against live ERP records, not a nightly export.',
  },
  {
    key: 'construction',
    label: 'Construction & engineering',
    inlineLabel: 'construction and engineering firms',
    expert: 'construction',
    icon: 'engineering',
    eyebrow: 'Built for construction finance',
    sub: 'Subcontractor invoices, job costing and retainage coded to the right job and cost code before they reach an approver.',
    story: 'agas',
    faq: 'Yes. Job, phase and cost-code dimensions are pulled from your system and suggested automatically, and project managers approve from their phone on site.',
  },
  {
    key: 'hospitality',
    label: 'Hospitality',
    inlineLabel: 'hospitality groups',
    expert: 'hospitality',
    icon: 'hotel',
    eyebrow: 'Built for multi-property hospitality',
    sub: 'Hundreds of small food, beverage and supplier invoices per property, captured and coded without a back-office AP clerk per site.',
    story: 'agas',
    faq: 'Yes. Property-level entities, GM approval thresholds and consolidated corporate reporting all run in one tenant.',
  },
  {
    key: 'nonprofit',
    label: 'Non-profit',
    inlineLabel: 'non-profits',
    expert: 'non-profit',
    icon: 'volunteer_activism',
    eyebrow: 'Built for non-profit finance',
    sub: 'Grant, fund and program coding applied automatically, with an audit trail your board and auditors can open themselves.',
    story: 'agas',
    faq: 'Yes. Fund, grant and program dimensions are pulled from your accounting system, and the full audit trail plus legal archive is included, not an add-on.',
  },
  {
    key: 'services',
    label: 'Professional services',
    inlineLabel: 'professional services firms',
    expert: 'professional services',
    icon: 'work',
    eyebrow: 'Built for professional services finance',
    sub: 'Client- and matter-coded spend approved by the people who own the budget, without chasing anyone through email.',
    story: 'agas',
    faq: 'Yes. Client, matter and department dimensions are supported, with delegation rules that survive partner vacations.',
  },
  {
    key: 'cas',
    label: 'CAS / accounting firms',
    inlineLabel: 'accounting firms',
    expert: 'CAS',
    icon: 'calculate',
    eyebrow: 'Built for CAS practices',
    sub: 'Run every client on one platform, with clean separation, standard workflows and per-client reporting your team can scale.',
    story: 'agas',
    faq: 'Yes. Firms run each client as its own entity with its own connector - nine of the ten largest audit firms already work in Yooz.',
  },
  {
    key: 'other',
    label: 'another industry',
    inlineLabel: 'your industry',
    expert: 'AP',
    icon: 'domain',
    eyebrow: 'Industry-agnostic by design',
    sub: 'Yooz is built around how AP actually works, not around one vertical - the AI learns your documents, your coding and your rules.',
    story: 'agas',
    faq: 'Almost certainly. Yooz is industry-agnostic: the AI learns from your own documents and coding history rather than from a fixed template library.',
  },
];

export const ERPS: Erp[] = [
  { key: 'intacct', label: 'Sage Intacct', note: 'certified connector, two-way sync of vendors, dimensions and AP bills, with automatic posting.' },
  { key: 'netsuite', label: 'NetSuite', note: 'SuiteApp-listed connector - PRs, POs, invoices and payments sync natively, no templates.' },
  { key: 'bc', label: 'Dynamics 365 Business Central', note: 'native connector with two-way master-data sync and automatic posting.' },
  { key: 'acumatica', label: 'Acumatica', note: 'certified connector with live vendor, GL and PO synchronization.' },
  { key: 'qb', label: 'QuickBooks', note: 'Online and Desktop both supported, including class and location tracking.' },
  { key: 'cdk', label: 'CDK Global', note: 'DMS-native integration built for multi-rooftop dealer groups.' },
  { key: 'tekion', label: 'Tekion', note: 'DMS-native integration with per-store entity separation.' },
  { key: 'karmak', label: 'Karmak', note: 'heavy-truck DMS integration covering parts and service invoice volume.' },
  { key: 'procede', label: 'Procede Excede', note: 'heavy-truck DMS integration with branch-level posting.' },
  { key: 'sage300cre', label: 'Sage 300 CRE', note: 'job, phase and cost-code dimensions mapped during onboarding.' },
  { key: 'sage100', label: 'Sage 100', note: 'native connector with automatic export and posting.' },
  { key: 'sagex3', label: 'Sage X3', note: 'multi-entity connector with dimension mapping.' },
  { key: 'gp', label: 'Dynamics GP', note: 'native connector with automatic voucher creation.' },
  { key: 'f&o', label: 'Dynamics 365 F&SCM', note: 'enterprise connector with multi-legal-entity support.' },
  { key: 'sap', label: 'SAP', note: 'connector covering vendor master, PO and invoice posting.' },
  { key: 'oracle', label: 'Oracle', note: 'connector for vendor, GL and AP document exchange.' },
  { key: 'jde', label: 'JD Edwards', note: 'enterprise connector with business-unit mapping.' },
  { key: 'infor', label: 'Infor', note: 'connector covering AP document exchange and posting.' },
  { key: 'epicor', label: 'Epicor', note: 'connector with PO and receipt matching support.' },
  { key: 'deltek', label: 'Deltek', note: 'project-based coding and approval routing supported.' },
  { key: 'blackbaud', label: 'Blackbaud Financial Edge', note: 'fund and grant dimensions mapped for non-profit finance.' },
  { key: 'mip', label: 'Abila MIP', note: 'fund accounting dimensions supported out of the box.' },
  { key: 'xero', label: 'Xero', note: 'native connector with tracking-category support.' },
  { key: 'winteam', label: 'WinTeam', note: 'connector built for service-contractor AP.' },
  { key: 'jonas', label: 'Jonas Construction', note: 'job-cost dimensions mapped during onboarding.' },
  { key: 'plex', label: 'Plex', note: 'manufacturing connector with PO and receipt matching.' },
  { key: 'tyler', label: 'Tyler Technologies', note: 'public-sector connector with fund-level coding.' },
  { key: 'accufund', label: 'AccuFund', note: 'fund accounting connector for non-profits.' },
  { key: 'dealertrack', label: 'Dealertrack', note: 'DMS integration for franchise dealer groups.' },
  { key: 'automate', label: 'Auto/Mate', note: 'DMS integration with store-level posting.' },
  { key: 'other', label: 'another system', note: 'we map your export format during onboarding - most systems are covered without custom development.' },
];

/** The hero wordmark strip, keyed by industry. `none` covers no selection. */
export const SYSTEM_STRIPS: Record<string, SystemStrip> = {
  auto: { label: 'Native two-way sync with the DMS platforms dealer groups actually run', list: ['CDK Global', 'Tekion', 'Dealertrack', 'Auto/Mate', 'PBS'] },
  truck: { label: 'Native two-way sync with heavy-truck dealer systems', list: ['Karmak', 'Procede Excede', 'PBS', 'CDK Global'] },
  mfg: { label: 'Native two-way sync with the systems manufacturers run', list: ['NetSuite', 'Sage X3', 'Plex', 'Epicor', 'Infor', 'SAP'] },
  construction: { label: 'Native two-way sync with construction and job-cost systems', list: ['Sage 300 CRE', 'Jonas Construction', 'Deltek', 'Acumatica'] },
  hospitality: { label: 'Native two-way sync with multi-property finance systems', list: ['Sage Intacct', 'NetSuite', 'QuickBooks', 'Dynamics 365'] },
  nonprofit: { label: 'Native two-way sync with fund accounting systems', list: ['Blackbaud Financial Edge', 'Abila MIP', 'AccuFund', 'Sage Intacct'] },
  services: { label: 'Native two-way sync with professional services systems', list: ['Sage Intacct', 'NetSuite', 'Deltek', 'QuickBooks'] },
  cas: { label: 'Native two-way sync with the systems your clients run', list: ['QuickBooks', 'Sage Intacct', 'Xero', 'NetSuite'] },
  none: { label: 'Native two-way sync with your ERP or DMS, whichever one you run', list: ['Sage Intacct', 'NetSuite', 'Dynamics 365', 'Acumatica', 'QuickBooks', 'CDK Global', 'Tekion'] },
};

export const STORIES: Record<StoryKey, Story> = {
  njtc: {
    key: 'njtc',
    industry: 'Heavy-duty truck',
    tag: 'Dealer group',
    quote: 'I absolutely love Yooz! I love paperless! No more file cabinet, no more filing, no more matching. The system does it automatically.',
    person: 'Yvette Duque',
    role: 'Bookkeeper, North Jersey Truck Center',
    before: 'Paper invoices filed by hand, manual matching against parts orders.',
    after: 'Touchless capture and matching, no filing cabinet.',
  },
  agas: {
    key: 'agas',
    industry: 'Manufacturing',
    tag: 'Multi-entity',
    quote: 'Yooz has shifted our AP team from being doers to reviewers. It’s not just an AP tool; it’s a system that improves overall efficiency, from data entry to variance analysis.',
    person: 'Megan Rice',
    role: 'Corporate Controller, A-Gas',
    before: 'AP team keying and chasing every invoice.',
    after: 'AP team reviews exceptions and runs variance analysis.',
  },
};

export const REVIEW_BADGES = [
  { source: 'G2', label: 'Best ROI, Spring 2026' },
  { source: 'Capterra', label: 'Shortlist 2026' },
  { source: 'TrustRadius', label: 'Top Rated' },
];

export const PRICING_INCLUDES = [
  'Unlimited users - approvers never cost extra',
  'Every module included: capture, matching, workflow, fraud, payment, archiving',
  'Your ERP or DMS connector, not a paid integration',
  'Continuous updates as they ship',
  'Unlimited support by chat, email and phone',
  '15-day free trial in a real production environment',
];

export const REASONS = [
  {
    icon: 'bolt',
    title: 'Highest return on automation',
    bodyA: 'Capture through payment on one platform cuts AP processing time and cost by ',
    stat: 'up to 80%',
    bodyB: ' - the saving comes from removing steps, not from a cheaper license.',
  },
  {
    icon: 'shield',
    title: 'Ultimate protection',
    bodyA: 'YoozProtect screens every document for forgery, duplicates and atypical amounts, and verifies vendor bank details before a dollar moves.',
    stat: '',
    bodyB: '',
  },
  {
    icon: 'workflow',
    title: 'Infinitely adaptable',
    bodyA: 'Multi-entity, multi-site, multi-currency, with a workflow engine you reconfigure yourself when the org chart changes.',
    stat: '',
    bodyB: '',
  },
  {
    icon: 'check_circle',
    title: 'Redefined simplicity',
    bodyA: '',
    stat: '600,000+',
    bodyB: ' users worldwide, and approvers still need no training and no license conversation. They open a link, see the document, and approve - from a phone if that is where they are.',
  },
];
