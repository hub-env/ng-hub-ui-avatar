import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	OnDestroy,
	SecurityContext,
	ViewChild,
	booleanAttribute,
	computed,
	effect,
	inject,
	input,
	linkedSignal,
	output,
	signal,
	untracked
} from '@angular/core';

import { DomSanitizer, SafeUrl, SafeValue } from '@angular/platform-browser';
import { map, takeWhile } from 'rxjs/operators';
import { readableAvatarInk } from './avatar-ink';
import { HubAvatarService } from './avatar.service';
import { AsyncSource } from './sources/async-source';
import { AvatarSource } from './sources/avatar-source.enum';
import { resolveHubAccent } from 'ng-hub-ui-utils';
import { Source } from './sources/source';
import { SourceFactory } from './sources/source.factory';

type StyleObject = Record<string, string | number | null | undefined>;
type Style = StyleObject | string;

/**
 * Semantic colours for the avatar badge and the avatar colour variants. Each maps
 * to a design-system `--hub-sys-color-*` token. Use them to colour a presence dot
 * (e.g. `success` = online, `warning` = away, `danger` = busy, `secondary` = offline)
 * or a labelled badge. Any custom string is also accepted (set `--hub-avatar-badge-color`).
 */
export type HubAvatarBadgeColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';

/**
 * Universal avatar component that generates an avatar from several sources, falling
 * back from one to the next as each fails to resolve.
 */

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'hub-avatar',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrl: './avatar.component.scss',
	template: `
		<div
			(click)="onAvatarClicked()"
			(keydown.enter)="onAvatarKeydown($event)"
			(keydown.space)="onAvatarKeydown($event)"
			[attr.role]="interactive() ? 'button' : null"
			[attr.tabindex]="interactive() ? 0 : null"
			class="avatar-container"
			[class.hub-avatar--custom]="hasCustomContent()"
			[style]="hostStyle()"
		>
			<span #customContent class="hub-avatar__custom" [style]="customContentStyle()"><ng-content></ng-content></span>
			@if (!hasCustomContent()) {
				@if (avatarSrc(); as src) {
					<img
						[src]="src"
						[alt]="avatarAlt()"
						[width]="size()"
						[height]="size()"
						[style]="avatarStyle()"
						[referrerPolicy]="referrerpolicy()"
						(error)="fetchAvatarSource()"
						class="avatar-content"
						loading="lazy"
					/>
				} @else if (avatarText(); as text) {
					<div class="avatar-content" [style]="avatarStyle()">
						{{ text }}
					</div>
				} @else if (placeholderSrc(); as src) {
					<img
						[src]="src"
						[alt]="avatarAlt()"
						[width]="size()"
						[height]="size()"
						[style]="placeholderStyle()"
						[referrerPolicy]="referrerpolicy()"
						(error)="onPlaceholderError()"
						class="avatar-content hub-avatar__placeholder"
						loading="lazy"
					/>
				}
			}
		</div>
		@if (_hasBadge()) {
			<span
				class="hub-avatar__badge"
				[class.hub-avatar__badge--dot]="_isDot()"
				[class.hub-avatar__badge--label]="!_isDot()"
				[attr.aria-hidden]="_isDot() ? 'true' : null"
				>{{ _badgeText() }}</span
			>
		}
	`,
	host: {
		'[attr.data-badge-color]': 'badgeColor() || null',
		'[style.--hub-avatar-badge-color]': 'badgeColorVar()',
		'[style.--hub-avatar-size]': 'avatarSizePx'
	}
})
export class HubAvatarComponent implements AfterContentInit, OnDestroy {
	private readonly sourceFactory = inject(SourceFactory);
	private readonly avatarService = inject(HubAvatarService);
	private readonly sanitizer = inject(DomSanitizer);

	readonly round = input(true);
	readonly size = input<string | number>(50);

