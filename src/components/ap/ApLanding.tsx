/**
 * The AP automation landing page.
 *
 * One island rather than several: the industry and system selection rewrites
 * surfaces in the header, hero, one whole feature card, two FAQ entries, the
 * client-proof heading and the side panel, so splitting it would mean sharing
 * one piece of state across islands for no gain. Astro prerenders this to
 * complete static HTML; hydration only adds the interaction.
 *
 * Nothing is fetched and nothing is behind a login. All personalisation comes
 * from the two tables in `data.ts`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

import DemoModal from './DemoModal';
import Features from './Features';
import Header, { type OpenPicker } from './Header';
import Hero from './Hero';
import SidePanel from './SidePanel';
import { Faq, FinalCta, Footer, Pricing, Reasons, Stories } from './Sections';
import {
  useActiveSection,
  useAnimationPause,
  useRevealPastHero,
} from './hooks';
import { findErp, findIndustry, personalise } from './personalisation';

interface Props {
  /** Lets a campaign land pre-filtered, one landing URL per ad group. */
  defaultIndustry?: string;
  defaultErp?: string;
  ctaLabel?: string;
  showBadges?: boolean;
}

export default function ApLanding({
  defaultIndustry = '',
  defaultErp = '',
  ctaLabel = 'Talk to an expert',
  showBadges = true,
}: Props) {
  const [industryKey, setIndustryKey] = useState(defaultIndustry);
  const [erpKey, setErpKey] = useState(defaultErp);
  const [picker, setPicker] = useState<OpenPicker>(null);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);

  // Google Ads targets a single build per ad group through the URL rather than
  // a separate page each. Values are validated against the tables, so a stale
  // or hand-edited parameter falls back to the unpersonalised page instead of
  // producing empty copy. Read after mount: the prerendered HTML is the
  // unpersonalised state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const industry = params.get('industry');
    if (industry && findIndustry(industry)) setIndustryKey(industry);

    const erp = params.get('erp');
    if (erp && findErp(erp)) setErpKey(erp);
  }, []);

  const p = useMemo(() => personalise(industryKey, erpKey), [industryKey, erpKey]);

  useAnimationPause();
  useRevealPastHero(heroRef, railRef);
  const section = useActiveSection();

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const reset = useCallback(() => {
    setIndustryKey('');
    setErpKey('');
    setQuery('');
  }, []);

  return (
    <div class="ap-root">
      <a class="ap-skip" href="#main">
        Skip to content
      </a>

      <Header
        p={p}
        industryKey={industryKey}
        erpKey={erpKey}
        open={picker}
        query={query}
        onOpen={setPicker}
        onQuery={setQuery}
        onIndustryKey={setIndustryKey}
        onErpKey={setErpKey}
        onReset={reset}
        onOpenModal={openModal}
      />

      <main id="main">
        <Hero
          p={p}
          ctaLabel={ctaLabel}
          showBadges={showBadges}
          industryKey={industryKey}
          erpKey={erpKey}
          onIndustryKey={setIndustryKey}
          onErpKey={setErpKey}
          heroRef={heroRef}
        />

        <div class="ap-body">
          <div class="ap-content">
            <Reasons />
            <Features p={p} />
            <Stories p={p} />
            <Pricing />
            <Faq p={p} />
            <FinalCta p={p} ctaLabel={ctaLabel} />
          </div>

          <SidePanel p={p} section={section} onOpenModal={openModal} railRef={railRef} />
        </div>
      </main>

      <Footer />

      {modalOpen && (
        <DemoModal
          p={p}
          industryKey={industryKey}
          erpKey={erpKey}
          onIndustryKey={setIndustryKey}
          onErpKey={setErpKey}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
