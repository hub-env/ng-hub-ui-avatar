import { readableAvatarInk } from './avatar-ink';

describe('readableAvatarInk', () => {
	it('keeps the design-system lightness rule wherever that rule is readable', () => {
		// `--hub-sys-color-*-on` flips at OKLCh lightness 0.62: below it the surface takes
		// white, above it black. These two sit either side of that line and clear AA both ways.
		expect(readableAvatarInk('#2c3e50')).toBe('#ffffff');
		expect(readableAvatarInk('#f1c40f')).toBe('#000000');
	});

	it('overrides that rule when its pick would miss AA', () => {
		// #d35400 reads as dark to the lightness rule (0.604), but white on it scores 4.17:1.
		expect(readableAvatarInk('#d35400')).toBe('#000000');
	});

	it('reads every colour syntax the avatar can be handed', () => {
		expect(readableAvatarInk('#fff')).toBe('#000000');
		expect(readableAvatarInk('rgb(26, 188, 156)')).toBe('#000000');
		expect(readableAvatarInk('rebeccapurple')).toBe('#ffffff');
		expect(readableAvatarInk('oklch(0.85 0.18 95)')).toBe('#000000');
	});

	it('declines to pick when the real background is unknown', () => {
		// A ratio against a colour the browser resolves later, or against something the page
		// shows through, would be arithmetic on a guess. The token keeps the decision instead.
		expect(readableAvatarInk('var(--brand)')).toBeNull();
		expect(readableAvatarInk('currentColor')).toBeNull();
		expect(readableAvatarInk('transparent')).toBeNull();
		expect(readableAvatarInk('rgba(0, 0, 0, 0.4)')).toBeNull();
		expect(readableAvatarInk(undefined)).toBeNull();
	});
});