	/**
	 * Marks the avatar as an interactive control. When `true`, the container
	 * exposes `role="button"`, becomes focusable and triggers `clickOnAvatar`
	 * with Enter/Space. Enable it whenever you bind `(clickOnAvatar)`.
	 */
	readonly interactive = input(false, { transform: booleanAttribute });
	readonly textSizeRatio = input(3);
	readonly bgColor = input<string>();
	/**
	 * Colour of the initials (and of projected content). Leave it unset and the avatar picks
	 * black or white per background, whichever reads — see {@link readableAvatarInk}. Set it
	 * to pin one colour: an explicit value always wins, including one that fails contrast,
	 * because a brand that insists on white initials is a decision this component does not get
	 * to overrule.
	 */
	readonly fgColor = input<string>();
	readonly borderColor = input<string>();
	/**
	 * When `true` (default) an initials avatar gets a background colour derived from
	 * a hash of its `name`, applied inline. Set to `false` to suppress that inline
	 * colour so the avatar can be themed via the `--hub-avatar-bg-color` CSS variable
	 * without needing `!important`. An explicit `bgColor` always wins over both.
	 */
	readonly autoColor = input(true, { transform: booleanAttribute });
	readonly style = input<Style>({});
	readonly cornerRadius = input<string | number>(0);
	readonly facebook = input<string | null>(undefined, { alias: 'facebookId' });
	readonly gravatar = input<string | null>(undefined, { alias: 'gravatarId' });
	readonly github = input<string | null>(undefined, { alias: 'githubId' });
	readonly custom = input<string | SafeUrl | null>(undefined, { alias: 'src' });
	readonly customAlt = input<string | null>(undefined, { alias: 'alt' });
	readonly initials = input<string | null>(undefined, { alias: 'name' });
	readonly value = input<string | null>();
	readonly referrerpolicy = input<string | null>();
	/**
	 * Picture of last resort: the URL painted while the avatar has nothing else to show —
	 * every declared source failed, none was declared at all, or an async one has not
	 * answered yet — and there are no initials to fall back on either. Without it the
	 * avatar renders an empty circle, which reads as a layout bug rather than as a missing
	 * person.
	 *
	 * It is deliberately NOT a source: it never joins the fallback chain, so it cannot
	 * outrank the initials the way handing the same URL to `src` would. A placeholder that
	 * fails to load is dropped rather than retried, because there is nothing after it.
	 */
	readonly placeholder = input<string>();
	readonly initialsSize = input<string | number>(0);
	/**
	 * Overlay badge at the bottom-end corner. A boolean / empty value renders a plain
	 * dot (great for a presence indicator); a string or number renders a labelled badge
	 * (e.g. a count like `"4k"`). `null` / absent (default) renders nothing.
	 *
	 * @example <hub-avatar badge badgeColor="success" />      // dot
	 * @example <hub-avatar badge="4k" badgeColor="danger" />  // labelled
	 */
	readonly badge = input<string | number | boolean | null>(null);

	/**
	 * Semantic colour of the {@link badge} (and, as a host class, of the avatar itself).
	 * Maps to a `--hub-sys-color-*` token; any custom string also works (set
	 * `--hub-avatar-badge-color`). When unset the badge uses a neutral default.
	 */
	readonly badgeColor = input<HubAvatarBadgeColor | (string & {}) | null>(null);

	/**
	 * Normalises {@link badgeColor} into a paintable value for the `--hub-avatar-badge-color`
	 * accent slot, accepting ANY colour. A bareword (a semantic name, a host-registered accent,
	 * or a CSS named colour) resolves to its design-system token `var(--hub-sys-color-<name>,
	 * <name>)` — the raw word is the fallback so an unregistered name still paints. A literal
	 * `#hex` / `rgb()` / `oklch()` / `var(...)` is passed through unchanged. `null` when unset,
	 * so the SCSS default (and the builtin `@each` per `data-badge-color`) takes over.
	 */
	protected readonly badgeColorVar = computed(() => resolveHubAccent(this.badgeColor()));

