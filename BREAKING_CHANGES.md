# Breaking Changes in `ng-hub-ui-avatar`

This document details the breaking changes introduced in major versions of `ng-hub-ui-avatar` and how to migrate your codebase.

## [22.14.0] - 2026-09-23

### Initials are no longer always white

- **Change**: an avatar that paints its own background — the hash colour from `name`, or an
  explicit `bgColor` — now writes its initials in black or white, whichever reaches the WCAG AA
  contrast of 4.5:1 against that background. The same applies to content projected into an
  avatar with a `bgColor`.

- **Why**: white initials did not read on most of the palette. Measured against white, six of
  the eight built-in backgrounds missed AA — `#f1c40f` 1.66:1, `#1abc9c` 2.41:1, `#3498db`
  3.15:1, `#7f8c8d` 3.48:1, `#e74c3c` 3.82:1, `#d35400` 4.17:1 — and they come up with ordinary
  names, so any application with a list of people had several of them on screen.

- **Impact — six of the eight automatic colours change appearance.** These flip from white to
  black initials: `#1abc9c`, `#3498db`, `#f1c40f`, `#e74c3c`, `#d35400`, `#7f8c8d`. These two
  are unchanged: `#8e44ad` and `#2c3e50`. The backgrounds themselves do not move, so the
  palette still looks like itself; only the text on top of it does. An avatar with no inline
  background — `[autoColor]="false"`, or one themed through `--hub-avatar-bg-color` — is
  untouched, and so is every image avatar.

- **What happens if you do nothing**: your avatars become readable, and some of them look
  different in a screenshot test. Nothing throws and nothing stops compiling.

- **Migration**: none is needed. To pin the old look on a given avatar, say so — an explicit
  `fgColor` always wins, contrast or no contrast:

    ```html
    <!-- Before 22.14.0: white initials, whatever the background -->
    <hub-avatar [name]="user.fullName" />

    <!-- After 22.14.0: white initials, because you asked for them -->
    <hub-avatar [name]="user.fullName" fgColor="#fff" />
    ```

    To pin it everywhere at once, hand `provideAvatar()` a palette whose colours all carry
    white text; the ink follows the background it is given.

### `fgColor` has no default value

- **Change**: `fgColor` is `InputSignal<string | undefined>` instead of `InputSignal<string>`,
  and its documented default of `'#FFF'` is gone.

- **Why**: the default was a sentinel, not a colour. The component compared `fgColor()` against
  the literal `'#FFF'` to work out whether the consumer had set anything, which made
  `fgColor="#FFF"` mean "unset" and `fgColor="#fff"` mean "set" — the same colour, two
  behaviours. And no avatar ever painted `#FFF`: with `fgColor` untouched the component emitted
  no colour at all and left it to `--hub-avatar-fg-color`. Now the ink is a real decision, the
  input has to be able to say "the consumer chose this" without guessing.

- **Impact**: only for code that reads the input's value. A template binding `[fgColor]="…"` or
  an attribute `fgColor="#fff"` behaves as before, except that `fgColor="#FFF"` is now honoured
  literally instead of being silently ignored — which is what it always looked like it did.
  TypeScript that reads `avatar.fgColor()` now gets `string | undefined`.

## [22.13.0] - 2026-09-23

### Angular below 20.2.0 is no longer supported

- **Change**: the `@angular/*` peer ranges move from `>=17.1.0` to `>=20.2.0`.

- **Why**: Its template uses `@else if (value(); as name)`, and an `as` on an `@else if` is only accepted from Angular 20.2 — the linker of 20.1 refuses it outright.

- **Impact — an application below 20.2.0 gets a peer warning where it used to get a build error.**
  Nothing that worked stops working: those versions never compiled against this package. Upgrade
  Angular to 20.2.0 or stay on the previous release.

## [22.12.0] - 2026-09-08

### `AvatarComponent` and `AvatarService` are renamed

