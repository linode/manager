## [2025-10-21] - v0.77.0

### Changed:

- Rename "Linode Object Storage" to "Akamai Object Storage" in various schema names ([#12977](https://github.com/linode/manager/pull/12977))


## [2025-10-07] - v0.76.0


### Upcoming Features:

- Update validation schema for Destination - Details - Path ([#12851](https://github.com/linode/manager/pull/12851))
- Logs Delivery Stream and Destination details validation change for Update schemas ([#12898](https://github.com/linode/manager/pull/12898))

## [2025-09-23] - v0.75.0

### Changed:

- ACLP-alerting: Allowing 0 for the metric threshold value ([#12803](https://github.com/linode/manager/pull/12803))

### Fixed:

- Username & email ASCII & chars limit validation + improved messages ([#12788](https://github.com/linode/manager/pull/12788))
- Fix VPC IPv6 range validation in `ModifyLinodeInterfaceSchema` ([#12856](https://github.com/linode/manager/pull/12856))

### Upcoming Features:

- Remove `address` from slaacSchema as it is a read-only field ([#12778](https://github.com/linode/manager/pull/12778))
- Rename Datastream to Delivery ([#12852](https://github.com/linode/manager/pull/12852))

## [2025-09-09] - v0.74.0

### Added:

- Additional device slots to `devices` schema ([#12791](https://github.com/linode/manager/pull/12791))
- Node Pool schemas `CreateNodePoolSchema` and `EditNodePoolSchema` ([#12793](https://github.com/linode/manager/pull/12793))

### Removed:

- General Node Pool schema `nodePoolSchema` ([#12793](https://github.com/linode/manager/pull/12793))

## [2025-08-26] - v0.73.0

### Changed:

- Update `alertsSchema` to require numeric fields when empty and change the validation messages ([#12703](https://github.com/linode/manager/pull/12703))

### Tech Stories:

- Clean up linode ipv6 interfaces ([#12612](https://github.com/linode/manager/pull/12612))

## [2025-08-12] - v0.72.0

### Changed:

- Update `createVPCSchema` to support IPv6 subnets ([#12563](https://github.com/linode/manager/pull/12563))

### Fixed:

- ACLP - Alerting: Fix missing 'in' operator check in dimension filter for create alert schema ([#12628](https://github.com/linode/manager/pull/12628))
- Non-human-readable validation messages for Linode Alert numeric input ([#12635](https://github.com/linode/manager/pull/12635))

### Removed:

- `nodePoolBetaSchema` in favor of `nodePoolSchema` ([#12596](https://github.com/linode/manager/pull/12596))

### Upcoming Features:

- Validation for datastream forms: create stream and destination. Validation for datastream create POST request ([#12557](https://github.com/linode/manager/pull/12557))

## [2025-07-29] - v0.71.0

### Changed:

- Update `VPCIPv6Schema` and `VPCIPv6SubnetSchema` ([#12309](https://github.com/linode/manager/pull/12309))
- Update `NodeBalancerSchema` port uniqueness logic to allow TCP and UDP configurations on the same port ([#12502](https://github.com/linode/manager/pull/12502))

### Upcoming Features:

- Update IPv6 Subnet validation ([#12382](https://github.com/linode/manager/pull/12382))

## [2025-07-15] - v0.70.0

### Upcoming Features:

- Update validation schemas for the changes in endpoints /v4/nodebalancers & /v4/nodebalancers/configs/{configId}/nodes for NB Dual Stack Support ([#12421](https://github.com/linode/manager/pull/12421))
- Add `regions` in `createAlertDefinitionSchema` and `editAlertDefinitionSchema` ([#12435](https://github.com/linode/manager/pull/12435))

## [2025-07-01] - v0.69.0

### Added:

- IAM RBAC: email validation ([#12395](https://github.com/linode/manager/pull/12395))

### Fixed:

- ACLP: update `scope` property in `createAlertDefinitionSchema` and `editAlertDefinitionSchema` to optional and nullable ([#12441](https://github.com/linode/manager/pull/12441))

### Upcoming Features:

- Add `scope` in `createAlertDefinitionSchema` and `editAlertDefinitionSchema` ([#12377](https://github.com/linode/manager/pull/12377))
- Update maintenance policy validation to use string type ([#12417](https://github.com/linode/manager/pull/12417))
- Add `createCloudNATSchema` and `updateCloudNATSchema`

## [2025-06-17] - v0.68.0

### Added:

- Validation schema for database PrivateNetwork property via updatePrivateNetworkSchema ([#12354](https://github.com/linode/manager/pull/12354))

### Upcoming Features:

- Change references of `interface` to `linode_interface` for firewall validation ([#12367](https://github.com/linode/manager/pull/12367))

## [2025-06-03] - v0.67.0

### Added:

- Method to retrieve dynamic validation for Create database schema ([#12281](https://github.com/linode/manager/pull/12281))

### Fixed:

- Handling duplicate subnet-ids during Nodebalancer creation with VPC enabled ([#12181](https://github.com/linode/manager/pull/12181))

## [2025-05-20] - v0.66.0

### Upcoming Features:

- Add new LKE-E schema for nodePoolBetaSchema ([#12188](https://github.com/linode/manager/pull/12188))

## [2025-05-06] - v0.65.0

### Added:

- DBaaS: Validation for `mysql.group_concat_max_len` and `default_time_zone` ([#12116](https://github.com/linode/manager/pull/12116))
- DBaaS: Custom validation for `net_buffer_length` ([#12126](https://github.com/linode/manager/pull/12126))

### Changed:

- Update validation schemas for the changes in POST endpoints in /v4/nodebalancers (& /v4beta/nodebalancers) for NB-VPC Integration ([#11910](https://github.com/linode/manager/pull/11910))

### Upcoming Features:

- Update ipv4ConfigInterface, ipv6ConfigInterface, ConfigProfileInterfaceSchema, and CreateVPCInterfaceSchema ([#11942](https://github.com/linode/manager/pull/11942))

## [2025-04-22] - v0.64.0

### Added:

- custom validation for `wal_sender_timeout` and `max_failover_replication_time_lag` ([#12022](https://github.com/linode/manager/pull/12022))

### Changed:

- Validation message for threshold field in Metric Threshold ([#11963](https://github.com/linode/manager/pull/11963))

### Removed:

- AutoscaleNodePoolSchema from kubenetes.schema.ts ([#12033](https://github.com/linode/manager/pull/12033))

### Tech Stories:

- Eslint Overhaul ([#11941](https://github.com/linode/manager/pull/11941))

### Upcoming Features:

- Enhance the validation schema for create flow and new schema for edit alert flow in cloudpulse ([#11868](https://github.com/linode/manager/pull/11868))

## [2025-04-08] - v0.63.0

### Upcoming Features:

- Update `ipv6` vpc schema validation for subnets, separate `createSubnetSchema` into `createSubnetSchemaIPv4` and `createSubnetSchemaWithIPv6` ([#11896](https://github.com/linode/manager/pull/11896))

## [2025-03-25] - v0.62.0

### Added:

- Validation messages for required Autoscale min and max values ([#11664](https://github.com/linode/manager/pull/11664))
- Optional IPv6 to `createVPCIPv6Schema` ([#11852](https://github.com/linode/manager/pull/11852))

### Changed:

- Update CreateFirewallSchema to match API types ([#11677](https://github.com/linode/manager/pull/11677))
- Improve accuracy of schemas related to Linode creation ([#11847](https://github.com/linode/manager/pull/11847))
- Bucket create schema `Label` to `Bucket name` ([#11877](https://github.com/linode/manager/pull/11877))

### Fixed:

- Improve clarity for Object Storage bucket creation validation message ([#11712](https://github.com/linode/manager/pull/11712))

### Tech Stories:

- Upgrade tsup to 8.4.0 ([#11866](https://github.com/linode/manager/pull/11866))

### Upcoming Features:

- Validation for required ACL enablement on LKE-E clusters ([#11746](https://github.com/linode/manager/pull/11746))
- New rule for Name and Description of Create Alert form ([#11773](https://github.com/linode/manager/pull/11773))

## [2025-02-25] - v0.61.0

### Removed:

- Required `entity_ids` from `createAlertDefinitionSchema` ([#11649](https://github.com/linode/manager/pull/11649))

## [2025-02-19] - v0.60.1

### Fixed:

- Inability to add LKE Node Pool Labels with underscore in key ([#11682](https://github.com/linode/manager/pull/11682))

## [2025-02-11] - v0.60.0

### Added:

- Taint and label schemas for Node Pool Labels and Taints ([#11553](https://github.com/linode/manager/pull/11553))

### Changed:

- Rename old `LinodeInterfaceSchema` to `ConfigProfileInterfaceSchema` ([#11527](https://github.com/linode/manager/pull/11527))

### Upcoming Features:

- Add new validation schemas for Linode Interfaces project: `CreateLinodeInterfaceSchema` and `ModifyLinodeInterfaceSchema` ([#11527](https://github.com/linode/manager/pull/11527))
- Revised validation error messages for the CreateAlertDefinition schema ([#11543](https://github.com/linode/manager/pull/11543))
- Add `UpdateFirewallSettingsSchema`for Linode Interfaces project ([#11559](https://github.com/linode/manager/pull/11559))
- Update `CreateLinodeSchema` for Linode Interfaces project ([#11566](https://github.com/linode/manager/pull/11566))
- Update `UpdateAccountSettingsSchema` validation schema for Linode Interfaces project ([#11562](https://github.com/linode/manager/pull/11562))

## [2025-01-28] - v0.59.0

### Changed:

- Allow `cipher_suite` to be `none` in NodeBalancer schemas ([#11515](https://github.com/linode/manager/pull/11515))

### Tech Stories:

- Update `tsconfig.json` to use `bundler` moduleResolution ([#11487](https://github.com/linode/manager/pull/11487))

## [2025-01-14] - v0.58.0

### Added:

- Validation for UDP NodeBalancer support ([#11321](https://github.com/linode/manager/pull/11321))

### Changed:

- Update VPC validation to temporarily hide mention of IPv6 in UI, fix punctuation ([#11357](https://github.com/linode/manager/pull/11357))
- Update VPC label validation schema punctuation, fix label validation regex ([#11393](https://github.com/linode/manager/pull/11393))
- Error messages for few attributes ([#11445](https://github.com/linode/manager/pull/11445))

## [2024-12-10] - v0.57.0

### Added:

- Punctuation for CloudPulse Alert error messages ([#11286](https://github.com/linode/manager/pull/11286))
- Maximum and minimum values for `check_attempts`, `check_interval`, and `check_timeout` in `createNodeBalancerConfigSchema` ([#11306](https://github.com/linode/manager/pull/11306))
- Maximum and minimum values for `check_attempts`, `check_interval`, and `check_timeout` to `UpdateNodeBalancerConfigSchema` ([#11306](https://github.com/linode/manager/pull/11306))

### Tech Stories:

- Update yup from `0.32.9` to `1.4.0` (#11324)
- Update Linter rules for common pr feedback points ([#11258](https://github.com/linode/manager/pull/11258))

### Upcoming Features:

- Add `cloudpulse.schema` to validate the various fields for the Create Alert Form ([#11255](https://github.com/linode/manager/pull/11255))

## [2024-11-12] - v0.56.0

### Tech Stories:

- Remove `@types/node` dependency ([#11157](https://github.com/linode/manager/pull/11157))

## [2024-10-28] - v0.55.0

### Added:

- Validation schema for LKE ACL payload ([#10968](https://github.com/linode/manager/pull/10968))
- `PRIVATE_IPv4_REGEX` for determining if an IPv4 address is private ([#11069](https://github.com/linode/manager/pull/11069))

### Changed:

- Update `nodeBalancerConfigNodeSchema` to allow any private IPv4 rather than just \`192\.168\` IPs ([#11069](https://github.com/linode/manager/pull/11069))

## [2024-10-14] - v0.54.0

### Changed:

- Update validation schema to account for clearing value in ImageSelect ([#11007](https://github.com/linode/manager/pull/11007))

## [2024-09-30] - v0.53.0

### Changed:

- Make `replication_type` and `replication_commit_type` optional in `databases.schema.ts` ([#10980](https://github.com/linode/manager/pull/10980))

## [2024-09-03] - v0.52.0

### Fixed:

- Lack of `label` error validation for letter casing and symbols when creating Object Storage bucket ([#10842](https://github.com/linode/manager/pull/10842), [#10847](https://github.com/linode/manager/pull/10847))

### Changed:

- Increase block storage max volume size to 16TB ([#10865](https://github.com/linode/manager/pull/10865))

## [2024-08-05] - v0.51.0

### Added:

- Unique label validation for Object Storage label ([#10699](https://github.com/linode/manager/pull/10699))

### Changed:

- Include optional 'encryption' field in CreateVolumeSchema ([#10716](https://github.com/linode/manager/pull/10716))

### Fixed:

- Allow null values in Linode configuration ([#10690](https://github.com/linode/manager/pull/10690))

### Upcoming Features:

- Update create bucket schema validation for `endpoint_type` and `cors_enabled` ([#10677](https://github.com/linode/manager/pull/10677))

## [2024-07-22] - v0.50.0

### Added:

- `createAccountLimitSupportTicketSchema` to support schemas ([#10620](https://github.com/linode/manager/pull/10620))

### Changed:

- Breaking: change Placement Group `is_strict` to `placement_group_policy` and `affinity_type` to `placement_group_type` ([#10651](https://github.com/linode/manager/pull/10651))

## [2024-07-08] - v0.49.0

### Added:

- `createSMTPSupportTicketSchema` to support schemas ([#10557](https://github.com/linode/manager/pull/10557))

## [2024-06-10] - v0.48.0

### Added:

- `tags` to `updateImageSchema` ([#10466](https://github.com/linode/manager/pull/10466))
- `updateImageRegionsSchema` ([#10541](https://github.com/linode/manager/pull/10541))

## [2024-05-28] - v0.47.0

### Added:

- `tags` to `createImageSchema` ([#10471](https://github.com/linode/manager/pull/10471))

### Changed:

- Adjust DiskEncryptionSchema so it is not an object ([#10462](https://github.com/linode/manager/pull/10462))
- Improve Image `label` validation ([#10471](https://github.com/linode/manager/pull/10471))

## [2024-05-13] - v0.46.0

### Changed:

- Include disk_encryption in CreateLinodeSchema and RebuildLinodeSchema ([#10413](https://github.com/linode/manager/pull/10413))
- Allow `backup_id` to be nullable in `CreateLinodeSchema` ([#10421](https://github.com/linode/manager/pull/10421))

## [2024-04-29] - v0.45.0

### Changed:

- Improved VPC `ip_ranges` validation in `LinodeInterfaceSchema` ([#10354](https://github.com/linode/manager/pull/10354))
- Allow `stackscript_id` to be `null` in `CreateLinodeSchema` ([#10367](https://github.com/linode/manager/pull/10367))

## [2024-04-15] - v0.44.0

### Changed:

- Update Regions error message in `updateObjectStorageKeysSchema` ([#10329](https://github.com/linode/manager/pull/10329))

## [2024-04-01] - v0.43.0

### Changed:

- Make `image` nullable in `CreateLinodeSchema` ([#10281](https://github.com/linode/manager/pull/10281))
- Enforce that the `certificates` array is empty for `http` and `tcp` configurations ([#10311](https://github.com/linode/manager/pull/10311))
- Allow `firewall_id` to be `null` in `CreateLinodeSchema` ([#10319](https://github.com/linode/manager/pull/10319))

## [2024-03-18] - v0.42.0

### Changed:

- Update TCP rules to not include a `match_condition` ([#10264](https://github.com/linode/manager/pull/10264))

## [2024-03-04] - v0.41.0

### Upcoming Features:

- Add Placement Group data in Create Linode payload ([#10195](https://github.com/linode/manager/pull/10195))
- Placement Group types update ([#10200](https://github.com/linode/manager/pull/10200))

## [2024-02-13] - v0.40.0

### Changed:

- ip_ranges field in LinodeInterfaceSchema no longer limited to 1 element ([#10089](https://github.com/linode/manager/pull/10089))

## [2024-02-05] - v0.39.0

### Upcoming Features:

- Add `path_regex` as a valid ACLB rule match field ([#10126](https://github.com/linode/manager/pull/10126))

## [2024-01-22] - v0.38.0

### Changed:

- Revise createObjectStorageKeysSchema to include optional 'regions' field ([#10063](https://github.com/linode/manager/pull/10063))
- Make `allow_list` not required for updateDatabaseSchema and added optional `type` property ([#9869](https://github.com/linode/manager/pull/9869))

## [2024-01-08] - v0.37.0

### Tech Stories:

- Add Lint Github Action ([#9973](https://github.com/linode/manager/pull/9973))

## [2023-12-11] - v0.36.0

### Upcoming Features:

- Improve `UpdateConfigurationSchema` ([#9870](https://github.com/linode/manager/pull/9870))
- Update `CreateServiceTargetSchema` and `UpdateServiceTargetSchema` to include `protocol` ([#9891](https://github.com/linode/manager/pull/9891))
- Change `ca_certificate` to `certificate_id` in `CreateServiceTargetSchema` and `UpdateServiceTargetSchema` ([#9891](https://github.com/linode/manager/pull/9891))
- Require certificates for AGLB HTTPS configurations ([#9903](https://github.com/linode/manager/pull/9903))

## [2023-11-13] - v0.35.0

### Upcoming Features:

- Add `CreateLoadBalancerEndpointSchema`, `CreateLoadBalancerServiceTargetSchema`, `CreateLoadBalancerRuleSchema`, `ConfigurationSchema`, and `CreateLoadBalancerSchema` for AGLB ([#9848](https://github.com/linode/manager/pull/9848))
- Add `UpdateConfigurationSchema` for AGLB ([#9853](https://github.com/linode/manager/pull/9853))
- Add missing label validation to `UpdateCertificateSchema` for AGLB ([#9880](https://github.com/linode/manager/pull/9880))

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