	/** True when a badge should be rendered (the `badge` input is set to anything but `null` / `false`). */
	protected readonly _hasBadge = computed(() => {
		const b = this.badge();
		return b !== null && b !== undefined && b !== false;
	});

	/** The badge's text content; empty for a plain dot (`badge` is `true` or an empty string). */
	protected readonly _badgeText = computed(() => {
		const b = this.badge();
		if (b === true || b === '' || b === null || b === undefined || b === false) {
			return '';
		}
		return String(b);
	});

	/** True when the badge is a plain dot (shown, but with no text content). */
	protected readonly _isDot = computed(() => this._hasBadge() && this._badgeText() === '');

	/**
	 * Fires when the avatar is clicked, or activated with Enter/Space while `interactive`.
	 * It carries the {@link Source} currently painting the avatar, and `null` when there is
	 * none: an avatar built only from projected content has nothing to report, and neither
	 * has one whose every source failed. The `null` is declared rather than leaked so a
	 * handler is told to expect it instead of tripping over an undefined payload.
	 */
	readonly clickOnAvatar = output<Source | null>();

	/** Wrapper around the projected content (`<ng-content>`), used to detect whether the consumer projected anything. */
	@ViewChild('customContent', { static: true }) private customContentRef?: ElementRef<HTMLElement>;

	/** True when the consumer projected custom content (an icon, SVG, image, …) into the avatar. */
	protected readonly hasCustomContent = signal(false);

	/** Inline style applied to the projected-content slot (honours `bgColor` / `fgColor` / `borderColor` / `style`). */
	protected readonly customContentStyle = computed<StyleObject>(() =>
		this.hasCustomContent() ? this.getCustomContentStyle() : {}
	);

	isAlive = true;

	/**
	 * Accessible name of the avatar image. An explicit `alt` wins; otherwise the person's
	 * `name` describes the picture, and with neither the image is decorative and the
	 * attribute stays empty. It must never fall back to the resolved source, or a screen
	 * reader announces the whole Gravatar URL instead of naming anyone.
	 */
	readonly avatarAlt = computed(() => this.customAlt() ?? this.initials() ?? '');

	/**
	 * The fallback chain, rebuilt whole from the source inputs and ordered by the priority the
	 * service is configured with. It is derived rather than patched entry by entry: walking
	 * `SimpleChanges` to add and remove sources reconstructed this same function by hand, and
	 * got it wrong at the edges — emptying the chain left the last resolved avatar on screen.
	 */
	private readonly sources = computed<Source[]>(() => {
		const declared: ReadonlyArray<readonly [AvatarSource, unknown]> = [
			[AvatarSource.FACEBOOK, this.facebook()],
			[AvatarSource.GRAVATAR, this.gravatar()],
			[AvatarSource.GITHUB, this.github()],
			[AvatarSource.CUSTOM, this.custom()],
			[AvatarSource.INITIALS, this.initials()],
			[AvatarSource.VALUE, this.value()]
		];

		return declared
			.filter(([sourceType]) => this.avatarService.isSource(sourceType))
			.reduce<Source[]>((sources, [sourceType, rawValue]) => {
				const sourceId = this.resolveSourceId(rawValue);
				if (sourceId) {
					sources.push(this.sourceFactory.newInstance(sourceType, sourceId));
				}
				return sources;
			}, [])
			.sort((source1, source2) => this.avatarService.compareSources(source1.sourceType, source2.sourceType));
	});

	/**
	 * Cursor into {@link sources}. Linked to the chain so a new chain restarts at its first
	 * usable entry, while a picture that fails to load — or a fetch that errors — advances it
	 * by hand. It legitimately sits past the end: that is the "nothing left to try" position.
	 */
	private readonly cursor = linkedSignal<Source[], number>({
		source: () => this.sources(),
		computation: (sources) => this.nextUsableIndex(sources, 0)
	});

