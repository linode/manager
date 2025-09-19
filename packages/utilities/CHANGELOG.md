## [2025-09-09] - v0.8.0

### Changed:

- Update `createDevicesFromStrings` to allow undefined values for all device slots ([#12791](https://github.com/linode/manager/pull/12791))

## [2025-08-12] - v0.7.0

### Removed:

- IPAM address from `linodeConfigInterfaceFactoryWithVPC` ([#12574](https://github.com/linode/manager/pull/12574))

### Upcoming Features:

- Update linodeConfigInterfaceFactoryWithVPC and linodeInterfaceFactoryVPC with IPv6 data ([#12305](https://github.com/linode/manager/pull/12305))

## [2025-07-29] - v0.6.0

### Removed:

- `isAclpSupportedRegion` helper method ([#12517](https://github.com/linode/manager/pull/12517))

### Upcoming Features:

- Add IPv6 Subnet support ([#12382](https://github.com/linode/manager/pull/12382))

## [2025-07-01] - v0.5.0

### Upcoming Features:

- Add factory methods to create mock VM Host Maintenance Policy data for testing ([#12334](https://github.com/linode/manager/pull/12334))
- Add `isAclpSupportedRegion` utility and unit tests ([#12375](https://github.com/linode/manager/pull/12375))
- Add maintenance policy utilities for VM maintenance API ([#12417](https://github.com/linode/manager/pull/12417))

## [2025-06-17] - v0.4.0

### Added:

- Unit test for `getAll` ([#12313](https://github.com/linode/manager/pull/12313))

### Removed:

- Ramda dependency ([#12313](https://github.com/linode/manager/pull/12313))

## [2025-04-22] - v0.3.0

### Added:

- Move `getUserTimeZone` and its associated profile factories to `@linode/utilities` ([#11955](https://github.com/linode/manager/pull/11955))
- Move `betaUtils` and its associated factories to `utilities` package ([#11986](https://github.com/linode/manager/pull/11986))
- Move `grants` and its associated factories to `utilities` package ([#12025](https://github.com/linode/manager/pull/12025))

### Tech Stories:

- Eslint Overhaul ([#11941](https://github.com/linode/manager/pull/11941))

## [2025-04-08] - v0.2.0

### Added:

- Move `regionsData` from `manager` to `utilities` package ([#11790](https://github.com/linode/manager/pull/11790))
- Move `LinodeCreateType` to `utilities` package ([#11790](https://github.com/linode/manager/pull/11790))
- Move `doesRegionSupportFeature` from `manager` to `utilities` package ([#11891](https://github.com/linode/manager/pull/11891))
- Add `luxon` dependency and move related utils from `manager` to `utilities` package ([#11905](https://github.com/linode/manager/pull/11905))
- Migrate ramda dependent utils to @linode/utilities package ([#11913](https://github.com/linode/manager/pull/11913))
- Move `useFormattedDate` from `manager` to `utilities` package ([#11931](https://github.com/linode/manager/pull/11931))

### Removed:

- Unused utils with security vulnerabilities ([#11899](https://github.com/linode/manager/pull/11899))

## [2025-03-25] - v0.1.0

### Added:

- `@linode/utilities` package with `capitalize` utility and `useInterval` hook as the first additions ([#11666](https://github.com/linode/manager/pull/11666))
- Migrate utilities from `manager` to `utilities` package ([#11711](https://github.com/linode/manager/pull/11711))
- Migrate utilities from `manager` to `utilities` package - pt2 ([#11733](https://github.com/linode/manager/pull/11733))
- Migrate hooks from `manager` to `utilities` package ([#11770](https://github.com/linode/manager/pull/11770))
- Add utilities depended on by linodes and other queries ([#11774](https://github.com/linode/manager/pull/11774))
- Migrate utilities from `manager` to `utilities` package - pt3 ([#11778](https://github.com/linode/manager/pull/11778))
- Move the entire `sort-by.ts` (excluding sortByUTFDate) to `utilities` package ([#11846](https://github.com/linode/manager/pull/11846))
- Migrate hooks from `manager` to `utilities` package - pt2 ([#11850](https://github.com/linode/manager/pull/11850))
- Migrate utilities from `manager` to `utilities` package - pt4 ([#11859](https://github.com/linode/manager/pull/11859))

### Changed:

- Move @vitest/ui to monorepo root dependency ([#11755](https://github.com/linode/manager/pull/11755))

### Tech Stories:

- Update `@vitest/ui` from `2.1.1` to `3.0.3` ([#11749](https://github.com/linode/manager/pull/11749))
