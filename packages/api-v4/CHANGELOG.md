## [2022-11-01] - v0.81.0
### Added:
- `setUserAgentPrefix` helper function to change API request user agent prefix

### Changed:
- `credentials` field on `ManagedServiceMonitor` is now an array of numbers
- API request user agent reflects environment

## [2022-10-17] - v0.80.0

### Changed:

- Updates to Managed
- LinodeTypeClass to support prodedicated
- SupportReply interface to include friendly_name

## [2022-10-04] - v0.79.0
### Changed:
- FirewallRuleProtocol type updated to include IPENCAP

## [2202-09-19] - v0.78.0

### Changed:
- LinodeConfigCreationData now includes initrd property

## [2022-09-06] - v0.77.0

### Changed:

- Unused dependencies and code clean up

## [2022-08-22] - v0.76.0

### Added:
- `billing_source` property to `Account` type

### Changed:
- `@linode/api-v4` is now built using `tsup` outputting esm, commonjs, and iife. Items can still be imported from the package root (`@linode/api-v4`) or from a subdirectory (`@linode/api-v4/lib/**`) on supported configurations.

## [2022-07-12] - v0.75.0

### Added:

- CloneDomainPayload and ImportZonePayload interfaces

## [2022-06-23] - v0.74.0

### Added:
- Types and methods for SMS phone number verification opt-in and opt-out
- Types and methods for security question management

### Changed
- Add `verified_phone_number` field to `Profile` type


## [2022-06-13] - v0.73.0

### Added:
- Types and fields for invoice tax summaries

## [2022-06-06] - v0.72.0

### Changed
- Add `replica_set` and `peers` fields to MongoDB database type

## [2022-05-16] - v0.71.0

### Changed:
- Database types to support the addition of PostgreSQL and MongoDB

### Fixed
- Validation package version in api-v4/package.json

## [2022-04-28] - v0.70.0

### Changed:

- Types for Databases (DatabaseClusterSizeObject, Engines, and DatabaseType) and and Linodes (BaseType and LinodeType)

## [2022-04-18] - v0.69.0

### Added:

- Types for DBaaS Maintenance Window

## [2022-04-07] - v0.68.0

### Added:

- Types and endpoints for IPv6 range sharing

## [2022-03-21] - v0.67.0

### Fixed:

- KubernetesDashboardResponse reflects API return data structure

## [2022-02-07] - v0.66.0

### Added:

- Types and methods for Databases

## [2022-01-10] -v0.65.0

### Changed:

- Refactor PaymentMethod type definition

## [2021-11-30] - v0.64.0

### Added:

- getLinodeFirewalls method

## [2021-11-15] - v0.63.0

### Added:

- PayPalData
- CreditCardData
- removeIPv6Range
- CreateIPv6RangePayload
- IPv6Prefix

### Changed:

- PaymentMethodData
- addPaymentMethod
- PaymentMethod

## [2021-11-09] - v0.62.0

### Added:

- Types, methods, and interfaces related to Block Storage migrations

## [2021-11-01] - v0.61.0

### Added:

- Support for enabling Kubernetes High Availability
- Endpoints for getting Kubernetes Dashboard and resetting Kube config

## [2021-10-20] - v0.60.0

### Changed:

Change default export from /lib to root
Add build config for Node.js

## [2021-10-05] - v0.59.0

### Added:

- AutoscaleNodePool
- AutoscaleNodePoolRequest

## [2021-09-17] - v0.58.0

### Added:

- Account Agreement types and methods

### Changed:

- GiB to GB in volumes.ts

## [2021-08-24] - v0.57.0

### Changed:

- Added firewalls to grants

### Fixed:

- Entity import in account/types

## [2021-08-09] - v0.56.0

### Added:

deletePaymentMethod
addPromotion

### Changed:

getLinodeTypes

## Validation Package

### Changed:

