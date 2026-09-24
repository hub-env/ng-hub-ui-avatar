/**
 * The avatar's size, split into what CSS is asked to paint and the pixel count behind it
 * (when there is one). The two are not the same question: a box can be sized with any CSS
 * length, while a remote source has to be asked for an image of so many pixels.
 */
export interface AvatarSize {
	/** The length written into CSS — `64px`, `1.75rem`, `calc(2rem + 4px)`. */
	readonly length: string;
	/** The pixels the length is worth, or `null` when only layout could tell. */
	readonly pixels: number | null;
}

/** Pixels an avatar falls back to when its size is absent or unpaintable. */
export const DEFAULT_AVATAR_PIXELS = 50;

const NUMBER = String.raw`[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?`;
const BARE_NUMBER = new RegExp(`^${NUMBER}$`, 'i');
const PIXELS = new RegExp(`^(${NUMBER})px$`, 'i');
const RELATIVE_UNIT = String.raw`%|em|rem|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|[sld]v(?:w|h|i|b|min|max)|cm|mm|q|in|pt|pc`;
const OTHER_LENGTH = new RegExp(`^${NUMBER}(?:${RELATIVE_UNIT})$`, 'i');
// `env()` included because a safe-area inset is a legitimate way to size an avatar in a
// notched layout. Braces and semicolons are excluded so a size input cannot smuggle extra
// declarations into the inline style it ends up in.
const COMPUTED_LENGTH = /^(?:calc|min|max|clamp|var|env)\([^;{}]*\)$/i;

/**
 * Reads the `size` input as a CSS length.
 *
 * A bare number is pixels — that is the contract this component shipped with, and the demos,
 * the docs and every consumer rely on it. Anything that already carries units is CSS's
 * business, not this component's: appending `px` to it produced `1.75rempx`, which the browser
 * drops without a word, and the avatar collapsed to nothing. A value that is neither is
 * refused outright rather than written through, because an invalid declaration fails the same
 * silent way.
 *
 * @param value The raw `size` input.
 * @param fallbackPixels Size to fall back to when `value` says nothing usable.
 */
export function resolveAvatarSize(
	value: string | number | null | undefined,
	fallbackPixels: number = DEFAULT_AVATAR_PIXELS
): AvatarSize {
	const fallback: AvatarSize = { length: `${fallbackPixels}px`, pixels: fallbackPixels };

	if (typeof value === 'number') {
		return Number.isFinite(value) ? { length: `${value}px`, pixels: value } : fallback;
	}

	const raw = (value ?? '').toString().trim();
	if (!raw) {
		return fallback;
	}

	if (BARE_NUMBER.test(raw)) {
		return { length: `${Number(raw)}px`, pixels: Number(raw) };
	}

	const pixels = PIXELS.exec(raw);
	if (pixels) {
		return { length: raw, pixels: Number(pixels[1]) };
	}

	if (OTHER_LENGTH.test(raw) || COMPUTED_LENGTH.test(raw)) {
		return { length: raw, pixels: null };
	}

	return fallback;
}
