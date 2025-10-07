## [2025-10-07] - v0.9.0

### Changed:

- Update `useIsLinodeAclpSubscribed` to reflect updated API fields ([#12870](https://github.com/linode/manager/pull/12870))

## [2025-09-09] - v0.8.0

### Tests:

- Add Mock IntersectionObserver in testSetup.ts ([#12777](https://github.com/linode/manager/pull/12777))

## [2025-08-12] - v0.7.0

### Changed:

- Allow Linode Select options to be disabled on a per-option basis ([#12585](https://github.com/linode/manager/pull/12585))

## [2025-07-29] - v0.6.0

### Fixed:

- `LinodeSelect` not filtering by the `optionsFilter` when `options` was passed as props ([#12529](https://github.com/linode/manager/pull/12529))

## [2025-07-15] - v0.5.0

### Upcoming Features:

- Add `useIsLinodeAclpSubscribed` hook and unit tests ([#12479](https://github.com/linode/manager/pull/12479))

## [2025-07-01] - v0.4.0

### Tech Stories

- Update to Storybook v9 ([#12416](https://github.com/linode/manager/pull/12416))

## [2025-05-06] - v0.3.0

### Fixed:

- Tests failing due to lack of ThemeProvider ([#12107](https://github.com/linode/manager/pull/12107))

### Tech Stories:

- Update linode/shared to not depend on TanStack Query and MUI directly ([#12106](https://github.com/linode/manager/pull/12106))

## [2025-04-22] - v0.2.0

### Tech Stories:

- Eslint Overhaul ([#11941](https://github.com/linode/manager/pull/11941))

## [2025-04-08] - v0.1.0

### Added:

- New `shared` package with `LinodeSelect` as the first component ([#11844](https://github.com/linode/manager/pull/11844))
- Move `useIsGeckoEnabled` hook out of `RegionSelect` to `@linode/shared` package ([#11918](https://github.com/linode/manager/pull/11918))