PaymentMethodSchema
PromoCodeSchema
createDomainSchema
FirewallRuleTypeSchema
linodeInterfaceSchema
createNodeBalancerConfigSchema
UpdateNodeBalancerConfigSchema
CreateVolumeSchema

## [2021-07-29] - v0.55.0

### Added:

- Types and endpoint support for new payment methods

## [2021-06-28] - v0.54.0

### Changed:

- Removed ‘ready’ and ‘completed’ statuses from AccountMaintenance interface in account/types.ts

## [2021-05-18] - v0.53.0

### Changed:

- Move remaining validation schemas to the validation package

## [2021-05-05] - v0.52.0

### Added:

- TPA Provider types

### Changed:

- Move validation schemas into separate library

## Validation Library

- Add README

## [2021-04-22] - v0.51.0

### Added:

- @linode/validation package
- Methods and schemas for machine image uploads

### Changed:

- UpdateAccountSettingsSchema

## [2021-04-13] - v0.50.0

### Added:

- resetLinodePassword (only applies to Bare Metal instances)

### Changed:

- linodeInterfaceSchema (label and IPAM address field)

## [2021-04-05] - v0.49.0

### Changed:

- Added metal to LinodeTypeClass type and removed LinodeInterface from linodes/types.ts
- Added interfaces for IPAssignment, IPSharingPayload and IPAssignmentPayload in networking/types.ts
- Added Bare Metal to Capabilities type in regions/types.ts

## [2021-03-23] - v0.48.0

### Changed:

- Update types and schemas for Interface fields on Linode configurations

## [2021-02-24] - v0.44.0

### Added

- Entity Transfer event actions, schema, types, and methods

## [2021-02-22] - v0.43.0

### Changed

- Update TypeScript version to v4.1.5
- Adjust types for rescueLinode to work with TypeScript

## [2021-02-15] - v0.42.0

### Added

profile_update event type

### Changed

Firewall validation schema (ports are now optional)
Firewall rule validation schema (add label and description fields)
Update Node version from 10.16 to 14.15.4

## [2021-01-25] - v0.41.0

### Added:

- Method for recycleClusterNodes
- Method for recycleNode

### Changed:

- Update getKubernetesVersions
- Update FirewallRuleTypeSchema

## [2021-01-13] - v0.40.0

### Added:

- Make CVV required

### Changed:

- Update CreateDomainPayload
- Update UpdateDomainPayload

## [2020-12-16] - v0.39.0

### Changed:

“updated” field added to Image interface

## [2020-11-17] - v0.38.0

### Added:

- Methods, types, and schemas for Object Storage Bucket-level ACL

### Changed:

- Better schema for validating Firewall rules
- Add APIWarning type and include it in the payload for /payment endpoints

## [2020-11-02] - v0.37.0

### Added:

- Methods and types for DBaaS

## [2020-09-21] - v0.34.0

Changed:

- Update Capabilities types to include Cloud Firewall
- Update NodeBalancers schema and types to include proxy_protocol

## [2020-09-09] - v0.33.0

Changed:

- Update TS interface for DomainRecord to include created/updated fields
- Update FirewallRuleSchema to make inbound/outbound rules non-required

Fixed:

- Fix type of getRegion JS Client method

## [2020-08-25] - v.0.32.0

### Added:

- DNS resolvers to Region response

## [2020-08-11] - v.0.31.0

### Added:

- Update Account capabilities type to include 'Cloud Firewall'
- Update Events type to include 'community_mention'
- New method getActiveLongviewPlan

### Fixed:

- Update Event time remaining to expect null or a string

## [2020-06-30] - v0.28.0

### Added:

- UpdateLinodeDiskSchema and CreateLinodeDiskFromImageSchema

### Changed:

- Remove password validation from Yup schemas

## [2020-06-16] - v.0.27.3

### Fixed:

- Update syntax and copy errors in README.md
- Ramda reference in JS client

## [2020-06-09] - v.0.27.1

Initial Beta release; for previous changelog entries see the root level CHANGELOG.md.

### Added:

- NPM publish in GitHub Actions
