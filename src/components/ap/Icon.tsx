/**
 * Material Symbols Outlined, the brand's icon set. Renders the ligature name;
 * never paste inline SVG or another icon library in its place.
 *
 * Icons here are always decorative — every icon-only control carries its own
 * `aria-label` — so they are hidden from assistive technology.
 */

interface Props {
  name: string;
  class?: string;
  /** Used for the per-element offsets that stagger an animation sequence. */
  style?: string;
}

export default function Icon({ name, class: className, style }: Props) {
  return (
    <span class={className ? `yz-icon ${className}` : 'yz-icon'} style={style} aria-hidden="true">
      {name}
    </span>
  );
}