	/**
	 * The source painting the avatar right now, and the only place the chain is indexed:
	 * the cursor sits outside it whenever nothing has resolved, so a raw read yields
	 * `undefined`. Anything that leaves the component gets the declared `null` instead.
	 */
	private readonly currentSource = computed<Source | null>(() => this.sources()[this.cursor()] ?? null);

	/** Picture the network came back with for an {@link AsyncSource}; cleared whenever the cursor moves. */
	private readonly asyncAvatarSrc = signal<string | null>(null);

	/**
	 * The picture painted right now — the source's own URL for a plain image source, the
	 * fetched one for an async source. `null` while the avatar is textual, unresolved, or
	 * still waiting for that response.
	 */
	protected readonly avatarSrc = computed<SafeUrl | null>(() => {
		const source = this.currentSource();
		if (!source || this.avatarService.isTextAvatar(source.sourceType)) {
			return null;
		}

		return source instanceof AsyncSource
			? this.asyncAvatarSrc()
			: this.sanitizer.bypassSecurityTrustUrl(source.getAvatar(+this.size()));
	});

	/** The initials (or raw value) painted right now; `null` while the avatar is a picture or unresolved. */
	protected readonly avatarText = computed<string | null>(() => {
		const source = this.currentSource();
		return source && this.avatarService.isTextAvatar(source.sourceType) ? source.getAvatar(+this.initialsSize()) : null;
	});

	/**
	 * Whether the {@link placeholder} itself failed to load. Linked to the input so a
	 * replacement gets its own chance; without the flag the browser re-requests the same
	 * dead URL on every error, because the error handler is what re-renders the image.
	 */
	private readonly placeholderFailed = linkedSignal<string | undefined, boolean>({
		source: () => this.placeholder(),
		computation: () => false
	});

	/** The placeholder to paint, or `null` when something else is painting or it has failed. */
	protected readonly placeholderSrc = computed<string | null>(() => {
		if (this.avatarSrc() || this.avatarText() || this.placeholderFailed()) {
			return null;
		}

		return this.placeholder() || null;
	});

	/** The placeholder is dressed as any other picture, so it lands where a real avatar would. */
	protected readonly placeholderStyle = computed<StyleObject>(() => this.getImageStyle());

	/** Inline style of whatever is painted — initials and pictures are dressed differently. */
	protected readonly avatarStyle = computed<StyleObject>(() => {
		const source = this.currentSource();
		if (!source) {
			return {};
		}

		return this.avatarService.isTextAvatar(source.sourceType)
			? this.getInitialsStyle(source.sourceId)
			: this.getImageStyle();
	});

	/** Inline size and shape of the avatar container. */
	protected readonly hostStyle = computed<StyleObject>(() => ({
		width: this.size() + 'px',
		height: this.size() + 'px',
		borderRadius: this.round() ? '50%' : this.cornerRadius() + 'px'
	}));

	constructor() {
		// The one step of the chain that cannot be derived: an async source has to leave the
		// component, comes back later and may never come back at all. Everything else about the
		// avatar is a function of the inputs and is computed; this bridges that function to the
		// network, and re-runs whenever the cursor lands on another source.
		effect(() => {
			const source = this.currentSource();
			untracked(() => {
				this.asyncAvatarSrc.set(null);
				if (source instanceof AsyncSource) {
					this.fetchAndProcessAsyncAvatar(source);
				}
			});
		});
	}

	onAvatarClicked(): void {
		this.clickOnAvatar.emit(this.currentSource());
	}

	/**
	 * Keyboard activation for the interactive avatar (Enter/Space). Inert unless
	 * `interactive` is enabled; prevents the default Space scroll.
	 *
	 * @param event Keyboard event from the container.
	 */
	onAvatarKeydown(event: Event): void {
		if (!this.interactive()) {
			return;
		}
		event.preventDefault();
		this.onAvatarClicked();
	}

	/**
	 * Detects projected content once it is available. Runs after content init so the
	 * `<ng-content>` nodes are already in place; everything downstream derives from the flag.
	 */
	ngAfterContentInit(): void {
		const host = this.customContentRef?.nativeElement;
		this.hasCustomContent.set(!!host && this.hasMeaningfulProjectedContent(host));
	}

