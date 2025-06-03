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