- **Change**: the component class is `HubAvatarComponent` and the injectable is
  `HubAvatarService`. Both old names stay exported as `@deprecated` aliases of the very same
  classes, and both are removed in **23.0.0**, the release that moves this family to Angular 23.
  `AvatarModule` is untouched — it is already announced for removal in that same release, so
  renaming it would create a symbol born deprecated.

- **Why**: `AvatarComponent` is a name in the consumer's namespace, not in ours. An application
  with users tends to grow an avatar component of its own, and the day it does, the two names
  collide in whichever file imports both — and the only way out is an alias on our side of the
  line, for a name this package never had the right to claim. Every other class in the family
  already carries the prefix; these two were the leftovers.

- **What happens if you do nothing**: today, nothing at all. `import { AvatarComponent } from
'ng-hub-ui-avatar'` still compiles, `imports: [AvatarComponent]` still works, and
  `inject(AvatarService)` still returns the same singleton, because each alias resolves to the class
  it renames. Your editor will mark them struck through, which is the warning. In 23.0.0 both
  disappear from the entry point and those imports stop compiling — loudly, at build time.

- **Migration**: rename the imports. Nothing else moves: same `<hub-avatar>` selector, same inputs,
  same outputs, same configuration through `provideAvatar()`.

    ```ts
    // Before
    import { AvatarComponent, AvatarService } from 'ng-hub-ui-avatar';

    @Component({ imports: [AvatarComponent] })
    export class ProfileComponent {
    	private readonly avatars = inject(AvatarService);
    }

    // After
    import { HubAvatarComponent, HubAvatarService } from 'ng-hub-ui-avatar';

    @Component({ imports: [HubAvatarComponent] })
    export class ProfileComponent {
    	private readonly avatars = inject(HubAvatarService);
    }
    ```

## [22.11.1] - 2026-09-08

### Announced: `AvatarModule` is removed in 23.0.0

- **Change**: the deprecation notice now names the release. Nothing is removed here and nothing
  changes at runtime — this release is the notice, and the removal lands in 23.0.0, the next
  version that tracks a new Angular major. `AvatarModule.forRoot()` goes with it.
- **Impact**: from 23.0.0 both symbols are gone from the entry point, so
  `import { AvatarModule }`, `imports: [AvatarModule]` and `AvatarModule.forRoot(config)` stop
  compiling.
- **Migration**: import the standalone component the module re-exported, and move the
  configuration to `provideAvatar()`, which is where it already lives — `forRoot()` only wrote the
  same `AVATAR_CONFIG` token.

```ts
// Before
@NgModule({ imports: [AvatarModule.forRoot({ colors: ['#1abc9c'] })] })
export class AppModule {}

// After
@Component({ imports: [HubAvatarComponent] })
export class ProfileComponent {}

bootstrapApplication(App, { providers: [provideAvatar({ colors: ['#1abc9c'] })] });
```

## [22.10.0] - 2026-09-06

### The avatar's render state is internal, and `ngOnChanges` is gone

- **Change**: `avatarSrc`, `avatarText`, `avatarStyle`, `hostStyle`, `hasCustomContent` and
  `customContentStyle` were public mutable fields holding what the component had just painted.
  They are now `protected` signals derived from the inputs, and the component no longer implements
  `OnChanges` — the fallback chain is computed instead of patched from `SimpleChanges`.
- **Impact**: reading any of those fields off a `ViewChild`-ed `AvatarComponent` no longer compiles,
  and neither does calling `avatar.ngOnChanges(...)` by hand (a test double driving the component
  that way is the likely place this shows up). Nothing changes for a template that only binds inputs
  and listens to `clickOnAvatar`, which is every documented use.
- **Migration**: read the inputs you passed in, not the state the avatar derived from them. A test
  that used to call `ngOnChanges` to make a change land should set the input and let change detection
  run:

    ```ts
    // Before
    fixture.componentRef.setInput('name', 'John Doe');
    component.ngOnChanges({ initials: new SimpleChange(null, 'John Doe', true) });
    fixture.detectChanges();

    // After
    fixture.componentRef.setInput('name', 'John Doe');
    fixture.detectChanges();
    ```