	/**
	 * Returns true when the projected slot holds a real element or non-whitespace text,
	 * so whitespace-only projection does not flip the avatar into custom-content mode.
	 *
	 * @param host The element wrapping the projected content.
	 */
	private hasMeaningfulProjectedContent(host: HTMLElement): boolean {
		return Array.from(host.childNodes).some(
			(node) =>
				node.nodeType === Node.ELEMENT_NODE ||
				(node.nodeType === Node.TEXT_NODE && (node.textContent ?? '').trim().length > 0)
		);
	}

	/**
	 * Builds the inline style for the projected-content slot. Sensible visible defaults
	 * (a themed background circle and a readable foreground colour) come from CSS tokens;
	 * the `bgColor` / `fgColor` / `borderColor` / `style` inputs override them when set.
	 */
	private getCustomContentStyle(): StyleObject {
		const borderColor = this.borderColor();
		const bgColor = this.bgColor();
		return {
			backgroundColor: bgColor ? bgColor : undefined,
			color: this.inkFor(bgColor),
			border: borderColor ? '1px solid ' + borderColor : undefined,
			...this.getCustomStyleObject()
		};
	}

	/**
	 * The colour to write on `background`, for whichever of the two slots is painting.
	 *
	 * An explicit `fgColor` wins outright. Failing that, the ink is derived from the colour
	 * the avatar is about to paint inline — which is the only moment it is known, since a
	 * hashed background is chosen per name and a `bgColor` is chosen per consumer. Returns
	 * `undefined` when there is no inline background, or when it cannot be measured, so the
	 * stylesheet's `--hub-avatar-fg-color` keeps the decision and token theming still works.
	 */
	private inkFor(background: string | undefined): string | undefined {
		const explicit = this.fgColor();
		if (explicit) {
			return explicit;
		}

		return (background ? readableAvatarInk(background) : null) ?? undefined;
	}

	/**
	 * The avatar size as a px string. Exposed on the host as `--hub-avatar-size`
	 * so the status dot (and any token-driven child) scales with the avatar.
	 */
	get avatarSizePx(): string {
		return (parseFloat(String(this.size())) || 50) + 'px';
	}

	/**
	 * Retires the source painting the avatar and hands over to the next usable one. Bound to
	 * the image's `(error)`, which is how a picture that never loads gives up its turn.
	 */
	fetchAvatarSource(): void {
		const failedSource = untracked(this.currentSource);
		if (failedSource) {
			this.avatarService.markSourceAsFailed(failedSource);
		}

		this.cursor.set(this.nextUsableIndex(untracked(this.sources), untracked(this.cursor) + 1));
	}

	/**
	 * Retires a broken placeholder. Bound to the placeholder image's `(error)`: there is no
	 * further fallback, so the avatar goes back to painting nothing rather than looping on
	 * a URL that has already answered once with a failure.
	 */
	protected onPlaceholderError(): void {
		this.placeholderFailed.set(true);
	}

	/**
	 * First index at or after `from` whose source has not already failed, or the chain's
	 * length when there is none left to try.
	 */
	private nextUsableIndex(sources: Source[], from: number): number {
		let index = from;
		while (index < sources.length && this.avatarService.sourceHasFailedBefore(sources[index])) {
			index++;
		}

		return index;
	}

	/**
	 * The id a source input carries, as a plain string. A string is taken as it is; anything
	 * else — notably the `SafeUrl` a consumer may hand to `src` — is unwrapped through the
	 * sanitizer, and a value that is absent or unsafe drops its source from the chain.
	 */
	private resolveSourceId(rawValue: unknown): string | null {
		if (rawValue && typeof rawValue === 'string') {
			return rawValue;
		}

		return rawValue == null ? null : this.sanitizer.sanitize(SecurityContext.URL, rawValue as SafeValue);
	}

