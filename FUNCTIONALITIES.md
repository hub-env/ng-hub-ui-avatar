# Functionalities of Avatar Library

This table details the functionalities of the `ng-hub-ui-avatar` library and indicates which ones are covered by interactive examples.

## Avatar (`hub-avatar`)

| Category            | Functionality                                                       | Example Covered |
| :------------------ | :------------------------------------------------------------------ | :-------------: |
| **Avatar Sources**  | Facebook Profile (`facebookId`)                                     |       ✅        |
|                     | Gravatar (`gravatarId`, email or hash)                              |       ✅        |
|                     | GitHub Profile (`githubId`)                                         |       ✅        |
|                     | Custom Image Source (`src`)                                         |       ✅        |
|                     | Name Initials (`name`)                                              |       ✅        |
|                     | Value Display (`value`)                                             |       ✅        |
|                     | Referrer policy on image requests (`referrerpolicy`)                |       ❌        |
|                     | Projected custom content (icon / SVG / image / emoji)               |       ✅        |
| **Fallback System** | Multiple Source Fallback                                            |       ✅        |
|                     | Placeholder of last resort (`placeholder`)                          |       ❌        |
| **Sizing**          | Custom Size (`size`)                                                |       ✅        |
|                     | Text Size Ratio (`textSizeRatio`)                                   |       ✅        |
|                     | Initials Size Limit (`initialsSize`)                                |       ✅        |
| **Styling**         | Round Avatar (`round`)                                              |       ✅        |
|                     | Corner Radius (`cornerRadius`)                                      |       ✅        |
|                     | Background Color (`bgColor`)                                        |       ✅        |
|                     | Foreground Color (`fgColor`)                                        |       ✅        |
|                     | Contrast-safe initials ink (black or white, picked per background)  |       ❌        |
|                     | Border Color (`borderColor`)                                        |       ✅        |
|                     | Custom Styles (`style`)                                             |       ✅        |
|                     | Hash background opt-out (`autoColor`)                               |       ❌        |
|                     | Semantic colour variants (`class="hub-avatar--success"`)            |       ❌        |
|                     | Sass theming mixin (`hub-avatar-theme()`)                           |       ✅        |
| **Accessibility**   | Image alt text (`alt`, falling back to `name`)                      |       ❌        |
| **Interactivity**   | Click Event Handler (`clickOnAvatar`)                               |       ✅        |
|                     | Keyboard activation (`interactive`)                                 |       ✅        |
| **Badge**           | Presence dot (`badge` + `badgeColor`)                               |       ✅        |
|                     | Labelled badge (`badge="4k"`)                                       |       ✅        |
| **Groups**          | Avatar Group Display                                                |       ✅        |
| **Configuration**   | Avatar Colors Override (`provideAvatar({ colors })`)                |       ❌        |
|                     | Source Priority Override (`provideAvatar({ sourcePriorityOrder })`) |       ❌        |
|                     | Src cache opt-out (`provideAvatar({ disableSrcCache })`)            |       ❌        |

---

_Note: ✅ indicates an active interactive example is available in the documentation. ❌ indicates functionality exists but no example yet._
