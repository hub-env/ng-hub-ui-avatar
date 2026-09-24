# ng-hub-ui-avatar - CSS Variables Reference

Complete reference of all CSS custom properties exposed by `ng-hub-ui-avatar`.
Use these variables to customize avatar rendering without editing component source code.

---

## Table of Contents

- [How it Works](#how-it-works)
- [Importing Styles](#importing-styles)
- [Base System Fallbacks](#base-system-fallbacks)
- [Avatar Variables](#avatar-variables)
- [Customization Examples](#customization-examples)
- [Best Practices](#best-practices)

---

## How it Works

The avatar styles are encapsulated within the component using canonical tokens (`--hub-avatar-*`).

This allows:

- Easy customization via CSS variables on the component's host or parent.
- Clean separation of concerns with component-level styles.
- Runtime theming via CSS custom properties.

---

## Importing Styles

Since 21.1.0 there is no stylesheet to import: the component carries its own styles, and everything
in this reference is themed by setting the tokens on `hub-avatar` (or on any ancestor).

The package still ships SCSS, but only the theming mixins, and since 22.7.0 they live at
`ng-hub-ui-avatar/styles` (the old `ng-hub-ui-avatar/src/lib/styles/...` path no longer resolves):

```scss
@use 'ng-hub-ui-avatar/styles' as avatar;

hub-avatar.brand {
  @include avatar.hub-avatar-theme($bg: #ede9fe, $fg: #5b21b6);
}
```

---

## Base System Fallbacks

`ng-hub-ui-avatar` defines and/or consumes these base tokens:

| Variable | Default |
| --- | --- |
| `--hub-ref-color-white` | `#fff` |
| `--hub-ref-radius-sm` | `0.25rem` |
| `--hub-ref-border-width` | `1px` |
| `--hub-ref-font-family-base` | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` |
| `--hub-sys-surface-page` | `#fff` |
| `--hub-sys-text-primary` | `#212529` |
| `--hub-sys-text-muted` | `#6c757d` |
| `--hub-sys-color-primary` | — (default avatar accent) |
| `--hub-sys-color-secondary` | — (default badge fill) |
| `--hub-sys-color-success` | — (`badgeColor="success"`) |
| `--hub-sys-color-warning` | — (`badgeColor="warning"`) |
| `--hub-sys-color-danger` | — (`badgeColor="danger"`) |
| `--hub-sys-color-ink` | `#212529` (accent emphasis mix) |

---

## Avatar Variables

Defined and consumed by `projects/avatar/src/lib/avatar.component.scss`.

### Core

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-size` | `50px` (runtime) | Avatar width/height — **written from the `size` input**, in whatever unit it was given (a bare number is px); override the input, not this variable (the inline host style wins) |
| `--hub-avatar-overflow` | `hidden` | Overflow clipping behavior |
| `--hub-avatar-object-fit` | `cover` | Image content fit |

### Accent

One slot drives the avatar's colour: re-base `--hub-avatar-accent` and the fill and a legible
foreground follow. This is what the `.hub-avatar--<colour>` variants and the
`hub-avatar-color-variants()` mixin write, so a custom colour needs no other rule.

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-accent` | `var(--hub-sys-color-primary, #0d6efd)` | The avatar's accent colour — the single slot every variant re-bases |
| `--hub-avatar-accent-emphasis` | `color-mix(in oklch, var(--hub-avatar-accent) 80%, var(--hub-sys-color-ink, #212529))` | Darkened accent, derived locally |
| `--hub-avatar-accent-subtle` | `color-mix(in oklch, var(--hub-avatar-accent) 12%, var(--hub-sys-surface-page, #fff))` | Tinted accent, derived locally |
| `--hub-avatar-accent-on` | `oklch(from var(--hub-avatar-accent) clamp(0, (0.62 - l) * 1000, 1) 0 h)` | Contrast flip on the accent — feeds `--hub-avatar-fg-color`, so light accents get dark text |

### Shape and Border

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-border-radius-round` | `50%` | Round avatar radius token |
| `--hub-avatar-border-radius-square` | `var(--hub-ref-radius-sm, 0.25rem)` | Default square corner radius |
| `--hub-avatar-border-radius` | `var(--hub-avatar-border-radius-round, var(--hub-avatar-border-radius-square, 0.25rem))` | Effective radius used by host/container/content |
| `--hub-avatar-border-width-default` | `var(--hub-ref-border-width, 1px)` | Base border width used when border is enabled |
| `--hub-avatar-border-width` | `0` | Effective avatar border width |
| `--hub-avatar-border-color` | `transparent` | Effective avatar border color |

### Text and Surface

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-fg-color` | `var(--hub-avatar-accent-on, var(--hub-ref-color-white, #fff))` | Text color for text avatars |
| `--hub-avatar-bg-color` | `var(--hub-avatar-accent, var(--hub-sys-color-primary, #0d6efd))` | Background for avatar content (accent by default; initials/value override it, images cover it) |
| `--hub-avatar-font-family` | `var(--hub-ref-font-family-base, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif)` | Text avatar font family |
| `--hub-avatar-font-weight` | `var(--hub-ref-font-weight-base, 400)` | Text avatar font weight |
| `--hub-avatar-font-size` | `calc(var(--hub-avatar-size, 50px) / 3)` | Text avatar font size |
| `--hub-avatar-line-height` | `var(--hub-avatar-size, 50px)` | Text avatar line height |
| `--hub-avatar-text-transform` | `uppercase` | Text transform for initials/value avatars |
| `--hub-avatar-text-align` | `center` | Text alignment for text avatars |

### Custom Content

Applied to content projected into `<hub-avatar>` (an icon, inline SVG, image or emoji). The background and foreground are the avatar's own (`--hub-avatar-bg-color` / `--hub-avatar-fg-color`); only these sizing tokens are content-specific, defaulting relative to `--hub-avatar-size` so they scale with the avatar.

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-content-padding` | `calc(var(--hub-avatar-size, 50px) * 0.2)` | Padding between the projected content and the avatar edge |
| `--hub-avatar-content-icon-size` | `calc(var(--hub-avatar-size, 50px) * 0.55)` | Font size for icon fonts / emoji (inherited by the glyph) |

### Badge

Opt-in corner overlay: a plain **dot** (`badge`) or a **labelled** pill (`badge="4k"`). Colour it with the `badgeColor` input — the semantic value re-bases `--hub-avatar-badge-color` to `--hub-sys-color-<name>` (express presence with the colour: online → success, away → warning, busy → danger, offline → secondary). Light backgrounds (`warning` / `light`) switch the label text to a dark colour automatically.

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-badge-size` | `calc(var(--hub-avatar-size, 50px) * 0.28)` | Dot diameter / label min-height |
| `--hub-avatar-badge-offset` | `0px` | Inset of the badge from the bottom-end corner |
| `--hub-avatar-badge-ring-width` | `max(2px, calc(var(--hub-avatar-size, 50px) * 0.05))` | Width of the ring around the badge |
| `--hub-avatar-badge-ring-color` | `var(--hub-sys-surface-page, #fff)` | Colour of the ring around the badge |
| `--hub-avatar-badge-color` | `var(--hub-sys-color-secondary, #6c757d)` | Badge fill (neutral default; semantic via `badgeColor`) |
| `--hub-avatar-badge-text-color` | `var(--hub-ref-color-white, #fff)` | Badge label text colour |
| `--hub-avatar-badge-font-size` | `calc(var(--hub-avatar-size, 50px) * 0.22)` | Badge label font size |
| `--hub-avatar-badge-padding` | `calc(var(--hub-avatar-size, 50px) * 0.08)` | Badge label inline padding |

### Stacked Group

Applied when avatars are wrapped in a `.hub-avatar-group` to overlap them; each avatar gets a ring so the edges read cleanly.

| Variable | Default | Usage |
| --- | --- | --- |
| `--hub-avatar-group-overlap` | `calc(var(--hub-avatar-size, 50px) * 0.3)` | Horizontal overlap between avatars |
| `--hub-avatar-group-ring-width` | `max(2px, calc(var(--hub-avatar-size, 50px) * 0.04))` | Ring width around each avatar |
| `--hub-avatar-group-ring-color` | `var(--hub-sys-surface-page, #fff)` | Ring colour around each avatar |

---

## Customization Examples

### Framework-Agnostic

```scss
/* size and shape come from the [size] / [round] / [cornerRadius] inputs */
hub-avatar {
  --hub-avatar-border-radius: 16px;
  --hub-avatar-fg-color: #ffffff;
  --hub-avatar-bg-color: #0d6efd;
  --hub-avatar-border-width: 2px;
  --hub-avatar-border-color: #0a58ca;
}
```

### Bootstrap Integration (Optional)

```scss
hub-avatar {
  --hub-avatar-bg-color: var(--bs-primary);
  --hub-avatar-fg-color: var(--bs-white);
  --hub-avatar-border-color: var(--bs-border-color);
}
```

### Compact Avatar

```html
<hub-avatar name="Jane Doe" size="32" class="compact"></hub-avatar>
```

```scss
hub-avatar.compact {
  /* the size itself is the [size] input; the tokens dress what it renders */
  --hub-avatar-font-size: 11px;
}
```

---

## Best Practices

- Prefer `--hub-avatar-*` tokens for direct component theming.
- Override `--hub-sys-*` and `--hub-ref-*` tokens for consistent cross-component behavior.
- Use framework variables like `--bs-*` only as optional integration, not as required defaults.
- Keep dynamic behavior (`size`, `round`, `cornerRadius`) through component inputs, and theme visual values with tokens.
