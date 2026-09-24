import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { contrastRatio } from 'ng-hub-ui-utils';
import { AVATAR_CONFIG } from './avatar-config.token';
import { HubAvatarComponent } from './avatar.component';
import { defaultColors } from './avatar.service';

/**
 * WCAG 2 AA for body text. The initials are text, so 3:1 (large text / UI components)
 * does not apply: at the default `textSizeRatio` of 3 a 50px avatar writes ~16px initials.
 */
const AA_MIN_CONTRAST = 4.5;

/**
 * What the stylesheet paints when the component emits no inline colour:
 * `--hub-avatar-fg-color` → `--hub-avatar-accent-on`, which is white for the default
 * (dark) primary accent. Encoded here because that fallback is the failure this suite
 * guards — an avatar that leaves the ink to the token gets white initials on whatever
 * background the hash happened to pick.
 */
const STYLESHEET_INK = '#ffffff';

@Component({
	standalone: true,
	imports: [HubAvatarComponent],
	template: `<hub-avatar [name]="name()" />`
})
class ContrastHostComponent {
	readonly name = signal('a');
}

/**
 * A name whose characters sum to the given palette slot. `getRandomColor` indexes the
 * palette by the ASCII sum modulo its length, and consecutive letters give consecutive
 * sums, so the eight letters from 'a' cover every slot of an eight-colour palette exactly
 * once — no search needed, and the mapping stays readable in the failure output.
 */
function nameForPaletteSlot(slot: number): string {
	return String.fromCharCode('a'.charCodeAt(0) + slot);
}

/** The palette entry `nameForPaletteSlot(slot)` resolves to, for the given palette. */
function colorForPaletteSlot(palette: string[], slot: number): string {
	return palette[nameForPaletteSlot(slot).charCodeAt(0) % palette.length];
}

describe('automatic avatar colours reach WCAG AA against their initials', () => {
	/**
	 * Renders an initials avatar and returns the two colours actually painted: the inline
	 * background, and the ink — inline when the component picks one, the stylesheet's
	 * fallback when it does not. Going through the rendered element rather than through
	 * the decision function is the point: it measures what a consumer sees.
	 */
	function paint(fixture: ComponentFixture<ContrastHostComponent>): { background: string; ink: string } {
		fixture.detectChanges();
		const painted = fixture.debugElement.query(By.css('.avatar-content')).nativeElement as HTMLElement;
		return {
			background: painted.style.backgroundColor,
			ink: painted.style.color || STYLESHEET_INK
		};
	}

	function measure(palette: string[], config?: { colors: string[] }): void {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				...(config ? [{ provide: AVATAR_CONFIG, useValue: config }] : [])
			]
		});

		const fixture = TestBed.createComponent(ContrastHostComponent);

		palette.forEach((_, slot) => {
			fixture.componentInstance.name.set(nameForPaletteSlot(slot));
			const { background, ink } = paint(fixture);
			const expected = colorForPaletteSlot(palette, slot);

			// Colours are compared by ratio, not by string: the DOM hands back `rgb(…)`
			// whatever the palette was written in, and two identical colours score 1.
			expect(contrastRatio(background, expected)).toBeCloseTo(1, 6);

			const ratio = contrastRatio(ink, background);
			expect(ratio, `${expected} with ${ink} initials`).not.toBeNull();
			expect(ratio!, `${expected} with ${ink} initials scores ${ratio!.toFixed(2)}:1`).toBeGreaterThanOrEqual(
				AA_MIN_CONTRAST
			);
		});
	}

	afterEach(() => TestBed.resetTestingModule());

	it('holds for every colour of the built-in palette', () => {
		measure(defaultColors);
	});

	/**
	 * The same guarantee for a palette the library has never seen. This is what tells a
	 * fixed list apart from a derivation: pinning the eight built-in colours would pass
	 * this suite's first case and still ship a consumer an unreadable avatar.
	 */
	it('holds for a palette supplied through AVATAR_CONFIG', () => {
		const consumerPalette = ['#ff9900', '#cccccc', '#004080', '#7f7f7f', '#00ffcc', '#990000', '#ffffff', '#111111'];
		measure(consumerPalette, { colors: consumerPalette });
	});
});
