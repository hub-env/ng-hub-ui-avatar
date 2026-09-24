# ng-hub-ui-avatar

[Español](./README.es.md) | **English**

[![NPM Version](https://img.shields.io/npm/v/ng-hub-ui-avatar.svg)](https://www.npmjs.com/package/ng-hub-ui-avatar)
[![npm](https://img.shields.io/npm/dt/ng-hub-ui-avatar.svg)](https://www.npmjs.com/package/ng-hub-ui-avatar)
[![license](https://img.shields.io/npm/l/ng-hub-ui-avatar.svg)](https://github.com/hub-env/ng-hub-ui-avatar/blob/main/LICENSE)

A universal avatar component for Angular applications that renders avatars from multiple sources (Gravatar, GitHub, Facebook, custom images, initials or plain text) and applies an automatic fallback strategy when a source fails.

> **⚠️ BREAKING CHANGES:** 22.15.0 honours a `size` that carries units instead of turning it into
> pixels: `size="1.75rem"` was composed as `1.75rempx`, which the browser drops in silence, so the
> avatar rendered with no box at all. A bare number is still pixels; the `avatarSizePx` getter is
> replaced by the `avatarSize()` signal.
> 22.14.0 stops painting every initial white. The ink is now chosen per
> background — black or white, whichever clears WCAG AA — so six of the eight automatic colours
> flip to black initials, and so does projected content over a light `bgColor`. The backgrounds do
> not move. `fgColor` loses its `'#FFF'` default, which was a sentinel the component compared
> against literally and never a painted colour; set it explicitly and it still always wins.
> 22.13.0 raises the Angular floor to 20.2: the template uses an `as` on an
> `@else if`, which Angular did not accept until then, so the old range promised a version this
> package could never build on.
> 22.12.0 renames `AvatarComponent` to `HubAvatarComponent` and
> `AvatarService` to `HubAvatarService`; the old names stay as deprecated aliases of the same
> classes and are removed in 23.0.0, so nothing breaks today.
> 22.11.1 announces that `AvatarModule` and `AvatarModule.forRoot()` are
> removed in 23.0.0, the next version that tracks a new Angular major — nothing changes at runtime yet,
> and the migration is `HubAvatarComponent` plus `provideAvatar()`.
> 22.10.0 makes the avatar's render state internal (`avatarSrc`, `avatarText`,
> `avatarStyle`, `hostStyle`, `hasCustomContent`, `customContentStyle`), drops `ngOnChanges` and widens the
> `clickOnAvatar` payload to `Source | null`. Earlier notes — 22.7.0 (SCSS moved to `ng-hub-ui-avatar/styles`),
> 22.3.0 (`status` replaced by `badge` + `badgeColor`) and 21.1.0 (no stylesheet import) — are in
> [BREAKING_CHANGES.md](./BREAKING_CHANGES.md). Read it before upgrading.

## Documentation and Live Examples

This package is part of [Hub UI](https://hubui.dev/en/), a collection of Angular component libraries for standalone apps.

- Docs: https://hubui.dev/en/avatar/overview/
- Live examples: https://hubui.dev/en/avatar/examples/
- Hub UI: https://hubui.dev/en/
- Hub UI on GitHub (issues, roadmap and contributing): https://github.com/hub-env/hub-ui

## 🧩 Library Family `ng-hub-ui`

This library is part of the **Hub UI** ecosystem:

- [ng-hub-ui-accordion](https://www.npmjs.com/package/ng-hub-ui-accordion) (deprecated — use ng-hub-ui-panels)
- [ng-hub-ui-action-sheet](https://www.npmjs.com/package/ng-hub-ui-action-sheet)
- [ng-hub-ui-avatar](https://www.npmjs.com/package/ng-hub-ui-avatar) ← You are here
- [ng-hub-ui-board](https://www.npmjs.com/package/ng-hub-ui-board)
- [ng-hub-ui-breadcrumbs](https://www.npmjs.com/package/ng-hub-ui-breadcrumbs)
- [ng-hub-ui-calendar](https://www.npmjs.com/package/ng-hub-ui-calendar)
- [ng-hub-ui-dropdown](https://www.npmjs.com/package/ng-hub-ui-dropdown)
- [ng-hub-ui-ds](https://www.npmjs.com/package/ng-hub-ui-ds)
- [ng-hub-ui-forms](https://www.npmjs.com/package/ng-hub-ui-forms)
- [ng-hub-ui-history](https://www.npmjs.com/package/ng-hub-ui-history)
- [ng-hub-ui-milestones](https://www.npmjs.com/package/ng-hub-ui-milestones)
- [ng-hub-ui-modal](https://www.npmjs.com/package/ng-hub-ui-modal)
- [ng-hub-ui-nav](https://www.npmjs.com/package/ng-hub-ui-nav)
- [ng-hub-ui-paginable](https://www.npmjs.com/package/ng-hub-ui-paginable)
- [ng-hub-ui-panels](https://www.npmjs.com/package/ng-hub-ui-panels)
- [ng-hub-ui-portal](https://www.npmjs.com/package/ng-hub-ui-portal)
- [ng-hub-ui-skeleton](https://www.npmjs.com/package/ng-hub-ui-skeleton)
- [ng-hub-ui-sortable](https://www.npmjs.com/package/ng-hub-ui-sortable)
- [ng-hub-ui-stepper](https://www.npmjs.com/package/ng-hub-ui-stepper)
- [ng-hub-ui-utils](https://www.npmjs.com/package/ng-hub-ui-utils)

## 📑 Table of Contents

- [Documentation and Live Examples](#documentation-and-live-examples)
- [🧩 Library Family `ng-hub-ui`](#-library-family-ng-hub-ui)
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Styling](#styling)
- [Changelog](#changelog)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Description

`ng-hub-ui-avatar` is a universal avatar component for Angular applications. It can render avatars from multiple sources and apply an automatic fallback strategy when a source fails.

Supported avatar sources:

- Gravatar
- GitHub
- Facebook
- Custom image (`src`)
- Initials (`name`)
- Text value (`value`)

> **These three sources contact a third party.** `secure.gravatar.com`, `api.github.com` and
> `graph.facebook.com` are reached from the visitor's browser, so those services see the
> visitor's IP address — and Gravatar additionally receives a hash of the email address you
> pass it, which is enough to correlate a person across every site that uses Gravatar. That is
> not a defect, it is what "resolve an avatar from Gravatar" means; but it is a decision worth
> making deliberately rather than discovering in a network tab. If you cannot send that data,
> use the custom image, initials or text sources, which never leave your own origin.

Fallback uses a source priority order. By default, the component tries the supported sources in their configured order until one succeeds.

> This project is a fork of [ngx-avatars](https://github.com/Heatmanofurioso/ngx-avatars), which itself continued the original avatar work. This package adapts and maintains the component for modern Angular applications.

## Features

- **Multiple Sources**: Gravatar, GitHub, Facebook, custom images, initials and plain text.
- **Projected Custom Content**: Drop any icon (FontAwesome, Material…), inline SVG, image or emoji inside `<hub-avatar>` and it is sized, centered and padded agnostically.
- **Automatic Fallback**: Configurable source priority order with graceful fallback when a source fails.
- **Initials Generation**: Builds initials avatars from a name with auto-generated background colors.
- **Readable by construction**: the initials are written in black or white, whichever clears WCAG AA against the background the avatar picked — including a palette of your own.
- **Async Remote Sources**: Resolves remote avatars (for example Gravatar) over HTTP with caching support.
- **Flexible Shape**: Round or square avatars with configurable corner radius and border.
- **CSS Variables**: Full theming via canonical `--hub-avatar-*` custom properties.
- **Signals API**: Modern Angular inputs/outputs built on signals.
- **Standalone-first**: `<hub-avatar>` is a standalone component — import it directly, no `NgModule` required. Customize colors, source priority order and cache behavior via `provideAvatar()`.

## Installation

```bash
npm install ng-hub-ui-avatar
```

## Quick Start

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAvatar } from 'ng-hub-ui-avatar';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
	providers: [
		provideHttpClient(), // required for async remote sources (Gravatar, GitHub…)
		provideAvatar() // optional — pass a config to customise sources/colours/cache
	]
});
```

Then import the standalone component and use it in any template:

```typescript
import { Component } from '@angular/core';
import { HubAvatarComponent } from 'ng-hub-ui-avatar';

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [HubAvatarComponent],
	template: `<hub-avatar name="John Doe" [round]="true" size="64"></hub-avatar>`
})
export class ProfileComponent {}
```

> `provideAvatar()` is optional — `<hub-avatar>` works out of the box with defaults. `HttpClient` is only needed for async remote sources (Gravatar, GitHub).

## Usage

`<hub-avatar>` is a **standalone** component: import `HubAvatarComponent` directly into the `imports` of any standalone component (as shown above). No `NgModule` is required.

### Configuration (`provideAvatar`)

`provideAvatar()` customises the source priority order, the colour palette used by initials avatars and the src-cache behaviour.

```typescript
import { provideAvatar, AvatarSource } from 'ng-hub-ui-avatar';

bootstrapApplication(AppComponent, {
	providers: [
		provideAvatar({
			sourcePriorityOrder: [AvatarSource.CUSTOM, AvatarSource.INITIALS],
			colors: ['#FFB6C1', '#2c3e50', '#95a5a6', '#f39c12', '#1abc9c'],
			disableSrcCache: false
		})
	]
});
```

> **Legacy `NgModule` — deprecated, removed in 23.0.0:** `AvatarModule` only re-exports the standalone component, and `AvatarModule.forRoot(config)` writes the same `AVATAR_CONFIG` token `provideAvatar()` does. Both keep working until 23.0.0, the release that moves this library to Angular 23; import `HubAvatarComponent` and register `provideAvatar()` instead. See `BREAKING_CHANGES.md`.

`AvatarConfig` fields:

| Field                 | Type             | Description                                            |
| --------------------- | ---------------- | ------------------------------------------------------ |
| `colors`              | `string[]`       | Custom color palette for generated text avatars.       |
| `sourcePriorityOrder` | `AvatarSource[]` | Custom fallback order across avatar sources.           |
| `disableSrcCache`     | `boolean`        | Disables the cache for custom (image) source requests. |

`AvatarSource` enum values: `FACEBOOK`, `GRAVATAR`, `GITHUB`, `CUSTOM`, `INITIALS`, `VALUE`.

> **You do not have to pick colours that carry white text.** Whatever palette you hand `colors`, each avatar writes its
> initials in black or white — whichever reaches the WCAG AA ratio of 4.5:1 against the colour it drew. The same goes for a
> `bgColor` set on one avatar. Set `fgColor` when you want a specific colour regardless.

> Note: `facebookId` is kept as a best-effort compatibility source and may fail depending on external API/privacy restrictions.

### Examples

```html
<hub-avatar gravatarId="adde9b2b981a8083cf084c63ad86f753"></hub-avatar>
<hub-avatar gravatarId="user@gmail.com"></hub-avatar>
<hub-avatar githubId="angular"></hub-avatar>
<hub-avatar facebookId="nasa"></hub-avatar>
<hub-avatar src="assets/avatar.jpg"></hub-avatar>
<hub-avatar name="John Doe"></hub-avatar>
<hub-avatar value="75%"></hub-avatar>

<hub-avatar
	facebookId="userFacebookID"
	name="Haithem Mosbahi"
	src="assets/avatar.jpg"
	value="28%"
	gravatarId="adde9b2b981a8083cf084c63ad86f753"
	size="100"
	[round]="true"
></hub-avatar>
```

### Clickable avatars

`clickOnAvatar` fires on click alone, which leaves keyboard and screen-reader users with no way to
trigger it. Add `interactive` and the container becomes a real control: `role="button"`, reachable
with Tab, activated with Enter or Space.

```html
<hub-avatar name="John Doe" interactive (clickOnAvatar)="openProfile($event)"></hub-avatar>
```

### Custom content (icons, SVG, images)

Project any content directly inside `<hub-avatar>` — an icon from any library, an inline `<svg>`, an `<img>` or even an emoji — and the avatar handles it agnostically: it centers the content, applies decent padding and clips it to the avatar shape (round or square). Font icons inherit a size and colour; inline SVG/images fill the avatar. Everything scales with `size`.

```html
<!-- FontAwesome (or any icon font) -->
<hub-avatar><i class="fa-solid fa-user"></i></hub-avatar>

<!-- Material Symbols -->
<hub-avatar size="72"><span class="material-symbols-outlined">rocket_launch</span></hub-avatar>

<!-- Inline SVG -->
<hub-avatar size="64">
	<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 2 7l10 5 10-5-10-5Z" /></svg>
</hub-avatar>

<!-- Emoji -->
<hub-avatar>🚀</hub-avatar>
```

It activates automatically whenever content is projected and takes precedence over the image/initials sources. The circle uses the avatar's own background (`--hub-avatar-bg-color`, the design-system accent by default) with a white foreground, so it reads as a coloured circle out of the box. Theme it with the regular `bgColor` / `fgColor` / `borderColor` inputs — set `bgColor` and the foreground follows it, black or white, whichever reads — and tune the sizing with the `--hub-avatar-content-*` tokens (see [Styling](#styling)).

## API Reference

### Inputs

| Input            | Type                                                              | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------- | ----------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `facebookId`     | `string \| null`                                                  | `undefined` | Facebook user id                                                                                                                                                                                                                                                                                                                                                                             |
| `gravatarId`     | `string \| null`                                                  | `undefined` | Gravatar email/hash                                                                                                                                                                                                                                                                                                                                                                          |
| `githubId`       | `string \| null`                                                  | `undefined` | GitHub user id                                                                                                                                                                                                                                                                                                                                                                               |
| `src`            | `string \| SafeUrl \| null`                                       | `undefined` | Custom image source                                                                                                                                                                                                                                                                                                                                                                          |
| `alt`            | `string \| null`                                                  | `undefined` | Custom image alt text                                                                                                                                                                                                                                                                                                                                                                        |
| `name`           | `string \| null`                                                  | `undefined` | Text source used to generate initials                                                                                                                                                                                                                                                                                                                                                        |
| `value`          | `string \| null`                                                  | `undefined` | Direct text avatar value                                                                                                                                                                                                                                                                                                                                                                     |
| `size`           | `number \| string`                                                | `50`        | Avatar size: a bare number is px, any CSS length (`1.75rem`, `50%`, `calc(2rem + 12px)`) is used as written                                                                                                                                                                                                                                                                                                                                                                            |
| `textSizeRatio`  | `number`                                                          | `3`         | Text size ratio (`size / textSizeRatio`)                                                                                                                                                                                                                                                                                                                                                     |
| `initialsSize`   | `number \| string`                                                | `0`         | Max initials length (`0` means no limit)                                                                                                                                                                                                                                                                                                                                                     |
| `round`          | `boolean`                                                         | `true`      | Enables circular shape                                                                                                                                                                                                                                                                                                                                                                       |
| `cornerRadius`   | `number \| string`                                                | `0`         | Radius in px when `round` is `false`                                                                                                                                                                                                                                                                                                                                                         |
| `bgColor`        | `string`                                                          | `undefined` | Background color override                                                                                                                                                                                                                                                                                                                                                                    |
| `autoColor`      | `boolean`                                                         | `true`      | Derives the initials background from a hash of `name` and applies it inline. Set to `false` to theme the avatar through `--hub-avatar-bg-color`; an explicit `bgColor` always wins.                                                                                                                                                                                                          |
| `fgColor`        | `string`                                                          | `undefined` | Colour of the initials (and of projected content). Left unset, the avatar writes black or white on whatever background it paints, whichever reaches WCAG AA. Set it to pin one colour: an explicit value always wins, including one that fails contrast.                                                                                                                                     |
| `borderColor`    | `string`                                                          | `undefined` | Border color (applies a 1px solid border)                                                                                                                                                                                                                                                                                                                                                    |
| `style`          | `Record<string, string \| number \| null \| undefined> \| string` | `{}`        | Inline styles merged into the rendered content — the image, the initials or the projected-content slot. A CSS string (`'border: 1px solid red'`) is parsed. It never reaches the host element.                                                                                                                                                                                               |
| `placeholder`    | `string`                                                          | `undefined` | Picture of last resort, painted only while nothing else is: no source resolved, none declared, or one still loading, and no initials either. It is not a source and never joins the fallback chain, so it cannot outrank the initials the way `src` would. A placeholder that fails to load is dropped, not retried. The image carries `hub-avatar__placeholder` alongside `avatar-content`. |
| `referrerpolicy` | `string \| null`                                                  | `undefined` | Referrer policy for avatar image requests                                                                                                                                                                                                                                                                                                                                                    |
| `interactive`    | `boolean`                                                         | `false`     | Turns the avatar into a control: `role="button"`, focusable, and Enter/Space emit `clickOnAvatar`. Enable it whenever you bind that output.                                                                                                                                                                                                                                                  |
| `badge`          | `string \| number \| boolean \| null`                             | `null`      | Corner overlay. `badge` / `[badge]="true"` → a **dot**; `badge="4k"` / `[badge]="9"` → a **labelled** pill; `null` / absent → nothing.                                                                                                                                                                                                                                                       |
| `badgeColor`     | `HubAvatarBadgeColor \| string \| null`                           | `null`      | Semantic colour of the badge: `primary · secondary · success · danger · warning · info · light · dark` (→ `--hub-sys-color-*`). Any custom string also works (set `--hub-avatar-badge-color`).                                                                                                                                                                                               |

`HubAvatarBadgeColor` is an exported type covering the semantic colours: `'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'`. Express presence with the colour: online → `success`, away → `warning`, busy → `danger`, offline → `secondary`.

### Outputs

| Output          | Type                               | Description                                                                                       |
| --------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| `clickOnAvatar` | `OutputEmitterRef<Source \| null>` | Fired on click, and on Enter/Space when `interactive` is set, with the source painting the avatar |

`Source` is exported from the package, so the handler can be typed:

```ts
import { Source } from 'ng-hub-ui-avatar';

onAvatarClick(source: Source | null): void { ... }
```

The emitted `Source` payload exposes:

- `sourceType`: source type (`facebook`, `gravatar`, `github`, `custom`, `initials`, `value`).
- `sourceId`: identifier used by that source.
- `getAvatar(size)`: function that resolves the avatar URL/value.

The payload is `null` when no source is painting the avatar: one built from projected content
alone, or one whose whole fallback chain has failed. The click still fires — only the source is
missing.

A bare `(clickOnAvatar)` binding is mouse-only. Add [`interactive`](#clickable-avatars) so the avatar
is focusable and answers Enter/Space too.

## Styling

Styles are encapsulated within the component using canonical `--hub-avatar-*` tokens. Since version 21.1.0 you no longer need to import a global stylesheet.

Full CSS variable catalog:

- [`./docs/css-variables-reference.md`](./docs/css-variables-reference.md)

Framework-agnostic customization example:

```scss
hub-avatar {
	/* size is set via the [size] input, not a CSS variable */
	--hub-avatar-border-radius: 16px;
	--hub-avatar-fg-color: #ffffff;
	--hub-avatar-bg-color: #0d6efd;
	--hub-avatar-border-width: 2px;
	--hub-avatar-border-color: #0a58ca;
}
```

Bootstrap integration example (optional):

```scss
hub-avatar {
	--hub-avatar-bg-color: var(--bs-primary);
	--hub-avatar-fg-color: var(--bs-white);
	--hub-avatar-border-color: var(--bs-border-color);
}
```

### Custom content

When you project content into `<hub-avatar>` (see [Custom content](#custom-content-icons-svg-images)), the **background is the avatar's own** (`--hub-avatar-bg-color`, the **accent colour by default**) and the icon uses the **avatar foreground** (`--hub-avatar-fg-color`, white) — so it reads as a coloured circle out of the box. Theme it with the regular `bgColor` / `fgColor` inputs (or `--hub-avatar-bg-color` / `--hub-avatar-fg-color`) just like any other avatar; a `bgColor` you set carries its own readable foreground unless `fgColor` says otherwise. Two extra tokens control the projected content's **sizing**, both relative to `--hub-avatar-size`:

| Token                            | Default                               | Description                                                          |
| -------------------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `--hub-avatar-content-padding`   | `calc(var(--hub-avatar-size) * 0.2)`  | Breathing room between the projected content and the avatar edge.    |
| `--hub-avatar-content-icon-size` | `calc(var(--hub-avatar-size) * 0.55)` | Font size for icon fonts / emoji (inherited by the projected glyph). |

```scss
hub-avatar {
	--hub-avatar-bg-color: #e7f1ff; // the avatar's own background — also the content circle
	--hub-avatar-fg-color: #0d6efd; // icon colour (or set the `fgColor` input)
	--hub-avatar-content-icon-size: calc(var(--hub-avatar-size) * 0.6);
}
```

### Badge (dot or labelled)

The `badge` input renders a corner overlay — a plain **dot** (great for presence) or a **labelled** pill (a count / text). Colour it with the semantic `badgeColor` input. Everything scales with the avatar.

```html
<!-- presence dot: badge (no content) + a semantic colour -->
<hub-avatar name="Ada Lovelace" badge badgeColor="success"></hub-avatar>
<!-- online -->
<hub-avatar name="Grace Hopper" badge badgeColor="warning"></hub-avatar>
<!-- away -->
<hub-avatar name="Alan Turing" badge badgeColor="danger"></hub-avatar>
<!-- busy -->
<hub-avatar name="Linus T" badge badgeColor="secondary"></hub-avatar>
<!-- offline -->

<!-- labelled badge -->
<hub-avatar name="Carlos M" badge="4k" badgeColor="danger"></hub-avatar>
```

`badgeColor` maps to `--hub-sys-color-*`. For a custom colour, set `--hub-avatar-badge-color` (per element or via the [colour-variants mixin](#colour-variants--mixins)):

```scss
hub-avatar[data-badge-color='brand'] {
	--hub-avatar-badge-color: #9333ea;
}
```

Badge tokens:

| Variable                        | Default                                               | Usage                                  |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| `--hub-avatar-badge-size`       | `calc(var(--hub-avatar-size, 50px) * 0.28)`           | Dot diameter / label min-height        |
| `--hub-avatar-badge-offset`     | `0px`                                                 | Inset from the bottom-end corner       |
| `--hub-avatar-badge-ring-width` | `max(2px, calc(var(--hub-avatar-size, 50px) * 0.05))` | Width of the ring around the badge     |
| `--hub-avatar-badge-ring-color` | `var(--hub-sys-surface-page, #fff)`                   | Colour of the ring around the badge    |
| `--hub-avatar-badge-color`      | `var(--hub-sys-color-secondary, #6c757d)`             | Badge fill (semantic via `badgeColor`) |
| `--hub-avatar-badge-text-color` | `var(--hub-ref-color-white, #fff)`                    | Badge label text colour                |
| `--hub-avatar-badge-font-size`  | `calc(var(--hub-avatar-size, 50px) * 0.22)`           | Badge label font size                  |
| `--hub-avatar-badge-padding`    | `calc(var(--hub-avatar-size, 50px) * 0.08)`           | Badge label inline padding             |

### Colour variants & mixins

Every semantic colour works out of the box, both for the badge (`badgeColor="success"`) and as a coloured **avatar circle** (`class="hub-avatar--success"`). To (re)generate these in your own CSS — or to register a **custom colour** (e.g. a brand colour) — use the `hub-avatar-color-variants()` mixin, which emits the avatar **and** badge variants in one loop over a colour map:

```scss
@use 'ng-hub-ui-avatar/styles/mixins/avatar-theme' as avatar;

// the eight semantic colours (default)
@include avatar.hub-avatar-color-variants();

// add your own — generates <hub-avatar class="hub-avatar--brand"> and badgeColor="brand"
@include avatar.hub-avatar-color-variants(
	(
		'brand': var(--my-brand),
		'accent': #00d4aa
	)
);
```

### Avatar group

Wrap several `<hub-avatar>` in a `.hub-avatar-group` to overlap them into a stacked group; each avatar gets a ring so the edges read cleanly.

```html
<div class="hub-avatar-group">
	<hub-avatar name="John Doe"></hub-avatar>
	<hub-avatar name="Jane Doe"></hub-avatar>
	<hub-avatar name="Sam Smith"></hub-avatar>
</div>
```

Group tokens:

| Variable                        | Default                                               | Usage                              |
| ------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| `--hub-avatar-group-overlap`    | `calc(var(--hub-avatar-size, 50px) * 0.3)`            | Horizontal overlap between avatars |
| `--hub-avatar-group-ring-width` | `max(2px, calc(var(--hub-avatar-size, 50px) * 0.04))` | Ring width around each avatar      |
| `--hub-avatar-group-ring-color` | `var(--hub-sys-surface-page, #fff)`                   | Ring colour around each avatar     |

### Sass theming mixin

The `hub-avatar-theme()` mixin themes an avatar in a single include — shape/surface, initials typography, projected-content sizing, the badge and the group ring. Every parameter is optional and defaults to `null`, so only the ones you pass are emitted as `--hub-avatar-*` overrides. It is token-based, with no Bootstrap dependency.

```scss
@use 'ng-hub-ui-avatar/styles/mixins/avatar-theme' as avatar;

hub-avatar.brand {
	@include avatar.hub-avatar-theme($size: 64px, $border-radius: 1rem, $bg: #ede9fe, $fg: #5b21b6, $badge-color: #f43f5e);
}
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

## Contributing

Contributions and collaboration are welcome.

- Fork the repository.
- Create a feature branch.
- Commit and push your changes.
- Open a pull request.

## Support

If you find this project helpful and would like to support its development, you can buy me a coffee:

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/carlosmorcillo)

- **Issues**: [GitHub Issues](https://github.com/hub-env/hub-ui/issues)
- **Author**: [Carlos Morcillo](https://www.carlosmorcillo.com)

## Commercial support

These libraries are maintained by [Carlos Morcillo Fernández](https://www.carlosmorcillo.com), a freelance frontend architect working with teams that build and maintain Angular applications.

If your team depends on Hub-UI and needs more than an issue thread can solve, that is my day job: architecture audits, design systems, Angular migrations and team mentoring. For projects that also need design and a full team, I run them through [Frog Hub](https://froghub.es), my development studio.

Have a look at [the services](https://www.carlosmorcillo.com/en/services/) or [tell me about your project](https://www.carlosmorcillo.com/en/contact/).

## License

This project is licensed under the MIT License.
