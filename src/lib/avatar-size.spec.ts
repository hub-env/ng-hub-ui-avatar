import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { HubAvatarComponent } from './avatar.component';
import { resolveAvatarSize } from './avatar-size';

describe('resolveAvatarSize', () => {
	it('reads a bare number as pixels', () => {
		expect(resolveAvatarSize(64)).toEqual({ length: '64px', pixels: 64 });
	});

	it('reads a numeric string as pixels', () => {
		expect(resolveAvatarSize('64')).toEqual({ length: '64px', pixels: 64 });
		expect(resolveAvatarSize(' 2.5 ')).toEqual({ length: '2.5px', pixels: 2.5 });
	});

	it('keeps an explicit px value, and the pixel count behind it', () => {
		expect(resolveAvatarSize('64px')).toEqual({ length: '64px', pixels: 64 });
	});

	it('keeps a relative length untouched, with no pixel count to report', () => {
		expect(resolveAvatarSize('1.75rem')).toEqual({ length: '1.75rem', pixels: null });
		expect(resolveAvatarSize('2em')).toEqual({ length: '2em', pixels: null });
		expect(resolveAvatarSize('50%')).toEqual({ length: '50%', pixels: null });
	});

	it('keeps a computed length untouched', () => {
		expect(resolveAvatarSize('calc(2rem + 4px)')).toEqual({ length: 'calc(2rem + 4px)', pixels: null });
		expect(resolveAvatarSize('clamp(2rem, 5vw, 4rem)')).toEqual({ length: 'clamp(2rem, 5vw, 4rem)', pixels: null });
		expect(resolveAvatarSize('var(--profile-avatar-size)')).toEqual({
			length: 'var(--profile-avatar-size)',
			pixels: null
		});
	});

	it('falls back to the default rather than writing something unpaintable', () => {
		expect(resolveAvatarSize('banana')).toEqual({ length: '50px', pixels: 50 });
		expect(resolveAvatarSize('64 px')).toEqual({ length: '50px', pixels: 50 });
		expect(resolveAvatarSize('')).toEqual({ length: '50px', pixels: 50 });
		expect(resolveAvatarSize(null)).toEqual({ length: '50px', pixels: 50 });
		expect(resolveAvatarSize(undefined)).toEqual({ length: '50px', pixels: 50 });
		expect(resolveAvatarSize(Number.NaN)).toEqual({ length: '50px', pixels: 50 });
	});
});

describe('HubAvatarComponent size', () => {
	let fixture: ComponentFixture<HubAvatarComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HubAvatarComponent],
			providers: [provideHttpClient()]
		}).compileComponents();

		fixture = TestBed.createComponent(HubAvatarComponent);
		fixture.componentRef.setInput('name', 'John Doe');
		fixture.detectChanges();
	});

	/** The container is what gives the avatar its box, so it is where the unit has to survive. */
	function paintedSize(): { host: string; container: string; lineHeight: string } {
		const host: HTMLElement = fixture.nativeElement;
		const container: HTMLElement = fixture.debugElement.query(By.css('.avatar-container')).nativeElement;
		const content: HTMLElement = fixture.debugElement.query(By.css('.avatar-content')).nativeElement;
		return {
			host: host.style.getPropertyValue('--hub-avatar-size').trim(),
			container: container.style.width,
			lineHeight: content.style.lineHeight
		};
	}

	it('paints a bare number as pixels, as it always has', () => {
		fixture.componentRef.setInput('size', 64);
		fixture.detectChanges();

		expect(paintedSize()).toEqual({ host: '64px', container: '64px', lineHeight: '64px' });
	});

	it('paints a size that already carries units as written', () => {
		fixture.componentRef.setInput('size', '1.75rem');
		fixture.detectChanges();

		expect(paintedSize()).toEqual({ host: '1.75rem', container: '1.75rem', lineHeight: '1.75rem' });
	});

	it('derives the initials font size from a relative size instead of dropping it', () => {
		fixture.componentRef.setInput('size', '1.75rem');
		fixture.detectChanges();

		// The CSSOM folds `calc(1.75rem / 3)` down to `calc(0.583333rem)` on the way in, so what
		// is asserted is that the division survived in the avatar's own unit — not the spelling.
		const content: HTMLElement = fixture.debugElement.query(By.css('.avatar-content')).nativeElement;
		expect(content.style.fontSize).toMatch(/^calc\(.*rem\)$/);
	});

	it('falls back to the default when the size cannot be painted', () => {
		fixture.componentRef.setInput('size', 'banana');
		fixture.detectChanges();

		expect(paintedSize()).toEqual({ host: '50px', container: '50px', lineHeight: '50px' });
	});
});
