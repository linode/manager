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