	ngOnDestroy(): void {
		this.isAlive = false;
	}

	/**
	 *
	 * returns initials style
	 *
	 * memberOf HubAvatarComponent
	 */
	private getInitialsStyle(avatarValue: string): StyleObject {
		const borderColor = this.borderColor();
		const bgColor = this.bgColor();
		const hasCornerRadius = !this.round() || +this.cornerRadius() > 0;
		// Explicit `bgColor` wins; otherwise the hash colour is applied inline only
		// while `autoColor` is on. With `[autoColor]="false"` no inline background is
		// emitted, so `.avatar-content { background-color: var(--hub-avatar-bg-color, …) }`
		// takes over and the consumer can theme the avatar through the token.
		const background = bgColor ? bgColor : this.autoColor() ? this.avatarService.getRandomColor(avatarValue) : undefined;
		return {
			textAlign: 'center',
			borderRadius: hasCornerRadius ? (this.round() ? '100%' : this.cornerRadius() + 'px') : undefined,
			border: borderColor ? '1px solid ' + borderColor : undefined,
			textTransform: 'uppercase',
			color: this.inkFor(background),
			backgroundColor: background,
			// Only the size is set inline (it scales with `size`); the family comes from
			// `.avatar-content { font-family: var(--hub-avatar-font-family, …) }` so the
			// initials honour the same token as the rest of the avatar (a `font` shorthand
			// here would pin Helvetica and shadow it).
			fontSize: Math.floor(+this.size() / this.textSizeRatio()) + 'px',
			lineHeight: this.size() + 'px',
			...this.getCustomStyleObject()
		};
	}

	/**
	 *
	 * returns image style
	 *
	 * memberOf HubAvatarComponent
	 */
	private getImageStyle(): StyleObject {
		const borderColor = this.borderColor();
		const hasCornerRadius = !this.round() || +this.cornerRadius() > 0;
		return {
			maxWidth: '100%',
			borderRadius: hasCornerRadius ? (this.round() ? '50%' : this.cornerRadius() + 'px') : undefined,
			border: borderColor ? '1px solid ' + borderColor : undefined,
			width: this.size() + 'px',
			height: this.size() + 'px',
			...this.getCustomStyleObject()
		};
	}

	private getCustomStyleObject(): StyleObject {
		const customStyle = this.style();
		if (!customStyle) {
			return {};
		}

		if (typeof customStyle === 'string') {
			return this.parseInlineStyleString(customStyle);
		}

		return customStyle;
	}

	private parseInlineStyleString(styleString: string): StyleObject {
		const styleObject: StyleObject = {};
		styleString
			.split(';')
			.map((declaration) => declaration.trim())
			.filter((declaration) => declaration.length > 0)
			.forEach((declaration) => {
				const separatorIndex = declaration.indexOf(':');
				if (separatorIndex <= 0) {
					return;
				}
				const property = declaration.slice(0, separatorIndex).trim();
				const value = declaration.slice(separatorIndex + 1).trim();
				if (property && value) {
					styleObject[property] = value;
				}
			});
		return styleObject;
	}

	/**
	 * Fetch avatar image asynchronously.
	 *
	 * param {Source} source represents avatar source
	 * memberof HubAvatarComponent
	 */
	private fetchAndProcessAsyncAvatar(source: AsyncSource): void {
		if (this.avatarService.sourceHasFailedBefore(source)) {
			return;
		}

		this.avatarService
			.fetchAvatar(source.getAvatar(+this.size()))
			.pipe(
				takeWhile(() => this.isAlive),
				map((response) => source.processResponse(response, +this.size()))
			)
			.subscribe({
				// Both land after the pass that would have painted them, so under OnPush nothing
				// would repaint them — except that both end in a signal write the template depends
				// on, and that marks the view on its own. Hence no ChangeDetectorRef here.
				next: (avatarSrc) => this.asyncAvatarSrc.set(avatarSrc),
				error: () => this.fetchAvatarSource()
			});
	}
}
