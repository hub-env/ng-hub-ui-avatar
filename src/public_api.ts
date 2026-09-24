/*
 * Public API Surface of ng-hub-ui-avatar
 */
export * from './lib/avatar-config';
export * from './lib/avatar-size';
export * from './lib/avatar.component';
export * from './lib/avatar.module';
export * from './lib/avatar.providers';
export * from './lib/avatar.service';
export * from './lib/sources/avatar-source.enum';
export * from './lib/sources/source';

/**
 * @deprecated Renamed to `HubAvatarComponent`, and removed under this name in **23.0.0**.
 * Every class in the family carries the `Hub` prefix so a consumer importing several
 * packages cannot end up with two `AvatarComponent`s in the same file. The class behind
 * this alias is unchanged.
 */
export { HubAvatarComponent as AvatarComponent } from './lib/avatar.component';

/**
 * @deprecated Renamed to `HubAvatarService`, and removed under this name in **23.0.0**.
 * The class behind this alias is unchanged; only the exported name moves.
 */
export { HubAvatarService as AvatarService } from './lib/avatar.service';