### `clickOnAvatar` emits `Source | null`

- **Change**: the output payload is now `Source | null`. It was typed `Source` but could hand you
  `undefined` — an avatar built from projected content alone has no source, and neither has one
  whose whole fallback chain failed.
- **Impact**: with `strictTemplates`, a handler declared `(source: Source)` no longer accepts
  `$event`. Nothing changes at runtime except that the two cases above now arrive as `null`.
- **Migration**: widen the handler and read the source through the null check.

    ```ts
    import { Source } from 'ng-hub-ui-avatar'; // now exported from the entry point

    onAvatarClick(source: Source | null): void {
    	if (!source) {
    		return;
    	}
    	console.log(source.sourceType);
    }
    ```

## [22.7.0] - 2026-07-07

### SCSS ships at `ng-hub-ui-avatar/styles` (packaging path)

- **Change**: the theming mixin now builds to `dist/avatar/styles/...` instead of `dist/avatar/src/lib/styles/...`, and a `styles/index.scss` root entry forwards it.
- **Impact**: a `@use` that reached into the old `src/lib/styles/...` path no longer resolves.
- **Migration**: `@use 'ng-hub-ui-avatar/styles' as *;`

## Version 22.3.0

### `status` input replaced by a general `badge`

The presence-only `status` input has been replaced by a more general **`badge`** overlay that can be a plain dot **or** carry a label (count / text), coloured by a **semantic** `badgeColor`.

| Before (`status`)                               | After (`badge` + `badgeColor`)                                  |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `status="online"`                               | `badge badgeColor="success"`                                    |
| `status="away"`                                 | `badge badgeColor="warning"`                                    |
| `status="busy"`                                 | `badge badgeColor="danger"`                                     |
| `status="offline"`                              | `badge badgeColor="secondary"`                                  |
| `status="custom"` + `--hub-avatar-status-color` | `badge badgeColor="<semantic>"` (or `--hub-avatar-badge-color`) |

New: a **labelled** badge — `<hub-avatar badge="4k" badgeColor="danger">`.

Renames:

- Type `HubAvatarStatus` → `HubAvatarBadgeColor` (now the semantic colour set, not presence keywords).
- Tokens `--hub-avatar-status-{size,offset,ring-width,ring-color,color}` → `--hub-avatar-badge-{size,offset,ring-width,ring-color,color}`.
- `hub-avatar-theme()` parameters `$status-*` → `$badge-*`.

## Version 21.1.0

### Removal of Public SCSS Entry Point

The standalone file `src/lib/styles/avatar.scss` has been removed. Styles are now strictly encapsulated within the `HubAvatarComponent` via `avatar.component.scss`.

**Migration Steps:**

1.  **Remove manual style imports:** If you were importing the stylesheet manually in your global `styles.scss`, remove the following line:

    ```scss
    @use 'ng-hub-ui-avatar/src/lib/styles/avatar.scss';
    ```

2.  **Automatic Styling:** The component now handles its own styles. Ensure your build pipeline correctly processes component-level SCSS.

3.  **Theming:** If you need to override component styles, use CSS custom properties (variables) as documented in the `css-variables-reference.md`.

## Version 21.0.0

### Angular Signals Migration

All component inputs have been modernized and migrated to use Angular Signals.
If your application binds to `HubAvatarComponent` properties programmatically or inspects its instance, you will need to read them as functions (e.g., `avatar.size()`) rather than direct properties. Template bindings `[size]="something"` remain unaffected, but internal mechanics now rely on `signal` syntax entirely.

### Removed Avatar Sources

The following avatar provider sources have been removed from the component to streamline dependencies and due to instability or changes in the providers' APIs:

- `googleId`
- `instagramId`
- `skypeId`
- `twitterId`
- `vkontakteId`

**Migration Steps:**
If you were using any of these attributes (e.g., `<hub-avatar twitterId="angular"></hub-avatar>`), you must implement a custom resolution logic in your app and pass the final image string via the `src` direct input, or use an alternative supported source like `githubId` or `gravatarId`.
