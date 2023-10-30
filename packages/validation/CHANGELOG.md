## [2023-10-30] - v0.34.0

### Changed:

- Require vpc_id when interface purpose is 'vpc' in LinodeInterfaceSchema ([#9709](https://github.com/linode/manager/pull/9709))

### Upcoming Features:

- Add AGLB `UpdateServiceTargetSchema`([#9800](https://github.com/linode/manager/pull/9800))
- Add AGLB `CreateRouteSchema` ([#9806](https://github.com/linode/manager/pull/9806))

## [2023-10-16] - v0.33.0

### Upcoming Features:

- Add `UpdateCertificateSchema` for AGLB ([#9723](https://github.com/linode/manager/pull/9723))

## [2023-10-02] - v0.32.0

### Upcoming Features:

- Update `LinodeInterfaceSchema` naming convention and add validation for a single interface ([#9687](https://github.com/linode/manager/pull/9687))

## [2023-09-18] - v0.31.0

### Added:

- Add create certificate schema for AGLB ([#9616](https://github.com/linode/manager/pull/9616))

## [2023-09-07] - v0.30.1

### Fixed:

- Edit interfaces config validation to allow null values for label and ipam_address ([#9641](https://github.com/linode/manager/pull/9641))

## [2023-09-05] - v0.30.0

### Changed:

- Include 'firewall_id' field as optional in CreateLinodeSchema ([#9453](https://github.com/linode/manager/pull/9453))
- Include `createSubnetSchema` in `createVPCSchema` validation ([#9537](https://github.com/linode/manager/pull/9537))

## [2023-08-21] - v0.29.0

### Changed:

- Update validation for `linodeInterfaceSchema`: update `subnet` to `subnet_id` ([#9485](https://github.com/linode/manager/pull/9485))

## [2023-08-07] - v0.28.0

### Added:

- Linode Config and interface validation ([#9418](https://github.com/linode/manager/pull/9418))

### Changed:

- Adjustments to linodeInterfaceSchema and createSubnetSchema ([#9418](https://github.com/linode/manager/pull/9418))

## [2023-07-24] - v0.27.0

### Added:

- Validation for VPC subnet creation and modifications ([#9390](https://github.com/linode/manager/pull/9390))

## [2023-07-11] - v0.26.0

### Added:

- Validation for VPC creation and updates ([#9361](https://github.com/linode/manager/pull/9361))

### Fixed:

- Firewall custom port validation ([#9336](https://github.com/linode/manager/pull/9336))

## [2023-06-29] - v0.25.0

### Fixed:

- Firewall custom ports validation ([#9336](https://github.com/linode/manager/pull/9336))

## [2023-06-12] - v0.24.0

### Changed:

- Updated `lint-staged` to `^13.2.2"` #9156

## [2023-05-01] - v0.23.0

### Fixed:

- Firewall ports regex to prevent exponential backtracking in the `validateFirewallPorts` schema #9010

## [2023-04-17] - v0.22.0

### Changed:

- Make NodeBalancer label required #8964

## [2023-04-03] - v0.21.0

### Added:

- React Query for SSH Keys [#8892](https://github.com/linode/manager/pull/8892)

## [2023-03-20] - v0.20.0

### Changed:

- Domain length validation from 255 characters to 253 characters to match API's domain length validation [#8853](https://github.com/linode/manager/pull/8853)
- Updated `tsup` [#8838](https://github.com/linode/manager/pull/8838)

### Removed:

- Unused packages + update lint-staged [#8860](https://github.com/linode/manager/pull/8860)

## [2023-02-13] - v0.19.0

### Changed:

- `image` field required in CreateLinodeSchema when creating Linode via StackScript

## [2023-02-07] - v0.18.0

### Fixed:

- `validation` CommonJS not accepted by Node.js

## [2023-01-13] - v0.17.1

### Fixed:

- Node.js CommonJS Module Error

## [2023-01-09] - v0.17.0

### Changed:

- Updated ESLint rules to not include Material UI

## [2022-11-01] - v0.16.0

### Changed:

- Linode max label length from 32 to 64 characters

## [2022-10-04] - v0.15.0

### Changed:

- validFirewallRuleProtocol and FirewallRuleTypeSchema updated to account for IPENCAP

## [2022-09-06] - v0.14.0

### Changed:

- Unused dependencies and code clean up

## [2022-08-22] - v0.13.0

### Changed:

- `@linode/validation` is now built using `tsup` outputting esm, commonjs, and iife. Items can still be imported from the package root (`@linode/validation`) or from a subdirectory (`@linode/validation/lib/**`) on supported configurations.

## [2022-06-23] - v0.12.0

### Added

- `SendCodeToPhoneNumberSchema`
- `VerifyPhoneNumberCodeSchema`
- `SecurityQuestionsSchema`

## [2022-05-16] - v0.11.1

### Fixed

- createDatabaseSchema MySQL validation to accept semi_synch

## [2022-05-16] - v0.11.0

### Changed

- Database schema to support addition of PostgreSQL and MongoDB

## [2022-05-02] - v0.10.0

### Changed:

- Replace all single quotes with curly quotes

## [2022-04-18] - v0.9.0

### Changed:

- updateDatabaseSchema to include maintenance updates

## [2022-02-07] - v0.8.0

### Changed:

- createDatabaseSchema and updateDatabaseSchema

## [2021-10-20] - v0.7.0

### Changed:

Change default export from /lib to root
Add build config for Node.js

## [2021-10-05] - v0.6.0

### Added:

- AutoscaleNodePoolSchema

### Changed:

- CreditCardSchema

## [2021-09-17] - v0.5.0

### Added:

- NodeBalancer validation error messages

### Changed:

- Allow non-VLAN interface labels to be null

## [2021-07-29] - v0.4.0

### Added:

- Schemas for new payment methods

## [2021-05-18] - v0.3.2

### Added:

- Remaining schemas from api-v4 package

## [2021-05-18] - v0.3.0

### Added:

- Remaining schemas from api-v4 package
