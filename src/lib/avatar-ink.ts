import { contrastRatio, parseColor, readableOn } from 'ng-hub-ui-utils';

/**
 * WCAG 2 AA for body text. The initials are text, not a UI component, so the 3:1 floor
 * does not apply to them: at the default `textSizeRatio` of 3 a 50px avatar writes ~16px
 * initials, which is neither large nor bold.
 */
const MIN_CONTRAST = 4.5;

const LIGHT_INK = '#ffffff';
const DARK_INK = '#000000';

/**
 * The ink an avatar should write on a background it picked itself.
 *
 * Starts from {@link readableOn}, the same OKLCh-lightness rule the design system computes
 * in CSS for `--hub-sys-color-*-on`, so an avatar and the rest of the system agree on what
 * a given colour wants on top of it. It departs from that rule only where the rule would be
 * unreadable — when its pick misses AA, the other end of the scale is taken instead.
 *
 * That swap is always an improvement, never a coin toss: across every possible luminance the
 * better of black and white never scores below 4.5826:1, so an ink under 4.5:1 proves the
 * opposite ink is the winning one. On the built-in palette the swap fires once, on `#d35400`,
 * where the lightness rule asks for white (4.17:1) and black gives 5.04:1.
 *
 * @param background The colour actually painted behind the text.
 * @returns `'#000000'` or `'#ffffff'`, or `null` when the background is not a colour this
 * library can measure — `var(...)`, `currentColor`, or anything translucent, whose real
 * contrast depends on whatever sits underneath. The caller then paints no ink and leaves
 * the decision to the `--hub-avatar-fg-color` token.
 */
export function readableAvatarInk(background: string | null | undefined): string | null {
	const rgb = parseColor(background);
	if (!rgb || rgb.a < 1) {
		return null;
	}

	const preferred = readableOn(rgb);
	if ((contrastRatio(preferred, rgb) ?? 0) >= MIN_CONTRAST) {
		return preferred;
	}

	return preferred === DARK_INK ? LIGHT_INK : DARK_INK;
}
