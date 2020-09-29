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
