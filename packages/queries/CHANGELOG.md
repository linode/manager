## [2025-12-09] - v0.18.0


### Changed:

- Update database useRestoreFromBackupMutation data to include region ([#13097](https://github.com/linode/manager/pull/13097))

### Upcoming Features:

- Add new queries for Network Load Balancers ([#13078](https://github.com/linode/manager/pull/13078))
- Added Database Connection Pool queries ([#13148](https://github.com/linode/manager/pull/13148))

## [2025-11-18] - v0.17.0


### Upcoming Features:

- Add new queries for Firewall RS & PL ([#13061](https://github.com/linode/manager/pull/13061))
- New IAM getUserEntitiesByPermission queries ([#13070](https://github.com/linode/manager/pull/13070))

## [2025-10-21] - v0.16.0

### Added:

- `useAllGetDelegatedChildAccountsForUserQuery` for IAM User Delegation ([#12920](https://github.com/linode/manager/pull/12920))

## [2025-10-07] - v0.15.0


### Added:

- IAM RBAC: useAllAccountEntities to fetch all pages client-side via getAll, preventing missing items on large accounts ([#12888](https://github.com/linode/manager/pull/12888))
- IAM Parent/Child - Implement new delegation query hooks ([#12895](https://github.com/linode/manager/pull/12895))
- IAM Delegation: useAllListMyDelegatedChildAccountsQuery to fetch all data ([#12913](https://github.com/linode/manager/pull/12913))
- Region VPC availability queries ([#12919](https://github.com/linode/manager/pull/12919))

### Changed:

- ACLP: update metric definition queries cache time to inifinity ([#12887](https://github.com/linode/manager/pull/12887))

### Removed:

- `isUsingBetaEndpoint` logic for kubernetes queries since all kubernetes endpoints
now use /v4beta ([#12867](https://github.com/linode/manager/pull/12867))

### Upcoming Features:

- Logs Delivery Streams/Destinations update useAll queries ([#12802](https://github.com/linode/manager/pull/12802))

## [2025-09-23] - v0.14.0

### Upcoming Features:

- Add infiniteQueries for Streams and Destinations ([#12811](https://github.com/linode/manager/pull/12811))
- Add query for Destinations' POST v4beta/monitor/streams/destinations/verify endpoint ([#12823](https://github.com/linode/manager/pull/12823))
- Rename DataStream to Delivery ([#12852](https://github.com/linode/manager/pull/12852))

## [2025-09-11] - v0.13.1

### Fixed:

- Restricted user with account access unable to access billing page on new session ([#12861](https://github.com/linode/manager/pull/12861))

## [2025-09-09] - v0.13.0

### Upcoming Features:

- Add queries for Streams DELETE, PUT API endpoints ([#12645](https://github.com/linode/manager/pull/12645))
- Add queries for Destinations DELETE, PUT API endpoints ([#12749](https://github.com/linode/manager/pull/12749))

## [2025-08-26] - v0.12.0

### Added:

- Implemented `enabled` parameters for payments & invoices queries ([#12660](https://github.com/linode/manager/pull/12660))
- Enable parameters to useAccountUsers & useUserRoles ([#12714](https://github.com/linode/manager/pull/12714))

### Changed:

- Replace deprecated queries from /account/entity-transfers to /account/service-transfers ([#12658](https://github.com/linode/manager/pull/12658))
- IAM RBAC - Increase getAccountEntities page size to 500 ([#12762](https://github.com/linode/manager/pull/12762))

### Upcoming Features:

- Add queries for destinations endpoints (paginated GET, POST) ([#12627](https://github.com/linode/manager/pull/12627))

## [2025-08-12] - v0.11.0

### Upcoming Features:

- Add GET queries for destinations endpoints ([#12559](https://github.com/linode/manager/pull/12559))

## [2025-07-29] - v0.10.0

### Changed:

- Fetch all nodebalancers query to accept Params and Filter ([#12510](https://github.com/linode/manager/pull/12510))

### Upcoming Features:

- Add queries for streams endpoints (GET, POST) ([#12524](https://github.com/linode/manager/pull/12524))

## [2025-07-15] - v0.9.0

### Added:

- `entitytransfers/` directory and migrated relevant query keys and hooks ([#12406](https://github.com/linode/manager/pull/12406))
- Added `databases/` directory and migrated relevant query keys and hooks ([#12426](https://github.com/linode/manager/pull/12426))
- `statusPage/` directory and migrated relevant query keys and hooks ([#12468](https://github.com/linode/manager/pull/12468))

## [2025-07-01] - v0.8.0

### Added:

- Created `iam/` directory and migrated relevant query keys and hooks ([#12370](https://github.com/linode/manager/pull/12370))
- Created `networktransfer/` directory and migrated relevant query keys and hooks ([#12381](https://github.com/linode/manager/pull/12381))

### Upcoming Features:

- Add `getAllMaintenancePolicies` query and `useAccountMaintenancePoliciesQuery` hook to fetch and manage VM Host Maintenance Policy data ([#12334](https://github.com/linode/manager/pull/12334))
- Add CRUD CloudNAT queries ([#12379](https://github.com/linode/manager/pull/12379))

## [2025-06-17] - v0.7.0

### Added:

- Created `types/` directory and migrated relevant query keys and hooks ([#12330](https://github.com/linode/manager/pull/12330))
- Created `betas/` directory and migrated relevant query keys and hooks ([#12358](https://github.com/linode/manager/pull/12358))

## [2025-06-03] - v0.6.0

### Added:

- Create `domains/` directory and migrate relevant query keys and hooks ([#12204](https://github.com/linode/manager/pull/12204))
- Create `images/` directory and migrate relevant query keys and hooks ([#12205](https://github.com/linode/manager/pull/12205))
- `quotas/` directory and migrated relevant query keys and hook ([#12221](https://github.com/linode/manager/pull/12221))

### Removed:

- `isUsingBetaEndpoint` parameter from `useNodeBalancerQuery` ([#12217](https://github.com/linode/manager/pull/12217))

## [2025-05-20] - v0.5.0

### Added:

- `useAddPaymentMethodMutation` for adding a payment method to your account ([#12136](https://github.com/linode/manager/pull/12136))

### Upcoming Features:

- Add queries for VPC IPs endpoints ([#12177](https://github.com/linode/manager/pull/12177))

## [2025-05-06] - v0.4.0

### Tech Stories:

- Re-export everything from `@tanstack/react-query` ([#12106](https://github.com/linode/manager/pull/12106))

## [2025-04-22] - v0.3.0

### Added:

- Linode Config related queries to get a single Config and a single Config Profile Interface ([#11953](https://github.com/linode/manager/pull/11953))

### Tech Stories:

- Eslint Overhaul ([#11941](https://github.com/linode/manager/pull/11941))

## [2025-04-08] - v0.2.0

### Added:

- `tags/` directory and migrated relevant query keys and hooks ([#11897](https://github.com/linode/manager/pull/11897))
- `support/` directory and migrated relevant query keys and hooks ([#11904](https://github.com/linode/manager/pull/11904))
- `stackscripts/` directory and migrated relevant query keys and hooks ([#11949](https://github.com/linode/manager/pull/11949))

### Upcoming Features:

- Add Firewall Settings query ([#11828](https://github.com/linode/manager/pull/11828))

## [2025-03-25] - v0.1.0

### Added:

- Create queries package with `linodes/` queries and dependencies ([#11774](https://github.com/linode/manager/pull/11774))
- Create `volumes/` directory and relevant query keys and hooks ([#11843](https://github.com/linode/manager/pull/11843))

### Upcoming Features:

- Add query to upgrade legacy config interfaces to Linode interfaces ([#11808](https://github.com/linode/manager/pull/11808))
