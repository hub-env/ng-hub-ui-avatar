# Changelog

All notable changes to this project will be documented in this file.

## [22.12.3] - 2026-09-23

### Changed

- **The Angular peer range now says what the code needs, not a number somebody picked.** It asked
  for `>=18.0.0`, which nothing in this package justified. The newest Angular API the source uses is
  input(), which shipped in 17.1, and the partial-Ivy output the Angular linker checks carries no
  marker above it. The range is `>=17.1.0`, so applications on those versions can install this
  library instead of being turned away by a range that was never measured.
- **The floor is derived and checked from now on.** `npm run peers:floors` works it out from three
  things that can be verified — the Angular APIs the source calls, the `minVersion` markers in the
  compiled output, and the Angular types that reach the published `.d.ts` — and CI fails when a
  declaration drifts away from it again.

## [22.12.2] - 2026-09-20

### Changed

- The npm keywords declare `ng-hub-ui`, the family name somebody searching for the ecosystem
  types. Metadata only: no code, types or styles change.

## [22.12.1] - 2026-09-16

### Changed

- The repository moved to the `hub-env` organization. Issues for every Hub UI package are now
  gathered in [hub-env/hub-ui](https://github.com/hub-env/hub-ui/issues), and the `repository`, `bugs`
  and README links point at the new addresses. GitHub redirects the old ones.

## [22.12.0] - 2026-09-08

### Changed

- **The two exported classes carry the `Hub` prefix: `HubAvatarComponent` and `HubAvatarService`.**
  A bare `AvatarComponent` is a name in the consumer's own namespace, not in ours. The day their
  application grows an avatar component of its own — and an application with users generally does —
  the two collide in whichever file imports both, and the only way out is an import alias on our
  side of the line, for a name we never had the right to take. Every other class in this family is
  already prefixed; these two were the leftovers. Nothing about the components changed: same
  selector, same inputs, same behaviour, same injectable.
- **`AvatarModule` keeps its name**, deliberately. It is already announced for removal in 23.0.0, so
  a prefixed spelling would be born deprecated and die in the same release.

### Deprecated

- **`AvatarComponent` and `AvatarService` are now deprecated aliases**, kept so nothing breaks
  today, and removed in **23.0.0** — the release that moves this family to Angular 23. Each is a
  re-export of the prefixed class, so a codebase importing the old name keeps compiling and keeps
  getting the very same class: `AvatarComponent === HubAvatarComponent` and
  `AvatarService === HubAvatarService`, which is pinned by a test rather than promised in prose.

### Added

- **A test reads the exported surface back from the compiled module** and fails on any class that
  ships without the `Hub` prefix, save the two aliases and `AvatarModule`. A naming rule nothing
  enforces is one class away from being false: the next export lands unprefixed and nobody notices
  until a consumer's own `AvatarComponent` collides with it.
- **`ng-hub-ui-ds` is declared as an optional peer dependency** (`>=22.0.0`). The avatar's colours
  and radii resolve through the family's `--hub-sys-*` / `--hub-ref-*` ladder, and the manifest said
  nothing about it — so a consumer reading the package on npm could not tell which package supplies
  them. It stays optional: every token ends in a literal fallback.

## [22.11.1] - 2026-09-08

### Deprecated

- **The `AvatarModule` deprecation now names the release that removes it: 23.0.0.** "A future
  major version" told a reader nothing they could plan against — in this ecosystem the major
  tracks Angular's, so it is not an API decision anyone can anticipate from the changelog. 23.0.0
  is the release that moves this library to Angular 23, which is a date a consumer already has to
  plan for, and it is the same release the modules of `ng-hub-ui-modal`, `-portal`, `-calendar`,
  `-skeleton`, `-stepper` and `-breadcrumbs` are removed in. `AvatarModule.forRoot()` goes with the
  module. Nothing changes at runtime and nothing is removed here: both keep working exactly as
  before, and the migration — `AvatarComponent` plus `provideAvatar()` — is written out in
  [BREAKING_CHANGES.md](./BREAKING_CHANGES.md).

## [22.11.0] - 2026-09-07

### Added

- **`placeholder` finally paints something.** The input had been declared since the component
  was written and nothing read it — not the component, not its template, not the service — so an
  avatar with no source and no initials rendered an empty circle while both READMEs listed the
  input as "reserved". It now holds the picture of last resort: painted only while nothing else
  is (no source resolved, none declared, or an async one still loading) and there are no initials
  to fall back on. It is deliberately **not** a source and never joins the fallback chain, so
  declaring it cannot outrank the initials the way handing the same URL to `src` does. A
  placeholder that itself fails to load is dropped rather than retried, because there is nothing
  after it. The image carries `hub-avatar__placeholder` alongside `avatar-content`, so a
  placeholder can be dressed differently from a real picture.

## [22.10.0] - 2026-09-06

### Added

- **`Source` is part of the public API.** The interface that types the `clickOnAvatar` payload
  lived only inside the package, so nobody could name the type of their own handler: the choice
  was `any` or a hand-copied duplicate that drifts the moment the real one changes. It is a type,
  so re-exporting it from the entry point costs nothing at runtime.

### Changed

- **`clickOnAvatar` emits `Source | null`, not `Source`.** The payload was read from a cursor into
  the fallback list, and that cursor legitimately sits outside it: at `-1` until something resolves
  — an avatar drawn from projected content alone never leaves it — and past the last entry once
  every source has failed. Clicking in either state handed the consumer `undefined` through an
  output that promised a `Source`, so a handler reading `$event.sourceType` threw. The absence is
  now declared instead of leaked and the click still fires; a handler typed `(source: Source)` has
  to widen. See `BREAKING_CHANGES.md`.

- **`<hub-avatar>` runs on `OnPush`.** It was the last component in the family still checked on every
  tick of the application, so a consumer who put an avatar inside an `OnPush` tree paid for that check
  and got nothing from it. What the template reads is derived from the inputs, so it marks the view on
  its own — see the entry below, which is what made the strategy safe to switch.

- **The avatar is derived from its inputs instead of patched from `SimpleChanges`.** The fallback
  chain was rebuilt by hand in `ngOnChanges`, one entry added or removed per changed property, and
  everything it produced — the resolved picture, the initials, their inline styles — was parked in
  mutable fields. But the chain is a function of the source inputs, so it is computed from them now;
  the cursor that walks it is linked to it, and what gets painted derives from wherever that cursor
  sits. The `ChangeDetectorRef` went with it: the template reads signals, and those mark the view on
  their own. Dependencies arrive through `inject()`. The render state the component used to expose as
  public fields is now internal — see `BREAKING_CHANGES.md`.

### Fixed

- **Clearing the last source input now clears the avatar.** Unsetting `name` (or `src`, or any other
  source) dropped the source from the fallback chain and stopped there: with nothing left to resolve,
  nothing repainted, and the initials or the picture of the value that had just been removed stayed
  on screen until some other source arrived. A list rendering avatars for a selection would keep
  showing the person who had just been deselected.

- **The avatar image is named after the person, not after the URL it came from.** The `alt`
  fell back to the resolved source, so a Gravatar, Facebook or custom picture without an explicit
  `alt` made a screen reader read the whole address aloud, and an image resolved asynchronously
  (GitHub) shipped with no `alt` at all or with the address a previous source had left behind.
  The accessible name now comes from `alt` when given, from `name` otherwise, and stays empty
  when there is neither — an avatar nobody named is decorative, and silence beats a URL.

- **The manifest now exports the stylesheet paths the documentation teaches.** The tarball has always
  carried `styles/index.scss` and `styles/mixins/_avatar-theme.scss`, but the generated `exports` map
  listed only the package entry point, so anything under `styles/` was formally private. The Angular
  CLI happens not to notice — its Sass integration falls back to resolving the package root and joins
  the rest of the path by hand — yet every resolver that honours the map (webpack's `sass-loader`,
  dart-sass's `pkg:` importer) refuses `@use 'ng-hub-ui-avatar/styles'` outright. Declaring `./styles`
  and `./styles/mixins/avatar-theme` makes the published surface match what the README, the docs page
  and `BREAKING_CHANGES.md` tell consumers to write, and aligns the package with `ng-hub-ui-ds`, which
  already lists its stylesheet subpaths. Packaging metadata only — no code, no types, no styles change.

- **The documentation now describes the component that exists.** Two inputs shipped without ever
  reaching the reference — `autoColor` (22.6.0) and `interactive` (22.8.0) — so the only way to
  discover that a clickable avatar can be reached with the keyboard, or that the initials background
  can be freed for theming, was to read the source. `clickOnAvatar` was typed `EventEmitter` although
  it is built with `output()`, `style` was described as landing on the avatar's root element although
  it is merged into the rendered content, and the breaking-changes banner still pointed at 21.1.0
  with three later migrations behind it. The English and Spanish READMEs had also drifted apart into
  different section structures, one of them teaching `AvatarModule.forRoot()` as a live API rather
  than the deprecated shim it is.

- **`FUNCTIONALITIES.md` stops reporting a `status` input.** It was renamed to `badge` + `badgeColor`
  in 22.3.0, and the table still listed presence rows under the old name while saying nothing about
  the keyboard activation, the hash-colour opt-out, the projected content, the colour variants or the
  theming mixin.

- **`docs/css-variables-reference.md` points at a stylesheet that exists.** It named
  `src/lib/styles/avatar.scss`, removed in 21.1.0, taught the SCSS import path that 22.7.0 replaced,
  labelled the semantic colours as `status` values, and offered two theming examples built on
  overriding `--hub-avatar-size` — which cannot work, because the host writes that token inline from
  the `size` input. The four `--hub-avatar-accent*` tokens, which are the whole colour engine, were
  missing.

## [22.9.3] - 2026-09-01

### Changed

- **The `homepage` in the manifest points at this library's own documentation page** rather than at
  the site root. It is the link a registry shows beside the package and the one a reader clicks from
  it, and landing on a front page they then have to search is a worse answer than landing on the
  reference for the package they were already looking at. Metadata only — no code, no types, no
  styles change, and nothing a consumer imports is affected.

## [22.9.2] - 2026-08-18

### Changed

- **The README now says what the remote sources cost.** Gravatar, GitHub and Facebook were documented as sources and as "resolved over HTTP", which is accurate and stops one sentence short of the part a consumer has to decide on: those requests leave the visitor's browser, so the third party sees their IP address, and Gravatar also receives a hash of the email address passed to it — enough to correlate a person across every site using it.

    Not a defect and nothing changed in the code: it is what resolving an avatar from Gravatar means. But it is a decision worth taking deliberately rather than finding in a network tab, and the alternative — custom image, initials or text — never leaves your own origin. Both READMEs carry it.

## [22.9.1] - 2026-08-08

### Fixed

- Documentation links now point at the canonical localized URLs. The README linked to `https://hubui.dev/<path>` with no locale prefix and no trailing slash, and both forms are 301-redirected, so every reader arriving from npm or GitHub landed on a redirect instead of the canonical page.

## [22.9.0] - 2026-07-28

### Changed

- **Accent resolution now imports the canonical `resolveHubAccent` from `ng-hub-ui-utils`.** The private copy under `src/lib/shared/resolve-hub-accent.ts` has been deleted in favour of the single, tested implementation shared family-wide. Behaviour is identical (the copy had not diverged): a bareword resolves to `var(--hub-sys-color-<name>, <name>)`, a literal colour passes through unchanged, an empty value yields `null`.

### Added

- **NEW peer dependency: `ng-hub-ui-utils` `>=22.7.0`.** Consumers must have `ng-hub-ui-utils` installed alongside this library (it is where `resolveHubAccent` lives). Users installing via `ng add ng-hub-ui` get it automatically; manual installs need `npm i ng-hub-ui-utils`.

## [22.8.0] - 2026-07-28

### Added

- **`interactive` input** (default `false`): marks the avatar as an interactive control. When enabled, the container exposes `role="button"`, becomes focusable (`tabindex="0"`) and triggers `clickOnAvatar` with Enter/Space (Space scroll prevented). Enable it whenever you bind `(clickOnAvatar)` — the click target used to be mouse-only and invisible to assistive technology.

## [22.7.0] - 2026-07-07

### Changed

- **BREAKING (packaging) — SCSS ships at `ng-hub-ui-avatar/styles`.** The theme mixin now builds to `dist/avatar/styles/...` (was `dist/avatar/src/lib/styles/...`), so `@use 'ng-hub-ui-avatar/styles'` resolves. Update any `@use` that reached into `src/lib/styles`.

- **`<hub-avatar>` `badgeColor` accepts ANY colour.** On top of the built-in semantic accents, the input now also accepts a **registered custom accent** and a **literal colour** (`#ff0000`, `rgb(...)`, `oklch(...)`, a CSS named colour), resolved through the shared `resolveHubAccent` resolver (a local copy of the canonical `ng-hub-ui-utils` helper): a bareword becomes `var(--hub-sys-color-<name>, <name>)`; a literal is used as-is. The single `--hub-<comp>-accent` slot derives the rest of the family, so built-in colours are unchanged.
- **Internal — host bindings moved to the `host` metadata object.** `@HostBinding` / `@HostListener` decorators were replaced by the `host` object in the component/directive metadata (Angular style guide). No public API or behaviour change.

## [22.6.0] - 2026-07-07

### Added

- **`[autoColor]` input for initials avatars.** In `[name]` mode the background colour is derived from a hash of the name and applied inline, which beats any `--hub-avatar-bg-color` theme a consumer sets (and forced `!important` workarounds). `[autoColor]="false"` now suppresses that inline colour so the avatar can be themed purely through the `--hub-avatar-bg-color` CSS variable. Defaults to `true` (unchanged behaviour); an explicit `bgColor` still wins over both.

## [22.5.1] - 2026-07-02

### Fixed

- CSS variable fallbacks realigned to the ds light defaults (`--hub-ref-font-family-base`: `Helvetica, Arial, sans-serif` → `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`); fallbacks only apply when ng-hub-ui-ds is not loaded.
- **Initials avatar honours `--hub-avatar-font-family`.** The initials text no longer pins `Helvetica, Arial, sans-serif` through an inline `font` shorthand (which shadowed the token); only the size is set inline, so the family follows `.avatar-content`'s `--hub-avatar-font-family` — the ds `system-ui` stack by default, matching image/badge text.
- Docs: `docs/css-variables-reference.md` default values resynchronized with the actual code declarations (now guarded by the repo-level `tokens-parity` check F).
- Docs: the README customization example no longer overrides `--hub-avatar-size` — the avatar box is sized from the `size` input at runtime (the inline host style overrules CSS), so the variable is reclassified as `INTERNAL` in the token spec; use the input to size the avatar.

## [22.5.0] - 2026-06-30

### Added

- **Standalone `AvatarComponent`.** `<hub-avatar>` is now a standalone component (`standalone: true`) — import it directly with `imports: [AvatarComponent]`, no `NgModule` required. Aligns the library with the rest of the ng-hub-ui ecosystem and modern Angular.
- **`provideAvatar(config?)`** — a standalone-friendly environment provider that replaces `AvatarModule.forRoot()` for configuring source priority, colour palette and src-cache behaviour. Optional: the component works with sensible defaults out of the box.

### Changed

- `AvatarModule` is now a thin re-export of the standalone `AvatarComponent` (it no longer declares it). Existing `imports: [AvatarModule]` and `AvatarModule.forRoot(config)` usages keep working unchanged.

### Deprecated

- **`AvatarModule`** and **`AvatarModule.forRoot()`** — prefer importing `AvatarComponent` and registering `provideAvatar()`. The module remains for backward compatibility and will be removed in a future major version.

## [22.4.0] - 2026-06-26

### Changed

- **Accent system migrated to the open-set "local accent slot" pattern.** A coloured-circle avatar variant now re-bases a single `--hub-avatar-accent` slot (instead of `--hub-avatar-bg-color` directly), and the role family — `--hub-avatar-accent-emphasis`, `--hub-avatar-accent-subtle` and the new `--hub-avatar-accent-on` (contrast colour) — is derived **locally** from it with `color-mix(in oklch, …)` / relative color, mirroring the `ng-hub-ui-ds` engine. The circle fill (`--hub-avatar-bg-color`) feeds from the slot and the foreground (`--hub-avatar-fg-color`) now defaults to `--hub-avatar-accent-on`, so **light accents (e.g. `light`) get legible dark text automatically**. The built-in variant list and the `$hub-avatar-semantic-colors` Sass map were extended from 8 to the **nine canonical accents** (added `neutral`). The `hub-avatar-color-variants()` mixin (and its default map — **preserved**) now feed the accent slot, so any custom accent (e.g. `brand`) works the same way with no recompilation.

### Added

- New tokens `--hub-avatar-accent` (the semantic slot), `--hub-avatar-accent-emphasis`, `--hub-avatar-accent-subtle` and `--hub-avatar-accent-on`.

### Notes

- The runtime `bgColor` / `fgColor` inputs (applied as inline styles) are unaffected and continue to override the slot-fed defaults. The independent `$bg` / `$fg` parameters of `hub-avatar-theme()` keep their existing behaviour (explicit surface overrides, not the semantic slot).

## [22.3.0] - 2026-06-26

### Changed (BREAKING)

- **`status` → `badge`.** The presence-only `status` input is replaced by a general **`badge`** overlay: `badge` (bare/empty) or `[badge]="true"` renders a **dot**; `badge="4k"` / `[badge]="9"` renders a **labelled pill**; `null` / absent renders nothing. Colour comes from a **semantic** `badgeColor` input — `primary · secondary · success · danger · warning · info · light · dark` (→ `--hub-sys-color-*`). Presence is now expressed through the colour: online → `success`, away → `warning`, busy → `danger`, offline → `secondary`. The `HubAvatarStatus` type is renamed to `HubAvatarBadgeColor`, and the `--hub-avatar-status-*` tokens to `--hub-avatar-badge-*`. **Migration:** `status="online"` → `badge badgeColor="success"`. See `BREAKING_CHANGES.md`.

### Added

- **Semantic colour variants for both the avatar and its badge**, generated in one loop. Out of the box: a coloured-circle avatar variant per semantic colour (`<hub-avatar class="hub-avatar--success">`) and the matching `badgeColor`.
- **`hub-avatar-color-variants($colors)` mixin** — emit those avatar + badge colour variants in your own CSS, defaulting to the eight semantic colours or your own map (e.g. a brand colour). Plus **`hub-avatar-badge-color($color)`** and new `$content-*` / `$badge-*` parameters on `hub-avatar-theme()`.
- New tokens: `--hub-avatar-badge-color` / `-text-color` / `-size` / `-offset` / `-ring-width` / `-ring-color` / `-font-size` / `-padding`.

## [22.2.1] - 2026-06-26

### Fixed

- Corrected the Angular peer dependency range from `>=16.0.0` to `>=18.0.0`. The library uses `input()` (Angular 17.1), `output()` (17.3) and the `@if` control flow (17), so it never actually worked on Angular 16 / 17.0–17.2 — the declared range now reflects the real minimum.
- Declared `ts-md5` (used by the Gravatar source) and `tslib` as runtime `dependencies`. Previously `ts-md5` was not declared at all (only listed under `allowedNonPeerDependencies`), so consumers using the Gravatar source could hit a missing-module error, and `tslib` was a peer dependency. Both now install automatically with the package.

## [22.2.0] - 2026-06-26

### Added

- **Projected custom content** — place any icon (`<i class="fa…">`, `<span class="material-icons">`…), an inline `<svg>`, an `<img>` or an emoji directly inside `<hub-avatar>` and it is handled agnostically: font icons inherit a sensible size while SVG/images fill the avatar, both centred with decent padding, clipped to the avatar shape (round or square) and scaling with `size`. It activates automatically when content is projected and takes precedence over the image/initials sources. The content sits on the avatar's own background (`--hub-avatar-bg-color`) with the avatar foreground colour (white), so it reads as a coloured circle out of the box; the existing `bgColor` / `fgColor` / `borderColor` / `style` inputs still apply. Two new sizing tokens: `--hub-avatar-content-padding` and `--hub-avatar-content-icon-size`.

### Changed

- The default `--hub-avatar-bg-color` is now the design-system accent (`--hub-sys-color-primary`) instead of the page surface, so icon/content avatars render as a coloured circle by default (matching how a milestone node fills with the accent). Initials and value avatars are unaffected — they already override the background with their own (auto-generated or `bgColor`) colour — and image avatars cover it.

## [22.1.1] - 2026-06-25

### Fixed

- Design-token consistency pass: aligned inline fallback defaults with the canonical `ng-hub-ui-ds` values and routed hardcoded literals (z-index, font-weight, line-height, radii and theme-aware colours) through their `--hub-sys-*` / `--hub-ref-*` tokens, so they follow the active theme. No visual change when the ds tokens are loaded.

## [22.1.0] - 2026-06-24

### Added

- New **`status` input** — a semantic presence indicator dot at the bottom-end corner. Built-ins map to the design-system colours: `online` → success, `away` → warning, `busy` → danger, `offline` → neutral (driven by a `data-status` `@each` loop); any custom string is accepted (set `--hub-avatar-status-color`). When unset (default) no dot renders. The dot scales with the avatar — the component now exposes the live size on the host as `--hub-avatar-size`. New tokens `--hub-avatar-status-size` / `-offset` / `-ring-width` / `-ring-color` / `-color`. A `HubAvatarStatus` type is now exported for the built-in statuses.
- New **`.hub-avatar-group`** helper class — wrap several `<hub-avatar>` to overlap them into a stacked group; each avatar gets a ring so the edges read cleanly. New tokens `--hub-avatar-group-overlap` / `-ring-width` / `-ring-color`.
- New **`hub-avatar-theme()` Sass mixin** (`styles/mixins/avatar-theme`) — theme an avatar in one call: shape/surface, initials typography, the status dot and the group ring. Every parameter is optional and defaults to `null`, so only the ones you pass are emitted as `--hub-avatar-*` overrides. Token-based, no Bootstrap dependency.

### Fixed

- Aligned the font-family token reference with the canonical `ng-hub-ui-ds` name: `--hub-ref-font-family-sans-serif` → `--hub-ref-font-family-base` (no visual change).

## [22.0.0] - 2026-06-17

### Changed

- Aligned with Angular 22.
- README documentation standardized.


## [21.1.1] - 2026-06-14

### Changed

- Replaced the deprecated `ngStyle` directive with the native `[style]` binding (Angular soft-deprecated `ngStyle`/`ngClass` in November 2024 in favour of native bindings, for better performance and smaller bundles).

## [21.1.0] - 2026-03-17

### Changed

- **BREAKING CHANGE:** Internal styles are now encapsulated within `HubAvatarComponent` via `avatar.component.scss`.
- Modernized unit tests to use `fixture.componentRef.setInput`.
- Improved test environment configuration.

## [21.0.0] - 2026-03-09

### Changed

- **BREAKING CHANGE:** Modernized component inputs to use Angular Signals.
- Refactored component structure to improve readability and maintainability.
- Updated documentation and README for better clarity, including details about project inspiration, ng-hub-ui family support, and formatting fixes.

### Removed

- **BREAKING CHANGE:** Removed `google`, `instagram`, `skype`, `twitter`, and `vkontakte` avatar sources from the library.
