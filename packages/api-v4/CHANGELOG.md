## [2025-03-13] - v0.136.0

### Changed:

- Add `type` and `lke_cluster` to Nodebalancer interface and `getNodeBalancerBeta` function ([#11653](https://github.com/linode/manager/pull/11653))
- Make `interface_generation` on `Linode` optional ([#11655](https://github.com/linode/manager/pull/11655))
- Make `label` field in `CreateFirewallPayload` required ([#11677](https://github.com/linode/manager/pull/11677))
- Update Region `Capabilities` type to temporarily include LA Disk Encryption ([#11783](https://github.com/linode/manager/pull/11783))

### Upcoming Features:

- Update region capability and Public Interface object for Linode Interfaces ([#11621](https://github.com/linode/manager/pull/11621))
- Add payload type for EditAlertDefinition, API request changes for the user edit functionality ([#11669](https://github.com/linode/manager/pull/11669))
- Add `getAlertDefinitionByServiceType` in alerts.ts ([#11685](https://github.com/linode/manager/pull/11685))
- Add `engine_config` to the Database Instance for DBaaS Advanced Configurations ([#11735](https://github.com/linode/manager/pull/11735))
- Use different validation schema for creating enterprise LKE cluster ([#11746](https://github.com/linode/manager/pull/11746))

## [2025-02-25] - v0.135.0

### Changed:

- Update LKE Tiered Version endpoints ([#11703](https://github.com/linode/manager/pull/11703))

### Upcoming Features:

- Add `DateTimeWithPreset` type in CloudPulse types ([#11573](https://github.com/linode/manager/pull/11573))
- Add `update_firewall` RoleType for IAM ([#11588](https://github.com/linode/manager/pull/11588))
- Change attribute names in NotificationChannel and MetricCriteria types to reflect the latest API specification ([#11610](https://github.com/linode/manager/pull/11610))
- Change type of the alertId in `editAlertDefinition` and `getAlertDefinitionByServiceTypeAndId` endpoints in CloudPulse alerts to string ([#11613](https://github.com/linode/manager/pull/11613))
- Add new `class` type in alerts object ([#11642](https://github.com/linode/manager/pull/11642))

## [2025-02-11] - v0.134.0


### Added:

- Labels and Taints types and params ([#11528](https://github.com/linode/manager/pull/11528))
- API endpoints for NotificationChannels ([#11547](https://github.com/linode/manager/pull/11547))
- `service-transfer` related endpoints ([#11562](https://github.com/linode/manager/pull/11562))
- `billing_agreement` to Agreements interface ([#11563](https://github.com/linode/manager/pull/11563))
- `Enhanced Interfaces` to a Region's `Capabilities` ([#11584](https://github.com/linode/manager/pull/11584))
- New database statuses for database_migration event ([#11590](https://github.com/linode/manager/pull/11590))

### Changed:

- Quotas API spec to make region field optional ([#11551](https://github.com/linode/manager/pull/11551))
- Update Taint value to allow undefined ([#11553](https://github.com/linode/manager/pull/11553))
- Mark `entity-transfers` related endpoints as deprecated ([#11562](https://github.com/linode/manager/pull/11562))

### Upcoming Features:

- Update `PermissionType` types for IAM ([#11423](https://github.com/linode/manager/pull/11423))
- Add new API types and endpoints for Linode Interfaces project: `/v4/linodes/instances` ([#11527](https://github.com/linode/manager/pull/11527))
- Update `AccountAccessType` and `RoleType` types for IAM ([#11533](https://github.com/linode/manager/pull/11533))
- Add and update `/v4/networking` endpoints and types for Linode Interfaces ([#11559](https://github.com/linode/manager/pull/11559))
- Update `/v4/account` and `/v4/vpcs` endpoints and types for upcoming Linode Interfaces project ([#11562](https://github.com/linode/manager/pull/11562))
- Update existing `v4/linodes/instances` endpoints and types for Linode Interfaces project ([#11566](https://github.com/linode/manager/pull/11566))
- Add new `editAlertDefinition` endpoint to edit the resources associated with CloudPulse alerts ([#11583](https://github.com/linode/manager/pull/11583))
- Add support for quotas usage endpoint ([#11597](https://github.com/linode/manager/pull/11597))

## [2025-01-28] - v0.133.0

### Changed:

- Allow `cipher_suite` to be `none` in `NodeBalancerConfig` and `CreateNodeBalancerConfig` ([#11515](https://github.com/linode/manager/pull/11515))

### Tech Stories:

- Update `tsconfig.json` to use `bundler` moduleResolution ([#11487](https://github.com/linode/manager/pull/11487))

### Upcoming Features:

- Update types for IAM and resources API ([#11429](https://github.com/linode/manager/pull/11429))
- Add types for Quotas endpoints ([#11493](https://github.com/linode/manager/pull/11493))
- Add Notification Channel related types to cloudpulse/alerts.ts ([#11511](https://github.com/linode/manager/pull/11511))


## [2025-01-14] - v0.132.0

### Added:

- Types for UDP NodeBalancer support ([#11321](https://github.com/linode/manager/pull/11321))
- Tags to `KubeNodePoolResponse` and `UpdateNodePoolData` ([#11368](https://github.com/linode/manager/pull/11368))

### Changed:

- Type of `AlertDefinitionType` to `'system'|'user'`   ([#11346](https://github.com/linode/manager/pull/11346))
- Property names, and types of the CreateAlertDefinitionPayload and Alert interfaces ([#11392](https://github.com/linode/manager/pull/11392))
- BaseDatabase total_disk_size_gb and used_disk_size_gb are always expected and used_disk_size_gb can be null ([#11426](https://github.com/linode/manager/pull/11426))
- Renamed `AvailableMetrics` type to `MetricDefinition` ([#11433](https://github.com/linode/manager/pull/11433))
- Changed MetricCritera, DimensionFilter and Alert Interfaces ([#11445](https://github.com/linode/manager/pull/11445))

### Fixed:

- Nullable AccountBeta ended & description properties ([#11347](https://github.com/linode/manager/pull/11347))
- Incorrect return type of `updateObjectACL` ([#11369](https://github.com/linode/manager/pull/11369))

### Removed:

- getAccountInfoBeta endpoint ([#11413](https://github.com/linode/manager/pull/11413))
- `MetricDefinitions` type ([#11433](https://github.com/linode/manager/pull/11433))

### Upcoming Features:

- Fix types for IAM API ([#11397](https://github.com/linode/manager/pull/11397))
- Add new `getAlertDefinitionByServiceTypeAndId` endpoint to fetch Cloud Pulse alert details by id and service type ([#11399](https://github.com/linode/manager/pull/11399))
- New `Block Storage Performance B1` linode capability ([#11400](https://github.com/linode/manager/pull/11400))
- Add `getKubernetesTypesBeta` function ([#11419](https://github.com/linode/manager/pull/11419))

## [2024-12-10] - v0.131.0

### Added:

- Extend support for Object Storage in Support tickets ([#11178](https://github.com/linode/manager/pull/11178))
- Missing `+eq` type to `FilterConditionTypes` interface ([#11233](https://github.com/linode/manager/pull/11233))
- New Accelerated-related fields and capabilities to API types ([#11256](https://github.com/linode/manager/pull/11256))
- Placement Groups migrations Types ([#11261](https://github.com/linode/manager/pull/11261))
- `service_type` as parameter for the Create Alert POST request ([#11286](https://github.com/linode/manager/pull/11286))

### Removed:

- `deleted` from the `ImageStatus` type ([#11257](https://github.com/linode/manager/pull/11257))

### Tech Stories:

- Update yup from `0.32.9` to `1.4.0` (#11324)
- Add Linter rules for naming convention ([#11337](https://github.com/linode/manager/pull/11337))
- Update Linter rules for common PR feedback points (#11258)
- Remove recently added camelCase rule ([#11330](https://github.com/linode/manager/pull/11330))

### Upcoming Features:

- Modify `chart_type` property type in `types.ts` ([#11204](https://github.com/linode/manager/pull/11204))
- Add POST request endpoint for create alert in `alerts.ts`, add Alert, add CreateAlertPayload types ([#11255](https://github.com/linode/manager/pull/11255))
- Add v4beta/account endpoint and update Capabilities for LKE-E ([#11259](https://github.com/linode/manager/pull/11259))
- Add remaining new types and v4beta endpoints for LKE-E ([#11302](https://github.com/linode/manager/pull/11302))
- New IAM endpoints and types ([#11146](https://github.com/linode/manager/pull/11146), [#11181](https://github.com/linode/manager/pull/11181))

## [2024-11-12] - v0.130.0

### Added:

- DBaaS: Suspend and Resume backend calls ([#11152](https://github.com/linode/manager/pull/11152))

### Removed:

- DBaaS: Deprecated types including MongoDB and Redis ([#11218](https://github.com/linode/manager/pull/11218))

### Tech Stories:

- Remove `@types/node` dependency ([#11157](https://github.com/linode/manager/pull/11157))

### Upcoming Features:

- DBaaS: Modify update payload to include version, add patch API ([#11196](https://github.com/linode/manager/pull/11196))

## [2024-10-28] - v0.129.0

### Added:

- ACL related endpoints and types for LKE clusters ([#10968](https://github.com/linode/manager/pull/10968))
- `StackScripts` to Region capabilities type ([#11139](https://github.com/linode/manager/pull/11139))

### Fixed:

- Incorrect documentation on how to set a page size ([#11129](https://github.com/linode/manager/pull/11129))

## [2024-10-14] - v0.128.0

### Added:

- `SMTP Enabled` account & Linode capabilities ([#10991](https://github.com/linode/manager/pull/10991))
- `allow_list` to the DatabaseInstance ([#11039](https://github.com/linode/manager/pull/11039))

### Changed:

- Rename `notification tax_id_invalid` to `tax_id_verifying` ([#10967](https://github.com/linode/manager/pull/10967))
- Firewall attributes `created_dt` to `created` and `updated_dt` to `updated` ([#11023](https://github.com/linode/manager/pull/11023))
- Databases types to have UpdateDatabasePayload include `cluster_size` and export the Engines type ([#11040](https://github.com/linode/manager/pull/11040))
- Specify DBaaS fork restore payload and return types ([#11048](https://github.com/linode/manager/pull/11048))

### Removed:

- `edge` type reference in `LinodeTypeClass` and `RegionSite` ([#10639](https://github.com/linode/manager/pull/10639))

### Upcoming Features:

- Add export to FilterValue interface ([#10853](https://github.com/linode/manager/pull/10853))

## [2024-09-30] - v0.127.0

### Changed:

- Make `replication_type` and `replication_commit_type` optional in MySQL and Postgres interfaces ([#10980](https://github.com/linode/manager/pull/10980))
- DBaaS restore method name ([#10988](https://github.com/linode/manager/pull/10988))

### Fixed:

- Include `standby` field in `DatabaseHosts` interface ([#10989](https://github.com/linode/manager/pull/10989))

### Upcoming Features:

- DBaaS V2 readonly hosts ([#10939](https://github.com/linode/manager/pull/10939))

## [2024-09-16] - v0.126.0

### Added:

- LinodeCapabilities type used for `capabilities` property of Linode interface ([#10920](https://github.com/linode/manager/pull/10920))

### Tech Stories:

- Update vitest to latest ([#10843](https://github.com/linode/manager/pull/10843))

### Upcoming Features:

- Change 'bs_encryption_supported' property on Linode object to 'capabilities' ([#10837](https://github.com/linode/manager/pull/10837))
- Add beta API root for CloudPulse endpoints ([#10851](https://github.com/linode/manager/pull/10851))

## [2024-09-03] - v0.125.0

### Added:

- Managed Databases V2 capability and types ([#10786](https://github.com/linode/manager/pull/10786))

### Changed:

- Deprecate `getClusters` ([#10801](https://github.com/linode/manager/pull/10801))
- Increase block storage max volume size to 16TB ([#10865](https://github.com/linode/manager/pull/10865))

### Upcoming Features:

- Update `AclpConfig` type ([#10769](https://github.com/linode/manager/pull/10769))
- Add service types and `getCloudPulseServiceTypes` request ([#10805](https://github.com/linode/manager/pull/10805))

## [2024-08-19] - v0.124.0

### Added:

- Firewall template endpoints ([#10770](https://github.com/linode/manager/pull/10770))

### Changed:

- Move `getObjectStorageEndpoints` from `/objects.ts` to `/buckets.ts` ([#10736](https://github.com/linode/manager/pull/10736))

### Upcoming Features:

- Add several CloudPulseMetrics types ([#10710](https://github.com/linode/manager/pull/10710))
- Change JWETokenPayLoad `resource_id` to `resource_ids` ([#10747](https://github.com/linode/manager/pull/10747))
- Add 'Akamai Cloud Pulse' in AccountCapability type interface ([#10768](https://github.com/linode/manager/pull/10768))

## [2024-08-05] - v0.123.0

### Added:

- `site_type` to the linode instance type ([#10714](https://github.com/linode/manager/pull/10714))

### Changed:

- Update Object Storage types with more descriptive names ([#10686](https://github.com/linode/manager/pull/10686))
- Support null values in `Interface` type ([#10690](https://github.com/linode/manager/pull/10690))
- Linode, Volume, and VolumeRequestPayload interfaces and VolumeStatus, AccountCapability, and Capabilities types to reflect Block Storage Encryption changes ([#10716](https://github.com/linode/manager/pull/10716))

### Upcoming Features:

- Add MetricDefinitions, Dimension, JWETokenPayload, JWEToken and metricDefinitions, dashboard by id and jwe token api calls ([#10676](https://github.com/linode/manager/pull/10676))
- Add new /v4/object-storage/endpoints endpoint ([#10677](https://github.com/linode/manager/pull/10677))

## [2024-07-22] - v0.122.0

### Changed:

- Breaking: change Placement Group `affinity_type` to `placement_group_type` ([#10651](https://github.com/linode/manager/pull/10651))
- Breaking: change Placement Group `is_strict` to `placement_group_policy` ([#10651](https://github.com/linode/manager/pull/10651))
- Use new "lish" API instead of "lish_token" ([#10656](https://github.com/linode/manager/pull/10656))

### Upcoming Features:

- Add ACLG Config and Widget to CloudPulse types ([#10625](https://github.com/linode/manager/pull/10625))

## [2024-07-08] - v0.121.0

### Changed:

- Update `updateImageRegions` to accept `UpdateImageRegionsPayload` instead of `regions: string[]` ([#10617](https://github.com/linode/manager/pull/10617))

### Upcoming Features:

- Added types needed for DashboardSelect component ([#10589](https://github.com/linode/manager/pull/10589))

## [2024-06-24] - v0.120.0

### Added:

- New endpoint for LKE HA types used in pricing ([#10505](https://github.com/linode/manager/pull/10505))
- UpdateImagePayload type ([#10514](https://github.com/linode/manager/pull/10514))
- New endpoint for `network-transfer/prices` ([#10566](https://github.com/linode/manager/pull/10566))

## [2024-06-10] - v0.119.0

### Added:

- `tags` field in `Image` type ([#10466](https://github.com/linode/manager/pull/10466))
- New endpoint for `object-storage/types` ([#10468](https://github.com/linode/manager/pull/10468))
- `members` to `DatabaseInstance` and `Database` types ([#10503](https://github.com/linode/manager/pull/10503))
- New event `tax_id_invalid` for account tax id ([#10512](https://github.com/linode/manager/pull/10512))

### Changed:

- Update return type of `updateDatabase` to be `Database` ([#10503](https://github.com/linode/manager/pull/10503))
- Add lke_cluster_id to Linode interface ([#10537](https://github.com/linode/manager/pull/10537))

### Upcoming Features:

- Update images endpoints to reflect the image service API spec ([#10541](https://github.com/linode/manager/pull/10541))

## [2024-05-28] - v0.118.0

### Added:

- New LKE events in `EventAction` type ([#10443](https://github.com/linode/manager/pull/10443))

### Changed:

- Add Disk Encryption to AccountCapability type and region Capabilities type ([#10462](https://github.com/linode/manager/pull/10462))

## [2024-05-13] - v0.117.0

### Added:

- 'edge' Linode type class ([#10415](https://github.com/linode/manager/pull/10415))

### Changed:

- Allow `backup_id` to be `null` in `CreateLinodeRequest` ([#10404](https://github.com/linode/manager/pull/10404))
- Add disk_encryption to Linode, Disk, CreateLinodeRequest, RebuildRequest, and KubeNodePoolResponse interfaces ([#10413](https://github.com/linode/manager/pull/10413))
- Allow null for Placement Groups maximum_pgs_per_customer ([#10433](https://github.com/linode/manager/pull/10433))

### Upcoming Features:

- Update Placement Group event types ([#10420](https://github.com/linode/manager/pull/10420))

## [2024-05-06] - v0.116.0

### Added:

- 'edge' Linode type class ([#10441](https://github.com/linode/manager/pull/10441))

## [2024-04-29] - v0.115.0

### Added:

- New endpoint for `volumes/types` ([#10376](https://github.com/linode/manager/pull/10376))

### Changed:

- Allow `stackscript_id` to be `null` in `CreateLinodeRequest` ([#10367](https://github.com/linode/manager/pull/10367))

### Upcoming Features:

- Add interface for linode migrate flow with placement groups ([#10339](https://github.com/linode/manager/pull/10339))

## [2024-04-15] - v0.114.0

### Added:

- New endpoint and type for `nodebalancers/types` ([#10265](https://github.com/linode/manager/pull/10265))
- Severity fields to support ticket endpoints and new account capability ([#10317](https://github.com/linode/manager/pull/10317))

### Upcoming Features:

- Modify Region Placement Groups Limits types ([#10343](https://github.com/linode/manager/pull/10343))

## [2024-04-01] - v0.113.0

### Added:

- Event type for database resize create (#10262)
- jsdoc style comments to `CreateLinodeRequest` based on API documentation ([#10319](https://github.com/linode/manager/pull/10319))

### Changed:

- Allow `image` to be `null` in `CreateLinodeRequest` ([#10281](https://github.com/linode/manager/pull/10281))
- Allow `firewall_id` to be `null` in `CreateLinodeRequest` ([#10319](https://github.com/linode/manager/pull/10319))

### Tech Stories:

- Update `axios` to resolve `follow-redirects` CVE-2024-28849 ([#10291](https://github.com/linode/manager/pull/10291))

## [2024-03-18] - v0.112.0

### Changed:

- Make `match_condition` optional in Rule types to support TCP rules ([#10264](https://github.com/linode/manager/pull/10264))
- Make `type` and `region` required in `CreateLinodeRequest` ([#10268](https://github.com/linode/manager/pull/10268))

### Upcoming Features:

- Add Placement Groups events types ([#10221](https://github.com/linode/manager/pull/10221))
- Add temporary deleteBucketWithRegion method for OBJ Multicluster ([#10244](https://github.com/linode/manager/pull/10244))

## [2024-03-04] - v0.111.0

### Changed:

- Rename `database_scale` type to `database_resize` ([#10193](https://github.com/linode/manager/pull/10193))

### Upcoming Features:

- Accept placement group in Linode create payload ([#10195](https://github.com/linode/manager/pull/10195))

## [2024-02-20] - v0.110.0

### Upcoming Features:

- Update /account and /profile UserType from `null` to `"default"` ([#10176](https://github.com/linode/manager/pull/10176))

## [2024-02-05] - v0.109.0

### Fixed:

- Accept `InterfacePayload` type when creating a Linode with interfaces specified ([#10086](https://github.com/linode/manager/pull/10086))
- Remove incorrect `_initial` property on `Event` type ([#9949](https://github.com/linode/manager/pull/9949))

### Upcoming Features:

- Add `user_type` to /profile endpoint for Parent/Child user roles ([#10080](https://github.com/linode/manager/pull/10080))
- Add `Akamai Cloud Load Balancer` to `AccountCapability` type ([#10098](https://github.com/linode/manager/pull/10098))

## [2024-01-22] - v0.108.0

### Added:

- AGLB endpoint health endpoints ([#10008](https://github.com/linode/manager/pull/10008))
- Ability to scale up Database instances ([#9869](https://github.com/linode/manager/pull/9869))

### Changed:

- Adjust several OBJ types to accommodate forthcoming API changes ([#9996](https://github.com/linode/manager/pull/9996))

## [2024-01-08] - v0.107.0

### Added:

- Optional `headers` to `getProfile` function ([#9987](https://github.com/linode/manager/pull/9987))

### Tech Stories:

- Add Lint GitHub Action ([#9973](https://github.com/linode/manager/pull/9973))

## [2023-12-11] - v0.106.0

### Added:

- Beta flag DC Get Well endpoints ([#9904](https://github.com/linode/manager/pull/9904))

### Tech Stories:

- Update `axios` to `1.6.1` ([#9911](https://github.com/linode/manager/pull/9911))

### Upcoming Features:

- Add validation to AGLB `createLoadbalancerConfiguration` and correct `routes` to `route_ids` ([#9870](https://github.com/linode/manager/pull/9870))
- Add `protocol` to AGLB `ServiceTargetPayload` ([#9891](https://github.com/linode/manager/pull/9891))
- Change `ca_certificate` to `certificate_id` in AGLB `ServiceTargetPayload` ([#9891](https://github.com/linode/manager/pull/9891))
- Add `user_type` and `child_account_access` fields for Parent/Child account switching ([#9942](https://github.com/linode/manager/pull/9942))
- Add new endpoints for Parent/Child account switching ([#9944](https://github.com/linode/manager/pull/9944))

## [2023-11-13] - v0.105.0

### Upcoming Features:

- Add `UpdateConfigurationPayload` ([#9853](https://github.com/linode/manager/pull/9853))
- Add `getAccountAvailabilities` and `getAccountAvailability` methods for DC Get Well initiative ([#9860](https://github.com/linode/manager/pull/9860))
- Add `getRegionAvailabilities` and `getRegionAvailability` endpoints and related types for Sold Out Plans initiative ([#9878](https://github.com/linode/manager/pull/9878))

## [2023-10-30] - v0.104.0

### Upcoming Features:

- Update AGLB `updateLoadbalancerServiceTarget` endpoint with method and schema ([#9800](https://github.com/linode/manager/pull/9800))
- Update AGLB `createLoadbalancerRoute` endpoint with payload/schema ([#9806](https://github.com/linode/manager/pull/9806))
- Update the `Subnet` and `Interface` interfaces to match new API spec ([#9824](https://github.com/linode/manager/pull/9824))

## [2023-10-16] - v0.103.0

### Upcoming Features:

- Added `UpdateCertificatePayload` payload and updated `Certificate` interface ([#9723](https://github.com/linode/manager/pull/9723))
- New payload option `migration_type` in `ResizeLinodePayload` and new event type `linode_resize_warm_create` ([#9677](https://github.com/linode/manager/pull/9677))

## [2023-10-02] - v0.102.0

### Upcoming Features:

- VPCs added to region Capabilities type ([#9635](https://github.com/linode/manager/pull/9635))
- Add type `DeleteLinodeConfigInterfacePayload` for deleting Linode config interfaces ([#9687](https://github.com/linode/manager/pull/9687))

## [2023-09-18] - v0.101.0

### Changed:

- Change `Account` and `Grant`-related types to include VPC-related grants and capabilities ([#9585](https://github.com/linode/manager/pull/9585))

### Fixed:

- Fix invalid absolute imports ([#9656](https://github.com/linode/manager/pull/9656))

### Upcoming Features:

- DBaaS disk size and used size ([#9638](https://github.com/linode/manager/pull/9638))

## [2023-09-05] - v0.100.0

### Changed:

- Include 'firewall_id' field as optional in CreateLinodeRequest ([#9453](https://github.com/linode/manager/pull/9453))

### Upcoming Features:

- Add add_vpcs to GlobalGrantTypes ([#9537](https://github.com/linode/manager/pull/9537))
- Update account and linode types for DC-specific pricing ([#9586](https://github.com/linode/manager/pull/9586))
- VPC and Subnet related event types ([#9530](https://github.com/linode/manager/pull/9530))

## [2023-08-21] - v0.99.0

### Changed:

- Include `vpc_id` and rename `subnet` to `subnet_id` in Linode config interface return object ([#9485](https://github.com/linode/manager/pull/9485))

## [2023-08-07] - v0.98.0

### Added:

- New methods for Linode Configs and new/updated Linode Config and interface types ([#9418](https://github.com/linode/manager/pull/9418))

## [2023-07-24] - v0.97.0

### Added:

- Support for self serve beta endpoints ([#9386](https://github.com/linode/manager/pull/9386))
- Endpoints for VPC Subnets ([#9390](https://github.com/linode/manager/pull/9390))

### Removed:

- Unused `_initial` field in `Event` ([#9416](https://github.com/linode/manager/pull/9416))

## [2023-07-11] - v0.96.0

### Added:

- Endpoints for VPC ([#9361](https://github.com/linode/manager/pull/9361))
- Endpoints for the Akamai Global Load Balancer ([#9363](https://github.com/linode/manager/pull/9363))

### Changed:

- Use 'canceled' instead of 'cancelled' for EntityTransferStatus ([#9335](https://github.com/linode/manager/pull/9335))

## [2023-06-27] - v0.95.1

### Fixed:

- Updated Entity interface to reflect the possibility of a null label ([#9331](https://github.com/linode/manager/pull/9331))

## [2023-06-26] - v0.95.0

### Added:

- New Region Capability (Premium Plans) ([#9253](https://github.com/linode/manager/pull/9253))
- Database APIv4 types to support Premium plans ([#9257](https://github.com/linode/manager/pull/9257))

### Removed:

- References to deprecated Google Tag Manager ([#9266](https://github.com/linode/manager/pull/9266))

## [2023-06-12] - v0.94.0

### Changed:

- Corrected `getLinodeKernel` return type from `ResourcePage<Kernel>` to `Kernel` #9198
- Corrected the return type of `deleteSSLCert` from `ObjectStorageBucketSSLResponse` to `{}` #9167
- Updated `lint-staged` to `^13.2.2` #9156
- Removed unused `handlebars` resolution #9156

### Fixed:

- Encode `api-v4` Path Parameters #9205

## [2023-05-30] - v0.93.0

### Added:

- `ticket_update` to account types ([#9105](https://github.com/linode/manager/pull/9105))
- filtering on IPv6 ranges ([#9097](https://github.com/linode/manager/pull/9097))

## [2023-05-15] - v0.92.0

### Added:

- Ability download DNS zone file #9075
- React Query - Linodes - Landing #9062
- Added `available` to the `LinodeBackup` type #9079

### Fixed:

- Removed deprecated PayPal endpoints #9058

## [2023-05-01] - v0.91.0

### Added:

- `InterfacePayload` type for network interface data when creating a Linode or a Linode configuration #9053
- `id` to the `Interface` type #9053

## [2023-04-17] - v0.90.0

### Changed:

- Accept URL query parameters for `getNodeBalancerConfigs` #8964
- Accept `null` for `OAuthClient` thumbnail URL #8938

## [2023-04-03] - v0.89.0

### Added:

- React Query for SSH Keys [#8892](https://github.com/linode/manager/pull/8892)
- React Query for Firewalls [#8889](https://github.com/linode/manager/pull/8889)

## [2023-03-20] - v0.88.0

### Added:

- `params` to regions endpoint [#8851](https://github.com/linode/manager/pull/8851)
- `params` and `filters` to `getLinodeFirewalls` [#8848](https://github.com/linode/manager/pull/8848)

### Changed:

- Updated `VolumeStatus` type [#8862](https://github.com/linode/manager/pull/8862)
- Updated `tsup` [#8838](https://github.com/linode/manager/pull/8838)

### Removed:

- Unused packages + update lint-staged [#8860](https://github.com/linode/manager/pull/8860)

## [2023-03-06] - v0.87.0

### Added:

- Increased minimum acceptable password strength for Linode root passwords
- Removed zone types for LISH URL change
- Account Logins Show `Successful` or `Failed` Access

### Changed:

- Update Node.js from 14.17.4 LTS to 18.14.1 LTS

## [2023-02-07] - v0.86.0

### Added:

- Databases as a User Permissions Option
- `label` to Region type
- Token related events

### Fixed:

- `api-v4` CommonJS not accepted by Node.js

## [2023-01-09] - v0.85.0

### Added:

- Account login history endpoints
- `completed` status to `AccountMaintenance` type

### Changed:

- Updated ESLint rules to not include Material UI

## [2022-12-12] - v0.84.0

### Added:

- `eol` field on `Image` type

## [2022-11-30] - v0.83.0

### Changed:

- Updated Volume interface to include linode_label; updated VolumeStatus type to include ‘migrating’

## [2022-11-14] - v0.82.0

### Added:

- Support for user-defined headers in UDF (user-defined fields) schema

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
