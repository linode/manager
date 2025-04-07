# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [2025-04-08] - v1.139.0


### Added:

- Add cache update logic on edit alert query ([#11917](https://github.com/linode/manager/pull/11917))

### Changed:

- Update Breadcrumb component to conform to Akamai Design System specs ([#11841](https://github.com/linode/manager/pull/11841))
- Display interface type first in Linode Network IP Addresses table ([#11865](https://github.com/linode/manager/pull/11865))
- Update Radio Button component to conform to Akamai Design System specs ([#11878](https://github.com/linode/manager/pull/11878))
- Change `GlobalFilters.tsx` and `Zoomer.tsx` to add color on hover of icon ([#11883](https://github.com/linode/manager/pull/11883))
- Update styles to CDS for profile menu ([#11884](https://github.com/linode/manager/pull/11884))
- Update BetaChip styles, its usage and updated BetaChip component tests ([#11965](https://github.com/linode/manager/pull/11965))
- Disable form fields on Firewall Create page for restricted users ([#11954](https://github.com/linode/manager/pull/11954))
- Update 'Learn more' docs link for Accelerated Compute plans ([#11970](https://github.com/linode/manager/pull/11970))

### Fixed:

- Database action menu incorrectly enabled with `read-only` grant and `Delete Cluster` button incorrectly disabled with `read/write` grant ([#11890](https://github.com/linode/manager/pull/11890))
- Tabs keyboard navigation on some Tanstack rerouted features ([#11894](https://github.com/linode/manager/pull/11894))
- Console errors on create menu & Linode create flow ([#11933](https://github.com/linode/manager/pull/11933))
- PAT Token drawer logic when Child Account Access is hidden ([#11935](https://github.com/linode/manager/pull/11935))
- Profile Menu Icon Size Inconsistency ([#11946](https://github.com/linode/manager/pull/11946))
- Unclearable ACL IP addresses for LKE clusters ([#11947](https://github.com/linode/manager/pull/11947))
- DBaaS Advanced Configuration: drawer shows outdated config values after save and reopen ([#11979](https://github.com/linode/manager/pull/11979))

### Removed:

- Ramda from `Utilities` package ([#11861](https://github.com/linode/manager/pull/11861))
- Move `ListItemOption` from `manager` to `ui` package ([#11790](https://github.com/linode/manager/pull/11790))
- Move `regionsData` from `manager` to `utilities` package ([#11790](https://github.com/linode/manager/pull/11790))
- Move `LinodeCreateType` to `utilities` package ([#11790](https://github.com/linode/manager/pull/11790))
- Move `LinodeSelect` to new `shared` package ([#11844](https://github.com/linode/manager/pull/11844))
- Legacy BetaChip component ([#11872](https://github.com/linode/manager/pull/11872))
- Move `doesRegionSupportFeature` from `manager` to `utilities` package ([#11891](https://github.com/linode/manager/pull/11891))
- Move Tags-related queries and dependencies to shares `queries` package ([#11897](https://github.com/linode/manager/pull/11897))
- Move Support-related queries and dependencies to shared `queries` package ([#11904](https://github.com/linode/manager/pull/11904))
- Move `luxon` dependent utils from `manager` to `utilities` package ([#11905](https://github.com/linode/manager/pull/11905))
- Move ramda dependent utils ([#11913](https://github.com/linode/manager/pull/11913))
- Move `useIsGeckoEnabled` hook out of `RegionSelect` to `@linode/shared` package ([#11918](https://github.com/linode/manager/pull/11918))
- Remove region selector from Edit VPC drawer since data center assignment cannot be changed. ([#11929](https://github.com/linode/manager/pull/11929))
- DBaaS: deprecated types, outdated and unused code in  DatabaseCreate and DatabaseSummary ([#11909](https://github.com/linode/manager/pull/11909))
- Move `useFormattedDate` from `manager` to `utilities` package ([#11931](https://github.com/linode/manager/pull/11931))
- Move stackscripts-related queries and dependencies to shared `queries` package ([#11949](https://github.com/linode/manager/pull/11949))

### Tech Stories:

- Make `RegionSelect` and `RegionMultiSelect` pure ([#11790](https://github.com/linode/manager/pull/11790))
- Nodebalancer routing (Tanstack) ([#11858](https://github.com/linode/manager/pull/11858))
- Add `FirewallSelect` component ([#11887](https://github.com/linode/manager/pull/11887))
- Add eslint rule for deprecating mui theme.spacing  ([#11889](https://github.com/linode/manager/pull/11889))
- Resolve Path Traversal Vulnerabilities detected from semgrep ([#11914](https://github.com/linode/manager/pull/11914))
- Move feature flag code out of Kubernetes queries file ([#11922](https://github.com/linode/manager/pull/11922))
- Fix incorrect secret in `publish-packages` Github Action  ([#11923](https://github.com/linode/manager/pull/11923))
- Remove hashing on Pendo account and visitor ids ([#11950](https://github.com/linode/manager/pull/11950))

### Tests:

- Add HTML report generation for Cypress test results ([#11795](https://github.com/linode/manager/pull/11795))
- Add `env:premiumPlans` test tag for tests which require premium plan availability ([#11886](https://github.com/linode/manager/pull/11886))
- Fix Linode create end-to-end test failures against alternative environments ([#11886](https://github.com/linode/manager/pull/11886))
- Delete redundant Linode create SSH key test ([#11886](https://github.com/linode/manager/pull/11886))
- Add test for Add Linode Interface drawer ([#11887](https://github.com/linode/manager/pull/11887))
- Prevent legacy regions from being used by Cypress tests ([#11892](https://github.com/linode/manager/pull/11892))
- Temporarily skip Firewall end-to-end tests ([#11898](https://github.com/linode/manager/pull/11898))
- Add tests for restricted user on database page ([#11912](https://github.com/linode/manager/pull/11912))
- Allow Cypress Volume tests to pass against alternative environments ([#11939](https://github.com/linode/manager/pull/11939))
- Fix create-linode-view-code-snippet.spec.ts test broken in devcloud ([#11948](https://github.com/linode/manager/pull/11948))
- Improve stability of Linode config Cypress tests ([#11951](https://github.com/linode/manager/pull/11951))

### Upcoming Features:

- DBaaS Advanced Configurations: Add UI for existing engine options in the drawer ([#11812](https://github.com/linode/manager/pull/11812))
- Add Default Firewalls paper to Account Settings ([#11828](https://github.com/linode/manager/pull/11828))
- Add functionality to support the 'Assign New Roles' drawer for a single user in IAM ([#11834](https://github.com/linode/manager/pull/11834))
- Update Firewall Devices Linode landing table to account for new interface devices ([#11842](https://github.com/linode/manager/pull/11842))
- Add Quotas Tab Beta Chip ([#11872](https://github.com/linode/manager/pull/11872))
- Add AlertListNoticeMessages component for handling multiple API error messages, update AddChannelListing and MetricCriteria components to display these errors, add handleMultipleError util method for aggregating, mapping the errors to fields ([#11874](https://github.com/linode/manager/pull/11874))
- Disable query to get Linode Interface when Interface Delete dialog is closed ([#11881](https://github.com/linode/manager/pull/11881))
- Update title for Delete Interface dialog ([#11881](https://github.com/linode/manager/pull/11881))
- Add VPC support to the Add Network Interface Drawer ([#11887](https://github.com/linode/manager/pull/11887))
- Add Interface Details drawer for Linode Interfaces ([#11888](https://github.com/linode/manager/pull/11888))
- Add a new confirmation dialog for the unassigning role flow in IAM ([#11893](https://github.com/linode/manager/pull/11893))
- Add VPC & Firewall section to LKE-E create flow ([#11901](https://github.com/linode/manager/pull/11901))
- Update success message for create/edit/enable/disable alert at `CreateAlertDefinition.tsx`, `EditAlertDefinition.tsx`, and `AlertListTable.tsx` ([#11903](https://github.com/linode/manager/pull/11903))
- Update Firewall Landing table to account for Linode Interface devices and Default Firewalls ([#11920](https://github.com/linode/manager/pull/11920))
- Add Default Firewall chips to Firewall Detail page ([#11920](https://github.com/linode/manager/pull/11920))
- Remove preselected role from Change Role drawer ([#11926](https://github.com/linode/manager/pull/11926))
- Adjust logic for displaying encryption status on Linode Details page and encryption copy on LKE Create page ([#11930](https://github.com/linode/manager/pull/11930))
- DBaaS Advanced Configurations: set up Autocomplete to display categorized options, add/remove configs, and implement a dynamic validation schema for all field types ([#11885](https://github.com/linode/manager/pull/11885))
- Support more VPC features when using Linode Interfaces on the Linode Create page ([#11915](https://github.com/linode/manager/pull/11915))
- Pre-select default firewalls on the Linode Create flow ([#11915](https://github.com/linode/manager/pull/11915))
- Update mock data and tests according to IAM backend response updates ([#11919](https://github.com/linode/manager/pull/11919))
- Update `vpcIPFactory` to support IPv6 ([#11938](https://github.com/linode/manager/pull/11938))
- Add a 2-minute refetch interval in alerts.ts, add isLoading and remove isFetching in AlertDetail.tsx. ([#11945](https://github.com/linode/manager/pull/11945))

## [2025-03-26] - v1.138.1

### Fixed:

- Authentication redirect issue ([#11925](https://github.com/linode/manager/pull/11925))

## [2025-03-25] - v1.138.0


### Added:

- LKE UI updates for checkout bar & NodeBalancer Details summary ([#11653](https://github.com/linode/manager/pull/11653))
- Link to Linode's Firewall in Linode Entity Details ([#11736](https://github.com/linode/manager/pull/11736))
- Logic to redirect invalid paths to home page of `/metrics` & `/alerts/definitions` url ([#11837](https://github.com/linode/manager/pull/11837))
- Tags in Volume Create Flow ([#11696](https://github.com/linode/manager/pull/11696))

### Changed:

- Copy in Node Pool resize, autoscale, and recycle CTAs ([#11664](https://github.com/linode/manager/pull/11664))
- Make "Public" checkbox default-checked in OAuth App creation form ([#11681](https://github.com/linode/manager/pull/11681))
- Improve error handling for KubeConfig download during cluster provisioning ([#11683](https://github.com/linode/manager/pull/11683))
- Update copy for LKE ACL section ([#11746](https://github.com/linode/manager/pull/11746))
- Update copy for LKE Recycle, Upgrade Version, and Delete Pool modals ([#11775](https://github.com/linode/manager/pull/11775))
- Update RegionSelect placement group tooltiptext copy ([#11791](https://github.com/linode/manager/pull/11791))
- Enhance MUI Adornments: Unify Theme for Autocomplete and TextField Components via InputBase Styling ([#11807](https://github.com/linode/manager/pull/11807))
- Update main search to use new API search implementation for large accounts ([#11819](https://github.com/linode/manager/pull/11819))
- Update styles to CSD for create menu ([#11821](https://github.com/linode/manager/pull/11821))
- Bucket create `Label` to `Bucket Name` ([#11877](https://github.com/linode/manager/pull/11877))
- Account for `LA Disk Encryption` region capability when checking if region supports Disk Encryption ([#11833](https://github.com/linode/manager/pull/11833))
- Account for whether region supports LDE when determining tooltip display for unencrypted linodes & node pools ([#11833](https://github.com/linode/manager/pull/11833))

### Fixed:

- Document titles of ACPL with appropriate keyword ([#11662](https://github.com/linode/manager/pull/11662))
- Missing disabled treatment and notices on several create flows for restricted users (#11674, #11687, #11672, #11700)
- Node Pools CTA buttons on small screens ([#11701](https://github.com/linode/manager/pull/11701))
- 404 cluster endpoint errors on Linode details page for non-LKE Linodes ([#11714](https://github.com/linode/manager/pull/11714))
- Mobile primary nav height ([#11723](https://github.com/linode/manager/pull/11723))
- RTX 6000 plans showing up in LKE UI ([#11731](https://github.com/linode/manager/pull/11731))
- Authentication Provider Selection Card UI regression ([#11732](https://github.com/linode/manager/pull/11732))
- Unresponsive show details button for selected Stackscript ([#11765](https://github.com/linode/manager/pull/11765))
- Linodes from distributed regions appearing in Create flow Backups & Clone tab ([#11767](https://github.com/linode/manager/pull/11767))
- Confusing wording on DBaaS suspend dialog ([#11769](https://github.com/linode/manager/pull/11769))
- Incorrect helper text in `Add an SSH Key` Drawer ([#11771](https://github.com/linode/manager/pull/11771))
- Linode Backups Drawer style regressions ([#11776](https://github.com/linode/manager/pull/11776))
- NodeBalancer Create Summary broken dividers and spacing ([#11779](https://github.com/linode/manager/pull/11779))
- Disable Firewall Selection in Linode Clone ([#11784](https://github.com/linode/manager/pull/11784))
- Incorrect default color shown in Avatar color picker ([#11787](https://github.com/linode/manager/pull/11787))
- PaginationFooter page size select ([#11798](https://github.com/linode/manager/pull/11798))
- `Add an SSH Key` button spacing ([#11800](https://github.com/linode/manager/pull/11800))
- Hide VPC Section from Linode Create Clone Tab ([#11805](https://github.com/linode/manager/pull/11805))
- Minor spacing inconsistencies throughout LKE ([#11827](https://github.com/linode/manager/pull/11827))
- Storybook not rendering due to crypto.randomUUID not being available in Storybook context ([#11835](https://github.com/linode/manager/pull/11835))
- Show details button misalignment for selected StackScript ([#11838](https://github.com/linode/manager/pull/11838))
- Navigation for metrics and alerts under Monitor at `PrimaryNav.tsx` ([#11869](https://github.com/linode/manager/pull/11869))

### Removed:

- Rate limits table from Object Storage details drawer ([#11848](https://github.com/linode/manager/pull/11848))
- Move `capitalize` utility and `useInterval` hook to `@linode/utilities` package ([#11666](https://github.com/linode/manager/pull/11666))
- Migrate utilities from `manager` to `utilities` package ([#11711](https://github.com/linode/manager/pull/11711))
- Migrate ErrorState to ui package ([#11718](https://github.com/linode/manager/pull/11718))
- Migrate utilities from `manager` to `utilities` package - pt2 ([#11733](https://github.com/linode/manager/pull/11733))
- Migrate hooks from `manager` to `utilities` package ([#11770](https://github.com/linode/manager/pull/11770))
- Move linodes-related queries and dependencies to shared packages ([#11774](https://github.com/linode/manager/pull/11774))
- Migrate utilities from `manager` to `utilities` package - pt3 ([#11778](https://github.com/linode/manager/pull/11778))
- Migrate Drawer to ui package ([#11789](https://github.com/linode/manager/pull/11789))
- Migrate ActionsPanel to ui package ([#11810](https://github.com/linode/manager/pull/11810))
- Unnecessary styled component from Linode Detail summary ([#11820](https://github.com/linode/manager/pull/11820))
- Move volumes-related queries and dependencies to shared `queries` package ([#11843](https://github.com/linode/manager/pull/11843))
- Move the entire `sort-by.ts` (excluding sortByUTFDate) to `utilities` package ([#11846](https://github.com/linode/manager/pull/11846))
- Migrate hooks from `manager` to `utilities` package ([#11850](https://github.com/linode/manager/pull/11850))
- Migrate utilities from `manager` to `utilities` package - pt4 ([#11859](https://github.com/linode/manager/pull/11859))
- Code coverage comparison jobs ([#11879](https://github.com/linode/manager/pull/11879))

### Tech Stories:

- Refactor the Linode Rebuild dialog ([#11629](https://github.com/linode/manager/pull/11629))
- Refactor CreateFirewallDrawer to use `react-hook-form` ([#11677](https://github.com/linode/manager/pull/11677))
- Upgrade to MUI v6 ([#11688](https://github.com/linode/manager/pull/11688))
- Migrate Firewalls feature to Tanstack routing ([#11704](https://github.com/linode/manager/pull/11704))
- Upgrade to 4.0.0 Design Tokens - New Spacing & Badge Tokens ([#11757](https://github.com/linode/manager/pull/11757))
- Update jspdf dependencies to resolve DOMPurify dependabot alert ([#11768](https://github.com/linode/manager/pull/11768))
- Upgrade Shiki to 3.1.0 ([#11772](https://github.com/linode/manager/pull/11772))
- Move @vitest/ui to monorepo root dependency ([#11755](https://github.com/linode/manager/pull/11755))
- Upgrade vitest and @vitest/ui to 3.0.7 ([#11755](https://github.com/linode/manager/pull/11755))
- Update react-vnc to 3.0.7 ([#11758](https://github.com/linode/manager/pull/11758))
- Restrict direct imports of Link from `react-router-dom` ([#11801](https://github.com/linode/manager/pull/11801))
- Refactor Stackscripts routing (Tanstack) ([#11806](https://github.com/linode/manager/pull/11806))
- Update main search to not depend on `recompose` library ([#11819](https://github.com/linode/manager/pull/11819))
- Remedy canvg dependency vulnerability ([#11839](https://github.com/linode/manager/pull/11839))
- Improve type-safety of Linode Create flow form ([#11847](https://github.com/linode/manager/pull/11847))
- Upgrade Vite to 6.2.2 ([#11866](https://github.com/linode/manager/pull/11866))
- Upgrade tsx to 4.19.3 ([#11866](https://github.com/linode/manager/pull/11866))
- Add MSW crud support for new Linode Interface endpoints ([#11875](https://github.com/linode/manager/pull/11875))
- Upgrade Storybook to 8.6.7 ([#11876](https://github.com/linode/manager/pull/11876))

### Tests:

- Add Cypress integration test to enable Linode Managed ([#10806](https://github.com/linode/manager/pull/10806))
- Improve Cypress test VLAN handling ([#11362](https://github.com/linode/manager/pull/11362))
- Add Cypress test for Service Transfers fetch error ([#11607](https://github.com/linode/manager/pull/11607))
- Add Cypress tests for restricted user Linode create flow ([#11663](https://github.com/linode/manager/pull/11663))
- Add test for ACLP Create Alerts ([#11670](https://github.com/linode/manager/pull/11670))
- Add Cypress test for Image create page for restricted users ([#11705](https://github.com/linode/manager/pull/11705))
- Configure caddy to ignore test output ([#11706](https://github.com/linode/manager/pull/11706))
- Add Cypress test for ACLP edit functionality of user defined alert ([#11719](https://github.com/linode/manager/pull/11719))
- Fix CloudPulse test failures triggered by new notice ([#11728](https://github.com/linode/manager/pull/11728))
- Remove Cypress test assertion involving Login app text ([#11737](https://github.com/linode/manager/pull/11737))
- Add Cypress test for Volume create page for restricted users ([#11743](https://github.com/linode/manager/pull/11743))
- Delete region test suite ([#11780](https://github.com/linode/manager/pull/11780))
- Add Cypress test for LKE create page for restricted users ([#11793](https://github.com/linode/manager/pull/11793))
- Fix bug in Edit User alert ([#11822](https://github.com/linode/manager/pull/11822))
- Fix VPC test failures when factory default region does not exist ([#11862](https://github.com/linode/manager/pull/11862))
- Add unit tests for `sortByUTFDate` utility ([#11846](https://github.com/linode/manager/pull/11846))
- Fix Google Pay test failures when using Braintree sandbox environment (#11863)
- Apply new custom eslint rule and lint files (#11689, #11722, #11730, #11756, #11766, #11814)


### Upcoming Features:

- Build new Quotas Controls ([#11647](https://github.com/linode/manager/pull/11647))
- Add Linode Interfaces Table to the Linode Details page ([#11655](https://github.com/linode/manager/pull/11655))
- Add final copy and docs links for LKE-E ([#11664](https://github.com/linode/manager/pull/11664))
- Truncate long usernames and emails in IAM users table and details page ([#11668](https://github.com/linode/manager/pull/11668))
- Fix filtering in IAM users table ([#11668](https://github.com/linode/manager/pull/11668))
- Add ability to edit alerts for CloudPulse User Alerts ([#11669](https://github.com/linode/manager/pull/11669))
- Add ability to create Firewalls from templates ([#11678](https://github.com/linode/manager/pull/11678))
- Add CloudPulse AlertReusableComponent, utils, and queries for contextual view ([#11685](https://github.com/linode/manager/pull/11685))
- Filter regions by supported region ids - `getSupportedRegionIds` in CloudPulse alerts ([#11692](https://github.com/linode/manager/pull/11692))
- Add new tags filter in the resources section of CloudPulse Alerts ([#11693](https://github.com/linode/manager/pull/11693))
- Fix LKE cluster table sorting when LKE-E beta endpoint is used ([#11714](https://github.com/linode/manager/pull/11714))
- Hide GPU plans tab for LKE-E ([#11726](https://github.com/linode/manager/pull/11726))
- Hide Networking sections from Linode Configurations page for Linodes with new interfaces ([#11727](https://github.com/linode/manager/pull/11727))
- Add table components to CloudPulse Alert Information contextual view ([#11734](https://github.com/linode/manager/pull/11734))
- Add DBaaS Advanced Configurations initial set up (new tab, drawer) ([#11735](https://github.com/linode/manager/pull/11735))
- Add Interface type to Linode Entity Detail ([#11736](https://github.com/linode/manager/pull/11736))
- Add support for `nodebalancerVPC` feature flag for NodeBalancer-VPC integration ([#11738](https://github.com/linode/manager/pull/11738))
- Fix LKE-E provisioning placeholder when filtering by status ([#11745](https://github.com/linode/manager/pull/11745))
- Enable ACL by default for LKE-E clusters ([#11746](https://github.com/linode/manager/pull/11746))
- Improve UX of CloudPulse Alerts create flow and resources section ([#11748](https://github.com/linode/manager/pull/11748))
- Update IAM assigned roles and entities table and refine styles for IAM permissions component. ([#11762](https://github.com/linode/manager/pull/11762))
- Enhance UI for Cloudpulse Alerting: Notifications, Metric Limits, and Dimensions ([#11773](https://github.com/linode/manager/pull/11773))
- Ability to add and remove Linode interfaces ([#11782](https://github.com/linode/manager/pull/11782))
- Add Confirmation Dialog when toggling an entity’s alert for CloudPulse Alerting ([#11785](https://github.com/linode/manager/pull/11785))
- Update warnings and actions for LKE-E VPCs ([#11786](https://github.com/linode/manager/pull/11786))
- Support Linode Interface Account Setting on Linode Create Flow ([#11788](https://github.com/linode/manager/pull/11788))
- Request for Quota increase modal ([#11792](https://github.com/linode/manager/pull/11792))
- Disable query to get Linode's firewalls for Linodes using new interfaces in LinodeEntityDetail ([#11796](https://github.com/linode/manager/pull/11796))
- Update navigation for CloudPulse Metrics to `/metrics` and CloudPulse Alerts to `/alerts` ([#11803](https://github.com/linode/manager/pull/11803))
- Add Upgrade Interfaces dialog for Linodes using legacy Configuration Profile Interfaces ([#11808](https://github.com/linode/manager/pull/11808))
- Disable Akamai App Platform beta for LKE-E clusters on create flow ([#11809](https://github.com/linode/manager/pull/11809))
- Handle errors while enabling and disabling alerts in Monitor at `AlertListTable.tsx` ([#11813](https://github.com/linode/manager/pull/11813))
- Set `refetchInterval` for 2 mins in CloudPulse alert queries  ([#11815](https://github.com/linode/manager/pull/11815))
- Add resources selection limitation in CloudPulse Alerting resources section for create and edit flows ([#11823](https://github.com/linode/manager/pull/11823))
- Remove `sxEndIcon` prop from Add Metric, Dimension Filter and Notification Channel buttons ([#11825](https://github.com/linode/manager/pull/11825))
- Add query to update roles in IAM ([#11840](https://github.com/linode/manager/pull/11840))
- Add a new drawer for changing role flow in IAM ([#11840](https://github.com/linode/manager/pull/11840))
- Initial support for VPCs using Linode Interfaces on the Linode create flow ([#11847](https://github.com/linode/manager/pull/11847))
- Restrict enable/disable actions in CloudPulse Alerts action menu based on alert status ([#11860](https://github.com/linode/manager/pull/11860))
- Remove toggle in the 'Add A User' drawer and default to limited access for users for IAM ([#11870](https://github.com/linode/manager/pull/11870))
- Update LKE-E flows to account for LDE status at LA launch ([#11880](https://github.com/linode/manager/pull/11880))


## [2025-02-27] - v1.137.2

### Fixed:

- Disk Encryption logic preventing Linode deployment in distributed regions ([#11760](https://github.com/linode/manager/pull/11760))

## [2025-02-25] - v1.137.1

### Fixed:

- Unable to save non-US billing contact information without tax id ([#11725](https://github.com/linode/manager/pull/11725))


## [2025-02-25] - v1.137.0


### Added:

- Improved Node Pool Collapsing UX ([#11619](https://github.com/linode/manager/pull/11619))
- Improved copy and helper text for NodeBalancer configurations ([#11636](https://github.com/linode/manager/pull/11636))
- Backstage Marketplace app ([#11652](https://github.com/linode/manager/pull/11652))

### Changed:

- Introduce 2025 CDS redesign ([#11465](https://github.com/linode/manager/pull/11465))
- Improve Syntax Highlighting ([#11611](https://github.com/linode/manager/pull/11611))
- Clarify OAuth setup instructions in Getting Started README ([#11622](https://github.com/linode/manager/pull/11622))
- Replace `Box` elements with `<StyledLinkButton>` for better accessibility and add `aria-label`s in the KubeConfigDisplay ([#11648](https://github.com/linode/manager/pull/11648))

### Fixed:

- Duplicate options from Help and Support search ([#11604](https://github.com/linode/manager/pull/11604))
- Document titles with incorrect keywords ([#11635](https://github.com/linode/manager/pull/11635))
- Order of footers for paginated LKE Node Pools ([#11639](https://github.com/linode/manager/pull/11639))
- TabIndex reset issue and incorrect enhanced number input minus sign SVG color ([#11651](https://github.com/linode/manager/pull/11654))
- Collapsible Node Pool overflow bug ([#11699](https://github.com/linode/manager/pull/11699))

### Removed:

- `ramda` from `Longview` ([#11606](https://github.com/linode/manager/pull/11606))
- `span` from Button Component ([#11627](https://github.com/linode/manager/pull/11627))
- Several old, unused Marketplace apps ([#11652](https://github.com/linode/manager/pull/11652))
- Migrate `Dialog`, `DialogTitle` components, and `visibilityHide.svg`, `visibilityShow.svg`, and `chevron-down.svg` icons to the `@linode/ui` package ([#11673](https://github.com/linode/manager/pull/11673))
- `react-select` from the codebase ([#11601](https://github.com/linode/manager/pull/11601))


### Tech Stories:

- Improve consistency of Notice error states ([#11404](https://github.com/linode/manager/pull/11404))
- Remove individual product entity icons and update storybook accordingly ([#11537](https://github.com/linode/manager/pull/11537))
- Add MSW crud operations for VPCs ([#11600](https://github.com/linode/manager/pull/11600))
- Convert Logout and OAuth to functional components ([#11620](https://github.com/linode/manager/pull/11620))
- Replace `data-test-id` attributes with `data-testid` and add eslint rules ([#11634](https://github.com/linode/manager/pull/11634))
- Update `TIME_DURATION` constant from `timeDuration` to `timeRange` ([#11631](https://github.com/linode/manager/pull/11631))

### Tests:

- Add integration test for LKE cluster add/remove tags ([#11545](https://github.com/linode/manager/pull/11545))
- Add component test for ImageSelect ([#11570](https://github.com/linode/manager/pull/11570))
- Add E2E test coverage for creating linode in a core region ([#11580](https://github.com/linode/manager/pull/11580))
- Refactor OCA tests ([#11591](https://github.com/linode/manager/pull/11591))
- Use DOM locators for Linode landing page tests ([#11594](https://github.com/linode/manager/pull/11594))
- Add Cypress test coverage for CloudPulse alert details page ([#11596](https://github.com/linode/manager/pull/11596))
- Upgrade Cypress to v14.0.1 ([#11608](https://github.com/linode/manager/pull/11608))
- Add Cypress tests for the CloudPulse alert listing page ([#11624](https://github.com/linode/manager/pull/11624))
- Add Cypress test for CloudPulse custom DateTimeRangePicker configuration ([#11626](https://github.com/linode/manager/pull/11626))
- Add unit tests for `payment` PDF generator ([#11644](https://github.com/linode/manager/pull/11644))
- Add Cypress tests for editing system alerts ([#11657](https://github.com/linode/manager/pull/11657))
- Fix DBaaS Backups unit test ([#11660](https://github.com/linode/manager/pull/11660))
- Add Cypress test for CloudPulse enabling/disabling alerts ([#11671](https://github.com/linode/manager/pull/11671))
- Add unit tests for `invoice` PDF generator and `getRemitAddress` util ([#11625](https://github.com/linode/manager/pull/11625))

### Upcoming Features:

- Replace `CloudPulseTimeRangeSelect` with `CloudPulseDateTimeRangePicker` ([#11573](https://github.com/linode/manager/pull/11573))
- Change metric request body to use `absolute_time_duration` for custom date and `relative_time_duration` for presets ([#11573](https://github.com/linode/manager/pull/11573))
- Add `1hr` preset option in `DateTimeRangePicker` and change time select input field to `read-only` in `DateTimePicker ([#11573](https://github.com/linode/manager/pull/11573))
- Add new table component for the assigned entities in the IAM ([#11588](https://github.com/linode/manager/pull/11588))
- Add new assign panel component for IAM ([#11605](https://github.com/linode/manager/pull/11605))
- Modify setValue method for the `DimensionFilterField`, `Metric` components and capitalize the Dimension Filter values in ShowDetails and Create features ([#11610](https://github.com/linode/manager/pull/11610))
- Enhance Alert Resources to display only selected resources and enhance EditAlertResources to save added/removed resources in CloudPulse Alerting section ([#11613](https://github.com/linode/manager/pull/11613))
- Update Tags dependency and filtering based on Region in CloudPulse ([#11615](https://github.com/linode/manager/pull/11615))
- Add new engineType filter in CloudPulse alerts resources section and enhance to build filters based on service type ([#11630](https://github.com/linode/manager/pull/11630))
- Add NetworkInterfaceType accordion to Account Settings ([#11640](https://github.com/linode/manager/pull/11640))
- Add implicit type filter for DBaaS resources fetch call in CloudPulse alerts resources section ([#11642](https://github.com/linode/manager/pull/11642))
- Update Node-Type filter from static to dynamic in CloudPulse ([#11643](https://github.com/linode/manager/pull/11643))
- Add Resources section in the create alert page in CloudPulse alerts ([#11649](https://github.com/linode/manager/pull/11649))
- Handle enable/disable action item for user created alerts in CloudPulse ([#11656](https://github.com/linode/manager/pull/11656))
- Correct table directional arrows; improve table striping at theme level ([#11661](https://github.com/linode/manager/pull/11661))

## [2025-02-19] - v1.136.1

### Fixed:

- Uptime not displaying in Longview ([#11667](https://github.com/linode/manager/pull/11667))

## [2025-02-11] - v1.136.0


### Added:

- Labels and Taints to LKE Node Pools ([#11528](https://github.com/linode/manager/pull/11528), [#11553](https://github.com/linode/manager/pull/11553))
- Firewall assignment on Linode and NodeBalancer detail pages ([#11567](https://github.com/linode/manager/pull/11567))
- LKE cluster label and id on associated Linode's details page ([#11568](https://github.com/linode/manager/pull/11568))
- Visual indication for unencrypted images ([#11579](https://github.com/linode/manager/pull/11579))
- Collapsible Node Pool tables & filterable status ([#11589](https://github.com/linode/manager/pull/11589))
- Database status display and event notifications for database migration  ([#11590](https://github.com/linode/manager/pull/11590))
- Database migration info banner ([#11595](https://github.com/linode/manager/pull/11595))

### Changed:

- Refactor StackScripts landing page ([#11215](https://github.com/linode/manager/pull/11215))
- Improve StackScript create and edit forms ([#11532](https://github.com/linode/manager/pull/11532))
- Don't allow "HTTP Cookie" session stickiness when NodeBalancer config protocol is TCP ([#11534](https://github.com/linode/manager/pull/11534))
- Make the `RegionMultiSelect` in the "Manage Image Regions" drawer ignore account capabilities ([#11598](https://github.com/linode/manager/pull/11598))
- Improve region filter loading state in Linodes Landing ([#11550](https://github.com/linode/manager/pull/11550))

### Fixed:

- Buggy Copy Token behavior on LKE details page ([#11592](https://github.com/linode/manager/pull/11592))
- Longview Detail id param not found (local only) ([#11599](https://github.com/linode/manager/pull/11599))
- Database restore backup timezone inconsistency ([#11628](https://github.com/linode/manager/pull/11628))

### Tech Stories:

- Refactor routing for Placement Groups to use Tanstack Router ([#11474](https://github.com/linode/manager/pull/11474))
- Replace ramda's `pathOr` with custom utility  ([#11512](https://github.com/linode/manager/pull/11512))
- Refactor StackScript Create, Edit, and Details pages ([#11532](https://github.com/linode/manager/pull/11532))
- Upgrade Vite to v6 ([#11548](https://github.com/linode/manager/pull/11548))
- Upgrade Vitest to v3 ([#11548](https://github.com/linode/manager/pull/11548))
- Enable Pendo based on OneTrust cookie consent ([#11564](https://github.com/linode/manager/pull/11564))
- TanStack Router Migration for Images Feature ([#11578](https://github.com/linode/manager/pull/11578))
- Removed `imageServiceGen2` and `imageServiceGen2Ga` feature flags ([#11579](https://github.com/linode/manager/pull/11579))
- Add Feature Flag for Linode Interfaces project ([#11584](https://github.com/linode/manager/pull/11584))
- Add MSW crud operations for Firewalls and `Get` operations for IP addresses ([#11586](https://github.com/linode/manager/pull/11586))
- Remove ramda from `DomainRecords` pt2 ([#11587](https://github.com/linode/manager/pull/11587))
- Remove ramda from `Managed` ([#11593](https://github.com/linode/manager/pull/11593))
- Remove `disallowImageUploadToNonObjRegions` feature flag ([#11598](https://github.com/linode/manager/pull/11598))
- Add `ignoreAccountAvailability` prop to `RegionMultiSelect` ([#11598](https://github.com/linode/manager/pull/11598))
- Update `markdown-it` to v14 ([#11602](https://github.com/linode/manager/pull/11602))
- Remove `@types/react-beautiful-dnd` dependency ([#11603](https://github.com/linode/manager/pull/11603))
- Upgrade to Vitest 3.0.5 ([#11612](https://github.com/linode/manager/pull/11612))
- Refactor `DomainRecordDrawer` to a functional component and use `react-hook-form` ([#11538](https://github.com/linode/manager/pull/11538))
- Add E2E test coverage for creating linode in a distributed region ([#11572](https://github.com/linode/manager/pull/11572))

### Tests:

- Add Cypress test to check Linode clone with null type ([#11473](https://github.com/linode/manager/pull/11473))
- Add a test for alerts show details page automation ([#11525](https://github.com/linode/manager/pull/11525))
- Add test coverage for viewing and deleting Node Pool Labels and Taints ([#11528](https://github.com/linode/manager/pull/11528))
- Warning notice for unavailable region buckets ([#11530](https://github.com/linode/manager/pull/11530))
- Add Cypress tests for object storage creation form for restricted user ([#11560](https://github.com/linode/manager/pull/11560))
- Stop using `--headless=old` Chrome flag to run headless Cypress tests ([#11561](https://github.com/linode/manager/pull/11561))
- Fix `resize-linode.spec.ts` test failure caused by updated API notification message ([#11561](https://github.com/linode/manager/pull/11561))
- Add tests for firewall assignment on Linode and NodeBalancer detail pages ([#11567](https://github.com/linode/manager/pull/11567))
- Add tests for downloading and viewing Kubeconfig file ([#11571](https://github.com/linode/manager/pull/11571))
- Add Cypress test for Service Transfers empty state ([#11585](https://github.com/linode/manager/pull/11585))

### Upcoming Features:

- Modify Cloud Manager to use OAuth PKCE ([#10600](https://github.com/linode/manager/pull/10600))
- Add new permissions component for IAM ([#11423](https://github.com/linode/manager/pull/11423))
- Add event messages for new `interface_create`, `interface_delete`, and `interface_update` events ([#11527](https://github.com/linode/manager/pull/11527))
- Add new table component for assigned roles in IAM ([#11533](https://github.com/linode/manager/pull/11533))
- Add support for NodeBalancer UDP Health Check Port ([#11534](https://github.com/linode/manager/pull/11534))
- Add filtering, pagination and sorting for resources section in CloudPulse alerts show details page ([#11541](https://github.com/linode/manager/pull/11541))
- Revised validation error messages and tooltip texts for Create Alert form ([#11543](https://github.com/linode/manager/pull/11543))
- Add placeholder Quotas tab in Accounts page ([#11551](https://github.com/linode/manager/pull/11551))
- Add new Notification Channel listing section in CloudPulse Alert details page ([#11554](https://github.com/linode/manager/pull/11554))
- Fix type errors that result from changes to `/v4/networking` endpoints ([#11559](https://github.com/linode/manager/pull/11559))
- Add billing agreement checkbox to non-US countries for tax id purposes ([#11563](https://github.com/linode/manager/pull/11563))
- Alerts Listing features: Pagination, Ordering, Searching, Filtering ([#11577](https://github.com/linode/manager/pull/11577))
- Add scaffolding for new edit resource component for system alerts in CloudPulse Alerts section ([#11583](https://github.com/linode/manager/pull/11583))
- Add support for quotas usage endpoint ([#11597](https://github.com/linode/manager/pull/11597))
- Add AddChannelListing and RenderChannelDetails for CloudPulse ([#11547](https://github.com/linode/manager/pull/11547))

## [2025-01-28] - v1.135.0

### Added:

- `useCreateUserMutation` for adding new users ([#11402](https://github.com/linode/manager/pull/11402)
- GPU plans in LKE create flow ([#11544](https://github.com/linode/manager/pull/11544))

### Changed:

- Improve backups banner styles ([#11480](https://github.com/linode/manager/pull/11480))
- Disable resizable plans when the usable storage equals the used storage of the database cluster ([#11481](https://github.com/linode/manager/pull/11481))
([#11495](https://github.com/linode/manager/pull/11495))
- Tech doc link for Bucket rate limits ([#11513](https://github.com/linode/manager/pull/11513))
- Search v2 `not equal` syntax ([#11521](https://github.com/linode/manager/pull/11521))
- Revise Disk Encryption description copy in Linode Create flow ([#11536](https://github.com/linode/manager/pull/11536))

### Fixed:

- Spacing for LKE cluster tags at desktop screen sizes ([#11507](https://github.com/linode/manager/pull/11507))
- Zoom-in icon hover effect in CloudPulse ([#11526](https://github.com/linode/manager/pull/11526))
- Linode Config Dialog misrepresenting primary interface ([#11542](https://github.com/linode/manager/pull/11542))

### Tech Stories:

- Update to TypeScript v5.7 ([#11531](https://github.com/linode/manager/pull/11531))
- Replace EnhancedSelect with Autocomplete component in the Help feature ([#11470](https://github.com/linode/manager/pull/11470))
- Replace ramda's `splitAt` with custom utility ([#11483](https://github.com/linode/manager/pull/11483))
- Update `tsconfig.json` to use `bundler` moduleResolution ([#11487](https://github.com/linode/manager/pull/11487))
- Replace one-off hardcoded color values with color tokens (part 5) ([#11488](https://github.com/linode/manager/pull/11488))
- Replace remaining react-select instances & types in Linodes Feature ([#11509](https://github.com/linode/manager/pull/11509))
- Dependabot security fixes ([#11510](https://github.com/linode/manager/pull/11510))
- Remove `ramda` from `DomainRecords` part 1 ([#11514](https://github.com/linode/manager/pull/11514))
- Remove `ramda` from `CreateDomain.tsx` ([#11505](https://github.com/linode/manager/pull/11505))
- Refactor and convert DomainRecords to functional component ([#11447](https://github.com/linode/manager/pull/11447))
- Add `Asia/Calcutta` zonename in `timezones.ts`, `disabledTimeZone` property in `DateTimeRangePicker`, and `minDate` property to `DateTimePicker` ([#11495](https://github.com/linode/manager/pull/11495))


### Tests:

- Improve organization of Object Storage and Object Storage Multicluster tests ([#11484](https://github.com/linode/manager/pull/11484))
- Fix test notification formatting and output issues ([#11489](https://github.com/linode/manager/pull/11489))
- Remove cypress deprecated helper.ts functions ([#11501](https://github.com/linode/manager/pull/11501))
- Add component tests for PasswordInput ([#11508](https://github.com/linode/manager/pull/11508))
- Add `CY_TEST_RESET_PREFERENCES` env var to reset user preferences at test run start ([#11522](https://github.com/linode/manager/pull/11522))
- Increase timeouts when performing Linode clone operations ([#11529](https://github.com/linode/manager/pull/11529))

### Upcoming Features:

- Add Proxy users table, removing users, adding users to IAM ([#11402](https://github.com/linode/manager/pull/11402))
- Add new entities component for IAM ([#11429](https://github.com/linode/manager/pull/11429))
- Display cluster provisioning after an LKE-E cluster is created ([#11518](https://github.com/linode/manager/pull/11518))
- Add Alert Details Criteria section in CloudPulse Alert Details page ([#11477](https://github.com/linode/manager/pull/11477))
- Update Metrics API request and JWE Token API request in CloudPulse ([#11506](https://github.com/linode/manager/pull/11506))
- Improve UDP NodeBalancer support ([#11515](https://github.com/linode/manager/pull/11515))
- Add scaffolding for Resources section in CloudPulse Alert details page ([#11524](https://github.com/linode/manager/pull/11524))
- Fix redirects from /account to /iam ([#11539](https://github.com/linode/manager/pull/11539)))
- Add `AddNotificationChannel` component with unit tests with necessary changes for constants, `CreateAlertDefinition` and other components. ([#11511](https://github.com/linode/manager/pull/11511))
- Add Quotas feature flag, queries, and MSW CRUD preset support ([#11493](https://github.com/linode/manager/pull/11493))


## [2025-01-14] - v1.134.0

### Added:

- New DatePicker Component ([#11151](https://github.com/linode/manager/pull/11151))
- Date Presets Functionality to Date Picker component ([#11395](https://github.com/linode/manager/pull/11395))
- Notice for OS Distro Nearing EOL/EOS ([#11253](https://github.com/linode/manager/pull/11253))
- aria-describedby to TextField with helper text ([#11351](https://github.com/linode/manager/pull/11351))
- Node Pool Tags to LKE Cluster details page ([#11368](https://github.com/linode/manager/pull/11368))
- MultipleIPInput Story in Storybook ([#11389](https://github.com/linode/manager/pull/11389))
- Manage Tags to Volumes table action menu and moved actions inside menu ([#11421](https://github.com/linode/manager/pull/11421))

### Changed:

- Database Resize: Updated tooltip text, plan selection descriptions, and summary text for new databases ([#11406](https://github.com/linode/manager/pull/11406))
- Database Resize: Disable plans when the usable storage equals the used storage of the database cluster ([#11481](https://github.com/linode/manager/pull/11481))
- DBaaS Settings Maintenance field Upgrade Version pending updates tooltip should display accurate text ([#11417](https://github.com/linode/manager/pull/11417))

### Fixed:

- Create support ticket for buckets created through legacy flow ([#11300](https://github.com/linode/manager/pull/11300))
- Incorrect Cloning Commands in Linode CLI Modal ([#11303](https://github.com/linode/manager/pull/11303))
- Events landing page lists events in wrong order ([#11339](https://github.com/linode/manager/pull/11339))
- Disallow word-break in billing contact info ([#11379](https://github.com/linode/manager/pull/11379))
- Object Storage object uploader spinner spinning backwards ([#11384](https://github.com/linode/manager/pull/11384))
- Document title from URL to appropriate keyword ([#11385](https://github.com/linode/manager/pull/11385))
- DBaaS settings maintenance does not display review state and allows version upgrade when updates are available ([#11387](https://github.com/linode/manager/pull/11387))
- Misplaced `errorGroup` prop causing console error in NodeBalancerConfigPanel ([#11398](https://github.com/linode/manager/pull/11398))
- Account Cancellation Survey Button Color Issues ([#11412](https://github.com/linode/manager/pull/11412))
- DBaaS Manage Access IP fields are displaying an IPv4 validation error message when both IPv6 and IPv4 are available. ([#11414](https://github.com/linode/manager/pull/11414))
- `RegionHelperText` causing console errors ([#11416](https://github.com/linode/manager/pull/11416))
- Linode Edit Config warning  message when initially selecting a VPC as the primary interface ([#11424](https://github.com/linode/manager/pull/11424))
- DBaaS Resize tab Used field is displaying just GB on provisioning database cluster ([#11426](https://github.com/linode/manager/pull/11426))
- Various bugs in Managed tables ([#11431](https://github.com/linode/manager/pull/11431))
- ARIA label of action menu in Domains Landing table row ([#11437](https://github.com/linode/manager/pull/11437))
- VPC interface not being set as the primary interface when creating a Linode ([#11450](https://github.com/linode/manager/pull/11450))
- `Create Token` button becomes disabled when all permissions are selected individually (without using 'select all') and child-account is hidden ([#11453](https://github.com/linode/manager/pull/11453))
- Discrepancy in Object Storage Bucket size in CM ([#11460](https://github.com/linode/manager/pull/11460))
- Object Storage `endpoint_type` sorting ([#11472](https://github.com/linode/manager/pull/11472))
- Visibility of sensitive data in Managed and Longview with Mask Sensitive Data setting enabled ([#11476](https://github.com/linode/manager/pull/11476))
- Display Kubernetes API endpoint for LKE-E cluster ([#11485](https://github.com/linode/manager/pull/11485))
- Accuracy of "Add Node Pools" section on LKE Create page ([#11516](https://github.com/linode/manager/pull/11516))

### Removed:

- `Images are not encrypted warning` warning ([#11443](https://github.com/linode/manager/pull/11443))
- Temporarily remove Properties tab from Gen2 buckets ([#11491](https://github.com/linode/manager/pull/11491))

### Tech Stories:

- Migrate `/volumes` to Tanstack router ([#11154](https://github.com/linode/manager/pull/11154))
- Clean up NodeBalancer related types ([#11321](https://github.com/linode/manager/pull/11321))
- Dev Tools fixes and improvements ([#11328](https://github.com/linode/manager/pull/11328))
- Replace one-off hardcoded color values with color tokens pt4 ([#11345](https://github.com/linode/manager/pull/11345))
- Refactor VPC Create to use `react-hook-form` instead of `formik` ([#11357](https://github.com/linode/manager/pull/11357))
- Refactor VPCEditDrawer and SubnetEditDrawer to use `react-hook-form` instead of `formik` ([#11393](https://github.com/linode/manager/pull/11393))
- Add `IMAGE_REGISTRY` Docker build argument ([#11360](https://github.com/linode/manager/pull/11360))
- Remove `reselect` dependency ([#11364](https://github.com/linode/manager/pull/11364))
- Update `useObjectAccess` to use a query key factory ([#11369](https://github.com/linode/manager/pull/11369))
- Replace instances of `react-select` in Managed ([#11391](https://github.com/linode/manager/pull/11391))
- Update our docs regarding useEffect best practices ([#11410](https://github.com/linode/manager/pull/11410))
- Refactor Domains Routing (Tanstack Router) ([#11418](https://github.com/linode/manager/pull/11418))
- Update Pendo URL with CNAME and update Analytics developer docs ([#11427](https://github.com/linode/manager/pull/11427))
- Add MSW crud domains ([#11428](https://github.com/linode/manager/pull/11428))
- Replace react-select instances in /Users with new Select ([#11430](https://github.com/linode/manager/pull/11430))
- Fixed CloudPulse metric definition types ([#11433](https://github.com/linode/manager/pull/11433))
- Patch `cookie` version as resolution for dependabot  ([#11434](https://github.com/linode/manager/pull/11434))
- Replace Select with Autocomplete component in Object Storage ([#11456](https://github.com/linode/manager/pull/11456))
- Update `react-vnc` to 2.0.2 ([#11467](https://github.com/linode/manager/pull/11467))

### Tests:

- Cypress component test for firewall inbound and outbound rules for mouse drag and drop ([#11344](https://github.com/linode/manager/pull/11344))
- Cypress component tests for firewall rules drag and drop keyboard interaction ([#11341](https://github.com/linode/manager/pull/11341))
- Mock LKE creation flow + APL coverage ([#11347](https://github.com/linode/manager/pull/11347))
- Improve Linode end-to-end test stability by increasing timeouts ([#11350](https://github.com/linode/manager/pull/11350))
- Fix `delete-volume.spec.ts` flaky test ([#11365](https://github.com/linode/manager/pull/11365))
- Add Cypress test for Credit Card Expired banner ([#11383](https://github.com/linode/manager/pull/11383))
- Cypress test flake: Rebuild Linode ([#11390](https://github.com/linode/manager/pull/11390))
- Improve assertions made in `smoke-billing-activity.spec.ts` ([#11394](https://github.com/linode/manager/pull/11394))
- Clean up `DatabaseBackups.test.tsx` ([#11394](https://github.com/linode/manager/pull/11394))
- Fix account login and logout tests when using non-Prod environment ([#11407](https://github.com/linode/manager/pull/11407))
- Add Cypress component tests for Autocomplete  ([#11408](https://github.com/linode/manager/pull/11408))
- Update mock region for LKE cluster creation test ([#11411](https://github.com/linode/manager/pull/11411))
- Cypress tests to validate errors in Linode Create Backups tab ([#11422](https://github.com/linode/manager/pull/11422))
- Cypress test to validate aria label of Linode IP Addresses action menu ([#11435](https://github.com/linode/manager/pull/11435))
- Cypress test to validate CAA records are editable ([#11440](https://github.com/linode/manager/pull/11440))
- Add test for LKE cluster rename flow ([#11444](https://github.com/linode/manager/pull/11444))
- Add unit tests to validate aria-labels of Action Menu for Linode IPs & ranges ([#11448](https://github.com/linode/manager/pull/11448))
- Add Cypress tests confirming Lionde Config Unrecommended status displays as expected in VPC Subnet table ([#11450](https://github.com/linode/manager/pull/11450))
- Add Cypress test for LKE node pool tagging ([#11368](https://github.com/linode/manager/pull/11368))
- Add coverage for Kube version upgrades in landing page ([#11478](https://github.com/linode/manager/pull/11478))
- Fix Cypress test failures stemming from Debian 10 Image deprecation ([#11486](https://github.com/linode/manager/pull/11486))
- Added Cypress test for restricted user Image non-Empty landing page ([#11335](https://github.com/linode/manager/pull/11335))

### Upcoming Features:

- Update Kubernetes Versions in Create Cluster flow to support tiers for LKE-E ([#11359](https://github.com/linode/manager/pull/11359))
- Switch from v4beta to v4 account endpoint for LKE-E ([#11413](https://github.com/linode/manager/pull/11413))
- Update Kubernetes version upgrade components for LKE-E ([#11415](https://github.com/linode/manager/pull/11415))
- Display LKE-E pricing in checkout bar ([#11419](https://github.com/linode/manager/pull/11419))
- Designate LKE-E clusters with 'Enterprise' chip ([#11442](https://github.com/linode/manager/pull/11442))
- Update LKE cluster details kube specs for LKE-E monthly pricing ([#11475](https://github.com/linode/manager/pull/11475))
- Add new users table component for IAM ([#11367](https://github.com/linode/manager/pull/11367))
- Add new user details components for IAM ([#11397](https://github.com/linode/manager/pull/11397))
- High performance volume indicator ([#11400](https://github.com/linode/manager/pull/11400))
- Add new no assigned roles component for IAM ([#11401](https://github.com/linode/manager/pull/11401))
- Fix invalid routes in the IAM ([#11436](https://github.com/linode/manager/pull/11436))
- Initial support for NodeBalancer UDP protocol  ([#11405](https://github.com/linode/manager/pull/11405))
- Add support for new optional filter - 'Tags' in monitor ([#11457](https://github.com/linode/manager/pull/11457))
- Show ACLP supported regions per service type in region select ([#11382](https://github.com/linode/manager/pull/11382))
- Add `CloudPulseAppliedFilter` and `CloudPulseAppliedFilterRenderer` components, update filter change handler function to add another parameter `label` ([#11354](https://github.com/linode/manager/pull/11354))
- Add column for actions to Cloud Pulse alert definitions listing view and scaffolding for Definition Details page ([#11399](https://github.com/linode/manager/pull/11399))
- Exhaustive unit tests for CloudPulse widgets ([#11464](https://github.com/linode/manager/pull/11464))
- Add Alert Details Overview section in Cloud Pulse Alert Details page ([#11466](https://github.com/linode/manager/pull/11466))
- AlertListing component and AlertTableRow component with Unit Tests ([#11346](https://github.com/linode/manager/pull/11346))
- Update layout in CloudPulseDashboardWithFilters component, add a `getFilters` util method in `FilterBuilder.ts` ([#11388](https://github.com/linode/manager/pull/11388))
- Metric, MetricCriteria, ClearIconButton components with Unit Tests ([#11392](https://github.com/linode/manager/pull/11392))
- DimensionFilter, DimensionFilterField, TriggerCondition component along with Unit Tests ([#11445](https://github.com/linode/manager/pull/11445))
- Improve Close Account Dialog UI ([#11469](https://github.com/linode/manager/pull/11469))

## [2024-12-20] - v1.133.2

### Fixed:

- Incorrectly displayed region options ([#11449](https://github.com/linode/manager/pull/11449))


## [2024-12-19] - v1.133.1

### Fixed:

- Filter available regions in Object Gen2 Create Drawer and Access Keys List based on endpoint capabilities ([#11432](https://github.com/linode/manager/pull/11432))
- Region name display in Gen2 warning notices when regions are unavailable due to format mismatch ([#11432](https://github.com/linode/manager/pull/11432))


## [2024-12-10] - v1.133.0

### Added:

- Object Storage buckets to Support tickets dropdown ([#11178](https://github.com/linode/manager/pull/11178))
- Option to copy token on LKE details page ([#11179](https://github.com/linode/manager/pull/11179))
- Tooltip for 'Usable Storage' in Create/Resize Database table ([#11223](https://github.com/linode/manager/pull/11223))
- Ability to perform complex search queries on the Images landing page ([#11233](https://github.com/linode/manager/pull/11233))
- Credit Card Expired banner ([#11240](https://github.com/linode/manager/pull/11240))
- Product Families to Create Menu dropdown ([#11260](https://github.com/linode/manager/pull/11260))
- Accelerated compute plans in Linode/LKE create flows ([#11287](https://github.com/linode/manager/pull/11287))
- Docs link and region availability notice for Accelerated compute plans ([#11363](https://github.com/linode/manager/pull/11363))

### Changed:

- Replace `react-beautiful-dnd` with `dnd-kit` library ([#11127](https://github.com/linode/manager/pull/11127))
- Linode details summary VPC IPv4 text to be copyable ([#11172](https://github.com/linode/manager/pull/11172))
- Replace Pagination page size autocomplete with simple select ([#11203](https://github.com/linode/manager/pull/11203))
- Replace Select component with Autocomplete in DBaaS ([#11245](https://github.com/linode/manager/pull/11245))
- Update types based on new Accelerated fields and added mock data ([#11256](https://github.com/linode/manager/pull/11256))
- Improve the status column on the Images landing page ([#11257](https://github.com/linode/manager/pull/11257))
- Improve Placement Groups UI during Linode migrations ([#11261](https://github.com/linode/manager/pull/11261))
- Update docs links on empty Database landing page ([#11262](https://github.com/linode/manager/pull/11262))
- Implement Dialogs/Drawers loading patterns ([#11273](https://github.com/linode/manager/pull/11273))
- Improve billing contact info display when Mask Sensitive Data setting is enabled ([#11276](https://github.com/linode/manager/pull/11276))
- Update and improve DBaaS Detail page styling and UI ([#11282](https://github.com/linode/manager/pull/11282))
- Add IPV6 tooltip to read-only host in DBaaS summary ([#11291](https://github.com/linode/manager/pull/11291))
- DBaaS Resize GA: Enable Downsizing (horizontal and vertical), enable 'Shared' tab, update node presentation ([#11311](https://github.com/linode/manager/pull/11311))
- Update DBaaS Access Controls copy, placeholders, and button text ([#11371](https://github.com/linode/manager/pull/11371))
- Adjust network_in values for distributed plans ([#11313](https://github.com/linode/manager/pull/11313))

### Fixed:

- Broken firewall rules table ([#11127](https://github.com/linode/manager/pull/11127))
- Table component styling issue for `noOverflow` property ([#11127](https://github.com/linode/manager/pull/11127))
- Alignment for Backup Label in Add-ons Panel ([#11160](https://github.com/linode/manager/pull/11160))
- Kubernetes details page UI issues ([#11217](https://github.com/linode/manager/pull/11217))
- Radio size prop not affecting the radio button's dimensions ([#11242](https://github.com/linode/manager/pull/11242))
- Storybook docgen ([#11264](https://github.com/linode/manager/pull/11264))
- DBaaS: summary read-only host field is blank ([#11265](https://github.com/linode/manager/pull/11265))
- DBaaS: landing paginator disappears when pageSize is less than the number of instances ([#11275](https://github.com/linode/manager/pull/11275))
- Incorrect Account Maintenance X-Filter ([#11277](https://github.com/linode/manager/pull/11277))
- Storybook optimizeDeps config to improve cold start ([#11278](https://github.com/linode/manager/pull/11278))
- Table and Chart Legend Spacing ([#11294](https://github.com/linode/manager/pull/11294))
- Content shifting on Linode Details summary graphs ([#11301](https://github.com/linode/manager/pull/11301))
- CORS toggle incorrectly appearing for Object Storage bucket objects ([#11355](https://github.com/linode/manager/pull/11355))
- LinodeCreate OS Panel fetching region with -1 on page load ([#11356](https://github.com/linode/manager/pull/11356))
- Lack of uniform spacing between resource link columns in empty state landing pages ([#11213](https://github.com/linode/manager/pull/11213))
- Convert Object Storage bucket sizes from `GiB` to `GB` in the frontend ([#11293](https://github.com/linode/manager/pull/11293))

### Removed:

- Migrate CircleProgress from `manager` to `ui` package ([#11214](https://github.com/linode/manager/pull/11214))
- Move `ClickAwayListener` from `manager` to `ui` package ([#11267](https://github.com/linode/manager/pull/11267))
- TooltipIcon component (migrated to `ui` package) ([#11269](https://github.com/linode/manager/pull/11269))
- Move `Checkbox` from `manager` to `ui` package ([#11279](https://github.com/linode/manager/pull/11279))
- Move `H1Header` from `manager` to `ui` package ([#11283](https://github.com/linode/manager/pull/11283))
- `TextField` component and `convertToKebabCase` utility function (migrated to `ui` package) ([#11290](https://github.com/linode/manager/pull/11290))
- `Toggle` component and `ToggleOn` and `ToggleOff` icons (migrated to `ui` package) ([#11296](https://github.com/linode/manager/pull/11296))
- Migrate `EditableText` from `manager` to `ui` package ([#11308](https://github.com/linode/manager/pull/11308))
- `Autocomplete`, `List`, and `ListItem` components (migrated to `ui` package) ([#11314](https://github.com/linode/manager/pull/11314))
- Move `Accordion` from `manager` to `ui` package ([#11316](https://github.com/linode/manager/pull/11316))
- Recently added camelCase rule ([#11330](https://github.com/linode/manager/pull/11330))
- Migrate `FormControlLabel` from `manager` to `ui` package ([#11353](https://github.com/linode/manager/pull/11353))
- Move `Chip` from `manager` to `ui` package ([#11266](https://github.com/linode/manager/pull/11266))

### Tech Stories:

- Update PULL_REQUEST_TEMPLATE ([#11219](https://github.com/linode/manager/pull/11219), [#11236](https://github.com/linode/manager/pull/11236))
- Optimize Events Polling following changes from incident ([#11263](https://github.com/linode/manager/pull/11263))
- Add documentation for form validation best practices ([#11298](https://github.com/linode/manager/pull/11298))
- Update developer docs on unit testing user events ([#11221](https://github.com/linode/manager/pull/11221))
- Refactor components to use `clamp` from `@linode/ui` rather than `ramda` ([#11306](https://github.com/linode/manager/pull/11306))
- Update yup from `0.32.9` to `1.4.0` ([#11324](https://github.com/linode/manager/pull/11324))
- Further improvements to PR template author checklist sections ([#11325](https://github.com/linode/manager/pull/11325))
- Bump recharts to ^2.14.1 ([#11358](https://github.com/linode/manager/pull/11358))
- Change Pendo sanitized URL path string ([#11361](https://github.com/linode/manager/pull/11361))
- Replace one-off hardcoded color values with color tokens pt3 ([#11241](https://github.com/linode/manager/pull/11241))
- Adjust linter rules for common PR feedback points ([#11258](https://github.com/linode/manager/pull/11258))
- Adjust linter rules for naming convention ([#11337](https://github.com/linode/manager/pull/11337))

### Tests:

- Add Cypress test for Account Maintenance CSV downloads ([#11168](https://github.com/linode/manager/pull/11168))
- Mock disable OBJ Gen 2 flags for existing OBJ Cypress tests ([#11191](https://github.com/linode/manager/pull/11191))
- Fix DBaaS resize tests that fail on first attempt and succeed on second ([#11238](https://github.com/linode/manager/pull/11238))
- Add Cypress tests to verify ACLP UI's handling of API errors ([#11239](https://github.com/linode/manager/pull/11239))
- Unskip Placement Group landing page navigation test ([#11272](https://github.com/linode/manager/pull/11272))
- Fix Linode migration test failure caused by region label conflicts ([#11274](https://github.com/linode/manager/pull/11274))
- Add Cypress test for restricted user Image Empty landing page ([#11281](https://github.com/linode/manager/pull/11281))
- Fix StackScript update test failure triggered by recent deprecation ([#11292](https://github.com/linode/manager/pull/11292))
- Fix test failure in `linode-storage.spec.ts` ([#11304](https://github.com/linode/manager/pull/11304))
- Fix `machine-image-upload.spec.ts` test failures ([#11319](https://github.com/linode/manager/pull/11319))
- Add tests for accelerated plans in `plan-selection.spec.ts` ([#11323](https://github.com/linode/manager/pull/11323))
- Add new assertions for linode backup Cypress tests ([#11326](https://github.com/linode/manager/pull/11326))
- Add test to create a mock accelerated Linode ([#11327](https://github.com/linode/manager/pull/11327))
- Fix DBaaS unit test flake ([#11332](https://github.com/linode/manager/pull/11332))
- Add unit test cases for `DialogTitle` component ([#11340](https://github.com/linode/manager/pull/11340))
- Add unit test cases for EntityHeader component ([#11222](https://github.com/linode/manager/pull/11222))
- Add unit test cases for `CopyableTextField` component ([#11268](https://github.com/linode/manager/pull/11268))
- Add unit test cases for `DocsLink` component ([#11336](https://github.com/linode/manager/pull/11336))

### Upcoming Features:

- Replace `LineGraph` with `AreaChart` and add `DataSet` type in `CloudPulseLineGraph` component, add `connectNulls`, `dotRadius`, `showDot`, `xAxisTickCount` property and `ChartVariant` interface in `AreaChart.ts` ([#11204](https://github.com/linode/manager/pull/11204))
- Configure max limit on CloudPulse resource selection component ([#11252](https://github.com/linode/manager/pull/11252))
- Add Create Alert Button, Add Name, Description, Severity components to the Create Alert Form ([#11255](https://github.com/linode/manager/pull/11255))
- Add feature flag and hook for LKE-E enablement ([#11259](https://github.com/linode/manager/pull/11259))
- Add and update kubernetes queries for LKE-E beta endpoints ([#11302](https://github.com/linode/manager/pull/11302))
- Handle JWE token limit of 250 in ACLP UI ([#11309](https://github.com/linode/manager/pull/11309))
- Modify `generate12HoursTicks` method in AreaChart `utils.ts`, remove breakpoint condition in `MetricsDisplay.tsx`, modify `legendHeight` and `xAxisTickCount` in `CloudPulseLineGraph.tsx` ([#11317](https://github.com/linode/manager/pull/11317))
- Add new PAT ‘Monitor’ scope for CloudPulse ([#11318](https://github.com/linode/manager/pull/11318))
- Add Cluster Type section to Create Cluster flow for LKE-E ([#11322](https://github.com/linode/manager/pull/11322))
- Update Region Select for LKE-Enterprise ([#11348](https://github.com/linode/manager/pull/11348))
- Update Regions/S3 Hostnames interface to match new design guidelines with
  improved visualization of multiple storage regions ([#11355](https://github.com/linode/manager/pull/11355))
- Remove Properties tab visibility for users without Gen2 capabilities and fix duplicate bucket display issue ([#11355](https://github.com/linode/manager/pull/11355))
- Add new routes for IAM, feature flag and menu item ([#11310](https://github.com/linode/manager/pull/11310))
- Mock data and query for new IAM permission API ([#11146](https://github.com/linode/manager/pull/11146))
- Mock data and query for new IAM account API ([#11181](https://github.com/linode/manager/pull/11181))
- Add ResourceMultiSelect component for CloudPulse alerting ([#11331](https://github.com/linode/manager/pull/11331))
- Service, Engine Option, Region components to CloudPulse Create Alert form ([#11286](https://github.com/linode/manager/pull/11286))

## [2024-11-22] - v1.132.2

### Changed:

- Change "Application Platform for LKE" to "Akamai App Platform"([#11312](https://github.com/linode/manager/pull/11312))

## [2024-11-19] - v1.132.1

### Fixed:

- Disable shared CPU whenever APL is enabled ([#11284](https://github.com/linode/manager/pull/11284))

## [2024-11-12] - v1.132.0

### Added:

- Tooltip for 'Usable Storage' in Create/Resize Database Table ([#11223](https://github.com/linode/manager/pull/11223))
- Success toasts to profile display settings page (with other minor improvements) ([#11141](https://github.com/linode/manager/pull/11141))
- Mask Sensitive Data preference to Profile Settings ([#11143](https://github.com/linode/manager/pull/11143))
- DBaaS Suspend and Resume for Database Landing and Details ([#11152](https://github.com/linode/manager/pull/11152))
- Pre-selection of a VPC’s subnet on the Linode Create page when the VPC only has one subnet ([#11188](https://github.com/linode/manager/pull/11188))
- Summary Section for Database Create GA ([#11193](https://github.com/linode/manager/pull/11193))
- New GPUv2 egress transfer helpers ([#11209](https://github.com/linode/manager/pull/11209))

### Changed:

- Optimize GPU egress data transfer copy ([#11235](https://github.com/linode/manager/pull/11235))
- Incorporate Product Family Groups in Side Nav ([#11080](https://github.com/linode/manager/pull/11080))
- Remove Double border on "Billing & Payment History" table with dark theme. ([#11111](https://github.com/linode/manager/pull/11111))
- Slightly improve styles on support ticket flows ([#11144](https://github.com/linode/manager/pull/11144))
- Improve validation error when a backup is not selected ([#11147](https://github.com/linode/manager/pull/11147))
- Database settings text and labels ([#11166](https://github.com/linode/manager/pull/11166))
- Refactor DatabaseResize to use shared components for node selection and summary section ([#11180](https://github.com/linode/manager/pull/11180))
- `.env.example` cypress warning ([#11202](https://github.com/linode/manager/pull/11202))
- Disable unsupported images for distributed regions ([#11206](https://github.com/linode/manager/pull/11206))

### Fixed:

- Preserve default child cluster creation behavior ([#11234](https://github.com/linode/manager/pull/11234))
- Misaligned table headers in Account Maintenance page ([#11099](https://github.com/linode/manager/pull/11099))
- Database create page form being enabled for restricted users ([#11137](https://github.com/linode/manager/pull/11137))
- Faux bold in Safari with `<strong />` & `<b />` tags ([#11149](https://github.com/linode/manager/pull/11149))
- `Coverage Comment` GHA running on drafts ([#11161](https://github.com/linode/manager/pull/11161))
- Aria label of action menu button in IP address table row ([#11167](https://github.com/linode/manager/pull/11167))
- UI bugs on the Object Storage bucket and access key landing pages ([#11187](https://github.com/linode/manager/pull/11187))
- Animation for VPC subnet drawers ([#11195](https://github.com/linode/manager/pull/11195))
- DBaaS enable creation of two node clusters ([#11218](https://github.com/linode/manager/pull/11218))
- Crash on the Linode Create flow when a Linode with a `type` of `null` is selected ([#11247](https://github.com/linode/manager/pull/11247))

### Tech Stories:

- Consolidate ImageSelect components ([#11058](https://github.com/linode/manager/pull/11058))
- Refactor TextField component ([#11134](https://github.com/linode/manager/pull/11134))
- Clean up Profile Display Settings page ([#11141](https://github.com/linode/manager/pull/11141))
- `only-export-components` for Tanstack routes ([#11142](https://github.com/linode/manager/pull/11142))
- Add more customization to legends and charts ([#11145](https://github.com/linode/manager/pull/11145))
- Update `@types/node` to `20.17.0` ([#11157](https://github.com/linode/manager/pull/11157))
- Add `cypress_containerized` Docker Compose service ([#11177](https://github.com/linode/manager/pull/11177))
- Add `nodejs-cloud-manager` Dockerfile target ([#11177](https://github.com/linode/manager/pull/11177))
- Remove use of Redux for viewing StackScript details ([#11192](https://github.com/linode/manager/pull/11192))
- Convert from `formik` to `react-hook-form` for `SubnetCreateDrawer` ([#11195](https://github.com/linode/manager/pull/11195))
- Use unit tested function for Pendo url transformation ([#11211](https://github.com/linode/manager/pull/11211))
- Remove the feature flag and tracking events used for A/B testing in the API CLI Tools modal, and update the DX Tools modal button copy to 'View Code Snippets ([#11156](https://github.com/linode/manager/pull/11156))

### Tests:

- Add cypress tests for creating LKE clusters with ACL ([#11132](https://github.com/linode/manager/pull/11132))
- Add unit tests to declutter LKE ACL cypress tests and fix `lke-create.spec.ts` failures ([#11176](https://github.com/linode/manager/pull/11176))
- Add vitest workspace configuration ([#11184](https://github.com/linode/manager/pull/11184))
- Delete test Linodes, LKE clusters, and Firewalls after Cypress runs ([#11189](https://github.com/linode/manager/pull/11189))
- Allow DBaaS resize test to pass when DBaaS v2 is enabled ([#11190](https://github.com/linode/manager/pull/11190))
- Slight improvements to GitHub test result comment formatting ([#11200](https://github.com/linode/manager/pull/11200))

### Upcoming Features:

- ACLP UI - DBaaS instances order by label ([#11226](https://github.com/linode/manager/pull/11226))
- Add post processing for missing timestamp data across dimensions in ACLP charts ([#11225](https://github.com/linode/manager/pull/11225))
- Add default x-filter for DBasS Aiven clusters fetch in resource selection component ([#11150](https://github.com/linode/manager/pull/11150))
- Replace one-off hardcoded black and white color values with colorTokens ([#11165](https://github.com/linode/manager/pull/11165))
- Add global border radius token to theme and replace hard coded values where `borderRadius = 0` ([#11169](https://github.com/linode/manager/pull/11169))
- Handle API errors for global filters and dashboard components ([#11170](https://github.com/linode/manager/pull/11170))
- Add global `font` and `spacing` tokens to theme and refactor design tokens ([#11171](https://github.com/linode/manager/pull/11171))
- DBaaS: Add query to patch API, modify factory to include pendingUpdates ([#11196](https://github.com/linode/manager/pull/11196))
- DBaaS: Add new Maintenance, Upgrade Version dialog, and Review Updates dialog components ([#11198](https://github.com/linode/manager/pull/11198))
- DBaaS: major minor updates integration ([#11199](https://github.com/linode/manager/pull/11199))

## [2024-11-05] - v1.131.2

### Fixed:

- APL summary panel not being loaded consistently ([#11207](https://github.com/linode/manager/pull/11207))

## [2024-10-29] - v1.131.1

### Fixed:

- Hostnames not showing on the Database details page ([#11182](https://github.com/linode/manager/pull/11182))

## [2024-10-28] - v1.131.0

### Added:

- Access Control List (ACL) integration to LKE clusters ([#10968](https://github.com/linode/manager/pull/10968))
- Monitor tab to DBaaS details page for GA ([#11105](https://github.com/linode/manager/pull/11105))
- Support for Application platform for Linode Kubernetes (APL)([#11110](https://github.com/linode/manager/pull/11110))
- Capability to search for a Linode by ID using the main search tool ([#11112](https://github.com/linode/manager/pull/11112))
- Pendo documentation to our development guide ([#11122](https://github.com/linode/manager/pull/11122))
- `hideFill` & `fillOpacity` properties to `AreaChart` component ([#11136](https://github.com/linode/manager/pull/11136))

### Changed:

- Improve weblish retry behavior ([#11067](https://github.com/linode/manager/pull/11067))
- Disable Create VPC button with tooltip text on Landing Page for restricted users ([#11063](https://github.com/linode/manager/pull/11063))
- Disable Create VPC button with tooltip text on empty state Landing Page for restricted users ([#11052](https://github.com/linode/manager/pull/11052))
- Disable VPC Action buttons when no access or read-only access. ([#11083](https://github.com/linode/manager/pull/11083))
- Disable Create Firewall button with tooltip text on empty state Landing Page for restricted users ([#11093](https://github.com/linode/manager/pull/11093))
- Disable Create Firewall button with tooltip text on Landing Page for restricted users ([#11094](https://github.com/linode/manager/pull/11094))
- Disable Longview 'Add Client' button with tooltip text on landing page for restricted users. ([#11108](https://github.com/linode/manager/pull/11108))
- Update Public IP Addresses tooltip and enable LISH console text ([#11070](https://github.com/linode/manager/pull/11070))
- Increase Cloud Manager node.js memory allocation (development jobs) ([#11084](https://github.com/linode/manager/pull/11084))
- Invoice heading from 'Invoice' to 'Tax Invoice' for UAE Customers ([#11097](https://github.com/linode/manager/pull/11097))
- Revise VPC Not Recommended Configuration Tooltip Text
  ([#11098](https://github.com/linode/manager/pull/11098))
- cloud-init icon ([#11100](https://github.com/linode/manager/pull/11100))
- Hide distributed regions in Linode Create StackScripts ([#11139](https://github.com/linode/manager/pull/11139))

### Fixed:

- Support Linodes with multiple private IPs in NodeBalancer configurations ([#11069](https://github.com/linode/manager/pull/11069))
- "Support Ticket" button in Add IP Address drawer not working properly ([#11074](https://github.com/linode/manager/pull/11074))
- Link to expired Markdown cheatsheet domain ([#11101](https://github.com/linode/manager/pull/11101))
- Region MultiSelect spacing issues ([#11103](https://github.com/linode/manager/pull/11103))
- Autocomplete renderOption prop console warning ([#11140](https://github.com/linode/manager/pull/11140))
- Duplicate punctuation on `image_upload` event message ([#11148](https://github.com/linode/manager/pull/11148))

### Tech Stories:

- Optimize AccessSelect component: Use React Hook Form & React Query ([#10952](https://github.com/linode/manager/pull/10952))
- Migrate /betas routes to Tanstack Router ([#11049](https://github.com/linode/manager/pull/11049))
- Update NodeJS naming to Node.js for Marketplace ([#11086](https://github.com/linode/manager/pull/11086))
- Replace 'e2e', 'e2e_heimdall', and 'component' Docker Compose services with 'cypress_local', 'cypress_remote', and 'cypress_component' ([#11088](https://github.com/linode/manager/pull/11088))
- Fix MSW 2.0 initial mock store and support ticket seeder bugs ([#11090](https://github.com/linode/manager/pull/11090))
- Move `src/foundations` directory from `manager` package to new `ui` package ([#11092](https://github.com/linode/manager/pull/11092))
- Clean up `REACT_APP_LKE_HIGH_AVAILABILITY_PRICE` from `.env.example` ([#11117](https://github.com/linode/manager/pull/11117))
- Remove unused Marketplace feature flags ([#11133](https://github.com/linode/manager/pull/11133))
- Clean up Create Using Command Line (DX Tools Additions) feature flag ([#11135](https://github.com/linode/manager/pull/11135))

### Tests:

- Add assertions for bucket details drawer tests ([#10971](https://github.com/linode/manager/pull/10971))
- Add new test to confirm changes to the Object details drawer for OBJ Gen 2 ([#11045](https://github.com/linode/manager/pull/11045))
- Add Cypress test for non-empty Linode landing page with restricted user ([#11060](https://github.com/linode/manager/pull/11060))
- Allow overriding feature flags via `CY_TEST_FEATURE_FLAGS` environment variable ([#11088](https://github.com/linode/manager/pull/11088))
- Fix flaky `DatabaseBackups.test.tsx` in coverage job ([#11130](https://github.com/linode/manager/pull/11130))
- Allow pipeline Slack notifications to be customized ([#11088](https://github.com/linode/manager/pull/11088))
- Show PR title in Slack CI notifications ([#11088](https://github.com/linode/manager/pull/11088))
- Fix `AppSelect.test.tsx` test flake ([#11104](https://github.com/linode/manager/pull/11104))
- Fix failing SMTP support ticket test by using mock Linode data ([#11106](https://github.com/linode/manager/pull/11106))
- Reduce flakiness of Placement Group deletion Cypress tests ([#11107](https://github.com/linode/manager/pull/11107))
- Mock APL feature flag to be disabled in LKE update tests ([#11113](https://github.com/linode/manager/pull/11113))
- Reduce flakiness of Linode rebuild test ([#11119](https://github.com/linode/manager/pull/11119))
- Add cypress tests for updating ACL in LKE clusters ([#11131](https://github.com/linode/manager/pull/11131))

### Upcoming Features:

- Improve CloudPulse Dashboard ([#11062](https://github.com/linode/manager/pull/11062))
- Retain CloudPulse resource selection while expand or collapse the filter button ([#11068](https://github.com/linode/manager/pull/11068))
- Add Interaction tokens, minimally clean up theme files ([#11078](https://github.com/linode/manager/pull/11078))
- Enhance DBaaS GA Summary tab ([#11091](https://github.com/linode/manager/pull/11091))
- Add Image Service Gen 2 final GA tweaks ([#11115](https://github.com/linode/manager/pull/11115))
- Add title / label for all global filters in ACLP ([#11118](https://github.com/linode/manager/pull/11118))
- Add global colorTokens to theme and replace one-off hardcoded white colors ([#11120](https://github.com/linode/manager/pull/11120))
- Encourage setting access controls during DBaaS creation ([#11124](https://github.com/linode/manager/pull/11124))

## [2024-10-14] - v1.130.0

### Added:

- Default root hostname for TXT records ([#11022](https://github.com/linode/manager/pull/11022))
- Firewalls to search result queries ([#11023](https://github.com/linode/manager/pull/11023))
- Number of Nodes selector for DBaaS GA Resize ([#11040](https://github.com/linode/manager/pull/11040))
- Databases to search result queries ([#11059](https://github.com/linode/manager/pull/11059))
- Notification Menu story in Storybook ([#10950](https://github.com/linode/manager/pull/10950))
- Linode Empty Landing story in Storybook ([#11012](https://github.com/linode/manager/pull/11012))

### Changed:

- Allow sorting by amount on billing activity table ([#10941](https://github.com/linode/manager/pull/10941))
- Rename `notification tax_id_invalid` to `tax_id_verifying` ([#10967](https://github.com/linode/manager/pull/10967))
- Hide SMTP warning for Linodes and accounts that have SMTP enabled ([#10991](https://github.com/linode/manager/pull/10991))
- Update docs links to use latest techdocs.akamai.com URLs ([#11003](https://github.com/linode/manager/pull/11003))
- Use CodeBlock component in KubeConfigDrawer ([#11019](https://github.com/linode/manager/pull/11019))
- Spell out "Configuration" in the Linodes Configurations table ([#11046](https://github.com/linode/manager/pull/11046))
- Improve ActionMenu styling and accessibility ([#10964](https://github.com/linode/manager/pull/10964))

### Fixed:

- Styling for the support ticket details page ([#10979](https://github.com/linode/manager/pull/10979))
- Value selection issue in ImageSelect ([#11007](https://github.com/linode/manager/pull/11007))
- Empty data for Account Maintenance CSVs on the first download attempt ([#11025](https://github.com/linode/manager/pull/11025))
- ActionPanel PrimaryButton `data-qa` attribute ([#11035](https://github.com/linode/manager/pull/11035))
- Users unable to upgrade Kubernetes version from landing page ([#11056](https://github.com/linode/manager/pull/11056))
- Toasts not consistently dismissible with the 'X' button ([#11073](https://github.com/linode/manager/pull/11073))
- TypeScript performance of `DismissibleBanner.tsx` ([#11075](https://github.com/linode/manager/pull/11075))
- Spelling and grammar mistakes on image create pages ([#11096](https://github.com/linode/manager/pull/11096))

### Removed:

- MacOS/Linux-specific `getting_started.sh` script ([#11021](https://github.com/linode/manager/pull/11021))
- VPC Details dismissible warning banner (#11050)
- 512GB plan selection from DBaaS ([#11036](https://github.com/linode/manager/pull/11036))

### Tech Stories:

- Introduce TanStack Router ([#10997](https://github.com/linode/manager/pull/10997))
- Add support ticket mocks to MSW 2.0 ([#10937](https://github.com/linode/manager/pull/10937))
- Add Pendo to Cloud Manager ([#10982](https://github.com/linode/manager/pull/10982))
- Get dependencies in a more healthy state ([#11005](https://github.com/linode/manager/pull/11005))
- Update Github Actions actions ([#11009](https://github.com/linode/manager/pull/11009))
- Clean up unused assets & icons ([#11011](https://github.com/linode/manager/pull/11011))
- Fix last `path-to-regexp` dependabot alert ([#11015](https://github.com/linode/manager/pull/11015))
- Add CodeBlock story ([#11019](https://github.com/linode/manager/pull/11019))
- Complete Linode Create refactor:
  - Remove Linode Create v1 - Part 2 ([#11020](https://github.com/linode/manager/pull/11020))
  - Rename `Linode Create v2` to `Linode Create` ([#11043](https://github.com/linode/manager/pull/11043))
- Validate redirect and login URLs via URL constructor ([#11031](https://github.com/linode/manager/pull/11031))
- Upgrade `upload-artifact` and `download-artifact` actions from v3 to v4 ([#11033](https://github.com/linode/manager/pull/11033))
- Update Sentry to the latest v7 version ([#11054](https://github.com/linode/manager/pull/11054))
- Remove unnecessary `isVLAN` code from codebase ([#11065](https://github.com/linode/manager/pull/11065))
- Fix TypeScript Performance of `BarPercent.tsx` ([#11076](https://github.com/linode/manager/pull/11076))
- Improve Pendo URL sanitization ([#11079](https://github.com/linode/manager/pull/11079))

### Tests:

- Add integration tests for CloudPulse dashboard ([#10891](https://github.com/linode/manager/pull/10891))
- Add integration test for Object Storage Gen 2 Access Keys page ([#10984](https://github.com/linode/manager/pull/10984))
- Add Cypress integration test for OBJ Gen 2 bucket details tab changes ([#10994](https://github.com/linode/manager/pull/10994))
- Add integration test for Object Storage Gen 2 Properties tab ([#11002](https://github.com/linode/manager/pull/11002))
- Add unit tests for CollapsibleTable and CollapsibleRow components ([#11016](https://github.com/linode/manager/pull/11016))
- Add unit tests for CheckoutSummary component ([#11061](https://github.com/linode/manager/pull/11061))
- Add Cypress test for OBJ Gen 2 create validation & API errors ([#11066](https://github.com/linode/manager/pull/11066))

### Upcoming Features:

- Add Region filtering to Linodes landing table ([#10639](https://github.com/linode/manager/pull/10639))
- Add `useAclpPreference` hook to improve flickering in widget component ([#10853](https://github.com/linode/manager/pull/10853))
- Restrict Image Upload to regions with Object Storage ([#11038](https://github.com/linode/manager/pull/11038))
- Add OBJ Gen2 resource links and fix test flake for bucket creation ([#11047](https://github.com/linode/manager/pull/11047))
- Add DBaaS GA enhancements to backups tab and make Beta fixes ([#11048](https://github.com/linode/manager/pull/11048))
- Add `additionalFilters` key in CloudPulseWidgetRenderer (#11053)
- Add Action Menu column to the Databases Table and update Database Logo ([#11039](https://github.com/linode/manager/pull/11039))

## [2024-10-02] - v1.129.1

### Fixed:

- DBaaS Landing Page V2 platform error for New Beta Users ([#11030](https://github.com/linode/manager/pull/11030))
- Add Volume button on Linodes Storage tab causing page crash ([#11032](https://github.com/linode/manager/pull/11032))
- Users unable to update to update profile timezone ([#11034](https://github.com/linode/manager/pull/11034))

## [2024-09-30] - v1.129.0

### Added:

- GPUv2 Plan Selection Egress Banner ([#10956](https://github.com/linode/manager/pull/10956))

### Changed:

- Move Region section above Images in Linode Create and update default OS to Ubuntu 24.04 LTS ([#10858](https://github.com/linode/manager/pull/10858))
- VPC Assign Linodes table header ([#10940](https://github.com/linode/manager/pull/10940))
- Copy updates in Create with CLI modal ([#10954](https://github.com/linode/manager/pull/10954))
- Better 'Backups Enabled' default when cloning Linode ([#10959](https://github.com/linode/manager/pull/10959))
- Disable 'Save' button in Change Avatar Color dialog until color is changed ([#10963](https://github.com/linode/manager/pull/10963))
- Limits: surface new API errors in Linode and LKE flows ([#10969](https://github.com/linode/manager/pull/10969))
- Update Images empty state as part of Image Service Gen2 ([#10985](https://github.com/linode/manager/pull/10985))
- Update Image Upload dropzone copy as part of Image Service Gen2 ([#10986](https://github.com/linode/manager/pull/10986))

### Fixed:

- Missing radio button labels for User Permissions ([#10908](https://github.com/linode/manager/pull/10908))
- Scrollbar showing briefly on Splash Screen ([#10922](https://github.com/linode/manager/pull/10922))
- Misaligned DNS banner text ([#10924](https://github.com/linode/manager/pull/10924))
- Objects Table Refreshing Logic Fixed ([#10927](https://github.com/linode/manager/pull/10927))
- Missing label for Full Account Toggle ([#10931](https://github.com/linode/manager/pull/10931))
- Textarea tooltip icon focus area ([#10938](https://github.com/linode/manager/pull/10938))
- Flickering on the user profile page when updating the currently signed in user's username ([#10947](https://github.com/linode/manager/pull/10947))
- Linode IPv6 Range rDNS typo ([#10948](https://github.com/linode/manager/pull/10948))
- Cancel Button Not Functioning in Delete Node Balancer Configuration Dialog ([#10962](https://github.com/linode/manager/pull/10962))
- Incorrect URL slug for Apache Spark Cluster Marketplace documentation ([#10965](https://github.com/linode/manager/pull/10965))
- Incorrect timezone in Database Maintenance Window tooltip, inaccurate Resize status of Database, and unneeded `replication_type` in v2 `createPayload` ([#10980](https://github.com/linode/manager/pull/10980))
- DBaaS backups disable invalid dates ([#10988](https://github.com/linode/manager/pull/10988))
- DBaaS V2 logo on empty landing ([#10993](https://github.com/linode/manager/pull/10993))
- Enabled Shared CPU tab for 2-nodes Database Cluster Resize ([#10995](https://github.com/linode/manager/pull/10995))
- Set full height to DX Tools Modal and add Linode API link ([#10998](https://github.com/linode/manager/pull/10998))
- Database Detail page Summary tab display of username and read-only host ([#10989](https://github.com/linode/manager/pull/10989))
- Missing platform header in DBaaS types call ([#11010](https://github.com/linode/manager/pull/11010))

### Removed:

- Support for Gravatar as user profile avatars ([#10930](https://github.com/linode/manager/pull/10930))
- `AddNewLink` component, replacing instances with `Button` ([#10966](https://github.com/linode/manager/pull/10966))

### Tech Stories:

- Replace 'react-select' with Autocomplete in Profile ([#10780](https://github.com/linode/manager/pull/10780))
- Update storybook to take care of tar vulnerability ([#10934](https://github.com/linode/manager/pull/10934))
- Update dompurify and jsPDF packages to resolve dependabot security alerts ([#10955](https://github.com/linode/manager/pull/10955))
- Remove Linode Create v1 ([#10958](https://github.com/linode/manager/pull/10958))
- Update vite and related packages to latest versions ([#10960](https://github.com/linode/manager/pull/10960))
- Update `husky` to latest ([#10990](https://github.com/linode/manager/pull/10990))
- Add Accessibility tab to Storybook Stories ([#10942](https://github.com/linode/manager/pull/10942))
- Mark formik as deprecated ([#10944](https://github.com/linode/manager/pull/10944))
- Fix console error on Volume Create - Linode Config selection ([#10970](https://github.com/linode/manager/pull/10970))

### Tests:

- Tag cypress tests by adding the "method:e2e" and "purpose:dcTesting" ([#10915](https://github.com/linode/manager/pull/10915))
- Added unit tests for the NodeBalancerDetail package ([#10916](https://github.com/linode/manager/pull/10916))
- Add unit tests for Dialog and DeletionDialog components ([#10917](https://github.com/linode/manager/pull/10917))
- Add unit tests for rest of NodeBalancers package ([#10945](https://github.com/linode/manager/pull/10945))
- Add unit tests for `AccountActivationLanding` component ([#10966](https://github.com/linode/manager/pull/10966))
- Fix plan selection test always failing on reattempts ([#10976](https://github.com/linode/manager/pull/10976))
- Fix test flake in `nodebalancers-create-in-complex-form.spec.ts` ([#10981](https://github.com/linode/manager/pull/10981))
- Improve region selection RegEx to resolve test failures when selecting certain regions ([#10983](https://github.com/linode/manager/pull/10983))
- Address Linode deletion test flakiness ([#10999](https://github.com/linode/manager/pull/10999))

### Upcoming Features:

- Add Landing Page and update Empty-State Landing page for DBaaS V2 ([#10823](https://github.com/linode/manager/pull/10823))
- Update CSS for widget level filters and widget heading title for ACLP ([#10903](https://github.com/linode/manager/pull/10903))
- Fix 'Create Volume' button state on Volume Create page when 'Encrypt Volume' checkbox is checked ([#10929](https://github.com/linode/manager/pull/10929))
- DBaaS V2 enhancements to the Summary and Settings tabs ([#10939](https://github.com/linode/manager/pull/10939))
- Enhance CSS for Cloudpulse widget and main bar components ([#10951](https://github.com/linode/manager/pull/10951))
- DBaaS V2 enhancements to the Backups ([#10961](https://github.com/linode/manager/pull/10961))
- Update URL for Volume Encryption guide ([#10973](https://github.com/linode/manager/pull/10973))
- Update Region description helper text ([#10987](https://github.com/linode/manager/pull/10987))

## [2024-09-16] - v1.128.0

### Added:

- Gravatar sunset banner for existing Gravatar users ([#10859](https://github.com/linode/manager/pull/10859))
- New Marketplace app for September 2024 ([#10874](https://github.com/linode/manager/pull/10874))
- Support for quoted strings in Search v2 ([#10894](https://github.com/linode/manager/pull/10894))
- SelectableTableRow story in Storybook ([#10870](https://github.com/linode/manager/pull/10870))
- DisplayPrice story in Storybook ([#10904](https://github.com/linode/manager/pull/10904))
- CheckoutSummary story in Storybook ([#10905](https://github.com/linode/manager/pull/10905))
- CopyableTextField story and cleaned up components ([#10912](https://github.com/linode/manager/pull/10912))
- Tracking metrics for LD DX Tools AB Test ([#10906](https://github.com/linode/manager/pull/10906))

### Changed:

- Restricted access UX for Databases ([#10794](https://github.com/linode/manager/pull/10794))
- Update image related copy as part of Image Service Gen2 ([#10835](https://github.com/linode/manager/pull/10835))
- Disable Region in OS tab for unsupported distributed images and fix helper text positioning ([#10848](https://github.com/linode/manager/pull/10848))
- Avatars for users without Gravatars ([#10859](https://github.com/linode/manager/pull/10859))
- Refactor and improve the User Details page ([#10861](https://github.com/linode/manager/pull/10861))
- Hide Beta price notice for Gecko LA and rename Ga code references to LA ([#10896](https://github.com/linode/manager/pull/10896))
- Lower Events historical data fetching to 7 days ([#10899](https://github.com/linode/manager/pull/10899))
- Update security policy ([#10902](https://github.com/linode/manager/pull/10902))
- "Contact support" links to new support ticket in event messages ([#10910](https://github.com/linode/manager/pull/10910))
- Invalid Tax Id notification ([#10928](https://github.com/linode/manager/pull/10928))

### Fixed:

- Helper text copy in NodeBalancer Create form “Algorithm” field ([#10855](https://github.com/linode/manager/pull/10855))
- Regions to be searched by ID when Gecko is enabled ([#10871](https://github.com/linode/manager/pull/10871))
- Weblish line wrapping ([#10893](https://github.com/linode/manager/pull/10893))
- Search queries containing `and` on Linode Create v2's StackScript tab not being respected ([#10894](https://github.com/linode/manager/pull/10894))
- Typo with toast success notification when updating Reverse DNS ([#10895](https://github.com/linode/manager/pull/10895))
- Linode Migrate Datacenter Started event message referring to the wrong region ([#10901](https://github.com/linode/manager/pull/10901))
- DisplayPrice story crash when Currency component's minimumFractionDigits is negative ([#10913](https://github.com/linode/manager/pull/10913))
- Linode Create v2 not handling deprecated and EOL Images ([#10914](https://github.com/linode/manager/pull/10914))
- API Tokens Table style regression ([#10918](https://github.com/linode/manager/pull/10918))
- Incorrect avatar displaying in Notification Center for a small subset of events ([#10923](https://github.com/linode/manager/pull/10923))

### Tech Stories:

- Introduce Mock Service Worker V2 ([#10610](https://github.com/linode/manager/pull/10610))
- Replace lodash set utility function to handle security threat raised by Dependabot ([#10814](https://github.com/linode/manager/pull/10814))
- Remove `eventMessages` feature flag logic and legacy code ([#10839](https://github.com/linode/manager/pull/10839))
- Refactor `useToastNotification` async toasts ([#10841](https://github.com/linode/manager/pull/10841))
- Update TypeScript and Vitest to latest ([#10843](https://github.com/linode/manager/pull/10843))
- Remove global error interceptors ([#10850](https://github.com/linode/manager/pull/10850))
- Update Node.js from `18.14` to `20.17` ([#10866](https://github.com/linode/manager/pull/10866))
- Remove `placementGroups` feature flag and conditional rendering ([#10877](https://github.com/linode/manager/pull/10877))
- Resolve "Incomplete string escape or encoding" codeQL alert in `generate-ansibleConfig.ts` ([#10887](https://github.com/linode/manager/pull/10887))
- Remove `linodeCreateRefactor` feature flag ([#10921](https://github.com/linode/manager/pull/10921))

### Tests:

- Add Cypress integration test for Secure VMs firewall generation ([#10802](https://github.com/linode/manager/pull/10802))
- Add tests for NodeBalancer Create flow ([#10825](https://github.com/linode/manager/pull/10825))
- Add unit test for LinodeVolumeAddDrawer and E2E test for client library update notices in Create/Attach Volume drawer ([#10837](https://github.com/linode/manager/pull/10837))
- Add new tests for for selecting "All" Scopes ([#10852](https://github.com/linode/manager/pull/10852))
- Add unit tests for NodeBalancerConfigPanel ([#10855](https://github.com/linode/manager/pull/10855))
- Add `CY_TEST_ACCOUNT_CACHE_DIR` environment variable to enable retrieval of test account cache data ([#10867](https://github.com/linode/manager/pull/10867))
- Allow tests to fall back on cached account data when API request fails ([#10867](https://github.com/linode/manager/pull/10867))
- Add Cypress integration test for Object Storage Gen2: E2 Endpoint ([#10879](https://github.com/linode/manager/pull/10879))
- Add Cypress integration test for Object Storage Gen2: E3 Endpoint ([#10880](https://github.com/linode/manager/pull/10880))
- Add Cypress test for empty Linode landing page and restricted user Linode landing page ([#10882](https://github.com/linode/manager/pull/10882))
- Update region selection helpers to account for upcoming Gecko improvements ([#10888](https://github.com/linode/manager/pull/10888))
- Update remaining Linode Create Cypress tests run against Linode Create v2 ([#10889](https://github.com/linode/manager/pull/10889))
- Add unit tests for SelectableTableRow component ([#10890](https://github.com/linode/manager/pull/10890))
- Clean up feature flag mocks ([#10892](https://github.com/linode/manager/pull/10892))
- Add Cypress test to confirm toast when updating RDNS, add unit tests for RDNS drawers ([#10895](https://github.com/linode/manager/pull/10895))
- Add Cypress integration test for Object Storage Gen2: E1 Endpoint ([#10907](https://github.com/linode/manager/pull/10907))
- Add unit tests for AttachVolumeDrawer component ([#10909](https://github.com/linode/manager/pull/10909))
- Add unit tests for NodeBalancersLanding package ([#10911](https://github.com/linode/manager/pull/10911))
- Support running component tests via CI ([#10926](https://github.com/linode/manager/pull/10926))

### Upcoming Features:

- Support Volume Encryption and associated notices in Create/Attach Volume drawer ([#10837](https://github.com/linode/manager/pull/10837))
- Add new `CloudPulseDashboardWithFilters` component that will be used as a reusable component in service provider pages ([#10845](https://github.com/linode/manager/pull/10845))
- Fix Demo feedback and missing changes across ACLP ([#10851](https://github.com/linode/manager/pull/10851))
- Add conditional client library update required reboot notice to Volume Create page ([#10868](https://github.com/linode/manager/pull/10868))
- Add DBaaS V2 Create enhancements ([#10872](https://github.com/linode/manager/pull/10872))
- Revert the “View Code Snippets” button copy to the original text ([#10886](https://github.com/linode/manager/pull/10886))
- Add “Encrypt Volume” checkbox in Attach Volume drawer ([#10909](https://github.com/linode/manager/pull/10909))
- Update BSE capability for Linodes to be `Block Storage Encryption` instead of `blockstorage_encryption` ([#10920](https://github.com/linode/manager/pull/10920))

## [2024-09-03] - v1.127.0

### Added:

- CheckoutBar Story ([#10784](https://github.com/linode/manager/pull/10784))

### Changed:

- Improve support ticket form pre-population and field labels ([#10745](https://github.com/linode/manager/pull/10745))
- Open LISH in a popup window rather than a new tab ([#10789](https://github.com/linode/manager/pull/10789))
- Use static number of rows in column in LISH to prevent resize and cursor positioning problems ([#10789](https://github.com/linode/manager/pull/10789))
- Move manual snapshot error message from Linode Backups page to snapshot confirmation dialog ([#10791](https://github.com/linode/manager/pull/10791))
- "Create Volume" button text to "Add Volume" ([#10808](https://github.com/linode/manager/pull/10808))
- Storybook navigation bar organization ([#10809](https://github.com/linode/manager/pull/10809))
- Increase block storage max volume size to 16TB ([#10865](https://github.com/linode/manager/pull/10865))

### Fixed:

- Inability to open Object Storage folders that contain special characters ([#10819](https://github.com/linode/manager/pull/10819))
- Event handlers making a proportional number of GET requests to the number of incoming events ([#10824](https://github.com/linode/manager/pull/10824))
- Inaccessible, non-theme error text color in confirmation dialogs ([#10828](https://github.com/linode/manager/pull/10828))
- CreateSSHKeyDrawer being hidden by Rebuild Linode dialog ([#10833](https://github.com/linode/manager/pull/10833))
- Firewall warning not appearing in Create Linode flow ([#10838](https://github.com/linode/manager/pull/10838))
- Restricted users without account access unable to create Linodes on Linode Create v2 ([#10846](https://github.com/linode/manager/pull/10846))

### Tech Stories:

- Improve local Storybook performance ([#10762](https://github.com/linode/manager/pull/10762))
- Remove `patch-package` dependency ([#10800](https://github.com/linode/manager/pull/10800))
- Update `storybook` to fix `ip` package vulnerability ([#10827](https://github.com/linode/manager/pull/10827))
- Update `jsdom` to remove `ws` package vulnerability ([#10829](https://github.com/linode/manager/pull/10829))
- Dependencies updates and resolution for `braces` package vulnerability ([#10830](https://github.com/linode/manager/pull/10830))
- Update `browserlist` to latest version ([#10836](https://github.com/linode/manager/pull/10836))
- Tag Linode Create v2 with form events ([#10840](https://github.com/linode/manager/pull/10840))

### Tests:

- Add test for Linode create error flows ([#10761](https://github.com/linode/manager/pull/10761))
- Add Cypress test for Object Storage Gen2 Create flow for endpoint type E0, added unit tests for new Gen2 components ([#10774](https://github.com/linode/manager/pull/10774))
- Add unit tests for new Gen2 components ([#10774](https://github.com/linode/manager/pull/10774))
- Add test for Linode VPC config not recommended notices ([#10781](https://github.com/linode/manager/pull/10781))
- Refactor StackScript create test to be resilient to Image deprecations ([#10788](https://github.com/linode/manager/pull/10788))
- Resolve StackScripts pagination test failure ([#10811](https://github.com/linode/manager/pull/10811))
- Add unit test cases for CheckoutBar component ([#10818](https://github.com/linode/manager/pull/10818))
- Resolve StackScript Linode deploy test flake ([#10826](https://github.com/linode/manager/pull/10826))
- Add unit tests for Confirmation Dialogs ([#10828](https://github.com/linode/manager/pull/10828))
- Allow region select helpers to be used with mock data ([#10832](https://github.com/linode/manager/pull/10832))

### Upcoming Features:

- Enhance support for CloudPulse X-Filters ([#10769](https://github.com/linode/manager/pull/10769))
- Hide CORS and SSL for OBJ Gen2 ([#10776](https://github.com/linode/manager/pull/10776))
- Update DBaaS menu item with V1 or V2 capability, add mock data ([#10786](https://github.com/linode/manager/pull/10786))
- Add “Encrypt Volume” checkbox in Edit Volume drawer ([#10787](https://github.com/linode/manager/pull/10787))
- Update Bucket Rate Limits ([#10790](https://github.com/linode/manager/pull/10790))
- Add "Encryption" column to Linode Volumes table ([#10793](https://github.com/linode/manager/pull/10793))
- Add bucket management Properties Tab for Object Storage Gen2 ([#10797](https://github.com/linode/manager/pull/10797))
- Display Endpoint Type alongside each endpoint hostname in Regions Column & Hostnames Drawers ([#10796](https://github.com/linode/manager/pull/10796))
- Add useRegionQuery and cleanup bucket landing page ([#10801](https://github.com/linode/manager/pull/10801))
- Add 'Encrypt Volume' checkbox to Clone Volume drawer ([#10803](https://github.com/linode/manager/pull/10803))
- Modify CloudPulseDashboardSelect and its relevant queries to support multiple service types ([#10805](https://github.com/linode/manager/pull/10805))
- Add new CloudPulseCustomSelect component and integrate with the global filter builder ([#10807](https://github.com/linode/manager/pull/10807))
- Add bucket rate limit info to Object Storage Bucket Details drawer ([#10821](https://github.com/linode/manager/pull/10821))

## [2024-08-22] - v1.126.1

### Fix:

- Re-enable CORS for Legacy/Gen1 Endpoints ([#10812](https://github.com/linode/manager/pull/10812))

## [2024-08-19] - v1.126.0

### Added:

- Support for VPCs in 'Open Support Ticket' Flow ([#10746](https://github.com/linode/manager/pull/10746))
- Documentation for changeset best practices ([#10758](https://github.com/linode/manager/pull/10758))
- Documentation for 'Sizing a pull request' to contribution guidelines ([#10764](https://github.com/linode/manager/pull/10764))

### Changed:

- Update Region label globally ([#10740](https://github.com/linode/manager/pull/10740))
- Update Passbolt CE naming in Marketplace ([#10778](https://github.com/linode/manager/pull/10778))
- Empty-state Kubernetes landing page with the 'Create Cluster' button disabled for restricted users ([#10756](https://github.com/linode/manager/pull/10756))
- Allow URL path to open OBJ Create Access Key drawer ([#10749](https://github.com/linode/manager/pull/10749))

### Fixed:

- Community notifications in event messages v2 refactor ([#10742](https://github.com/linode/manager/pull/10742))
- LKE Cluster Create tab selection reset upon adding pool ([#10772](https://github.com/linode/manager/pull/10772))
- Incorrect spelling of Ukraine's capital ([#10777](https://github.com/linode/manager/pull/10777))
- Restricted access to login history for unrestricted child accounts ([#10779](https://github.com/linode/manager/pull/10779))
- Guide link for Secure Your Server app on Marketplace (#10782)

### Removed:

- Animation from search results and animate icon instead ([#10754](https://github.com/linode/manager/pull/10754))

### Tech Stories:

- Replace Select with Autocomplete:
  - Stackscripts and Images ([#10715](https://github.com/linode/manager/pull/10715))
  - Linodes ([#10725](https://github.com/linode/manager/pull/10725))
- Fix and enable Linode Create flow v1 form events ([#10722](https://github.com/linode/manager/pull/10722))
- Use Query Key Factory for Object Storage ([#10726](https://github.com/linode/manager/pull/10726))
- Remove `suppressImplicitAnyIndexErrors` and `ignoreDeprecations` Typescript options ([#10755](https://github.com/linode/manager/pull/10755))
- Use Query Key Factory for Linode Types ([#10760](https://github.com/linode/manager/pull/10760))
- Clean up Account Settings Object Storage and use React Query mutation ([#10766](https://github.com/linode/manager/pull/10766))
- Prepare for React Query v5 ([#10767](https://github.com/linode/manager/pull/10767))

### Tests:

- Add Cypress integration test for closing support tickets ([#10697](https://github.com/linode/manager/pull/10697))
- Add Cypress tests for refactored Linode Create flow with add-ons ([#10730](https://github.com/linode/manager/pull/10730))
- Update StackScript deploy test ([#10757](https://github.com/linode/manager/pull/10757))
- Fix `EditImageDrawer.test.tsx` unit test flake ([#10759](https://github.com/linode/manager/pull/10759))

### Upcoming Features:

- Add mock data to CloudPulseLineGraph ([#10710](https://github.com/linode/manager/pull/10710))
- Add CloudPulseDashboardFilterBuilder component to build filters per service type ([#10718](https://github.com/linode/manager/pull/10718))
- Add Object Storage Gen2 `/endpoints` query ([#10736](https://github.com/linode/manager/pull/10736))
- Add data visualization tokens to theme files ([#10739](https://github.com/linode/manager/pull/10739))
- Add Object Storage Gen2 factories, mocks, and `BucketRateLimitTable` component ([#10744](https://github.com/linode/manager/pull/10744))
- Add CloudPulse conversion for data roll up and modify positioning of "No data to display" message ([#10747](https://github.com/linode/manager/pull/10747))
- Add Volume Encryption section to Volume Create page ([#10750](https://github.com/linode/manager/pull/10750))
- Add Secure VM informational banners ([#10751](https://github.com/linode/manager/pull/10751))
- Add Sentry Tag for Linode Create v2 ([#10763](https://github.com/linode/manager/pull/10763))
- Determine if ACLP should be enabled based on account capabilities ([#10768](https://github.com/linode/manager/pull/10768))
- Add Firewall generation dialog ([#10770](https://github.com/linode/manager/pull/10770))
- Add Endpoint Type column & disable CORS for Gen2 buckets ([#10771](https://github.com/linode/manager/pull/10771))
- Add "Encryption" column to Volumes landing table ([#10775](https://github.com/linode/manager/pull/10775))

## [2024-08-05] - v1.125.0

### Added:

- Marketplace apps for August 2024 ([#10634](https://github.com/linode/manager/pull/10634))
- Account Limit support ticket to remaining create flows ([#10684](https://github.com/linode/manager/pull/10684))
- ARIA label to Account Maintenance tables ([#10694](https://github.com/linode/manager/pull/10694))

### Changed:

- Use `getRestrictedResourceText` utility and move restrictions Notice to top of Image Create and Upload pages ([#10675](https://github.com/linode/manager/pull/10675))
- Improve Types for Object Storage ([#10686](https://github.com/linode/manager/pull/10686))
- Rename SRV column headers in Linode's DNS Manager ([#10687](https://github.com/linode/manager/pull/10687))
- Scale LISH to fit viewport ([#10689](https://github.com/linode/manager/pull/10689))
- Open LISH in new tab rather than new window ([#10689](https://github.com/linode/manager/pull/10689))
- Save and restore more form fields from local storage in support ticket dialog ([#10703](https://github.com/linode/manager/pull/10703))
- Update Placement Group policy text copy ([#10727](https://github.com/linode/manager/pull/10727))
- Update Appwrite Marketplace logo ([#10729](https://github.com/linode/manager/pull/10729))
- Revise UX & copy in Monthly Network Transfer Pool Modal ([#10737](https://github.com/linode/manager/pull/10737))
- Disable Image Action Menu Buttons for Restricted Users ([#10682](https://github.com/linode/manager/pull/10682))

### Fixed:

- Incorrect Linode network interface configuration being displayed ([#10690](https://github.com/linode/manager/pull/10690))
- Sources not displaying correctly in Firewall Rule drawer ([#10724](https://github.com/linode/manager/pull/10724))
- Liked answer/question notifications from Community Questions Site ([#10732](https://github.com/linode/manager/pull/10732))
- Filtering for Linode Create v2 Core region selection ([#10743](https://github.com/linode/manager/pull/10743))

### Removed:

- Akamai Cloud Load Balancer ([#10705](https://github.com/linode/manager/pull/10705))

### Tech Stories:

- Query Key Factory for Linodes ([#10659](https://github.com/linode/manager/pull/10659))
- Query Key Factory for Status Page ([#10672](https://github.com/linode/manager/pull/10672))
- Replace 'react-select' with Autocomplete:
  - Billing ([#10681](https://github.com/linode/manager/pull/10681))
  - NodeBalancers Create (#10688)
  - Domains (#10693)
  - Firewalls' Add Inbound/Outbound rule drawer ([#10701](https://github.com/linode/manager/pull/10701))
  - `IPSelect`, `PaginationFooter`, and `TagsInput` (#10706)
  - Longview ([#10721](https://github.com/linode/manager/pull/10721))
- Migrate from `xterm` package to latest `@xterm/xterm` package ([#10689](https://github.com/linode/manager/pull/10689))
- Docker Compose changes to facilitate new testing pipeline ([#10713](https://github.com/linode/manager/pull/10713))
- Upgrade to latest Design Language System (DLS) 2.6.1 ([#10734](https://github.com/linode/manager/pull/10734))
- Refactor DiskEncryption component and rename to Encryption ([#10735](https://github.com/linode/manager/pull/10735))

### Tests:

- Add Cypress integration test for Support Ticket landing page ([#10616](https://github.com/linode/manager/pull/10616))
- Add cypress test coverage to DX tools additions in Linode create flow ([#10626](https://github.com/linode/manager/pull/10626))
- Improve feature flag mocking ergonomics for Cypress tests ([#10635](https://github.com/linode/manager/pull/10635))
- Add Cypress test for login redirect upon API unauthorized response ([#10655](https://github.com/linode/manager/pull/10655))
- Confirm UI flow when a user changes their Longview plan ([#10668](https://github.com/linode/manager/pull/10668))
- Confirm refactored Linode Create flow with Firewalls attached ([#10683](https://github.com/linode/manager/pull/10683))
- Add Cypress integration tests for account "Maintenance" tab ([#10694](https://github.com/linode/manager/pull/10694))
- Make existing Linode Create Cypress test compatible with Linode Create v2 ([#10695](https://github.com/linode/manager/pull/10695))
- Mock sidebar as open in some tests to minimize flake ([#10698](https://github.com/linode/manager/pull/10698))
- Tag tests for synthetic monitoring ([#10713](https://github.com/linode/manager/pull/10713))
- Add E2E coverage for refactored Events and Placement Groups flows ([#10719](https://github.com/linode/manager/pull/10719))
- Avoid cleaning up Volumes that are not in "active" state ([#10728](https://github.com/linode/manager/pull/10728))
- Add E2E coverage for Logout flow ([#10733](https://github.com/linode/manager/pull/10733))

### Upcoming Features:

- Add CloudPulse widget component in the UI for metrics data ([#10676](https://github.com/linode/manager/pull/10676))
- Object Storage Gen2 cors_enabled and type updates ([#10677](https://github.com/linode/manager/pull/10677))
- Add EU Agreement to Linode Create v2 ([#10692](https://github.com/linode/manager/pull/10692))
- Fix broken Linode Create v2 clone validation ([#10698](https://github.com/linode/manager/pull/10698))
- Replace Formik with React Hook Form for Create Bucket Drawer ([#10699](https://github.com/linode/manager/pull/10699))
- Make minor improvements to Linode Create v2 ([#10704](https://github.com/linode/manager/pull/10704))
- Add feature flag for Block Storage Encryption (BSE) ([#10707](https://github.com/linode/manager/pull/10707))
- Allow Marketplace Apps to be overwritten with a feature flag on Linode Create v2 ([#10709](https://github.com/linode/manager/pull/10709))
- Hide Monthly Network Transfer section for distributed regions ([#10714](https://github.com/linode/manager/pull/10714))
- Add new MSW, Factory, and E2E intercepts for OBJ Gen2 ([#10720](https://github.com/linode/manager/pull/10720))
- Add support for Two-step region select in Linode Create v2 ([#10723](https://github.com/linode/manager/pull/10723))
- Fix Image Capability and other tweaks in Image Service Gen2 ([#10731](https://github.com/linode/manager/pull/10731))

## [2024-07-22] - v1.124.0

### Added:

- Account Limit support ticket form for limit errors in Linode Create flow ([#10620](https://github.com/linode/manager/pull/10620))

### Changed:

- Use `getRestrictedResourceText` utility and move restrictions Notice to top of Volume Create ([#10632](https://github.com/linode/manager/pull/10632))
- Update Placement Group affinity labels and nomenclature ([#10651](https://github.com/linode/manager/pull/10651))
- Use new "lish" API instead of "lish_token" ([#10656](https://github.com/linode/manager/pull/10656))
- Display overflowing Kubernetes cluster tags in drawer ([#10658](https://github.com/linode/manager/pull/10658))
- Rename Distribution to OS ([#10666](https://github.com/linode/manager/pull/10666))
- Improve LKE Detail summary panel and Node Pool tables UI ([#10685](https://github.com/linode/manager/pull/10685))
- Disable Create Volume Button on the landing page for restricted users ([#10627](https://github.com/linode/manager/pull/10627))
- Disable Volume Action Menu buttons for restricted users ([#10641](https://github.com/linode/manager/pull/10641))
- Disable Create Volume button on empty state landing page for restricted users ([#10630](https://github.com/linode/manager/pull/10630))
- Disable Create Image button on empty state landing page for restricted users ([#10670](https://github.com/linode/manager/pull/10670))
- Disable Create Image button on landing page for restricted users ([#10671](https://github.com/linode/manager/pull/10671))

### Fixed:

- Incorrect error notice in Volume drawers for restricted users ([#10646](https://github.com/linode/manager/pull/10646))
- Github CLI install link in Contributing guide ([#10657](https://github.com/linode/manager/pull/10657))
- LKE details page 'Delete Pool' button misalignment ([#10660](https://github.com/linode/manager/pull/10660))
- User Preferences not properly being cached when the app loads ([#10663](https://github.com/linode/manager/pull/10663))
- Blank toast notification when canceling an image upload ([#10664](https://github.com/linode/manager/pull/10664))
- Missing support link in some toast notifications ([#10680](https://github.com/linode/manager/pull/10680))
- Column headers for Automatic Images ([#10696](https://github.com/linode/manager/pull/10696))

### Removed:

- Gravatar analytics events ([#10661](https://github.com/linode/manager/pull/10661))

### Tech Stories:

- Improve `getQueryParamsFromQueryString` type safety ([#10645](https://github.com/linode/manager/pull/10645))
- Improve API flexibility for `useToastNotification` ([#10654](https://github.com/linode/manager/pull/10654))
- Clean up and fix Linode Details styles ([#10662](https://github.com/linode/manager/pull/10662))
- Improve PowerActionsDialog ([#10667](https://github.com/linode/manager/pull/10667))
- Replace Select with Autocomplete component on Kubernetes Create page ([#10673](https://github.com/linode/manager/pull/10673))
- Update Managed Queries to use Query Key Factory ([#10679](https://github.com/linode/manager/pull/10679))

### Tests:

- Add Cypress integration test to add SSH key via Linode Create ([#10448](https://github.com/linode/manager/pull/10448))
- Add Cypress test for Login History page ([#10575](https://github.com/linode/manager/pull/10575))
- Add tests for Longview client rename and deletion ([#10644](https://github.com/linode/manager/pull/10644))

### Upcoming Features:

- Add Tax ID Notifications & Warning Icon ([#10558](https://github.com/linode/manager/pull/10558))
- Add capability to save & retrieve user preferences ([#10625](https://github.com/linode/manager/pull/10625))
- Add feature flag and capability for OBJ Gen2 ([#10647](https://github.com/linode/manager/pull/10647))
- Add Analytics Events to Linode Create v2 ([#10649](https://github.com/linode/manager/pull/10649))
- Update Manage Image Regions drawer based on UX feedback ([#10674](https://github.com/linode/manager/pull/10674))

## [2024-07-08] - v1.123.0

### Added:

- Design Tokens (CDS 2.0) ([#10022](https://github.com/linode/manager/pull/10022))
- Design update dismissible banner ([#10640](https://github.com/linode/manager/pull/10640))

### Changed:

- Rebuild Linode drawer ([#10594](https://github.com/linode/manager/pull/10594))
- Auto-populate Image label based on Linode and Disk names ([#10604](https://github.com/linode/manager/pull/10604))
- Update Linode disk action menu ([#10614](https://github.com/linode/manager/pull/10614))

### Fixed:

- Potential runtime issue with conditional hook ([#10584](https://github.com/linode/manager/pull/10584))
- Visual bug inside Node Pools table ([#10599](https://github.com/linode/manager/pull/10599))
- Linode Resize dialog UX when linode data is loading or there is an error ([#10618](https://github.com/linode/manager/pull/10618))

### Removed:

- Region helper text on the Image Upload page ([#10642](https://github.com/linode/manager/pull/10642))

### Tech Stories:

- Refactor `SupportTicketDialog` with React Hook Form ([#10557](https://github.com/linode/manager/pull/10557))
- Query Key Factory for ACLB ([#10598](https://github.com/linode/manager/pull/10598))
- Make `Factory.each` start incrementing at 1 instead of 0 ([#10619](https://github.com/linode/manager/pull/10619))

### Tests:

- Cypress integration test for SSH key update and delete ([#10542](https://github.com/linode/manager/pull/10542))
- Refactor Cypress Longview test to use mock API data/events ([#10579](https://github.com/linode/manager/pull/10579))
- Add assertions for created LKE cluster in Cypress LKE tests ([#10593](https://github.com/linode/manager/pull/10593))
- Update Object Storage tests to mock account capabilities as needed for Multicluster ([#10602](https://github.com/linode/manager/pull/10602))
- Fix OBJ test failure caused by visiting hardcoded and out-of-date URL ([#10609](https://github.com/linode/manager/pull/10609))
- Combine VPC details page subnet create, edit, and delete Cypress tests ([#10612](https://github.com/linode/manager/pull/10612))
- De-parameterize Cypress Domain Record Create tests ([#10615](https://github.com/linode/manager/pull/10615))
- De-parameterize Cypress Deep Link smoke tests ([#10622](https://github.com/linode/manager/pull/10622))
- Improve security of Linodes created during tests ([#10633](https://github.com/linode/manager/pull/10633))

### Upcoming Features:

- Gecko GA Region Select ([#10479](https://github.com/linode/manager/pull/10479))
- Add Dashboard Selection component inside the Global Filters of CloudPulse view ([#10589](https://github.com/linode/manager/pull/10589))
- Conditionally disable regions based on the selected image on Linode Create ([#10607](https://github.com/linode/manager/pull/10607))
- Prevent Linode Create v2 from toggling mid-creation ([#10611](https://github.com/linode/manager/pull/10611))
- Add new search query parser to Linode Create v2 StackScripts tab ([#10613](https://github.com/linode/manager/pull/10613))
- Add ‘Manage Image Regions’ Drawer ([#10617](https://github.com/linode/manager/pull/10617))
- Add Marketplace Cluster pricing support to Linode Create v2 ([#10623](https://github.com/linode/manager/pull/10623))
- Add debouncing to the Linode Create v2 `VLANSelect` ([#10628](https://github.com/linode/manager/pull/10628))
- Add Validation to Linode Create v2 Marketplace Tab ([#10629](https://github.com/linode/manager/pull/10629))
- Add Image distributed compatibility notice to Linode Create ([#10636](https://github.com/linode/manager/pull/10636))

## [2024-06-24] - v1.122.0

### Added:

- Informational notice about capturing an image from a Linode in a distributed compute region ([#10544](https://github.com/linode/manager/pull/10544))
- Volume & Images landing pages search and filtering ([#10570](https://github.com/linode/manager/pull/10570))
- Standard Tax Rate for JP ([#10606](https://github.com/linode/manager/pull/10606))
- B2B Tax ID for EU ([#10606](https://github.com/linode/manager/pull/10606))

### Changed:

- Rename to 'Choose a Distribution' to 'Choose an OS' in Linode Create flow ([#10554](https://github.com/linode/manager/pull/10554))
- Use dynamic outbound transfer pricing with `network-transfer/prices` endpoint ([#10566](https://github.com/linode/manager/pull/10566))
- Link Cloud Manager README to new documentation pages ([#10582](https://github.com/linode/manager/pull/10582))
- Use dynamic HA pricing with `lke/types` endpoint ([#10505](https://github.com/linode/manager/pull/10505))

### Fixed:

- Marketplace docs urls for Apache Kafka Cluster and Couchbase Cluster ([#10569](https://github.com/linode/manager/pull/10569))
- Users must be an unrestricted User in order to add or modify tags on Linodes ([#10583](https://github.com/linode/manager/pull/10583))
- CONTRIBUTING doc page commit type list markup ([#10587](https://github.com/linode/manager/pull/10587))
- React Query Events `seen` behavior and other optimizations ([#10588](https://github.com/linode/manager/pull/10588))
- Accessibility: Add tabindex to TextTooltip ([#10590](https://github.com/linode/manager/pull/10590))
- Fix parsing issue causing in Kubernetes Version field ([#10597](https://github.com/linode/manager/pull/10597))

### Tech Stories:

- Refactor and clean up ImagesDrawer ([#10514](https://github.com/linode/manager/pull/10514))
- Event Messages Refactor: progress events ([#10550](https://github.com/linode/manager/pull/10550))
- NodeBalancer Query Key Factory ([#10556](https://github.com/linode/manager/pull/10556))
- Query Key Factory for Domains ([#10559](https://github.com/linode/manager/pull/10559))
- Upgrade Vitest and related dependencies to 1.6.0 ([#10561](https://github.com/linode/manager/pull/10561))
- Query Key Factory for Firewalls ([#10568](https://github.com/linode/manager/pull/10568))
- Update TypeScript to latest ([#10573](https://github.com/linode/manager/pull/10573))

### Tests:

- Cypress integration test to add SSH key via Profile page ([#10477](https://github.com/linode/manager/pull/10477))
- Add assertions regarding Disk Encryption info banner to lke-landing-page.spec.ts ([#10546](https://github.com/linode/manager/pull/10546))
- Add Placement Group navigation integration tests ([#10552](https://github.com/linode/manager/pull/10552))
- Improve Cypress test suite compatibility against alternative environments ([#10562](https://github.com/linode/manager/pull/10562))
- Improve stability of StackScripts pagination test ([#10574](https://github.com/linode/manager/pull/10574))
- Fix Linode/Firewall related E2E test flake ([#10581](https://github.com/linode/manager/pull/10581))
- Mock profile request to improve security questions test stability ([#10585](https://github.com/linode/manager/pull/10585))
- Fix hanging unit tests ([#10591](https://github.com/linode/manager/pull/10591))
- Unit test coverage - HostNameTableCell ([#10596](https://github.com/linode/manager/pull/10596))

### Upcoming Features:

- Resources MultiSelect component in cloudpulse global filters view ([#10539](https://github.com/linode/manager/pull/10539))
- Add Disk Encryption info banner to Kubernetes landing page ([#10546](https://github.com/linode/manager/pull/10546))
- Add Disk Encryption section to Linode Rebuild modal ([#10549](https://github.com/linode/manager/pull/10549))
- Obj fix for crashing accesskey page when relevant customer tags are not added ([#10555](https://github.com/linode/manager/pull/10555))
- Linode Create v2 - Handle side-effects when changing the Region ([#10564](https://github.com/linode/manager/pull/10564))
- Revise LDE copy in Linode Create flow when Distributed region is selected ([#10576](https://github.com/linode/manager/pull/10576))
- Update description for Add Node Pools section in LKE Create flow ([#10578](https://github.com/linode/manager/pull/10578))
- Linode Create v2 - Add Marketplace Searching / Filtering ([#10586](https://github.com/linode/manager/pull/10586))
- Add Distributed Icon to ImageSelects for distributed compatible images ([#10592](https://github.com/linode/manager/pull/10592)
- Update Images Landing table ([#10545](https://github.com/linode/manager/pull/10545))

## [2024-06-21] - v1.121.2

### Fixed:

- Object Storage showing incorrect object URLs ([#10603](https://github.com/linode/manager/pull/10603))

## [2024-06-11] - v1.121.1

### Fixed:

- Core Plan table display ([#10567](https://github.com/linode/manager/pull/10567))

## [2024-06-10] - v1.121.0

### Added:

- Tags to Edit Image drawer ([#10466](https://github.com/linode/manager/pull/10466))
- Tags to image upload tab ([#10484](https://github.com/linode/manager/pull/10484))
- Apache Kafka Cluster and Couchbase Cluster Marketplace Apps ([#10500](https://github.com/linode/manager/pull/10500))
- Improvements to Clone flow to encourage powering down before cloning ([#10508](https://github.com/linode/manager/pull/10508))
- Alphabetical account sorting and search capabilities to Switch Account drawer ([#10515](https://github.com/linode/manager/pull/10515))

### Changed:

- Use dynamic pricing with `object-storage/types` endpoint ([#10468](https://github.com/linode/manager/pull/10468))
- Modify limited availability banner display logic ([#10536](https://github.com/linode/manager/pull/10536))
- Add `regions` and `total_size` fields to `imageFactory` ([#10541](https://github.com/linode/manager/pull/10541))

### Fixed:

- Unsurfaced interface error in Linode Config dialog ([#10429](https://github.com/linode/manager/pull/10429))
- Firewall landing device request with -1 ID ([#10509](https://github.com/linode/manager/pull/10509))
- Leading whitespace in list of Firewall Services ([#10527](https://github.com/linode/manager/pull/10527))
- Misalignment of Cluster Summary section at some screen sizes ([#10531](https://github.com/linode/manager/pull/10531))
- Stale assigned Firewall data displaying on Linode and NodeBalancer details pages ([#10534](https://github.com/linode/manager/pull/10534))

### Tech Stories:

- Replace Select with Autocomplete in: volumes ([#10437](https://github.com/linode/manager/pull/10437))
- Query Key Factory for Support Tickets ([#10496](https://github.com/linode/manager/pull/10496))
- Query Key Factory for Databases ([#10503](https://github.com/linode/manager/pull/10503))
- Remove `recompose` - Part 1 ([#10516](https://github.com/linode/manager/pull/10516))
- Clean up loading components ([#10524](https://github.com/linode/manager/pull/10524))
- New `consistent-type-imports` es-lint warning ([#10540](https://github.com/linode/manager/pull/10540))
- Query Key Factory for Security Questions and Preferences ([#10543](https://github.com/linode/manager/pull/10543))
- Upgrade Cypress from v13.5.0 to v13.11.0 ([#10548](https://github.com/linode/manager/pull/10548))
- Rename Edge regions to Distributed regions ([#10452](https://github.com/linode/manager/pull/10452))

### Tests:

- Improve unit test suite stability ([#10278](https://github.com/linode/manager/pull/10278))
- Added test automation for database resize feature. ([#10461](https://github.com/linode/manager/pull/10461))
- Add Linode Create v2 end-to-end tests ([#10469](https://github.com/linode/manager/pull/10469))
- Add Cypress test coverage for Linode Create v2 flow ([#10469](https://github.com/linode/manager/pull/10469))
- Remove console logs from e2e tests ([#10506](https://github.com/linode/manager/pull/10506))
- Add Linode details page assertion for LISH via SSH Info ([#10513](https://github.com/linode/manager/pull/10513))
- Add unit tests for CreateImageFromDiskDialog and EnableBackupsDialog and LDE-related E2E assertions for Create Image flow ([#10521](https://github.com/linode/manager/pull/10521))
- Fix `EditRouteDrawer.test.tsx` unit test flake ([#10526](https://github.com/linode/manager/pull/10526))
- Cypress integration tests for PG update label flow ([#10529](https://github.com/linode/manager/pull/10529))
- Add Cypress integration test for email bounce banners ([#10532](https://github.com/linode/manager/pull/10532))
- Improve test Linode security ([#10538](https://github.com/linode/manager/pull/10538))

### Upcoming Features:

- New tax id validation for non-US countries ([#10512](https://github.com/linode/manager/pull/10512))
- Add CloudPulse feature flag and landing page([#10393](https://github.com/linode/manager/pull/10393))
- Add Dashboard Global Filters and Dashboards Tab to the CloudPulse component ([#10397](https://github.com/linode/manager/pull/10397))
- Add Encrypted/Not Encrypted status to LKE Node Pool table ([#10480](https://github.com/linode/manager/pull/10480))
- Refactor Event Messages ([#10517](https://github.com/linode/manager/pull/10517))
- Fix regions length check in HostNameTableCell ([#10519](https://github.com/linode/manager/pull/10519))
- Linode Create Refactor:
  - Marketplace App Sections ([#10520](https://github.com/linode/manager/pull/10520))
  - Disk Encryption ([#10535](https://github.com/linode/manager/pull/10535)
- Add warning notices regarding non-encryption when creating Images and enabling Backups ([#10521](https://github.com/linode/manager/pull/10521))
- Add Encrypted / Not Encrypted status to Linode Detail header ([#10537](https://github.com/linode/manager/pull/10537))

## [2024-05-29] - v1.120.1

### Fixed:

- Tooltip not closing when unhovered ([#10523](https://github.com/linode/manager/pull/10523))

## [2024-05-28] - v1.120.0

### Added:

- Event message handling for new LKE event types ([#10443](https://github.com/linode/manager/pull/10443))
- Tags to Image Create capture tab ([#10471](https://github.com/linode/manager/pull/10471))
- Options for default policies when creating a Firewall ([#10474](https://github.com/linode/manager/pull/10474))

### Changed:

- Make all tooltips interactive and prevent `disableInteractive` for future usage ([#10501](https://github.com/linode/manager/pull/10501))

### Fixed:

- Duplicate speedtest helper text in Create Cluster form ([#10490](https://github.com/linode/manager/pull/10490))
- `RegionSelect` unexpected keyboard behavior ([#10495](https://github.com/linode/manager/pull/10495))

### Removed:

- `parentChildAccountAccess` feature flag ([#10489](https://github.com/linode/manager/pull/10489))
- `firewallNodebalancer` feature flag ([#10460](https://github.com/linode/manager/pull/10460))
- `recharts` feature flag ([#10483](https://github.com/linode/manager/pull/10483))

### Tech Stories:

- Add script to generate internal test results payload ([#10422](https://github.com/linode/manager/pull/10422))
- Update Storybook to 8.1.0 ([#10463](https://github.com/linode/manager/pull/10463))
- Upgrade country-region-data to 3.0.0 ([#10464](https://github.com/linode/manager/pull/10464))
- Remove aria-label from TableRow ([#10485](https://github.com/linode/manager/pull/10485))

### Tests:

- Add Placement Group populated landing page UI tests ([#10446](https://github.com/linode/manager/pull/10446))
- Add Placement Group Linode assignment UI tests ([#10449](https://github.com/linode/manager/pull/10449))
- Add Cypress test coverage for Disk Encryption in Linode Create flow ([#10462](https://github.com/linode/manager/pull/10462))
- Clean up support ticket test intercepts ([#10465](https://github.com/linode/manager/pull/10465))
- Clean up cy.intercept calls in nodebalancer test ([#10467](https://github.com/linode/manager/pull/10467))
- Fix failing StackScript test following deprecation of Fedora 38 Image ([#10470](https://github.com/linode/manager/pull/10470))
- Clean up and improves image creation Cypress tests ([#10471](https://github.com/linode/manager/pull/10471))
- Clean up cy.intercept calls in notification and events ([#10472](https://github.com/linode/manager/pull/10472))
- Add integration test for Linode Create with Placement Group ([#10473](https://github.com/linode/manager/pull/10473))
- Clean up cy.intercept calls in resize-linode test ([#10476](https://github.com/linode/manager/pull/10476))
- Clean up cy.intercept calls in smoke-delete-linode test ([#10478](https://github.com/linode/manager/pull/10478))
- Add cypress assertion and test for placement group deletion error handling ([#10493](https://github.com/linode/manager/pull/10493))

### Upcoming Features:

- Linode Create Refactor - Scroll Errors Into View ([#10454](https://github.com/linode/manager/pull/10454))
- Optimize and clean up PlacementGroups Select ([#10455](https://github.com/linode/manager/pull/10455))
- Add Disk Encryption section to Linode Create flow ([#10462](https://github.com/linode/manager/pull/10462))
- Reset errors in PlacementGroupDeleteModal ([#10486](https://github.com/linode/manager/pull/10486))

## [2024-05-13] - v1.119.0

### Changed:

- Update Account Closure Dialog Wording ([#10406](https://github.com/linode/manager/pull/10406))
- Implement GPUv2 plan divider & cleanup/consolidate plan selection components ([#10407](https://github.com/linode/manager/pull/10407)) [#10450](https://github.com/linode/manager/pull/10450)

### Fixed:

- Object ACL select field enabled in loading state ([#10412](https://github.com/linode/manager/pull/10412))
- Modification of Linode config 'interfaces' array on no changes ([#10423](https://github.com/linode/manager/pull/10423))
- Table component props forwarding ([#10424](https://github.com/linode/manager/pull/10424))

### Tech Stories:

- Remove `linodeCloneUiChanges` feature flag and clean up usages ([#10385](https://github.com/linode/manager/pull/10385))
- Query Key Factory for Volumes ([#10414](https://github.com/linode/manager/pull/10414))
- Query Key Factory for Kubernetes ([#10428](https://github.com/linode/manager/pull/10428))
- Clean up Main Content Banner ([#10430](https://github.com/linode/manager/pull/10430))
- Clean up Database feature flagging logic ([#10435](https://github.com/linode/manager/pull/10435))

### Tests:

- Add Cypress test coverage for Firewall renaming ([#10384](https://github.com/linode/manager/pull/10384))
- Add Cypress test for Domain cloning ([#10403](https://github.com/linode/manager/pull/10403))
- Fix VPC subnet Linode assignment integration test failures ([#10405](https://github.com/linode/manager/pull/10405))
- Fix access key test failure when user has many OBJ buckets ([#10405](https://github.com/linode/manager/pull/10405))
- Refactor Linode config end-to-end tests ([#10405](https://github.com/linode/manager/pull/10405))
- Fix failing OBJ E2E tests following API release ([#10417](https://github.com/linode/manager/pull/10417))
- Add Cypress tests for Placement Group deletion flows ([#10425](https://github.com/linode/manager/pull/10425))
- Add Placement Group create flow UI test ([#10445](https://github.com/linode/manager/pull/10445))
- Fix One-Click App test by using Ubuntu 22.04 image ([#10447](https://github.com/linode/manager/pull/10447))

### Upcoming Features:

- Add dialog to refresh proxy tokens as time expires ([#10361](https://github.com/linode/manager/pull/10361))
- Update Placement Groups text copy ([#10399](https://github.com/linode/manager/pull/10399))
- Linode Create Refactor:
  - Marketplace - Part 1 ([#10401](https://github.com/linode/manager/pull/10401))
  - Backups (#10404)
  - Marketplace - Part 2 (#10419)
  - Cloning ([#10421](https://github.com/linode/manager/pull/10421))
- Update Placement Group Table Row linodes tooltip and SelectPlacementGroup option label ([#10408](https://github.com/linode/manager/pull/10408))
- Add content to the ResourcesSection of the PG landing page in empty state ([#10411](https://github.com/linode/manager/pull/10411))
- Use 'edge'-class plans in edge regions ([#10415](https://github.com/linode/manager/pull/10415))
- Add disk_encryption to several factories for mocked data ([#10418](https://github.com/linode/manager/pull/10418))
- Fix Placement Group action event formatting ([#10420](https://github.com/linode/manager/pull/10420))
- Replace remaining feature flag implementation with `useIsPlacementGroupsEnabled` utility function ([#10431](https://github.com/linode/manager/pull/10431))
- Update Placement Groups final copy ([#10434](https://github.com/linode/manager/pull/10434))
- Add support for Placement Groups in Linode CLI tool ([#10438](https://github.com/linode/manager/pull/10438))
- Set PlacementGroupSelect clearOnBlur to true ([#10427](https://github.com/linode/manager/pull/10427))
- Update Placement Groups maximum_pgs_per_customer UI (#10433)
- Add DiskEncryption component ([#10439](https://github.com/linode/manager/pull/10439))

## [2024-05-06] - v1.118.1

### Upcoming Features:

- Use 'edge'-class plans in edge regions ([#10441](https://github.com/linode/manager/pull/10441))

## [2024-04-29] - v1.118.0

### Added:

- April Marketplace apps and SVGs ([#10382](https://github.com/linode/manager/pull/10382))

### Changed:

- Improve the UX of Access Token & Access Key drawers ([#10338](https://github.com/linode/manager/pull/10338))
- RegionSelect disabled option API updates ([#10373](https://github.com/linode/manager/pull/10373))
- Dynamic pricing with `volumes/types` endpoint ([#10376](https://github.com/linode/manager/pull/10376))
- Top Menu clean up and refactor ([#10383](https://github.com/linode/manager/pull/10383))
- PlanSelection availability updates and consolidation ([#10387](https://github.com/linode/manager/pull/10387))
- Shift wording from 'limited availability' to 'limited deployment availability' ([#10394](https://github.com/linode/manager/pull/10394))
- Gecko Beta copy updates ([#10400](https://github.com/linode/manager/pull/10400))

### Fixed:

- Charts Y-axis values are trimmed when scale is increased ([#10330](https://github.com/linode/manager/pull/10330))
- Chrome bug related to outdated CSS vendor prefixes ([#10380](https://github.com/linode/manager/pull/10380))
- Clickable disabled smaller plans in Resizing Tab ([#10381](https://github.com/linode/manager/pull/10381))
- New OBJ Buckets do not appear when created before initial fetch completes ([#10388](https://github.com/linode/manager/pull/10388))

### Removed:

- Deprecated Marketplace apps ([#10382](https://github.com/linode/manager/pull/10382))

### Tech Stories:

- Refactor and streamline VPC queries ([#10322](https://github.com/linode/manager/pull/10322))
- Update documentation on Adobe Analytics to cover data property ([#10365](https://github.com/linode/manager/pull/10365))
- Add isFeatureEnabledV2 to check for feature flag AND account capability ([#10371](https://github.com/linode/manager/pull/10371))
- Replace sanitize-html with dompurify ([#10378](https://github.com/linode/manager/pull/10378))
- Remove lodash (global import) as a package dependency ([#10386](https://github.com/linode/manager/pull/10386))
- Add Gravatar Analytics ([#10389](https://github.com/linode/manager/pull/10389))

### Tests:

- Add tests for Parent/Child Users & Grants page ([#10240](https://github.com/linode/manager/pull/10240))
- Add new Cypress tests for Longview landing page ([#10321](https://github.com/linode/manager/pull/10321))
- Add VM Placement Group landing page empty state UI test ([#10350](https://github.com/linode/manager/pull/10350))
- Fix `machine-image-upload.spec.ts` e2e test flake ([#10370](https://github.com/linode/manager/pull/10370))
- Update latest kernel version to fix `linode-config.spec.ts` ([#10391](https://github.com/linode/manager/pull/10391))
- Fix hanging account switching test ([#10396](https://github.com/linode/manager/pull/10396))

### Upcoming Features:

- Add Placement Groups to Linode Migrate flow ([#10339](https://github.com/linode/manager/pull/10339))
- Add text copy for Placement Group region limits in PlacementGroupsCreateDrawer ([#10355](https://github.com/linode/manager/pull/10355))
- Invalidate Placement Group queries on Linode create & delete mutations ([#10366](https://github.com/linode/manager/pull/10366))
- Update the Placement Groups SVG icon ([#10379](https://github.com/linode/manager/pull/10379))
- Fix & Improve Placement Groups feature restriction ([#10372](https://github.com/linode/manager/pull/10372))
- Linode Create Refactor:
  - VPC (#10354)
  - StackScripts (#10367)
  - Validation (#10374)
  - User Defined Fields ([#10395](https://github.com/linode/manager/pull/10395))
- Update gecko feature flag to object ([#10363](https://github.com/linode/manager/pull/10363))
- Show the selected regions as chips in the AccessKeyDrawer ([#10375](https://github.com/linode/manager/pull/10375))
- Add feature flag for Linode Disk Encryption (LDE) ([#10402](https://github.com/linode/manager/pull/10402))

## [2024-04-15] - v1.117.0

### Added:

- Resource links to NodeBalancers empty state landing page ([#10345](https://github.com/linode/manager/pull/10345))
- New DescriptionList component ([#10325](https://github.com/linode/manager/pull/10325))
- Akamai's Japanese QI System ID to Japanese Invoices ([#10356](https://github.com/linode/manager/pull/10356))

### Changed:

- Improve tags experience ([#10122](https://github.com/linode/manager/pull/10122))
- Use Chip for notification badge ([#10333](https://github.com/linode/manager/pull/10333))

### Fixed:

- Direction of the Bucket Access ACL select field carat with `Autocomplete` ([#10286](https://github.com/linode/manager/pull/10286))
- Reset SSH key form state on cancel ([#10344](https://github.com/linode/manager/pull/10344))
- `usePersonAccessTokensQuery` running without option to be disabled ([#10358](https://github.com/linode/manager/pull/10358))
- Unable to update label of OBJ limited access key ([#10362](https://github.com/linode/manager/pull/10362))
- Tooltip displaying for current Dedicated plan when resizing Database Cluster ([#10364](https://github.com/linode/manager/pull/10364))

### Tech Stories:

- Price NodeBalancers dynamically with `nodebalancers/types` endpoint ([#10265](https://github.com/linode/manager/pull/10265))
- Update Storybook to 8.0.5 ([#10336](https://github.com/linode/manager/pull/10336))
- Update Notistack to 3.0.1 ([#10357](https://github.com/linode/manager/pull/10357))

### Tests:

- Add tests to check Parent and Child Close Account flows ([#10316](https://github.com/linode/manager/pull/10316), [#10296](https://github.com/linode/manager/pull/10296))
- Add UI test for account switch flow with expired Parent token ([#10341](https://github.com/linode/manager/pull/10341))
- Add Cypress tests for Account billing drawers ([#10349](https://github.com/linode/manager/pull/10349))

### Upcoming Features:

- Disable fetching buckets with clusters when ObjMultiClusterEnabled flag is enabled (#10282)
- Update error message in EditAccessKeyDrawer ([#10329](https://github.com/linode/manager/pull/10329))
- Support ticket severity ([#10317](https://github.com/linode/manager/pull/10317))
- Refactor account switching utils for reusability and automatic token refreshing ([#10323](https://github.com/linode/manager/pull/10323))
- Update Placement Groups detail and summaries ([#10325](https://github.com/linode/manager/pull/10325))
- Update and clean up Placement Group assign/unassign features (#10328)
- Update navigation and add new menu items for Placement Groups ([#10340](https://github.com/linode/manager/pull/10340))
- Update UI for Region Placement Groups Limits type changes ([#10343](https://github.com/linode/manager/pull/10343))
- Linode Create Refactor:
  - User Data ([#10331](https://github.com/linode/manager/pull/10331))
  - Summary ([#10334](https://github.com/linode/manager/pull/10334))
  - VLANs ([#10342](https://github.com/linode/manager/pull/10342))
- Include powered-off status in Clone Linode event ([#10337](https://github.com/linode/manager/pull/10337))

## [2024-04-08] - v1.116.1

### Fixed:

- Search indefinitely loading on large accounts ([#10351](https://github.com/linode/manager/pull/10351))
- Returning proper scope when selecting all perms ([#10359](https://github.com/linode/manager/pull/10359))

## [2024-04-01] - v1.116.0

### Changed:

- Notifications for database resize events ([#10262](https://github.com/linode/manager/pull/10262))
- Clear ACLB configuration certificates if `http` or `tcp` protocol is selected ([#10311](https://github.com/linode/manager/pull/10311))
- Revamp Primary Navigation ([#10137](https://github.com/linode/manager/pull/10137))

### Fixed:

- Spacing between copy and Rebuild Linode button in Rebuild dialog ([#10283](https://github.com/linode/manager/pull/10283))
- Loading state missing from Users & Grants table ([#10303](https://github.com/linode/manager/pull/10303))
- Wrong status indicator when provisioning a LKE ([#10320](https://github.com/linode/manager/pull/10320))
- Hide DBaaS resize tab behind feature flag ([#10324](https://github.com/linode/manager/pull/10324))

### Tech Stories:

- Update account queries to use query key factory ([#10260](https://github.com/linode/manager/pull/10260))
- Upgrade MSW to 2.2.3 ([#10285](https://github.com/linode/manager/pull/10285))
- Update `axios` to resolve `follow-redirects` CVE-2024-28849 ([#10291](https://github.com/linode/manager/pull/10291))
- Remove use of flags.vpc and related logic in codebase ([#10299](https://github.com/linode/manager/pull/10299))
- Use query key factory for region queries ([#10301](https://github.com/linode/manager/pull/10301))
- Use query key factory for image queries ([#10302](https://github.com/linode/manager/pull/10302))
- Remove VPC feature flag ([#10306](https://github.com/linode/manager/pull/10306))
- Replace Typescript intersections with interfaces ([#10309](https://github.com/linode/manager/pull/10309))

### Tests:

- Add Parent/Child account switching UI tests for Child->Parent and Child->Child flows ([#10288](https://github.com/linode/manager/pull/10288))
- Resolve Firewall update test flake ([#10289](https://github.com/linode/manager/pull/10289))

### Upcoming Features:

- Set up grants and permissions for Placement Groups ([#10257](https://github.com/linode/manager/pull/10257))
- Add Create Placement Group flow in Details panel of Linode Create flow ([#10273](https://github.com/linode/manager/pull/10273))
- Gecko Beta Demo feedback ([#10284](https://github.com/linode/manager/pull/10284))
- Update Placement Groups types & payload ([#10300](https://github.com/linode/manager/pull/10300))
- Add placement group item to checkout summary ([#10304](https://github.com/linode/manager/pull/10304))
- Hide the Child Account Access table header for parent users without the enabled grant ([#10305](https://github.com/linode/manager/pull/10305))
- Update Placement Groups UI for Edit Drawer & Delete Modal ([#10312](https://github.com/linode/manager/pull/10312))
- Revoke proxy PAT when switching accounts ([#10313](https://github.com/linode/manager/pull/10313))
- Implement Placement Groups Query Key Factory ([#10314](https://github.com/linode/manager/pull/10314))
- Linode Create Refactor
  - Access ([#10308](https://github.com/linode/manager/pull/10308))
  - Details ([#10297](https://github.com/linode/manager/pull/10297))
  - Firewall ([#10315](https://github.com/linode/manager/pull/10315))
  - Add-ons ([#10319](https://github.com/linode/manager/pull/10319))
  - Images and Distributions ([#10281](https://github.com/linode/manager/pull/10281))

## [2024-03-18] - v1.115.0

### Added:

- Invoice byline for powered down instances ([#10208](https://github.com/linode/manager/pull/10208))
- LinuxGSM and Passbolt to Marketplace ([#10272](https://github.com/linode/manager/pull/10272))
- Linode Clone UI refinements ([#10280](https://github.com/linode/manager/pull/10280))

### Changed:

- Allow the disabling of the TypeToConfirm input ([#10205](https://github.com/linode/manager/pull/10205))
- Disable 512GB Plans ([#10228](https://github.com/linode/manager/pull/10228))
- Update ACLB Match Condition Tooltips and Placeholders ([#10271](https://github.com/linode/manager/pull/10271))
- Source ACLB region info from API data and use Jakarta instead of Sydney ([#10274](https://github.com/linode/manager/pull/10274))
- Improve the Linodes restricted user experience ([#10227](https://github.com/linode/manager/pull/10227))

### Fixed:

- Persisting error messages in ACLB delete dialogs ([#10254](https://github.com/linode/manager/pull/10254))
- ACLB TCP rule creation ([#10264](https://github.com/linode/manager/pull/10264))
- Ensure IP / Mask for firewall rules drawer correctly populates ([#10279](https://github.com/linode/manager/pull/10279))
- Linode Rebuild Dialog state not being reset properly ([#10287](https://github.com/linode/manager/pull/10287))

### Tech Stories:

- Upgrade to TanStack Query v4 ([#10236](https://github.com/linode/manager/pull/10236))
- Use `@lukemorales/query-key-factory` for Profile Queries ([#10241](https://github.com/linode/manager/pull/10241))
- Update root eslint parser to `@typescript-eslint/parser` ([#10243](https://github.com/linode/manager/pull/10243))
- Implement new useId() hook in several components ([#10261](https://github.com/linode/manager/pull/10261))
- Linode Create Refactor - Part 1 ([#10268](https://github.com/linode/manager/pull/10268))

### Tests:

- Add Cypress test to check empty state in Images landing page ([#10167](https://github.com/linode/manager/pull/10167))
- Add tests for child user verification banner ([#10204](https://github.com/linode/manager/pull/10204))
- Refactor Cypress region utils, address region capacity flake ([#10242](https://github.com/linode/manager/pull/10242))
- Resolve OBJ Bucket create/delete E2E test flake ([#10245](https://github.com/linode/manager/pull/10245))
- Fix URL redirect flake for Images empty state landing page test ([#10267](https://github.com/linode/manager/pull/10267))

### Upcoming Features:

- Update Placement Group Create & Edit Drawers ([#10205](https://github.com/linode/manager/pull/10205))
- Add scrolling for S3 hostnames in the Access Keys modal. ([#10218](https://github.com/linode/manager/pull/10218))
- Placement Groups events and notifications ([#10221](https://github.com/linode/manager/pull/10221))
- Disable Cloning, Private IP, Backups for edge regions ([#10222](https://github.com/linode/manager/pull/10222))
- Show correct status of Child Account Enabled column for parent users ([#10233](https://github.com/linode/manager/pull/10233))
- Hide "Switch Account" buttons if child_account_access is false ([#10237](https://github.com/linode/manager/pull/10237))
- Only support Edge to Edge Migrations ([#10238](https://github.com/linode/manager/pull/10238))
- Update Buckets landing page to use regions instead of clusters ([#10244](https://github.com/linode/manager/pull/10244))
- Display parent email in user menu for restricted parent users without access to company name ([#10248](https://github.com/linode/manager/pull/10248))
- Adjust user table column count for parent/child ([#10252](https://github.com/linode/manager/pull/10252))
- Linode plan table updates for Edge regions ([#10255](https://github.com/linode/manager/pull/10255))
- Change Placement Group Feature Flag to return a JSON object ([#10256](https://github.com/linode/manager/pull/10256))
- Update copy from Business Partner to Parent User ([#10259](https://github.com/linode/manager/pull/10259))
- Update Assign Linode Drawer and improve query skipping ([#10263](https://github.com/linode/manager/pull/10263))
- Add Parent/Child Account copy and account management improvements ([#10270](https://github.com/linode/manager/pull/10270))
- Improve Proxy Account Visibility with Distinct Visual Indicators ([#10277](https://github.com/linode/manager/pull/10277))

## [2024-03-04] - v1.114.0

### Added:

- Reintroduce NVMe Volume Upgrades ([#10229](https://github.com/linode/manager/pull/10229))

### Changed:

- Improve dev tools UI ([#10220](https://github.com/linode/manager/pull/10220))
- ACLB beta region from `Washington, DC` to `Miami, FL` ([#10232](https://github.com/linode/manager/pull/10232))

### Fixed:

- Incorrect units in Linode Network Graph Tooltip ([#10197](https://github.com/linode/manager/pull/10197))
- Disabled `Add` button once a node pool is added to kubernetes cluster in Create flow ([#10215](https://github.com/linode/manager/pull/10215))
- Invalid VPC scope with a Select All > Read Only selection in Create PAT drawer ([#10226](https://github.com/linode/manager/pull/10226))
- Disabled styles for Textfield input ([#10231](https://github.com/linode/manager/pull/10231))
- LinodeVolumeCreateForm crash ([#10235](https://github.com/linode/manager/pull/10235))

### Tech Stories:

- Update to React 18 ([#10169](https://github.com/linode/manager/pull/10169))
- Improve LinodeActionMenu restricted user experience ([#10199](https://github.com/linode/manager/pull/10199))
- Convert isRestrictedGlobalGrantType to Hook ([#10203](https://github.com/linode/manager/pull/10203))
- Update Storybook to latest to resolve CVE-2023-42282 ([#10212](https://github.com/linode/manager/pull/10212))
- Generate docs site sidebar based on folder structure ([#10214](https://github.com/linode/manager/pull/10214))
- Clean up `new QueryClient()` pattern in unit tests ([#10217](https://github.com/linode/manager/pull/10217))
- Remove build time API caching ([#10219](https://github.com/linode/manager/pull/10219))
- Clean up `Chip` component ([#10223](https://github.com/linode/manager/pull/10223))

### Tests:

- Add Cypress tests for account switching from Parent to Child ([#10110](https://github.com/linode/manager/pull/10110))
- Improve User Profile integration test coverage and separate from Display Settings coverage ([#10202](https://github.com/linode/manager/pull/10202))
- Add test for OBJ Multicluster bucket create flow ([#10211](https://github.com/linode/manager/pull/10211))
- Suppress Rollup warnings during Cypress tests ([#10239](https://github.com/linode/manager/pull/10239))

### Upcoming Features:

- Add list view for Linode Clone and Create from Backup ([#10182](https://github.com/linode/manager/pull/10182))
- Add ‘Delete Placement Group’ Modal (#10162)
- Update Placement Groups types, methods and factories (#10200)
- Add placement group details to Create Linode payload ([#10195](https://github.com/linode/manager/pull/10195))
- Update OBJ Multi-Cluster copy ([#10188](https://github.com/linode/manager/pull/10188))
- Handle errors gracefully when OBJ Multi-Cluster feature flag is enabled without MSW (#10189)
- Ensure correct ARIA labels for permissions are displayed in Access Key "Permissions" drawer when OBJ Multicluster is enabled ([#10213](https://github.com/linode/manager/pull/10213))
- Update Region Select for edge sites (#10194)
- Tag custom analytics events for account switching ([#10190](https://github.com/linode/manager/pull/10190))
- Improve Billing & Account restricted user experience ([#10201](https://github.com/linode/manager/pull/10201))
- Disable ability to edit or delete a proxy user via User Profile page ([#10202](https://github.com/linode/manager/pull/10202))
- Fix Users & Grants filtering error based on `user_type` ([#10230](https://github.com/linode/manager/pull/10230))
- Fix Account Switching ([#10234](https://github.com/linode/manager/pull/10234))
- Fix to ensure ChildAccountList receives proper account token (#10234)
- Rename database scale up to database resize ([#10193](https://github.com/linode/manager/pull/10193))

## [2024-02-20] - v1.113.0

### Added:

- Feb 2024 Marketplace apps ([#10149](https://github.com/linode/manager/pull/10149))

### Changed:

- Improve Linode Graph X Axis Labels when viewing historic data ([#10186](https://github.com/linode/manager/pull/10186))

### Fixed:

- EditableText interaction styling ([#10132](https://github.com/linode/manager/pull/10132))
- Inability to transfer IPv6 ranges ([#10156](https://github.com/linode/manager/pull/10156))
- Incorrect `X-Filter` on the Account Maintenance "Pending" Table (#10196)
- Bundle analyzer script ([#10175](https://github.com/linode/manager/pull/10175))

### Tech Stories:

- Clean up DC Get Well feature flag logic ([#10146](https://github.com/linode/manager/pull/10146))
- Clean up `regionDropdown` feature flag ([#10148](https://github.com/linode/manager/pull/10148))
- Update `react-router-dom` in preparation for React 18 ([#10154](https://github.com/linode/manager/pull/10154))
- Remove Enzyme ([#10160](https://github.com/linode/manager/pull/10160))
- Update Luxon ([#10163](https://github.com/linode/manager/pull/10163))
- Update `launchdarkly-react-client-sdk` ([#10165](https://github.com/linode/manager/pull/10165))
- Add analytics event for breadcrumb label edit icon on Linode details page ([#10183](https://github.com/linode/manager/pull/10183))

### Tests:

- Add integration test coverage for Account Login History ([#10125](https://github.com/linode/manager/pull/10125))
- Add integration test to check proxy user disabled username/email field ([#10139](https://github.com/linode/manager/pull/10139))
- Add Cypress tests for OBJ Multicluster access key operations ([#10144](https://github.com/linode/manager/pull/10144))
- Fix billing contact Cypress test by narrowing element selection scope ([#10150](https://github.com/linode/manager/pull/10150))
- Update Cypress tests to use `"default"` `user_type` for non-parent/child/proxy users ([#10176](https://github.com/linode/manager/pull/10176))
- Fix Button enabled assertions ([#10142](https://github.com/linode/manager/pull/10142))

### Upcoming Features:

- Disable "Save" button in Edit Access Key drawer unless field values are changed ([#10118](https://github.com/linode/manager/pull/10118))
- Add Placement Groups Select component (#10100)
- Update Placement Groups limits ([#10191](https://github.com/linode/manager/pull/10191))
- Add Placement Group Linodes List ([#10123](https://github.com/linode/manager/pull/10123))
- Add AssignLinodesToPlacementGroup drawer ([#10140](https://github.com/linode/manager/pull/10140))
- Add PlacementGroups Summary component ([#10164](https://github.com/linode/manager/pull/10164))
- Add unassign linode from Placement Group modal (#10172)
- Improve restricted access Login History experience for child and restricted users ([#10125](https://github.com/linode/manager/pull/10125))
- Add session expiry confirmation dialog for proxy to parent user account switching ([#10152](https://github.com/linode/manager/pull/10152))
- Clean up files to use profile to get `user_type` ([#10102](https://github.com/linode/manager/pull/10102))
- Update components and unit tests to use `"default"` `user_type` for non-parent/child/proxy users ([#10176](https://github.com/linode/manager/pull/10176))
- Use infinite query for fetching child accounts ([#10179](https://github.com/linode/manager/pull/10179))
- Use API filtering on user_type to populate the two Users & Grants tables ([#10192](https://github.com/linode/manager/pull/10192))

## [2024-02-13] - v1.112.0

### Added:

- Support for IPv4 Ranges in VPC 'Assign Linodes to subnet' drawer ([#10089](https://github.com/linode/manager/pull/10089))
- VPC IPv4 address and range to Linode IP Address Table ([#10108](https://github.com/linode/manager/pull/10108))
- Support for VPC IPv4 Ranges data in Unassign Linodes drawer ([#10114](https://github.com/linode/manager/pull/10114))
- Support for VPC IPv4 Ranges in Linode Create flow and 'VPC IPv4 Ranges' column to inner Subnets table on VPC Detail page ([#10116](https://github.com/linode/manager/pull/10116))
- Support VPC IPv4 Ranges in Add/Edit Linode Config dialog ([#10170](https://github.com/linode/manager/pull/10170))

### Changed:

- "Learn more" docs link for IPv4 ranges in Add/Edit Linode Config dialog, Linode Create flow, and VPC "Assign Linodes" drawer

### Fixed:

- Error when enabling backups for Linodes in regions with $0 pricing ([#10153](https://github.com/linode/manager/pull/10153))
- Error notices for $0 regions in LKE Resize and Add Node Pools drawers ([#10157](https://github.com/linode/manager/pull/10157))
- Error in Enable All Backups drawer when one or more Linode is in a $0 region ([#10161](https://github.com/linode/manager/pull/10161))
- Display $0.00 prices in Linode Migration dialog ([#10166](https://github.com/linode/manager/pull/10166))

## [2024-02-05] - v1.111.0

### Changed:

- Table CollapsibleRow icon orientation ([#10119](https://github.com/linode/manager/pull/10119))
- Hide error message for $0 regions ([#10141](https://github.com/linode/manager/pull/10141))

### Fixed:

- Incorrect color of VPC Action Buttons in Dark Mode ([#10101](https://github.com/linode/manager/pull/10101))
- Breadcrumb label in NodeBalancers details & create pages ([#10127](https://github.com/linode/manager/pull/10127))

### Tech Stories:

- Improve NodeBalancer Restricted User Experience ([#10095](https://github.com/linode/manager/pull/10095))
- Update Storybook & add @babel/traverse resolution ([#10097](https://github.com/linode/manager/pull/10097))
- Remove unused `@types/reach__router` package ([#10099](https://github.com/linode/manager/pull/10099))
- Add RegionMultiSelect Component ([#10084](https://github.com/linode/manager/pull/10084))
- Remove unused `react-page-visibility` and `@types/react-page-visibility` packages ([#10099](https://github.com/linode/manager/pull/10099))
- Move `simple-git` from `dependencies` to `devDependencies` ([#10099](https://github.com/linode/manager/pull/10099))
- Remove `kubernetesDashboardAvailability` feature flag ([#10121](https://github.com/linode/manager/pull/10121))
- Refactor AccessKeyTable - Eliminate React anti-patterns ([#10124](https://github.com/linode/manager/pull/10124))
- React Query for Events ([#9949](https://github.com/linode/manager/pull/9949))
- Upgrade to Vitest 1.2.0 ([#10070](https://github.com/linode/manager/pull/10070))
- Enable TypeScript type checks in the Cypress directory ([#10086](https://github.com/linode/manager/pull/10086))

### Tests:

- Add Cypress tests for restricted user billing flows ([#10070](https://github.com/linode/manager/pull/10070))
- Fix test failure related to Ubuntu 23.04 Image deprecation ([#10091](https://github.com/linode/manager/pull/10091))
- Add regression tests for deleting users on the Users & Grants page. ([#10093](https://github.com/linode/manager/pull/10093))
- Fix Domains landing page empty state test flake ([#10094](https://github.com/linode/manager/pull/10094))
- Add Cypress test for VPC assignment during Linode create flow ([#9939](https://github.com/linode/manager/pull/9939))

### Upcoming Features:

- Create Load Balancer Summary page ([#10018](https://github.com/linode/manager/pull/10018))
- OBJ MultiCluster - Add regions field in Create Access Key Drawer ([#10034](https://github.com/linode/manager/pull/10034))
- Add Rule support to ACLB Full Create Flow ([#10035](https://github.com/linode/manager/pull/10035))
- Update ACLB Configuration Port Copy ([#10079](https://github.com/linode/manager/pull/10079))
- Add search filter in Clone Linode and Create Linode from Backup flows ([#10088](https://github.com/linode/manager/pull/10088))
- Handle ACLB Account Capability ([#10098](https://github.com/linode/manager/pull/10098))
- Add new ACLB logo ([#10105](https://github.com/linode/manager/pull/10105))
- Put newly created ACLB Rules at the top of the table upon creation ([#10107](https://github.com/linode/manager/pull/10107))
- Change ACLB Rule Execution Order Column ([#10112](https://github.com/linode/manager/pull/10112))
- Add ACLB rule Path Regex match type ([#10126](https://github.com/linode/manager/pull/10126))
- Update ACLB Copy ([#10128](https://github.com/linode/manager/pull/10128))
- Implement Account Switching Functionality (#10064)
- Add `user_type` to /profile endpoint for Parent/Child user roles ([#10080](https://github.com/linode/manager/pull/10080))
- Add business partner table to Users & Grants child view ([#10076](https://github.com/linode/manager/pull/10076))
- Disable adding and editing API tokens for proxy users (#10109)
- Restrict proxy users from updating username/email (#10103)
- Add Verification Banner for Child Accounts ([#10085](https://github.com/linode/manager/pull/10085))
- Add Placement Groups Detail Page ([#10096](https://github.com/linode/manager/pull/10096))
- Add Placement Groups Create/Rename Drawers (#10106)
- Add Placement Groups Landing Page ([#10068](https://github.com/linode/manager/pull/10068))
- Add Placement Groups Landing Page empty state ([#10075](https://github.com/linode/manager/pull/10075))

## [2024-01-31] - v1.110.3

### Fix:

- Enable `Can add VPCs to this account` for user permissions

## [2024-01-31] - v1.110.2

### Changed:

- Remove VPC beta feedback link

## [2024-01-31] - v1.110.1

### Changed:

- Updated VPC flag for primary navigation

## [2024-01-22] - v1.110.0

### Added:

- Subnet IPv4 range recommendation in VPC Create flow and Subnet Create Drawer ([#10010](https://github.com/linode/manager/pull/10010))
- Sold out chips for GPU and Premium CPU plans ([#10013](https://github.com/linode/manager/pull/10013))
- Cloud Manager Documentation microsite with Vitepress ([#10027](https://github.com/linode/manager/pull/10027))
- Proper support for OBJ Access Key events ([#10038](https://github.com/linode/manager/pull/10038))
- Support VPC in Access Token drawers ([#10024](https://github.com/linode/manager/pull/10024))

### Changed:

- Styling of Toggles and Radios in dark mode ([#10020](https://github.com/linode/manager/pull/10020))
- Deprecate Ark, TF2, Terraria, Percona, Mist, MagicSpam and BitNinja from Marketplace Apps ([#10046](https://github.com/linode/manager/pull/10046))
- Update user title and emote icons on Support Ticket page ([#10054](https://github.com/linode/manager/pull/10054))
- Update Cloud Manager LICENSE ([#10067](https://github.com/linode/manager/pull/10067))
- Remove unified migrations feature flag ([#10074](https://github.com/linode/manager/pull/10074))
- Right align chart tooltip data points ([#10078](https://github.com/linode/manager/pull/10078))
- Update OBJ types used in several Object Storage components ([#9996](https://github.com/linode/manager/pull/9996))
- Replace Linode details Analytics tab with Recharts ([#10037, #10001](https://github.com/linode/manager/pull/10037))
- Replace Managed summary charts with Recharts ([#10001](https://github.com/linode/manager/pull/10001))

### Fixed:

- Managed Summary layout ([#10042](https://github.com/linode/manager/pull/10042))
- Textfield Label Tooltip Icon elongation/distortion upon focus ([#10044](https://github.com/linode/manager/pull/10044))
- Broken PrimaryNav marketplace navigation within Linode Create ([#10049](https://github.com/linode/manager/pull/10049))
- Kubernetes upgrade flow on Kubernetes details page ([#10057](https://github.com/linode/manager/pull/10057))
- VPC arguments in Linode Create flow CLI ([#10071](https://github.com/linode/manager/pull/10071))
- Standardize Copy Icon Color Variations in CopyableTextField ([#10073](https://github.com/linode/manager/pull/10073))
- Linode details action button color in dark mode ([#10077](https://github.com/linode/manager/pull/10077))
- AGLB route rules being cleared when updating a route ([#10016](https://github.com/linode/manager/pull/10016))
- AGLB Service Target validation ([#10016](https://github.com/linode/manager/pull/10016))

### Tech Stories:

- Update `react-waypoint` for React 18 ([#10026](https://github.com/linode/manager/pull/10026))
- Improve accessibility of Button Component ([#10028](https://github.com/linode/manager/pull/10028))
- Remove `classnames` and `@types/classnames` ([#10029](https://github.com/linode/manager/pull/10029))
- Update `axios` to resolve `follow-redirects` dependabot alert ([#10059](https://github.com/linode/manager/pull/10059))

### Tests:

- Add test coverage updating/renaming Linode labels ([#10032](https://github.com/linode/manager/pull/10032))
- GDPR agreement e2e test ([#10033](https://github.com/linode/manager/pull/10033))
- Add test coverage for Billing Access permission for Child accounts ([#10045](https://github.com/linode/manager/pull/10045))
- Improve Kubernetes version upgrade Cypress test ([#10057](https://github.com/linode/manager/pull/10057))
- Combine VPC landing page tests for update and delete operations ([#10061](https://github.com/linode/manager/pull/10061))

### Upcoming Features:

- Add AGLB Endpoint Health ([#10008](https://github.com/linode/manager/pull/10008))
- Add child account access column and disable delete account button when account has child accounts ([#10025](https://github.com/linode/manager/pull/10025))
- Add parent/proxy 'Switch Account' button and drawer to user profile dropdown menu ([#10031](https://github.com/linode/manager/pull/10031))
- Disable Contact / Billing Info for Restricted Users ([#10036](https://github.com/linode/manager/pull/10036))
- Disable Billing Access user permission for child accounts ([#10045](https://github.com/linode/manager/pull/10045))
- Fix AGLB Configuration "Save" button remaining disabled when trying to remove a route ([#10048](https://github.com/linode/manager/pull/10048))
- Add Switch Account button to Account Landing page for parent and proxy users ([#10052](https://github.com/linode/manager/pull/10052))
- Add VM Placement feature flag ([#10060](https://github.com/linode/manager/pull/10060))
- Add Placement Groups: Queries, Types, Validation, Factories and Mock Data ([#10062](https://github.com/linode/manager/pull/10062))
- Improve AGLB Configuration - Add Certificate Drawer ([#10066](https://github.com/linode/manager/pull/10066))
- Configure User Permissions Billing Account Access for user types ([#10069](https://github.com/linode/manager/pull/10069))
- Ability to scale up Database instances ([#9869](https://github.com/linode/manager/pull/9869))
- Clone Linode power-off notice ([#10072](https://github.com/linode/manager/pull/10072))

## [2024-01-10] - v1.109.1

### Fixed:

- VPC docs links on VPC landing, Create, and Detail pages and in "Assign Linodes" flow ([#10050](https://github.com/linode/manager/pull/10050))
- VPC subnet Linode assignment text field input issue ([#10047](https://github.com/linode/manager/pull/10047))

### Tests:

- Remove obsolete VPC disabled state tests ([#10047](https://github.com/linode/manager/pull/10047))

## [2024-01-08] - v1.109.0

### Changed:

- Improve layout of User Permissions page ([#10005](https://github.com/linode/manager/pull/10005))
- Update toast notifications for UserPermissions ([#10011](https://github.com/linode/manager/pull/10011))
- VLAN availability text on Linode Create ([#9989](https://github.com/linode/manager/pull/9989))
- Default access to `None` for all scopes when creating Personal Access Tokens ([#9992](https://github.com/linode/manager/pull/9992))
- Filter already assigned services from firewall dropdowns ([#9993](https://github.com/linode/manager/pull/9993))

### Fixed:

- User Permissions toggle and radio button accessibility ([#10009](https://github.com/linode/manager/pull/10009))

### Tech Stories:

- Currency and DateTimeDisplay v7 storybook migrations ([#10007](https://github.com/linode/manager/pull/10007))
- ColorPalette and CircleProgress v7 storybook migration ([#10015](https://github.com/linode/manager/pull/10015))
- DebouncedSearchTextfield and EditableText v7 storybook migrations ([#10017](https://github.com/linode/manager/pull/10017))
- Placeholder and EntityDetails v7 storybook migrations ([#10019](https://github.com/linode/manager/pull/10019))
- PaginationControls V7 story migration ([#9959](https://github.com/linode/manager/pull/9959))
- TagsInput & TagsPanel Storybook v7 Stories ([#9963](https://github.com/linode/manager/pull/9963))
- Add Lint Github Action ([#9973](https://github.com/linode/manager/pull/9973))
- Complete @mui/styles to tss-react migration and remove @mui/styles ([#9978](https://github.com/linode/manager/pull/9978))
- ErrorState and FileUploader v7 storybook migrations ([#9981](https://github.com/linode/manager/pull/9981))
- Speed up code coverage Github Actions jobs by skipping Cloud Manager build ([#9988](https://github.com/linode/manager/pull/9988))
- Radio and TextField v7 storybook migrations ([#9994](https://github.com/linode/manager/pull/9994))
- Graphs stories v7 migration ([#9999](https://github.com/linode/manager/pull/9999))
- Add ability to pass headers to useProfile query ([#9987](https://github.com/linode/manager/pull/9987))

### Tests:

- Add Cypress test for Firewalls empty state landing page ([#10000](https://github.com/linode/manager/pull/10000))
- Add integration test for Domains empty landing page ([#10004](https://github.com/linode/manager/pull/10004))
- Add Cypress integration tests for User Permissions page ([#10009](https://github.com/linode/manager/pull/10009))
- Fix `CreditCard.test.tsx` failing unit test triggered by new year ([#10023](https://github.com/linode/manager/pull/10023))
- Add integration test for AGLB Load Balancer delete flows. ([#9955](https://github.com/linode/manager/pull/9955))
- Add Cypress test for Volumes empty state landing page ([#9995](https://github.com/linode/manager/pull/9995))
- Tests to power on/off and reboot Linodes ([#9980](https://github.com/linode/manager/pull/9980))

### Upcoming Features:

- Add child access user permissions for parent accounts ([#10005](https://github.com/linode/manager/pull/10005))
- Update top menu for parent, child, and proxy accounts ([#10014](https://github.com/linode/manager/pull/10014))
- Add AGLB Service Target Section to Full Create Flow ([#9965](https://github.com/linode/manager/pull/9965))
- Change AGLB Rule Session Stickiness unit from milliseconds to seconds ([#9969](https://github.com/linode/manager/pull/9969))
- Improve AGLB selects and other UX ([#9975](https://github.com/linode/manager/pull/9975))
- Ability to choose a single Compute Region ID (e.g., us-east) in Create Object Storage Bucket drawer ([#9976](https://github.com/linode/manager/pull/9976))
- Add mocks and update queries for new Parent/Child endpoints ([#9977](https://github.com/linode/manager/pull/9977))
- Replace NodeBalancer detail charts with Recharts ([#9983](https://github.com/linode/manager/pull/9983))
- Revised copy for Private IP add-on in Linode Create flow ([#9990](https://github.com/linode/manager/pull/9990))
- Add `child_account` oauth scope to Personal Access Token drawers ([#9992](https://github.com/linode/manager/pull/9992))
- Add AGLB Routes section of full create page ([#9997](https://github.com/linode/manager/pull/9997))

## [2023-12-11] - v1.108.0

### Added:

- Ensure EU consent box shows for new European countries ([#9901](https://github.com/linode/manager/pull/9901))
- NodeBalancer support for Firewalls ([#9760](https://github.com/linode/manager/pull/9760))
- Implement DC Get Well disabled regions in RegionSelect ([#9907](https://github.com/linode/manager/pull/9907), [#9909](https://github.com/linode/manager/pull/9909), [#9943](https://github.com/linode/manager/pull/9943), [#9945](https://github.com/linode/manager/pull/9945), [#9953](https://github.com/linode/manager/pull/9953))

### Changed:

- Improve MainConcept Transcoders Marketplace app name, description, and website ([#9858](https://github.com/linode/manager/pull/9858))
- Move Linode Details Add/Edit Config button alignment to the right ([#9925](https://github.com/linode/manager/pull/9925))
- Add pricing Docs Link to create/clone flows and remove DC-specific pricing warning notice ([#9946](https://github.com/linode/manager/pull/9946))
- Update MainConcept app names to include “Demo” ([#9950](https://github.com/linode/manager/pull/9950))

### Fixed:

- Overflow for VPC and StackScript detail descriptions and cut off placeholder text in VPC search bar ([#9887](https://github.com/linode/manager/pull/9887))
- Missing region ID param in Linode Detail clone action menu item ([#9888](https://github.com/linode/manager/pull/9888))
- Linode Network Transfer History graph back button incorrectly appearing to be disabled ([#9900](https://github.com/linode/manager/pull/9900))
- 'Oh snap' errors from MSW ([#9910](https://github.com/linode/manager/pull/9910))
- `TableCell` with `ActionMenu` incorrect size and border placement ([#9915](https://github.com/linode/manager/pull/9915))
- Images landing page guide section title typo ([#9930](https://github.com/linode/manager/pull/9930))
- `TableCell` styling for `ActionMenu`s ([#9954](https://github.com/linode/manager/pull/9954))

### Removed:

- `dcSpecificPricing` and `objDcSpecificPricing` feature flags ([#9881](https://github.com/linode/manager/pull/9881))

### Tech Stories:

- Refactor `RegionSelect` to use `Autocomplete` ([#9873](https://github.com/linode/manager/pull/9873))
- Clean up App.tsx ([#9897](https://github.com/linode/manager/pull/9897))
- Update `axios` to `1.6.1` ([#9911](https://github.com/linode/manager/pull/9911))
- Remove unused container files ([#9928](https://github.com/linode/manager/pull/9928))
- MUI v5 Migration - `SRC > Components > Breadcrumb` ([#9877](https://github.com/linode/manager/pull/9877))
- MUI v5 Migration - `SRC > Features > Support` ([#9882](https://github.com/linode/manager/pull/9882))
- MUI v5 Migration - `SRC > Components > EditableInput` ([#9884](https://github.com/linode/manager/pull/9884))
- NodeBalancer Config Node - Remove one-off-styled Chip ([#9883](https://github.com/linode/manager/pull/9883))
- Toggle v7 story migration ([#9905](https://github.com/linode/manager/pull/9905))
- EnhancedSelect and RegionSelect stories cleanup ([#9906](https://github.com/linode/manager/pull/9906))
- Dismissible Banner Storybook v7 story migration ([#9932](https://github.com/linode/manager/pull/9932))
- Tabs Storybook v7 story migration ([#9937](https://github.com/linode/manager/pull/9937))
- Tile and ShowMoreExpansion Storybook v7 story migration ([#9913](https://github.com/linode/manager/pull/9913))
- ActionMenu Storybook v7 story migration ([#9927](https://github.com/linode/manager/pull/9927))
- TopMenu and TagsList Storybook v7 story migration ([#9948](https://github.com/linode/manager/pull/9948))
- SideMenu & UserMenu Storybook v7 story migration ([#9956](https://github.com/linode/manager/pull/9956))
- Payment Method Row Storybook v7 story migration ([#9958](https://github.com/linode/manager/pull/9958))
- Use `LinodeSelect` and `NodeBalancerSelect` components for Firewall create drawer ([#9886](https://github.com/linode/manager/pull/9886))

### Tests:

- Remove `dcSpecificPricing` and `objDcSpecificPricing` feature flags ([#9881](https://github.com/linode/manager/pull/9881))
- Update tests for DC-specific pricing docs link ([#9946](https://github.com/linode/manager/pull/9946))
- Upgrade Cypress from 13.4.0 to 13.5.0 ([#9892](https://github.com/linode/manager/pull/9892))
- Improve stability for Longview, Rebuild, and Rescue tests ([#9902](https://github.com/linode/manager/pull/9902))
- Code coverage implementation ([#9917](https://github.com/linode/manager/pull/9917))
- Add unit tests and additional integration test for VPC delete dialog ([#9920](https://github.com/linode/manager/pull/9920))
- Add AGLB Configuration create and delete e2e tests ([#9924](https://github.com/linode/manager/pull/9924))
- Add maintenance mode integration test ([#9934](https://github.com/linode/manager/pull/9934))
- Combine billing cypress tests ([#9940](https://github.com/linode/manager/pull/9940))
- Add account cancellation UI tests ([#9952](https://github.com/linode/manager/pull/9952))
- Fix warm resize test by updating notice text ([#9972](https://github.com/linode/manager/pull/9972))
- Add integration tests for VPC assign/unassign flows ([#9818](https://github.com/linode/manager/pull/9818))

### Upcoming Features:

- Add AGLB create flow Stepper details content ([#9849](https://github.com/linode/manager/pull/9849))
- Add AGLB Configuration Create Flow ([#9870](https://github.com/linode/manager/pull/9870))
- Add AGLB Feedback Link ([#9885](https://github.com/linode/manager/pull/9885))
- Add AGLB copy and docs links ([#9908](https://github.com/linode/manager/pull/9908))
- Add AGLB Service Target `protocol` field in Create/Edit Service Target drawer and "Protocol" column to Service Targets table ([#9891](https://github.com/linode/manager/pull/9891))
- Add AGLB Configuration e2e tests, improve error handling, and improve UX ([#9941](https://github.com/linode/manager/pull/9941))
- Add AGLB copy changes and improvements ([#9954](https://github.com/linode/manager/pull/9954))
- Fix AGLB Configuration creation by fixing port type and other refinement ([#9903](https://github.com/linode/manager/pull/9903))
- Add `parentChildAccountAccess` feature flag ([#9919](https://github.com/linode/manager/pull/9919))
- Update existing user account and grant factories and mocks for Parent/Child account switching ([#9942](https://github.com/linode/manager/pull/9942))
- Add new grants and React Query queries for Parent/Child account switching ([#9944](https://github.com/linode/manager/pull/9944))
- Add `Reboot Needed` status for Linodes assigned to VPCs ([#9893](https://github.com/linode/manager/pull/9893))
- Indicate unrecommended Linode configurations on VPC Detail page ([#9914](https://github.com/linode/manager/pull/9914))
- Tweak VPC landing page empty state copy and add resource links ([#9951](https://github.com/linode/manager/pull/9951))
- Display warning notices for unrecommended configurations in Linode Add/Edit Config dialog ([#9916](https://github.com/linode/manager/pull/9916))
- Disable Public IP Address for VPC-only Linodes in the Linode's details page ([#9899](https://github.com/linode/manager/pull/9899))
- Update copy on VPC Create page ([#9962](https://github.com/linode/manager/pull/9962))
- Update VPC-related copy for Reboot Needed tooltip ([#9966](https://github.com/linode/manager/pull/9966))
- Update copy for VPC Panel in Linode Create flow and VPC-related copy in Linode Add/Edit Config dialog ([#9968](https://github.com/linode/manager/pull/9968))
- Create feature flag to support OBJ Multi Cluster UI changes ([#9970](https://github.com/linode/manager/pull/9970))
- Replace Linode Network Transfer History chart with Recharts ([#9938](https://github.com/linode/manager/pull/9938))

## [2023-11-13] - v1.107.0

### Changed:

- Logic governing inclusion of public interfaces in Linode Create payload ([#9834](https://github.com/linode/manager/pull/9834))
- Improve layout of breadcrumb for support tickets ([#9855](https://github.com/linode/manager/pull/9855))
- Logic governing display of Network Interfaces/Networking section in Linode Config dialog ([#9868](https://github.com/linode/manager/pull/9868))
- Temporarily remove region sorting on DBaaS landing page ([#9861](https://github.com/linode/manager/pull/9861))

### Fixed:

- Linodes Landing flickering ([#9836](https://github.com/linode/manager/pull/9836))
- Faux-bold font rendering ([#9843](https://github.com/linode/manager/pull/9843))
- Incorrect docs links for Main Concept and Simplex Marketplace apps ([#9854](https://github.com/linode/manager/pull/9854))
- Select Backup grid layout ([#9862](https://github.com/linode/manager/pull/9862))

### Tech Stories:

- `Tag` Component v7 story migration ([#9840](https://github.com/linode/manager/pull/9840))
- `BetaChip` Component v7 story migration ([#9864](https://github.com/linode/manager/pull/9864))
- MUI Migration - `SRC > Components > Crumbs` ([#9841](https://github.com/linode/manager/pull/9841))
- Clean up app entrypoint render logic ([#9844](https://github.com/linode/manager/pull/9844))
- Fix Safari LaunchDarkly MSW Errors ([#9863](https://github.com/linode/manager/pull/9863))

### Tests:

- Add DBaaS test coverage for disk metrics ([#9833](https://github.com/linode/manager/pull/9833))
- Improve Cypress rescue and rebuild test stability ([#9867](https://github.com/linode/manager/pull/9867))
- Upgrade Cypress to v13.x ([#9874](https://github.com/linode/manager/pull/9874))
- Add integration tests for AGLB certificate edit flow ([#9880](https://github.com/linode/manager/pull/9880))
- Add integration tests for AGLB certificate delete flow ([#9846](https://github.com/linode/manager/pull/9846))

### Upcoming Features:

- Fix Unassign multiple Linodes from Subnet ([#9820](https://github.com/linode/manager/pull/9820))
- `RemovableSelectionsList` default maximum height and overflow scroll ([#9827](https://github.com/linode/manager/pull/9827))
- VPC UX feedback ([#9832](https://github.com/linode/manager/pull/9832))
- Remove temporary code for surfacing VPC interface errors and fix formatting of error in Linode Config dialog ([#9839](https://github.com/linode/manager/pull/9839))
- Refine payload in subnet "Assign Linodes" drawer ([#9845](https://github.com/linode/manager/pull/9845))
- Add Create VPC drawer to Linode Create flow and update Create Firewall button width ([#9847](https://github.com/linode/manager/pull/9847))
- Only unassign linodes in the 'Linodes to be Unassigned from Subnet' list for Subnet Unassign Drawer ([#9851](https://github.com/linode/manager/pull/9851))
- Clear subnet errors in Linode Create flow and VPC label errors in VPC Edit flow upon input change ([#9857](https://github.com/linode/manager/pull/9857))
- Fix IPv4 checkboxes for VPC interfaces in Linode Config dialog ([#9865](https://github.com/linode/manager/pull/9865))
- Fix incorrectly displayed error text in Linode Edit/Add config flow and prevent subnet section from incorrectly clearing in Linode Edit/Add Config and Linode Create flow ([#9866](https://github.com/linode/manager/pull/9866))
- Linode Details: VPC Subnets Not Associated with VPC IP Address Are Displayed ([#9872](https://github.com/linode/manager/pull/9872))
- Add VPC BETA Feedback link to VPC landing and detail pages ([#9879](https://github.com/linode/manager/pull/9879))
- Add `dcGetWell` feature flag ([#9859](https://github.com/linode/manager/pull/9859))
- Add RQ queries and mock data for DC Get Well ([#9860](https://github.com/linode/manager/pull/9860))
- Add RQ queries and mock data for Sold Out Plans ([#9878](https://github.com/linode/manager/pull/9878))
- Add basic AGLB create page and feature flag ([#9856](https://github.com/linode/manager/pull/9856))
- Add AGLB create page with Actions buttons ([#9825](https://github.com/linode/manager/pull/9825))
- Manage state in Create Load Balancer flow ([#9848](https://github.com/linode/manager/pull/9848))
- AGLB Configurations Add Route Drawer and other refinements ([#9853](https://github.com/linode/manager/pull/9853))
- Add missing label field validation in AGLB Edit Certificate drawer ([#9880](https://github.com/linode/manager/pull/9880))

## [2023-10-30] - v1.106.0

### Added:

- October Marketplace apps ([#9771](https://github.com/linode/manager/pull/9771))
- Last log in and TFA status to Users & Grants page ([#9810](https://github.com/linode/manager/pull/9810))
- Dynamic price error handling for DC-specific pricing ([#9660](https://github.com/linode/manager/pull/9660))

### Changed:

- Linode Create error placement ([#9788](https://github.com/linode/manager/pull/9788))
- Firewall Create Drawer opens in the same tab in the Linode Create Flow ([#9785](https://github.com/linode/manager/pull/9785))

### Fixed:

- Quote variable in changeset shell command ([#9791](https://github.com/linode/manager/pull/9791))
- Primary nav DBaaS menu item flicker on page load ([#9808](https://github.com/linode/manager/pull/9808))
- Excess spacing above and below Linode CLI help text in Upload Image form ([#9812](https://github.com/linode/manager/pull/9812))
- Only show regions that support Databases on the Database Create page ([#9815](https://github.com/linode/manager/pull/9815))
- Footer styles on small viewports ([#9823](https://github.com/linode/manager/pull/9823))
- Rendering of unsanitized titles in event notification popup and support tickets ([#9826](https://github.com/linode/manager/pull/9826))
- CreateCluster form label styles and layout ([#9835](https://github.com/linode/manager/pull/9835))

### Tech Stories:

- Rename isPropValid utility ([#9790](https://github.com/linode/manager/pull/9790))
- Migrate NodeBalancer Node Mode Select TextField to Autocomplete ([#9754](https://github.com/linode/manager/pull/9754))
- Migrate UserDefinedSelect from a TextField Select to an Autocomplete ([#9756](https://github.com/linode/manager/pull/9756))
- Create Stack component ([#9830](https://github.com/linode/manager/pull/9830))
- MUI v5 Migration - `SRC > Features > StackScripts` pt1 ([#9773](https://github.com/linode/manager/pull/9773))
- Clean up `src/utilities` exports ([#9783](https://github.com/linode/manager/pull/9783))
- MUI v5 Migration - `SRC > Features > StackScripts` pt 2 ([#9786](https://github.com/linode/manager/pull/9786))
- MUI v5 Migration - `SRC > Features > Users` ([#9748](https://github.com/linode/manager/pull/9748))

### Tests:

- Improve error message display when Linode API error occurs in Cypress test ([#9777](https://github.com/linode/manager/pull/9777))
- Improve Linode config edit test stability ([#9781](https://github.com/linode/manager/pull/9781))
- Improve LKE create test reattempt stability ([#9782](https://github.com/linode/manager/pull/9782))
- Clean up Jest warnings and errors ([#9784](https://github.com/linode/manager/pull/9784))
- Fix DBaaS UI test failures stemming from API update ([#9801](https://github.com/linode/manager/pull/9801))
- Refactor Cypress Firewall migration tests ([#9807](https://github.com/linode/manager/pull/9807))
- Skip affected tests when Managed is enabled on test accounts ([#9809](https://github.com/linode/manager/pull/9809))
- Make `ConfigureForm.test.tsx` Vitest compatible ([#9816](https://github.com/linode/manager/pull/9816))

### Upcoming Features:

- Helper text for DC-specific pricing Object Storage overages ([#9813](https://github.com/linode/manager/pull/9813))
- Support VPCs in Add/Edit Linode Config dialog ([#9709](https://github.com/linode/manager/pull/9709))
- Properly support new shapes of `Subnet` and `Interface` return objects ([#9824](https://github.com/linode/manager/pull/9824))
- Only show regions that support VPCs in VPC Create page ([#9787](https://github.com/linode/manager/pull/9787))
- Invalidate VPC-related queries when deleting a Linode ([#9814](https://github.com/linode/manager/pull/9814))
- Add AGLB Routes - Rule Edit Drawer ([#9778](https://github.com/linode/manager/pull/9778))
- Add AGLB Edit Service Target drawer ([#9800](https://github.com/linode/manager/pull/9800))
- Add AGLB Rule Delete Dialog ([#9804](https://github.com/linode/manager/pull/9804))
- Add AGLB Create Route Drawer ([#9806](https://github.com/linode/manager/pull/9806))
- Add AGLB Edit Route Drawer ([#9822](https://github.com/linode/manager/pull/9822))
- Add Rule Index to AGLB Rule Table ([#9838](https://github.com/linode/manager/pull/9838))

## [2023-10-16] - v1.105.0

### Added:

- Statically Cache Marketplace Apps ([#9732](https://github.com/linode/manager/pull/9732))
- Link `contact Support` text in notices to support ticket modal ([#9770](https://github.com/linode/manager/pull/9770))

### Changed:

- Comment out CS:GO app pending update ([#9753](https://github.com/linode/manager/pull/9753))

### Fixed:

- Add Firewall and Linode Configuration success toast notifications ([#9725](https://github.com/linode/manager/pull/9725))
- Long drawer titles overlapping close icon ([#9731](https://github.com/linode/manager/pull/9731))
- Removed `title` prop forwarding on Modals/Dialogs ([#9739](https://github.com/linode/manager/pull/9739))
- Fixed the top spacing for the NodeBalancer empty state page ([#9746](https://github.com/linode/manager/pull/9746))
- Notice scroll-to-view behavior and styling regressions ([#9755](https://github.com/linode/manager/pull/9755))
- Display Database menu items in side nav and Create dropdown for permissioned users ([#9762](https://github.com/linode/manager/pull/9762))
- Customer success Hively overlap issue ([#9776](https://github.com/linode/manager/pull/9776))
- Inconsistent display of % in Linode Details MNTP legend ([#9780](https://github.com/linode/manager/pull/9780))

### Tech Stories:

- Disable Sentry Performance Tracing ([#9745](https://github.com/linode/manager/pull/9745))
- Migrate Filesystem TextField Select to Autocomplete ([#9752](https://github.com/linode/manager/pull/9752))
- MUI v5 Migration - `SRC > Features > Lish` ([#9774](https://github.com/linode/manager/pull/9774))

### Tests:

- Added Cypress integration test for Edit Subnet flow ([#9728](https://github.com/linode/manager/pull/9728))
- Cypress tests for VPC create flows ([#9730](https://github.com/linode/manager/pull/9730))

### Upcoming Features:

- Subnet Unassign Linodes Drawer ([#9703](https://github.com/linode/manager/pull/9703))
- Add AGLB Route Delete Dialog ([#9735](https://github.com/linode/manager/pull/9735))
- Add Drag and Drop support to the Load Balancer Rules Table ([#9736](https://github.com/linode/manager/pull/9736))
- Make Reboot Linodes dismissible banner on VPC Details page unique for each VPC ([#9743](https://github.com/linode/manager/pull/9743))
- Showcase VPC feedback ([#9751](https://github.com/linode/manager/pull/9751))
- Persistent error messages for Region, Label, and Description fields in VPC Create flow ([#9750](https://github.com/linode/manager/pull/9750))
- Ability to choose resize types when resizing Linode ([#9677](https://github.com/linode/manager/pull/9677))
- Add AGLB "Edit Certificate" drawer ([#9723](https://github.com/linode/manager/pull/9723))

## [2023-10-02] - v1.104.1

### Fixed:

- Add disabled Tokyo RegionSelect menu entry ([#9758](https://github.com/linode/manager/pull/9758))
- Display DC-specific monthly prices to two decimal places and hide blank Region column on past invoices ([#9759](https://github.com/linode/manager/pull/9759))

## [2023-10-02] - v1.104.0

### Added:

- Breadcrumb header and other improvements to Volumes Create ([#9720](https://github.com/linode/manager/pull/9720))

### Fixed:

- Back link and CSV download button accessibility on Billing Detail page ([#9697](https://github.com/linode/manager/pull/9697))
- Missing ARIA label for backup notification dismissal button ([#9699](https://github.com/linode/manager/pull/9699))
- Payment confirmation number covered in Payment Receipts ([#9702](https://github.com/linode/manager/pull/9702))
- Overly permissive regex in One Click Apps flow ([#9704](https://github.com/linode/manager/pull/9704))
- Styling issues in kubeconfig dialog ([#9705](https://github.com/linode/manager/pull/9705))
- Account Users "Add A User" button alignment ([#9721](https://github.com/linode/manager/pull/9721))
- "Cancel" button in Database Access Controls drawer incorrectly having a loading state ([#9722](https://github.com/linode/manager/pull/9722))
- Missing button labels in Delete SSH Key dialog and Clone Domain drawer ([#9726](https://github.com/linode/manager/pull/9726))

### Tech Stories:

- De-Redux-ify and clean up the Volumes Drawer ([#9601](https://github.com/linode/manager/pull/9601))
- MUI v5 Migration - `SRC > Features > Longview` Pt2: Longview Landing and Longview root packages ([#9612](https://github.com/linode/manager/pull/9612))
- Fix TPAProviders invalid prop on a DOM element console errors ([#9698](https://github.com/linode/manager/pull/9698))
- Fix CodeQL warning with analytics.ts custom event payload ([#9700](https://github.com/linode/manager/pull/9700))
- Add feature flag handling for DBaaS create menu item ([#9706](https://github.com/linode/manager/pull/9706))

### Upcoming Features:

- Add AGLB details - Routes Tab ([#9593](https://github.com/linode/manager/pull/9593))
- Update AGLB Certificates UI ([#9711](https://github.com/linode/manager/pull/9711))
- Add AGLB Create Service Target Drawer ([#9657](https://github.com/linode/manager/pull/9657))
- VPC and Firewall assignment within Linode Create flow ([#9635](https://github.com/linode/manager/pull/9635))
- Only show IPv4s specific to a linode-subnet relationship in a linode's row on VPC details page ([#9710](https://github.com/linode/manager/pull/9710))
- Updates to Create VPC based on feedback ([#9718](https://github.com/linode/manager/pull/9718))
- Subnet Assign Linodes Drawer and new list component, `RemovableSelectionsList` ([#9687](https://github.com/linode/manager/pull/9687))
- Add beta notice for DC-specific pricing to Object Storage ([#9654](https://github.com/linode/manager/pull/9654))
- Update DC Specific Pricing Notices ([#9690](https://github.com/linode/manager/pull/9690))
- Update Monthly Network Transfer Pool dialog copy and typography ([#9692](https://github.com/linode/manager/pull/9692))

## [2023-09-22] - v1.103.0

### Change:

- Remove Beta chip from Add User Data accordion ([#9712](https://github.com/linode/manager/pull/9712))

## [2023-09-18] - v1.102.0

### Added:

- Configuration Profiles docs link to Linode Details Configurations tab ([#9658](https://github.com/linode/manager/pull/9658))

### Fixed:

- Stuck LKE node pools when HA Control Plane is unavailable for self-hosting Cloud Manager users ([#9558](https://github.com/linode/manager/pull/9558))
- Longview styling regressions ([#9619](https://github.com/linode/manager/pull/9619))
- Typo in 'Confirm Ticket Close' modal ([#9639](https://github.com/linode/manager/pull/9639))
- Selected state of Longview processes table ([#9643](https://github.com/linode/manager/pull/9643))
- Typo in NodeBalancer landing table column header ([#9648](https://github.com/linode/manager/pull/9648))
- Metadata CLI command ([#9665](https://github.com/linode/manager/pull/9665))
- Billing Contact UI regression caused by MUI Update ([#9667](https://github.com/linode/manager/pull/9667))
- Panels alignment in NodeBalancer create flow ([#9673](https://github.com/linode/manager/pull/9673))
- Misplaced helper text and static copy in Linode Create Volume drawer ([#9683](https://github.com/linode/manager/pull/9683))
- Redis trademark changes ([#9694](https://github.com/linode/manager/pull/9694))

### Tech Stories:

- Add Autocomplete component ([#9497](https://github.com/linode/manager/pull/9497))
- MUI v5 Migration - `SRC > Features > EntityTransfers` ([#9582](https://github.com/linode/manager/pull/9582))
- MUI v5 Migration - `SRC > Features > Longview` Pt1: Longview Detail ([#9600](https://github.com/linode/manager/pull/9600))

### Upcoming Features:

- Add VPC-related permissions, capabilities, and grants ([#9585](https://github.com/linode/manager/pull/9585))
- Add VPC data in Linode Detail header ([#9645](https://github.com/linode/manager/pull/9645))
- Add VPC Create Subnet drawer ([#9652](https://github.com/linode/manager/pull/9652))
- Add VPC Delete Subnet dialog ([#9640](https://github.com/linode/manager/pull/9640))
- Add VPC filter subnets field ([#9647](https://github.com/linode/manager/pull/9647))
- Populate VPC Subnets table with data ([#9599](https://github.com/linode/manager/pull/9599))
- Standardize "region" and "data center" copy for DC-specific pricing ([#9670](https://github.com/linode/manager/pull/9670))
- Removed VPC column from Linodes landing page table ([#9625](https://github.com/linode/manager/pull/9625))
- Improved VPC Create validation for subnets ([#9659](https://github.com/linode/manager/pull/9659))
- Add DC-specific pricing Invoice support ([#9597](https://github.com/linode/manager/pull/9597))
- Add DC-specific pricing Linode Create support ([#9598](https://github.com/linode/manager/pull/9598))
- Add DC-specific pricing to Kubernetes node pools ([#9606](https://github.com/linode/manager/pull/9606))
- Add DC-specific transfer pools and linode usage displays ([#9620](https://github.com/linode/manager/pull/9620))
- Add Region label to DC-specific pricing invoices ([#9663](https://github.com/linode/manager/pull/9663))
- Add AGLB Details - Configuration Tab ([#9591](https://github.com/linode/manager/pull/9591))
- Add AGLB Certificate Delete Dialog ([#9666](https://github.com/linode/manager/pull/9666))
- Add AGLB Certificate Create Drawer ([#9616](https://github.com/linode/manager/pull/9616))
- Add AGLB Configuration Delete Dialog ([#9675](https://github.com/linode/manager/pull/9675))
- Add DBaaS disk size and used size fields to Database Summary ([#9638](https://github.com/linode/manager/pull/9638))

## [2023-09-07] - v1.101.1

### Fixed:

- Restricted users unable to edit Firewall after creation ([#9637](https://github.com/linode/manager/pull/9637))

## [2023-09-05] - v1.101.0

### Added:

- September marketplace release ([#9596](https://github.com/linode/manager/pull/9596))

### Fixed:

- Longview crashing the app with a negative number of CPU cores ([#9563](https://github.com/linode/manager/pull/9563))
- CopyTooltip hover state in Linode Summary ([#9587](https://github.com/linode/manager/pull/9587))
- Metadata Image select dropdown ([#9592](https://github.com/linode/manager/pull/9592))
- Hide User Data accordion in Linode Rebuild dialog for unsupported regions ([#9602](https://github.com/linode/manager/pull/9602))

### Tech Stories:

- Add Product Information Banners for all product landing pages ([#9523](https://github.com/linode/manager/pull/9523))
- MUI v5 migration - `SRC > Features > ToastNotifications` ([#9555](https://github.com/linode/manager/pull/9555))
- MUI v5 Migration - `SRC > Features > GlobalNotifications` ([#9561](https://github.com/linode/manager/pull/9561))
- MUI v5 Migration - `SRC > Features > Events` ([#9565](https://github.com/linode/manager/pull/9565))
- Make feature flag dev tools show reality ([#9567](https://github.com/linode/manager/pull/9567))
- Update Material UI and Emotion ([#9603](https://github.com/linode/manager/pull/9603))

### Upcoming Features:

- Add AGLB Create Page - Stepper component ([#9520](https://github.com/linode/manager/pull/9520))
- VPC Create page ([#9537](https://github.com/linode/manager/pull/9537))
- VPC detail summary ([#9549](https://github.com/linode/manager/pull/9549))
- Add AGLB landing page ([#9556](https://github.com/linode/manager/pull/9556))
- Introduce dynamic pricing utils and constants ([#9564](https://github.com/linode/manager/pull/9564))
- Add DC Specific Pricing to NodeBalancer Create ([#9566](https://github.com/linode/manager/pull/9566))
- Add DC-specific pricing to Kubernetes HA ([#9568](https://github.com/linode/manager/pull/9568))
- Add DC dynamic pricing information for Linode migration flow ([#9570](https://github.com/linode/manager/pull/9570))
- Add DC Specific Pricing Notices and Docs Links ([#9572](https://github.com/linode/manager/pull/9572))
- Add AGLB Details - Certificate Tab ([#9576](https://github.com/linode/manager/pull/9576))
- Add AGLB Details - Service Targets Tab ([#9577](https://github.com/linode/manager/pull/9577))
- Fix volume e2e test and dc specific price unit test ([#9578](https://github.com/linode/manager/pull/9578))
- Add AGLB Details - Settings Tab ([#9583](https://github.com/linode/manager/pull/9583))
- Add Collapsible Table Component ([#9584](https://github.com/linode/manager/pull/9584))
- Update mocks for DC-specific pricing API responses ([#9586](https://github.com/linode/manager/pull/9586))
- Add DC-specific pricing to Linode backups ([#9588](https://github.com/linode/manager/pull/9588))
- Details for betas and ability to enroll in betas ([#9544](https://github.com/linode/manager/pull/9544))
- Support for VPC and subnet events ([#9530](https://github.com/linode/manager/pull/9530))
- Added DC specific pricing to Volumes create flows ([#9569](https://github.com/linode/manager/pull/9569))
- Update header from “Subnet” to “Subnets” in VPC Create flow ([#9604](https://github.com/linode/manager/pull/9604))

## [2023-08-30] - v1.100.2

### Fixed:

- Extra API calls for Linode Configs ([#9609](https://github.com/linode/manager/pull/9609))

## [2023-08-22] - v1.100.1

### Fixed:

- Incorrect timezone form styles on profile page ([#9573](https://github.com/linode/manager/pull/9573))
- Create Linode from Stackscript field state bug ([#9573](https://github.com/linode/manager/pull/9573))

## [2023-08-21] - v1.100.0

### Added:

- Firewalls table to Linode Details > “Network” tab ([#9470](https://github.com/linode/manager/pull/9470))

### Changed:

- Strip whitespace on blur for username and email text fields ([#9463](https://github.com/linode/manager/pull/9463))
- Move Kubernetes HA Control Plane selection from checkout bar to create form ([#9489](https://github.com/linode/manager/pull/9489))

### Fixed:

- Alignment issue on Service Transfers page ([#9491](https://github.com/linode/manager/pull/9491))
- Broken K8 node pools display with infinite scrolling ([#9509](https://github.com/linode/manager/pull/9509))
- Collision caused by IPv6 address in the FW Rules Table ([#9510](https://github.com/linode/manager/pull/9510))
- Inconsistent Node Pool Summary price font family ([#9512](https://github.com/linode/manager/pull/9512))
- Persistent OAuth client inputs after canceling or submitting ([#9515](https://github.com/linode/manager/pull/9515))
- Disabled Select tooltip hover ([#9518](https://github.com/linode/manager/pull/9518))
- Styling syntax error with EnhancedSelectFields ([#9521](https://github.com/linode/manager/pull/9521))
- Circular dependency and blur behaviors on main search field ([#9534](https://github.com/linode/manager/pull/9534))
- Incorrect redirect to DBaaS instance details page upon create ([#9547](https://github.com/linode/manager/pull/9547))
- Hively icons showing external link icons ([#9548](https://github.com/linode/manager/pull/9548))
- Crash when resizing a Linode under a user’s reputation score ([#9550](https://github.com/linode/manager/pull/9550))
- Firewalls breadcrumb containing the firewall id ([#9554](https://github.com/linode/manager/pull/9554))

### Tech Stories:

- Clean up Profile Settings ([#9482](https://github.com/linode/manager/pull/9482))
- Finish deprecating the `core` folder and clean up components ([#9488](https://github.com/linode/manager/pull/9488))
- Add event messages story and playground ([#9516](https://github.com/linode/manager/pull/9516))
- Refactor Backups Drawer ([#9517](https://github.com/linode/manager/pull/9517))
- Clean up withRouter usage ([#9522](https://github.com/linode/manager/pull/9522))
- Clean up how dev tools are initialized ([#9525](https://github.com/linode/manager/pull/9525))
- Replaced deprecated keycodes ([#9527](https://github.com/linode/manager/pull/9527))
- MUI v5 Migration - `SRC > Features > TopMenu` ([#9498](https://github.com/linode/manager/pull/9498))
- MUI v5 Migration - `SRC > Features > Linodes pt2` ([#9501](https://github.com/linode/manager/pull/9501))
- MUI v5 Migration - `SRC > Features > Search` ([#9532](https://github.com/linode/manager/pull/9532))
- Make UserMenu use MUI instead of Reach UI ([#9533](https://github.com/linode/manager/pull/9533))
- Make ActionMenu use MUI instead of Reach UI ([#9540](https://github.com/linode/manager/pull/9540))
- Duplicate key error on Linode and NodeBalancer Landing ([#9543](https://github.com/linode/manager/pull/9543))

### Upcoming Features:

- Add AGLB empty state ([#9462](https://github.com/linode/manager/pull/9462))
- Update AGLB API endpoints ([#9496](https://github.com/linode/manager/pull/9496))
- Add AGLB Details - Summary Page ([#9551](https://github.com/linode/manager/pull/9551))
- Add Betas Landing page ([#9465](https://github.com/linode/manager/pull/9465))
- Add VPC column to linodes landing page table ([#9485](https://github.com/linode/manager/pull/9485))
- Add VPC delete dialog ([#9490](https://github.com/linode/manager/pull/9490))
- Add VPC Edit drawer ([#9528](https://github.com/linode/manager/pull/9528))
- Swap VLAN and User Data order in Linode Create ([#9492](https://github.com/linode/manager/pull/9492))
- Remove customer tag check for Metadata ([#9546](https://github.com/linode/manager/pull/9546))

## [2023-08-11] - v1.99.1

### Fixed:

Unescape encoding for user data ([#9536](https://github.com/linode/manager/pull/9536))

## [2023-08-07] - v1.99.0

### Added:

- Ability to sort Databases by Region and Engine ([#9433](https://github.com/linode/manager/pull/9433))

### Changed:

- NodeBalancers can be created without a configuration ([#9472](https://github.com/linode/manager/pull/9472))
- Renamed `Premium` to `Premium CPU` in plans tables ([#9484](https://github.com/linode/manager/pull/9484))

### Fixed:

- Make drawers full width on mobile viewports ([#9427](https://github.com/linode/manager/pull/9427))
- Inconsistent styling and clipped copy tooltip on OBJ bucket details page ([#9430](https://github.com/linode/manager/pull/9430))
- Remove markup from Help & Support landing search results ([#9456](https://github.com/linode/manager/pull/9456))
- Create Firewall drawer input persisting after firewall creation or cancellation ([#9459](https://github.com/linode/manager/pull/9459))
- Redirect the user back to `/linodes` when Linode is deleted from Linode Details ([#9469](https://github.com/linode/manager/pull/9469))
- Add Gopaddle & re-add Wazuh Marketplace apps ([#9473](https://github.com/linode/manager/pull/9473))
- Enhanced Select fields text cut off at bottom ([#9479](https://github.com/linode/manager/pull/9479))

### Removed:

- Linodes Redux store ([#9421](https://github.com/linode/manager/pull/9421))

### Tech Stories:

- Improve reusability for ActionPanel component ([#9341](https://github.com/linode/manager/pull/9341))
- Migrate LinodeSelect to LinodeSelect ([#9396](https://github.com/linode/manager/pull/9396))
- Refactor Link and deprecate ExternalLink ([#9411](https://github.com/linode/manager/pull/9411))
- Optimize Linode event handlers and query invalidation ([#9451](https://github.com/linode/manager/pull/9451))
- LinodeSelect - Allow fully custom noOptionsText ([#9452](https://github.com/linode/manager/pull/9452))
- React Query queries for Linode Configs ([#9418](https://github.com/linode/manager/pull/9418))
- Resolve open dependabot alerts and clean up packages ([#9425](https://github.com/linode/manager/pull/9425))
- Remove Bluebird.js as a dependency ([#9455](https://github.com/linode/manager/pull/9455))
- Clean up exports of src/hooks/ ([#9457](https://github.com/linode/manager/pull/9457))
- Update Storybook Categories ([#9458](https://github.com/linode/manager/pull/9458))
- Fix <LinodeSelect /> bugs ([#9464](https://github.com/linode/manager/pull/9464))
- Decrease Sentry capture rate ([#9487](https://github.com/linode/manager/pull/9487))
- MUI v5 Migration - `SRC > Components > TableFooter` ([#9412](https://github.com/linode/manager/pull/9412))
- MUI v5 Migration - `SRC > Components > Dialog` ([#9419](https://github.com/linode/manager/pull/9419))
- MUI v5 Migration - `SRC > Features > Firewalls` ([#9434](https://github.com/linode/manager/pull/9434))
- MUI v5 Migration > `SRC > Features > Linodes Pt 1` ([#9445](https://github.com/linode/manager/pull/9445))
- MUI v5 Migration - `SRC > Components > InputAdornment` ([#9454](https://github.com/linode/manager/pull/9454))
- MUI v5 Migration - `SRC > Components > FormControlLabel` ([#9476](https://github.com/linode/manager/pull/9476))
- MUI v5 Migration - `SRC > Components > Form` ([#9480](https://github.com/linode/manager/pull/9480))
- MUI v5 migration `SRC > Features > Help` ([#9408](https://github.com/linode/manager/pull/9408))

### Upcoming Features:

- VPC landing page ([#9467](https://github.com/linode/manager/pull/9467))
- Add basic routing and files for VPC ([#9474](https://github.com/linode/manager/pull/9474))
- Fix User data input crash ([#9494](https://github.com/linode/manager/pull/9494))

## [2023-07-28] - v1.98.1

### Fixed:

- Region Select order ([#9466](https://github.com/linode/manager/pull/9466))
- Backups Drawer missing plans and prices ([#9466](https://github.com/linode/manager/pull/9466))

## [2023-07-24] - v1.98.0

### Added:

- Hover state on table rows ([#9367](https://github.com/linode/manager/pull/9367))

### Fixed:

- Misleading MNTP percentage for accounts with no active services ([#9362](https://github.com/linode/manager/pull/9362))
- LinodeSelect styling ([#9417](https://github.com/linode/manager/pull/9417))
- Behavior of logo and menu items in SideMenu ([#9431](https://github.com/linode/manager/pull/9431))
- TopMenu bug that prevented tooltips from showing via tab key navigation ([#9371](https://github.com/linode/manager/pull/9371))
- Make "edit" button for images landing page consistent ([#9424](https://github.com/linode/manager/pull/9424))
- Temporarily hide Wazuh Marketplace app ([#9442](https://github.com/linode/manager/pull/9442))

### Tech Stories:

- Improve Sentry's environment identification ([#9428](https://github.com/linode/manager/pull/9428))
- Update Sentry and enable performance monitoring ([#9337](https://github.com/linode/manager/pull/9337))
- RQ-ify Events ([#9416](https://github.com/linode/manager/pull/9416))
- MUI v5 Migration - `SRC > Components > DocumentTitle` ([#9406](https://github.com/linode/manager/pull/9406))
- MUI v5 Migration - `SRC > Components > Paper` ([#9410](https://github.com/linode/manager/pull/9410))
- MUI v5 Migration `SRC > Features > Footer` ([#9415](https://github.com/linode/manager/pull/9415))
- MUI v5 Migration - `SRC > Component > GaugePercent` ([#9420](https://github.com/linode/manager/pull/9420))
- MUI v5 Migration - `SRC > Components > Drawer` ([#9423](https://github.com/linode/manager/pull/9423))
- MUI v5 Migration - `SRC > Components > SectionErrorBoundary` ([#9329](https://github.com/linode/manager/pull/9329))
- Use RQ for isLargeAccount ([#9402](https://github.com/linode/manager/pull/9402))
- MUI v5 Migration - 'SRC > Features > Domains' ([#9403](https://github.com/linode/manager/pull/9403))

### Upcoming Features:

- Set up initial AGLB RQ work with useLoadBalancers ([#9392](https://github.com/linode/manager/pull/9392))
- Add primary navigation AGLB entry (feature flagged & Beta) ([#9404](https://github.com/linode/manager/pull/9404))
- Add LoadBalancer create menu entry (feature flagged & Beta) ([#9405](https://github.com/linode/manager/pull/9405))
- Add skeleton AGLB Service Target landing page and unit tests ([#9397](https://github.com/linode/manager/pull/9397))
- Add initial AGLB routes, folders, pages, and tabs ([#9376](https://github.com/linode/manager/pull/9376))
- React Query queries for VPC Subnets ([#9390](https://github.com/linode/manager/pull/9390))
- Make VLAN section in Linode Create an Accordion ([#9414](https://github.com/linode/manager/pull/9414))
- Queries, server handlers, and factories for self-serve betas ([#9386](https://github.com/linode/manager/pull/9386))

## [2023-07-11] - v1.97.0

### Added:

- Light/dark mode keyboard shortcut copy on "My Settings" page ([#9286](https://github.com/linode/manager/pull/9286))
- Visual outline to some country flags ([#9288](https://github.com/linode/manager/pull/9288))
- Helper text for the Add SSH Key Drawer form ([#9290](https://github.com/linode/manager/pull/9290))
- Improved warning and error messaging for failed backup events ([#9364](https://github.com/linode/manager/pull/9364))

### Changed:

- Update Metadata copy ([#9374](https://github.com/linode/manager/pull/9374))

### Fixed:

- Notification menu crashing older Safari versions ([#9360](https://github.com/linode/manager/pull/9360))
- Confirmation modal overflow on mobile ([#9289](https://github.com/linode/manager/pull/9289))
- Layout issue with Create Access Key Drawer for Object Storage ([#9296](https://github.com/linode/manager/pull/9296))
- LinodeSelectV2 label association ([#9298](https://github.com/linode/manager/pull/9298))
- Missing icons in DBaaS engine selection field ([#9306](https://github.com/linode/manager/pull/9306))
- Disable delete button for public IP addresses if it's the only IP address ([#9332](https://github.com/linode/manager/pull/9332))
- Action Menu tooltip icon color deprecation ([#9352](https://github.com/linode/manager/pull/9352))
- Multiple requests for logo when loading billing invoice PDFs ([#9355](https://github.com/linode/manager/pull/9355))
- Updated wording from “Linode” to “Cloud Manager” ([#9358](https://github.com/linode/manager/pull/9358))
- Volume empty state misspelling of NVMe ([#9366](https://github.com/linode/manager/pull/9366))

### Tech Stories:

- React Query methods for VPC ([#9361](https://github.com/linode/manager/pull/9361))
- Made yarn up:expose actually expose Cloud Manager on all interfaces ([#9297](https://github.com/linode/manager/pull/9297))
- MUI v5 Migration - `Components > InlineMenuAction` ([#9268](https://github.com/linode/manager/pull/9268))
- MUI v5 Migration - `Components > LandingLoading` ([#9282](https://github.com/linode/manager/pull/9282))
- Upgrade LaunchDarkly client library ([#9285](https://github.com/linode/manager/pull/9285))
- MUI v5 Migration - `Components > LongviewLineGraph` ([#9291](https://github.com/linode/manager/pull/9291))
- MUI v5 Migration - `Components > SingleTextFieldForm` ([#9292](https://github.com/linode/manager/pull/9292))
- MUI v5 Migration - `Components > SelectableTableRow` ([#9299](https://github.com/linode/manager/pull/9299))
- MUI v5 Migration - `Components > Chip` ([#9310](https://github.com/linode/manager/pull/9310))
- MUI v5 Migration - `Components > Toolbar` ([#9319](https://github.com/linode/manager/pull/9319))
- MUI v5 Migration - `Components > Accordion` (part 2) ([#9320](https://github.com/linode/manager/pull/9320))
- MUI v5 Migration - `Components > AppBar` ([#9321](https://github.com/linode/manager/pull/9321))
- MUI v5 Migration - `Components > Box` ([#9322](https://github.com/linode/manager/pull/9322))
- MUI v5 Migration - `Components > CopyTooltip` ([#9323](https://github.com/linode/manager/pull/9323))
- MUI v5 Migration - `Components > Button` ([#9325](https://github.com/linode/manager/pull/9325))
- MUI v5 Migration - `Components > Hidden` ([#9326](https://github.com/linode/manager/pull/9326))
- MUI v5 Migration - `Components > SelectionCard` ([#9327](https://github.com/linode/manager/pull/9327))
- MUI v5 Migration - `Components > Typography` ([#9328](https://github.com/linode/manager/pull/9328))
- MUI v5 Migration - `Components > Checkbox` (part 2) ([#9338](https://github.com/linode/manager/pull/9338))
- MUI v5 Migration - `Components > Chip` ([#9339](https://github.com/linode/manager/pull/9339))
- MUI v5 Migration - `Components > Snackbar` ([#9359](https://github.com/linode/manager/pull/9359))
- MUI v5 Migration - `Components > Tooltip` ([#9369](https://github.com/linode/manager/pull/9369))
- MUI v5 Migration - `Components > MenuItem` ([#9295](https://github.com/linode/manager/pull/9295))
- MUI v5 Migration - `Components > Divider` ([#9353](https://github.com/linode/manager/pull/9353))
- Remove old changelog scripting ([#9340](https://github.com/linode/manager/pull/9340))
- Remove `withLoadingAndError` and clean up 2FA components ([#9318](https://github.com/linode/manager/pull/9318))
- Link component: remove default export and improved Storybook story ([#9313](https://github.com/linode/manager/pull/9313))
- Refactor components to use TypeToConfirmDialog ([#9175](https://github.com/linode/manager/pull/9175))

## [2023-06-29] - v1.96.2

### Fixed:

- Issue where Cloud Manager was not displaying all linodes capable of being "cloned" ([#9294](https://github.com/linode/manager/pull/9294))
- Firewall custom ports validation w/ unit tests ([#9336](https://github.com/linode/manager/pull/9336))

### Tech Stories:

- React Query - Linodes - General Refactors ([#9294](https://github.com/linode/manager/pull/9294))

## [2023-06-27] - v1.96.1

### Fixed:

- Crash when viewing notifications due to `null` label in event entity ([#9331](https://github.com/linode/manager/pull/9331))

## [2023-06-26] - v1.96.0

### Added:

- Dynamic Premium Plans support for Linode creation flows ([#9253](https://github.com/linode/manager/pull/9253))
- Dynamic GPU Plans support for Linode creation flows ([#9284](https://github.com/linode/manager/pull/9284))
- Metadata Beta docs links ([#9304](https://github.com/linode/manager/pull/9304))

### Changed:

- Improve Linode Power confirmation dialog layout and UX copy ([#9240](https://github.com/linode/manager/pull/9240))
- Improve Premium plans Tab copy ([#9287](https://github.com/linode/manager/pull/9287))

### Fixed:

- Timestamps for finished events show time of completion instead of start ([#9215](https://github.com/linode/manager/pull/9215))
- Corrected typos in Marketplace app summaries & descriptions ([#9260](https://github.com/linode/manager/pull/9260))
- Button alignment on Nodebalancer Create page ([#9272](https://github.com/linode/manager/pull/9272))
- Linodes Landing Grid/Tag views and toggle button styling ([#9273](https://github.com/linode/manager/pull/9273))
- Fixed crash caused by un-escaped RegEx ([#9280](https://github.com/linode/manager/pull/9280))
- Show accurate Notification Threshold values when toggling in Linode Settings ([#9281](https://github.com/linode/manager/pull/9281))
- Regression with text input placeholder opacity ([#9303](https://github.com/linode/manager/pull/9303))

### Removed:

- Deprecate Google Analytics and clean up unused custom events ([#9266](https://github.com/linode/manager/pull/9266))

### Tech Stories:

- Fixed Github Actions build-manager step ([#9274](https://github.com/linode/manager/pull/9274))
- Help Landing: remove banner icon and refactor class components ([#9230](https://github.com/linode/manager/pull/9230))
- Migrate <App /> to functional component ([#9256](https://github.com/linode/manager/pull/9256))
- MUI v5 Migration - `Components > FileUploader` ([#9254](https://github.com/linode/manager/pull/9254))
- MUI v5 Migration - `Components > LabelAndTagsPanel` ([#9270](https://github.com/linode/manager/pull/9270))
- MUI v5 Migration - `Components > LineGraph` ([#9276](https://github.com/linode/manager/pull/9276))
- MUI v5 Migration - `Components > Pagination` ([#9237](https://github.com/linode/manager/pull/9237))
- MUI v5 Migration - `Components > ProductInformationBanner` ([#9213](https://github.com/linode/manager/pull/9213))
- MUI v5 Migration - `Components > PromotionalOfferCard` ([#9239](https://github.com/linode/manager/pull/9239))
- MUI v5 Migration - `Components > TableRowEmpty, TableRowError, TableRowLoading` ([#9232](https://github.com/linode/manager/pull/9232))
- MUI v5 Migration - `Components > ImageSelect` ([#9267](https://github.com/linode/manager/pull/9267))
- MUI v5 Migration - `Components > MaintenanceBanner` ([#9278](https://github.com/linode/manager/pull/9278))
- MUI v5 Migration - `Components > MultipleIPInput` ([#9283](https://github.com/linode/manager/pull/9283))
- MUI v5 Migration - `Components > HighlightedMarkdown` ([#9244](https://github.com/linode/manager/pull/9244))
- MUI v5 Migration - `Components > ScriptCode` ([#9243](https://github.com/linode/manager/pull/9243))
- MUI v5 Migration - `Components > LinodeCLIModal` ([#9220](https://github.com/linode/manager/pull/9220))
- Plan selection—reduce space ([#9238](https://github.com/linode/manager/pull/9238))
- React Query - Linode Disks ([#9255](https://github.com/linode/manager/pull/9255))
- React Query - Linode Resize Dialog ([#9242](https://github.com/linode/manager/pull/9242))
- React Query - Linode Volumes continued ([#9218](https://github.com/linode/manager/pull/9218))
- React Query - Linodes - LinodeSelect and refactor ([#9193](https://github.com/linode/manager/pull/9193))
- Refactor <IPSelect /> ([#9263](https://github.com/linode/manager/pull/9263))
- Refactor billing activity filters to improve caching ([#9271](https://github.com/linode/manager/pull/9271))
- Refactored AddNewMenu to use a MUI Menu ([#9224](https://github.com/linode/manager/pull/9224))
- Remove url-parse in factor of native Javascript ([#9228](https://github.com/linode/manager/pull/9228))
- Renamed LinkStyledButton to StyledLinkButton ([#9248](https://github.com/linode/manager/pull/9248))
- Update ExtendedAccordion, Prompt, and SafeTabPanel components ([#9241](https://github.com/linode/manager/pull/9241))

## [2023-06-14] - v1.95.1

### Fixed:

- New Marketplace apps display and toggle ([#9259])

## [2023-06-12] - v1.95.0

### Added:

- June 2023 Marketplace Release ([#9114])
- Metadata beta updates ([#9222])
- Kubernetes product information banner ([#9226])

### Changed:

- Improve failed Image creation and upload error messages ([#9184])

### Fixed:

- Tooltip console errors and top menu icon hover ([#9206])
- Disable Marketplace app search until loading complete ([#9207])
- Prevent rendering of purple content within Buttons without a buttonType prop ([#9209])
- VLANs configuration not showing for restricted users ([#9214])
- Linode Settings Disk I/O notification threshold value unable to be changed ([#9247])
- Linode Details crashing for Linodes with no `type` ([#9249])

### Tech Stories:

- Move dismissibleButton to DismissibleBanner component ([#9142])
- Resolve yaml dependabot alert for CVE-2023-2251 ([#9156])
- Simplify SelectPlanPanel and SelectPlanQuantityPanel ([#9165])
- React Query - Object Storage - Bucket SSL ([#9167])
- React Query - Linode Migrate Dialog ([#9195])
- React Query - Linode Configurations ([#9198])
- Added REACT_APP_MAINTENANCE_MODE env var to explicitly enable maintenance mode ([#9171])
- Update Storybook to 7.0.18 and add measure addon ([#9181])
- Update to vite@4.3.9 for CVE-2023-34092 ([#9212])
- MUI v5 - `Components > Tag` ([#9164])
- MUI v5 Migration - `Components > ShowMore` ([#9169])
- MUI v5 - `Components > PreferenceToggle` ([#9172])
- MUI v5 - `Components > SelectRegionPanel` ([#9173])
- MUI v5 - `Components > Linear Progress` ([#9177])
- MUI v5 Migration - `Features > ObjectStorage` ([#9180])
- MUI v5 Migration - `Components > TagCell, Tags, AddTag` ([#9186])
- MUI v5 Migration - `Components > TabbedPanel, ReachTab, ReachTabList` ([#9191])
- MUI v5 Migration - Features > Profile ([#9197])
- MUI v5 Migration - `Components > PasswordInput` ([#9202])
- MUI v5 - `Components > TableContentWrapper` ([#9208])
- MUI v5 - `Components > ProductNotification` ([#9211])
- MUI v5 Migration - `Components > TabLink` and `Components > TabLinkList` ([#9159])
- MUI v5 Migration - `Components > EditableText` ([#9179])
- MUI v5 Migration - `Components > EnhancedSelect` ([#9194])
- Rename `features/linodes` to `features/Linodes` ([#9201])

## [2023-05-30] - v1.94.0

### Added:

- Resource links to Object Storage empty state landing page #9098
- Resource links to Images empty state landing page #9095

### Fixed:

- Required fields for Firewall rules drawer form #9127
- Cloud Manager maintenance mode #9130
- Error handling for loadScript and Adobe Analytics #9161

### Removed:

- Unifi Marketplace app #9145

### Tech Stories:

- Automate the changelog with changeset generation #9104
- Upgrade Cypress to v12.11 #9038
- React Query for Linode Details - General Details #9099
- React Query Linode Details - Network Tab #9097
- React Query for Linode Details Settings Tab #9121
- React Query for Support Tickets - Ticket Details #9105
- MUI v5 Migration - `Components > EditableEntityLabel` #9129
- MUI v5 Migration - `Components > EnhancedNumberInput` #9152
- MUI v5 Migration - `Components > EntityDetail` #9123
- MUI v5 Migration - `Components > EntityHeader` #9109
- MUI v5 Migration - `Components > EntityIcon` #9125
- MUI v5 Migration - `Components > ErrorState` #9128
- MUI v5 Migration - `Components > IconButton` #9102
- MUI v5 Migration - `Components > Placeholder & Components > H1 Header` #9131
- MUI v5 Migration - `Components > TransferDisplay` #9107
- MUI v5 Migration - `Components > TypeToConfirm` & `Components > TypeToConfirmDialog` #9124
- MUI v5 Migration - `Features > CancelLanding` #9113
- MUI v5 Migration - `Features > NodeBalancers` #9139
- MUI v5 Migration - `Features > NotificationCenter` #9162

## [2023-05-22] - v1.93.3

### Fixed:

- LISH Console via SSH containing `none` as the username #9148
- Ability to add a Linode to a Firewall when the Firewall contains a large number of Linodes #9151
- Inability of restricted users with NodeBalancer creation permissions to add NodeBalancers #9150
- Bucket Access unnecessarily refreshing #9140

## [2023-05-22] - v1.93.2

### Fixed:

- Issue where linode "Reboot" button was disabled #9143

## [2023-05-18] - v1.93.1

### Fixed:

- Initialize linode before referencing #9133
- Revert linode landing changes #9136

## [2023-05-15] - v1.93.0

### Added:

- Resource links to empty state Volumes landing page #9065
- Resource links to empty state Firewalls landing page #9078
- Resource links to empty state StackScripts landing page #9091
- Resource links to empty state Domains landing page #9092
- Ability download DNS zone file #9075
- New flag to deliver DC availability notice for premium plans #9066
- Accessible graph data for LineGraphs #9045

### Changed:

- Banner text size and spacing to improve readability #9064
- Updated ClusterControl description #9081
- Highlighted Marketplace apps and button card height on empty state Linodes landing page #9083

### Fixed:

- Ability to search Linodes by IPv6 #9073
- Surface general errors in the Object Storage Bucket Create Drawer #9067
- Large file size for invoices due to uncompressed JPG logo #9069
- Phone Verification error does not reset #9059
- Show error for PayPal payments #9058
- Send Adobe Analytics page views #9108

### Tech Stories:

- MUI v5 Migration - `Components > CheckoutSummary` #9100
- MUI v5 Migration - `Components > CopyableTextField` #9018
- MUI v5 Migration - `Components > DialogTitle` #9050
- MUI v5 Migration - `Components > DownloadCSV` #9084
- MUI v5 Migration - `Components > Notice` #9094
- MUI v5 Migration - `Components > PrimaryNav` #9090
- MUI v5 Migration - `Components > ShowMoreExpansion` #9096
- MUI v5 Migration - `Components > Table` #9082
- MUI v5 Migration - `Components > TableBody` #9082
- MUI v5 Migration - `Components > TableCell` #9082
- MUI v5 Migration - `Components > TableHead` #9082
- MUI v5 Migration - `Components > TableRow` #9082
- MUI v5 Migration - `Components > TableSortCell` #9082
- React Query - Linodes - Prepare for React Query for Linodes #9049
- React Query - Linodes - Landing #9062
- React Query - Linodes - Detail - Backups #9079
- Add Adobe Analytics custom event tracking #9004

## [2023-05-01] - v1.92.0

### Added:

- No Results section for Marketplace Search #8999
- Private IP checkbox when cloning a Linode #9039
- Metadata migrate warning #9033

### Changed:

- Region Select will dynamically get country flags and group all countries based on API data #8996
- Removed MongoDB Marketplace Apps #9071

### Fixed:

- Kubernetes Delete Dialog clears when it is re-opened #9000
- HTML showing up in event messages #9003
- Inability to edit and save Linode Configurations #9053
- Excessively large file size for invoices due to uncompressed JPG logo #9069
- Marketplace One Click Cluster UDF caching issue #8997
- Prevent IP transfer & sharing modals form submission if no action selected #9026
- Increase radio button padding to fix hover effect shape #9031
- Blank Kubernetes Node Pool plan selection #9009

### Tech Stories:

- MUI v5 Migration - `Components > CircleProgress` #9028
- MUI v5 Migration - `Components > StatusIcon` #9014
- MUI v5 Migration - `Components > TagsInput, TagsPanel` #8995
- MUI v5 Migration - Grid v2 for Features #8985
- MUI v5 Migration - `Components > Dialog` #9020
- MUI v5 Migration - `Components > DeletionDialog` #9047
- MUI v5 Migration - `Components > Currency` #9030
- MUI v5 Migration - `Components > DisplayPrice` #9022
- MUI v5 Migration - `Components > CreateLinodeDisabled` #9015
- MUI v5 Migration - `Components > DateTimeDisplay, DebouncedSearchTextField` #9007
- MUI v5 Migration - `Components > ConfirmationDialog` #9016
- MUI v5 Migration - `Components > CopyTooltip` #9040
- MUI v5 Migration - `Components > CheckoutBar` #9051
- MUI v5 Migration - `Components > CreateLinodeDisabled` #9015
- MUI v5 Migration - `Components > ColorPalette` #9013
- MUI v5 Migration - `Components > Tile` #9001
- MUI v5 Migration - `Components > TagsInput, TagsPanel` #8995
- MUI v5 Migration - `Components > DismissibleBanner` #8998
- MUI v5 Migration - `Components > SupportLink, TextTooltip` #8993
- MUI v5 Migration - `Components > Toggle` #8990
- MUI v5 Migration - `Components > SplashScreen` #8994
- Remove `ConditionalWrapper` #9002
- Upgrade New Relic to v1230 #9005
- Add basic Adobe Analytics tracking #8989
- Add more eslint rules #9043
- @linode/validation version badge Label in `README.md` #9011
- Improve Firewall ports regex to prevent exponential backtracking #9010
- Fix code scanning alert that DOM text is reinterpreted as HTML #9032
- Fix the typesafety of the `<Select />` component #8986
- Update PayPal and Braintree dependencies #9052

## [2023-04-18] - v1.91.1

### Fixed:

- Add Premium plans to LKE #9021

## [2023-04-17] - v1.91.0

### Added:

- Cross Data Center Clone warning #8937
- `Plan` column header to plan select table #8943

### Changed:

- Use Akamai logo for TPA provider screen #8982
- Use Akamai logo for the favicon #8988
- Only fetch grants when the user is restricted #8941
- Improve the StackScript user defined fields (UDF) forms #8973

### Fixed:

- Styling of Linode Details Add Configurations modal header #8981
- Alignment issues with Kubernetes Node Pool table and buttons #8967
- Domain Records not updating when navigating #8957
- Notification menu displaying empty menu on secondary status click #8902

### Tech Story:

- React Query for NodeBalancers #8964
- React Query for Profile - Trusted Devices #8942
- React Query for OAuth Apps #8938
- Un-Redux-ify Object Storage Drawer #8965
- MUI v5 Migration - `Components > BarPercent` #8962
- MUI v5 Migration - `Components > BetaChip & Breadcrumb` #8968
- MUI v5 Migration - `Features > Billing` #8933
- MUI v5 Migration - `Components > CheckBox` #8980
- MUI v5 Migration - `Components > BackupStatus` #8960
- Use MUI Grid v2 #8959
- Update the `usePagination` hook to use Query Params instead of state #8914
- Use Query Client from Context #8949

## [2023-04-03] - v1.90.0

### Added:

- Delete warning to LKE [#8891](https://github.com/linode/manager/pull/8891)
- “to another region” to the title of the Linode Migrate Dialog [#8920](https://github.com/linode/manager/pull/8920)

### Changed:

- Disable Download CA Certificate when DB is provisioning [#8890](https://github.com/linode/manager/pull/8890)
- Update OCC logos to include naming convention [#8927](https://github.com/linode/manager/pull/8927)
- MUI v5 Migration - Features > Billing [#8895](https://github.com/linode/manager/pull/8895)
- MUI v5 Migration - Features > Account [#8893](https://github.com/linode/manager/pull/8893)
- MUI v5 Migration - Components > Drawer, DrawerContent [#8908](https://github.com/linode/manager/pull/8908)
- MUI v5 Migration - Components > Accordion [#8905](https://github.com/linode/manager/pull/8905)
- MUI v5 Migration - Components > SelectionCard [#8939](https://github.com/linode/manager/pull/8939)
- MUI v5 Migration - Components > AccountActivation, ActionMenu [#8930](https://github.com/linode/manager/pull/8930)
- MUI v5 Migration - Components > AbuseTicketBanner, AccessPanel [#8913](https://github.com/linode/manager/pull/8913)
- MUI v5 Migration - Components > DocsLink, ExternalLink, IconTextLink [#8919](https://github.com/linode/manager/pull/8919)
- MUI v5 Migration - Features > Databases [#8896](https://github.com/linode/manager/pull/8896)
- React Query for Firewalls [#8889](https://github.com/linode/manager/pull/8889)
- RQ-ify Types endpoints [#8840](https://github.com/linode/manager/pull/8840)
- React Query for SSH Keys [#8892](https://github.com/linode/manager/pull/8892)
- React Query for Notifications [#8915](https://github.com/linode/manager/pull/8915)

### Fixed:

- Filtering by `Status` on Linode Details Volumes Table [#8947](https://github.com/linode/manager/pull/8947)
- Tag drawer in LinodesLanding summary view [#8909](https://github.com/linode/manager/pull/8909)
- Crash for Events with a `null` community post `entity` [#8912](https://github.com/linode/manager/pull/8912)
- Incorrect headline in Linode Details Networking table [#8925](https://github.com/linode/manager/pull/8925)
- One Click Cluster UDF Caching issue [#8997](https://github.com/linode/manager/pull/8997)

### Removed:

- Repo clean up, remove old Redux Docs [#8907](https://github.com/linode/manager/pull/8907)

## [2023-03-28] - v1.89.1

### Fixed:

- NodeBalancer Configurations not saving [#8929](https://github.com/linode/manager/pull/8929)

## [2023-03-20] - v1.89.0

### Added:

- One Click Clusters [#8878](​​https://github.com/linode/manager/pull/8878)
- Infinitely Loaded Volume Select [#8876](https://github.com/linode/manager/pull/8876)
- Allow users to select `system` as a theme option [#8869](https://github.com/linode/manager/pull/8869)
- Vite [#8838](https://github.com/linode/manager/pull/8838)
- Resource links to Kubernetes empty state landing page [#8827](https://github.com/linode/manager/pull/8827)

### Changed:

- Updated maintenance and account activation screen logo [#8879](https://github.com/linode/manager/pull/8879)
- Updated `VolumeStatus` type and logic [#8862](https://github.com/linode/manager/pull/8862)
- Temporarily changed Remit To invoice address [#8847](https://github.com/linode/manager/pull/8847)
- Improved notification event links [#8828](https://github.com/linode/manager/pull/8828)
- Improved Linode disk downsize error messaging [#8861](https://github.com/linode/manager/pull/8861)
- Refactored LandingHeader & EntityHeader [#8856](https://github.com/linode/manager/pull/8856)
- Use region `label` from `/v4/regions` instead of `dcDisplayNames` constant [#8851](https://github.com/linode/manager/pull/8851)

### Fixed:

- Use our custom dialog for Monthly Network Transfer Pool instead of MUI's [#8874](https://github.com/linode/manager/pull/8874)
- Radio Styles after Vite Upgrade [#8871](https://github.com/linode/manager/pull/8871)
- Disable/hide showAll for PaginationFooter [#8826](https://github.com/linode/manager/pull/8826)
- Invalidate Firewall devices cache when a Linode is deleted [#8848](https://github.com/linode/manager/pull/8848)

### Removed:

- VLANs from Redux [#8872](https://github.com/linode/manager/pull/8872)
- Unused packages + update lint-staged [#8860](https://github.com/linode/manager/pull/8860)
- /core/styles abstraction for tss-react codemod [#8875](https://github.com/linode/manager/pull/8875)

## [2023-03-06] - v1.88.0

### Breaking:

- Remove deprecated `ip_whitelist_enabled` Profile Toggle

### Added:

- Support for local development access from local domain
- Account Logins Show `Successful` or `Failed` Access

### Changed:

- Increased minimum acceptable password strength for Linode root passwords
- Use React Query to fetch and store user preferences, tags, and images
- Use `URLSearchParams` to standardize query string parsing and stringifying
- Improvements to PrimaryNav new branded logo animation, transition, and accessibility
- Update Node.js from 14.17.4 LTS to 18.14.1 LTS
- Add `tss-react` and refactor `Button` to styled API
- Use Region ID to dynamically generate LISH URLs

### Removed:

- `wait-on` package for CVE-2023-25166

### Fixed:

- Firewall Rules Table rendering overlapping text
- `validateDOMNesting` warning in console

## [2023-02-21] - v1.87.0

### Added:

- Ability to create Object Storage folders

### Changed:

- Standardize Text tooltip
- Prevent Firewall Rule Drawer reset if the same preset is reselected

## [2023-02-13] - v1.86.0

### Added:

- “Status” column to Linode Backups table

### Changed:

- Migrate to Material UI v5 theme format
- Accessibility improvements to TopMenu icons
- Logo updates
- Account Agreements Query Small Optimization

### Fixed:

- Uneven Breakpoints in Kubernetes Landing Table

## [2023-02-07] - v1.85.0

### Added:

- Databases as a User Permissions Option
- Monthly Network Transfer Pool to select empty state landing pages
- API/CLI usage information to Linode Create

### Changed:

- Improve firewall rule list screen reader support
- UX copy for “Getting Started” playlists

### Fixed:

- API Tokens revocation

## [2023-01-18] - v1.84.0

### Added:

- Jan 2023 Marketplace Apps
- Type-to-confirm to more destructive actions

### Changed:

- Standardized usage of dismissible banners and notices
- Aligned left modal title
- Standardized `Disk IO` -> `Disk I/O` formatting across app

### Fixed:

- Linodes Landing Extra Padding
- Broken URL for Peppermint Marketplace App

## [2023-01-13] - v1.83.2

### Fixed:

- Linodes Detail Showing Past Maintenance Events
- Incorrect Linode Plan tab selection on Linode Create
- Inability to save changes to NodeBalancer Mode selection
- Deploying a Linode Backup to a new Linode forces a different plan size to be chosen

## [2023-01-11] - v1.83.1

### Fixed:

- Showing past completed maintenance on Linodes

## [2023-01-09] - v1.83.0

### Added:

- Support for new Washington, DC datacenter
- Account Login History
- `completed` Account Maintenance Events
- External link icons to YouTube links on Database landing page

### Changed:

- Relocate SMTP restriction notice for better visibility
- Update text for Akamai-billed customers
- Update and improve PayPal payment limits and logic
- Update links to the Marketplace app guides
- Update Docs Search URL regarding VLANs
- Update to Material UI v5
- Re-worked Gravatar loading and fallback logic
- Filter blocklisted events from Notification Menu
- Remove NVMe chip from Volumes

### Fixed:

- /32 IP address Access Controls for DBaaS
- Show correct plan tab when cloning a Linode
- Stackscripts loading for large accounts

## [2022-12-12] - v1.82.0

### Added:

- SMTP restriction support ticket form
- Region to Database summary view
- Mastodon Marketplace App

### Changed:

- Updated secrets modal button text
- Improved Linode migration time estimates
- Made help banner text more readable
- Switched to Akamai billing information and tax identification numbers
- Filter deprecated Linux images

### Fixed:

- Delayed loading of /56 ranges in Linode Network tab

## [2022-11-30] - v1.81.0

### Added:

- SMTP restriction notice helper text
- Object Storage type to confirm
- Copyable Linode IP Address text
- Copyable Kubernetes Node Pool IP address text
- React Query for Volumes

### Fixed:

- Landing page empty state 2-column layout

## [2022-11-14] - v1.80.0

### Added:

- Paste functionality restored for Glish
- Support for user-defined headers in stackscripts

### Changed:

- LKE UI refinements

## [2022-11-07] - v1.79.1

### Fixed:

- Bug when managing user permissions for large accounts

## [2022-11-01] - v1.79.0

### Added:

- Set custom UserAgent header for api-v4 when run in node

### Changed:

- Linode label max characters increased to 64 chars
- Update Configuration Profile doc link
- Marketplace app info button can be focused via keyboard
- Notices that suggest opening a support ticket now include a link to do so

### Fixed:

- Error when swapping Linode IPs after having already done so
- Issue preventing more than 100 Marketplace apps from appearing
- Error when updating billing contact info without a company name in certain circumstances

## [2022-10-17] - v1.78.0

### Added:

- Support for Pro Dedicated Plans
- Support ticket link for Account Limit notice text
- HA chip for highly available clusters in the Kubernetes landing page
- Visual indicator when keyboard navigating Linode and Database plan selection tables
- React Query for Managed

### Changed:

- Disable delete pool button if there is only one pool
- Display friendly name for Support ticket reply

### Fixed:

- Accessibility and zoom issue for inputs on Safari iOS

## [2022-10-04] - v1.77.0

### Added:

- ARIA labels for network transfer history previous/next buttons
- Firewall Support for `IPENCAP` Protocol
- New Linode Logo
- Getting Started links on the Linodes and Databases empty landing pages

### Changed:

- New environment docs and updated PR Template

### Fixed:

- Linode “Add Disk” drawer UI width bug
- Object Storage overwrite file error causing the app to crash

## [2022-09-19] - v1.76.0

### Added:

- Ability to select a disk for initrd in Linode Config modal
- Contextual help links on Linode create page

### Changed:

- Invoice tax and logo updates
- Improve timezone offsets by pulling them from `Luxon`
- Allow deletion of private IPv4 addresses
- Make database engine icons more visible on focus
- Replace `novnc-node` with `react-vnc`

### Fixed:

- Issue where long drawer titles force "Close" button to new line
- Database maintenance window day mapping and notification message for database_update
- Confirm that 2FA toggle is not present in either state when security questions are not answered

## [2022-09-06] - v1.75.0

### Added:

- Marketplace Search & Filtering and UI refinements
- Sept 2022 Marketplace Apps
- More Insightful Credit Card Expiration Date Validation
- Volume Status on Volumes landing page

### Changed:

- Remove Type-To-Confirm checkbox from Modals
- Documentation link for Powered off Linode Accrued Charges

### Fixed:

- Ant Media Server display in drawer
- Apostrophes in Linode Resize and Host Maintenance error messages

## [2022-08-24] - v1.74.1

### Fixed:

- Issue causing user-defined fields to clear erroneously during Linode StackScript deploy

## [2022-08-22] - v1.74.0

### Added:

- Support for “Any/All” option for StackScript target images

### Changed:

- Update billing UI for Akamai customers
- Build `api-v4` and `validation` with `tsup`

### Fixed:

- Slight adjustment to browser back button behavior on User Permissions tab
- Make "Copy IP" buttons visible on keyboard focus as well as table row hover

## [2022-08-08] - v1.73.0

### Added:

- Local storage warning to Kubernetes upgrade flow
- August 2022 Marketplace apps

### Changed:

- Filter `read_only` Linodes From Firewall Select For Restricted Users

### Fixed:

- Linode Backups tab error certain users were experiencing
- Invoice formatting issue

## [2022-07-25] - v1.72.0

### Changed:

- Phone Verification and Security Questions copy
- PayPal Loading State improvement
- Button placement in User Permissions
- Add Payment Drawer error from toast to notice

### Fixed:

- Mobile graph legends alignment
- Region selection not clearing when switching between Linode Create tabs

## [2022-07-20] - v1.71.1

### Added:

- Banner regarding maintenance to the Databases Landing and Database Create pages

## [2022-07-12] - v1.71.0

### Added:

- Kali distro icon
- Ability to download secret keys

### Changed:

- UI in Keys and secrets modals
- Update 2FA Security Questions Notice font size
- Main content banner width
- Use React Query for Domains
- Removed create image cost estimator
- Don't make /account requests if restricted user
- Persist Last Updated column on small screens in Support Ticket Table

### Fixed:

- Image upload max size bug on Linux
- Responsiveness of Linode stats graphs
- Curly apostrophe on cancel landing page
- Phone Verification when verifying the same phone number

## [2022-07-01] - v1.70.1

### Fixed:

- Banner text wrapping for certain viewport widths

## [2022-06-23] - v1.70.0

### Added:

- June 2022 Marketplace release
- Security questions for account verification
- Phone number SMS verification opt-in and opt-out

### Changed:

- Move Upload Image region text to tooltip
- Enabling or resetting 2FA requires security questions to be answered
- Clean up dismissed notifications more frequently in User Preferences

### Fixed:

- Show errors in Firewall rules table
- Make notification badge a true circle

## [2022-06-13] - v1.69.0

### Added:

- Display tax lines on invoices
- Ability for users to migrate unattached volumes to NVMe block storage

## [2022-06-08] - v1.68.1

### Fixed:

- Notification Menu spamming calls when clicking a link

## [2022-06-06] - v1.68.0

### Added:

- Tooltip explaining public/private hosts for MongoDB clusters
- Support for scoping Database and Firewall permissions

### Changed:

- Tweak Connection Details for Mongo clusters
- Bold the Entity Label, Actions, and Username in the Notification Menu
- Enable Google Analytics IP anonymization

### Fixed:

- Height of Region select

## [2022] - v1.67.0

### Added:

- Marketplace Add: May 2022 Release

### Changed:

- Allow more sorting options for Databases
- Remove NVMe marketing banners
- Remove Ada chat bot

### Fixed:

- Linode Configs Cancel Button functionality
- Events sometimes disappearing from the notification menu

## [2022-05-16] - v1.66.2

### Changed:

- Display linroot as the username for MongoDB and MySQL clusters, and linpostgres as the username for PostgreSQL clusters

## [2022-05-16] - v1.66.1

### Changed:

- Display 'admin' as username for MongoDB database clusters

## [2022-05-16] - v1.66.0

### Added:

- Support and icons for PostgreSQL and MongoDB

### Changed:

- Expanded accessibility and styling docs
- Icon for MySQL

### Fixed:

- Marketplace Wazuh link

## [2022-05-02] - v1.65.0

### Added:

- Outlined chip variant

### Changed:

- Hyphenate “type-to-confirm”
- Curly all single quotes
- Max node pool copy
- Limit collection of country and tax information
- Spacing on DBaaS Settings page
- Unbold Object links in Object Storage
- All No Stats Available States

### Fixed:

- Linode Activity Feed undefined loading state
- Button text not vertically centered in Firefox

## [2022-04-28] - v1.64.1

### Changed

- Code refactors to accommodate API database type changes

## [2022-04-18] - v1.64.0

### Added:

- Support for DBaaS Maintenance Windows

### Changed:

- Update DBaaS Beta notice to include end date
- Notification Drawer updates and refinements
- Improve Table Loading States
- Premium LKE Create page UI refinements
- Display placeholder text while stats are not yet available in Linode Network tab
- Support Ticket Refinements

### Fixed:

- Show /116s in networking panel
- Typo in migrate Linode modal
- Max value for Node Pools is 100

## [2022-04-08] - v1.63.1

### Fixed:

- Issue where Community StackScripts were inaccessible

## [2022-04-07] - v1.63.0

### Added:

- IPv6 sharing support
- Ability to add Gravatars to My Profile settings

### Changed:

- Font size for "Billing & Payment History" header
- Swapped button order in Restore from Backup drawer
- Events page refinements
- Default permissions and expiry for personal access tokens

### Fixed:

- Prometheus & Grafana and Ant Media Enterprise docs link
- Linodes missing from Firewall Linode selection
- Prevent Linode Landing table from scrolling

## [2022-03-28] - v1.62.1

### Added:

- March 2022 Marketplace release

## [2022-03-21] - v1.62.0

### Added:

- Dynamically-shown warning for raw disks in Capture Image tab
- Kubernetes Dashboard link

### Changed:

- Replace Linode Checkout Sidebar with Summary Paper
- Prevent referral link from being modified
- Remove manage SSH keys link from success notice
- DBaaS cluster labels now editable

### Fixed:

- Tags Panel causing extra PUT requests
- Select Dropdown overflow
- Linode Disk delete modal cancel button
- Mismatching Marketplace app drawers
- Hover state for Linode Detail header copy icon on Safari

## [2022-03-08] - v1.61.1

### Added:

- Early Adopter Program SLA banners to Database Create and empty state Database landing pages for beta

### Fixed:

- Fixed issue where limited users without billing access could not use the app

## [2022-03-07] - v1.61.0

### Added:

- Transfer and Network In/Out columns to Linode plans tables
- Type to confirm toggle

### Changed:

- Drupal Marketplace app logo
- Feedback link
- Improve styling consistency for backup auto enrollment
- Replaced copy icon and added copy tooltip on hover

#### Storybook

- Colors
- Icons
- Loading states
- Notifications
- Tooltip
- Typography

### Fixed:

- Extra character in Support Ticket entity selection
- Status icon alignment in tables
- Linode Details action link colors in dark mode
- Linode Details Configurations table alignment

## [2022-02-25] - v1.60.1

### Added:

- Check for regions/states in the Tax Collection Banner

## [2022-02-21] - v1.60.0

### Added:

- Copy IP address tooltip in the Linode Networking tab
- February 2022 Marketplace release

### Changed:

- Update Storybook components
- Glish URL root from “alpha” to “dev”

### Fixed:

- Prevent previous saved support text from loading into a ticket reply

## [2022-02-14] - v1.59.1

### Changed:

- Disable "Make a Payment" button if restricted user has read_only access
- Default Linode image to Debian 11

### Fixed:

- Icon showing after IP address in Linodes landing table

## [2022-02-07] - v1.59.0

### Added:

- Databases support
- Option to download invoices as CSV
- Ability to link Databases and Firewalls to Support Tickets
- GitHub workflows documentation
- Tax collection banner

### Changed:

- Un-exclude Armed Forced regions from billing region dropdown

### Fixed:

- ‘X’ misalignment when IP input field has error

## [{2022-01-24] - v1.58.1

### Fixed:

- Display previous region as placeholder

## [2022-01-24] - v1.58.0

### Added:

- Marketplace January 2022 Release

### Changed:

- Upgrade to High Availability Dialog Copy
- NVMe Block Storage banner copy in the Volume Create form
- Marketplace document link updates and cleanup

### Fixed:

- Icon Alignment for Kubernetes Nodes

## [2022-01-10] - v1.57.0

### Changed:

- Marketplace: Utunnel app name update
- Override Domain type display in search results
- Backup Auto Enrollment – Remove redundant head
- Removed copy re: OBJ buckets needing to be empty prior to canceling Object Storage Subscription

### Fixed:

- Customer unable to edit Cloud Firewall Rules
- Editing a Secondary Domain that caused freeze and crash
- Support ticket entity param bug for LKE clusters

## [2021-11-30] - v1.56.0

### Added:

- Warning when booting into Rescue Mode that Cloud Firewall will not be enabled
- URL paging for the Linodes table

### Fixed:

- Row height and extra spacing around ActionMenu in Safari
- Transferred column on NodeBalancer page not showing the correct amount
- Axis label UI bugs

## [2021-11-15] - v1.55.0

### Added:

Elastic IPs:

- Add IPv6 ranges to IP Transfer modal
- Handle IPv6 events language
- Handle IPv6 range deletion

PayPal:

- Add PayPal as recurring payment method
- Use react-paypal-js for one time PayPal payments

- Add Q4 releases for Marketplace
- Add delete button to NodeBalancer Detail in settings

### Changed:

- Update "Add an IP Address" drawer and provide the ability to add IPv6 ranges
- Updates to payment method logic and UI

### Fixed:

- Table row height too high in Safari

## [2021-11-09] - v1.54.0

### Added:

- Support for Block Storage migrations and flow for upgrading volumes to NVMe

### Changed:

- URL of HA Cluster guide link
- Removed "File System Path" column from Volumes landing table

### Fixed:

- Button order in the Add Linode to Firewall drawer
- Button alignment in the Enable All Backups drawer
- Linode Networking Graph Overlapping with DNS Resolvers

## [2021-11-01] - v1.53.0

### Added:

- Kubernetes High Availability feature

### Changed:

- Remove deprecate Linode domains banner
- IP address font color on Firefox in dark mode

### Fixed:

- Button placement and improved spacing in Add Node Pool Drawer
- Inserting default values from NodeBalancers when creating new Domain
- Timezone issue with NodeBalancer graphs

## [2021-10-20] - v1.52.0

### Added:

- NVMe banner for Newark, NJ

### Changed:

- Update to React v17.0.2
- Raise threshold for large account
- Add hover states for top nav icons

### Fixed:

- Consistent spelling of "canceled"
- Vertical alignment for Linode status column

## [2021-10-05] - v1.51.0

### Added:

- Support for Autoscaling NodePools

### Changed:

- Improve experience attaching a VLAN when creating a Linode from a Backup or Clone
- Swap Create Access Key button order
- Validation error message with NodeBalancer

### Fixed:

- Formatting of long strings in Domains TXT records
- Validation saying "expiring too far in the future" when entering credit card expiration date

## [2021-09-17] - v1.50.0

### Added:

- GDPR Compliance notification, banner, and checkboxes

### Changed:

- GiB to GB for Volumes
- Remove “Glish” tab for Bare Metal Linodes
- Reduce bottom padding for linodes grouped by tag
- Removed /128 prefix length from IPv6 address in Linode details
- Primary button position to the right in Drawers and Modals

### Fixed:

- Bug preventing Linode Configuration changes

## [2021-09-09] - v1.49.0

### Added:

- Promotional banner for Object Storage
- Banner and screen for upcoming maintenance
- More validation for the label field in Firewall rules

### Changed:

- Preserve Support Ticket replies between refreshes
- Font size for Managed Credentials and Contacts copy
- Vertically center icons and texts in dropdown
- Allow more room for image names

### Fixed:

- Action buttons being disabled upon Firewall creation for restricted users
- Issue adding tags during Volume creation

## [2021-08-31] - v1.48.0

### Added:

- Copy for Images pricing on the Create Image page
- Price estimation for captured images

### Changed:

- Labels’ “(required)” substring adjusted to normal weight

### Fixed:

- Not all Linode maintenance events being populated

## [2021-08-26] - v1.47.1

### Added:

- Display maintenance view when API is in maintenance mode

### Fixed:

- Crash in account/billing for certain accounts

## [2021-08-24] - v1.47.0

### Added:

- Support for multiple payment methods in “Make a Payment” drawer
- Support for multiple payment methods in “Add a Payment” drawer
- New minimum TTL values for domains
- Restricted user support for Firewalls

### Changed:

- Swap order of Shared and Dedicated CPU tabs
- Button Placements and Styles (includes Migration modal fixes)
- Marketplace app name from Severalnines to ClusterControl
- Tighten spacing for Support Ticket Details
- Remove data center verbiage from Firewalls
- Remove redundant headers for Managed

### Fixed:

- Support ticket input with different font sizes
- Kubernetes Debian images showing up in the Rebuild and Stackscript Dialogs
- Warning styles
- Primary button loading state in dark mode
- Users unable to specify a Label and Description when capturing an Image

## [2021-08-11] - v1.46.1

### Fixed:

- Inability to add Firewall rules that use ICMP protocol
- Root Device bugs in Linode Config dialog
- UI bugs for action buttons in dark mode

### Changed:

- Copy in Create Firewall and Add Linode to Firewall drawers

## [2021-08-09] - v1.46.0

### Added:

Billing:

- Ability to add a promo code to account
- Ability to delete payment method
- Temporary credit card notice to Add Payment Method drawer

- Banner for Block Storage availability in Atlanta
- Handling for entity_transfer_accept_recipient events
- Linode Create flow filtering for Bare Metal plans
- Handle firewall error message for unsupported hosts
- Cleanup Button and add documentation
- Marketplace Q3 Apps

### Changed:

Billing:

- Hide Google Pay notice when loading payment methods
- Prevent logging of Google Pay payment closed or timeout errors to Sentry
- Refined handling of payment_due notifications in Notifications drawer

- Improve Table Loading and Table Error Styles
- Instances of “Add a SSH Key” corrected to “Add an SSH Key”
- My Profile / Account dropdown changes
- Refresh on permission change
- Remove checkout sidebar for Volume Create flow
- Reduce spacing for NodeBalancer Settings
- Remove parenthetical GB limit
- Remove redundant headers
- Standardize secret token modals
- Use React Query for Account Settings
- Update Linode logo on TPA
- Update Linode Plan card view to prevent text wrapping
- Update several dependencies and upgrade Node to 14.17.4
- Update Firewall Details table header and Longview Plan chip
- Upgrade cypress to see if it helps CI performance issues

### Fixed:

- Delay in Linode Analytics graphs updating when navigating to another Linode via the search bar
- "Unknown Plan" and "Unknown Image" in Search
- Inability to add tags to Volumes during creation

## [2021-07-30] - v1.45.1

### Fixed:

- Bug preventing some users from editing their accounts

## [2021-07-29] - v1.45.0

### Added:

- Google Pay support
- Analytics for Image Uploads
- Ability to retry an Image upload

### Changed:

- Communicate account balances differently depending on whether balance is past due or not
- Updated font-logos and added Rocky Linux icon in map
- Remove remaining CMR flag dependency and clean up Accordion
- Referrals, ActionMenu CMR, and Linode Settings cleanup
- Copy for High Memory plans
- UI tweaks for LKE Detail page
- Remove "Other Entities" from Monthly Network Transfer section of Network tab
- Never display payments in Payment Activity table as negative
- Expand all Linode Settings accordions by default
- Table consistency across app
- Use new status page URL for system status

### Fixed:

- Visibility of Block Device errors in Linode Config dialog
- staticContext console warning
- Nodebalancer table console error regarding children with the same key
- Formatting error when showing rDNS error
- Referral link showing for customers who have not met the $25 min payment threshold
- Kubernetes navigation link showing as inactive on /kubernetes/create
- Typecheck error in FileUploader by importing Dispatch type
- Image uploads not working on some systems

## [2021-07-01] - v1.44.1

### Fixed:

- Referral link is not hidden properly

## [2021-06-28] - v1.44.0

### Added:

- Dedicated Maintenance Table at `/account/maintenance`
- Use React Query query to populate account network transfer

### Changed:

- Referral page changes
- Update Virtualmin and Webmin Marketplace links
- EntityTables and Tables CMR cleanup

### Fixed:

- Console warning for Divider custom props
- Object Storage landing table UI bugs
- Ability to access /dev/sdh Block Device in Configuration modal

## [2021-06-17] - v1.43.1

### Added:

- Notice to the Referrals page to highlight upcoming changes to the program

## [2021-06-16] - v1.43.0

### Added:

- Toast notifications and updated table entries for Image upload success/failures
- Drag & Drop Image uploads
- Time of migration to Scheduled Migrations banner

### Changed:

- Event text for Domain record creation and update
- Minimum LKE node warning message
- Remove "beta" tag from Machine Images

### Fixed:

- Clearing ticket form state after submit
- Domains table header for large accounts
- IP Sharing for large accounts
- Paper padding regression in Create Cluster
- Prevent Linode disks from being deleted while a Linode is running

## [2021-06-01] - v1.42.0

### Added:

- Connect with LISH copy in Rescue modal for Bare Metal instances
- Dismissible banner for Images pricing

### Changed:

- Images landing tables default sorted by label ascending
- NodeBalancers landing table default sorted by label ascending

- Add AlmaLinux icon
- Remove focus styles for mouse users
- Update Credit Card drawer
- Update LKE Create Cluster default node pool size to 3

### Fixed:

- Search Linodes by IP address
- Input field error message positioning and width
- Viewing all Object Storage objects for some Buckets

## [2021-05-19] - v1.41.3

### Fixed:

- Search by IP for large accounts

## [2021-05-18] - v1.41.2

### Changed:

- Fallback to tux icon for unknown distros

## [2021-05-18] - v1.41.1

### Fixed:

- Fix Validation package on NPM

## [2021-05-18] - v1.41.0

### Added:

- Link to documentation on Linode Rescue Modal

### Changed:

- Create LKE Cluster UI buttons and change default number of nodes to 3
- Hide Trusted Devices table if no devices are selected and rename “Untrust” to “Revoke”
- Update keyboard shortcuts for Windows and Linux

Images:

- Rename sections
- Rename dropdown option “Deploy to Existing Linode” to “Rebuild an Existing Linode”

### Fixed:

- Create Cluster plan panel buttons flickering
- IP sharing display for large accounts

## [2021-05-12] - v1.40.1

### Changed

- Remove Beta notifications and text for Cloud Firewalls as part of GA release

## [2021-05-05] - v1.40.0

### Added:

- Google as TPA provider

### Changed:

Bare Metal:

- Show “N/A” with helper text in "Last Backup" cell for Bare Metal instances
- Confirmation dialog for booting Bare Metal Linodes into rescue mode
- Add docs link in "Last Backup" Bare Metal column tooltips

- EventsLanding table column headers styling
- VLAN Refinements in Linode Create flow
- “Disk Imagize” status changed to “Capturing Image”
- Add box rule and adjust spacing in account billing
- Show promo service type in billing summary
- Update buttons styles on Firewalls Linodes tab to match the Rules tab

### Fixed:

- “Add Disk” button styling in RescueDialog
- Prevent SideMenu scroll bar from overlapping text
- Don’t request tags for restricted users

## [2021-05-03] - v1.39.2

### Added:

- For release: Remove beta notices and link for VLANs since they're leaving beta

## [2021-04-28] - v1.39.1

### Changed:

- Update Image Upload docs link
- Update Image Upload curl command to match Linode docs

### Fixed:

- "Create Image" button from Image Landing empty state not allowing image uploads

## [2021-04-22] - v1.39.0

### Added:

- @linode/validation package for maintaining validation schemas
- Marketplace Partner Apps Q2/2021
- Delete Cluster button/modal in LKE Detail view
- Remove overriding font style for Receive Transfer modal
- Upload Image tab

### Changed:

- Swap order of username and gravatar in the navbar
- Update hover states for docs and secondary buttons
- Filter out creating and pending images from ImageSelect in the Create flow
- Linode Detail view graphs legend and spacing adjustments
- NodeBalancer IP Addresses' copy tooltips appear on row hover

Images:

- Move Images Create drawer to a separate page
- Separate Images into two tables: “Manual Images” and “Automatic Images”
- Rename deployment actions in Images Landing action menu

### Fixed:

- Error for restricted users with Linode creation permissions

## [2021-04-13] - v1.38.0

### Changed:

VLANs:

- Add placeholder and tooltip to clarify IPAM address format
- Public interface can appear in any slot
- Display all interfaces all the time in Linode configuration modal

- Update README.md
- Separate password change flow for Bare Metal instances

### Fixed:

- Ensuring VLANs are fresh when opening the configs drawer
- Editing VLAN configs
- Wrapping for Account > User Permissions > Specific Permissions dropdown

## [2021-04-05] - v1.37.0

### Added:

- VLANs
- Support for Bare Metal plans in Linode create flow

### Changed:

- Changes for VLAN attachment in Linode Create flow
- Hide unneeded fields on LinodeDetail for Bare Metal plans
- Make Domain, OBJ and LKE upgrade banners dismissible

### Fixed:

- Wrapping on Firewall Rule table
- IP transfer not showing all options
- Properly handle migration_pending notification
- IP sharing bug

## [2021-03-23] - 1.36.0

### Added:

- Status banners on all /support pages showing open status.linode.com incidents

### Changed:

- VLANs can now be created through the Linode Config create/edit dialog
- Update Configurations table in Linode Detail to show revised VLAN information
- Remove Kernel and VM Mode columns from Configurations table
- Make button and dialog naming conventions consistent
- Remove default Firewall rules (new Firewalls are created empty, with policies set to Accept)
- Make abuse ticket banners dismissible
- Closing the notification drawer marks notifications as read

### Fixed:

- Don't clear support modal contents from local storage on close
- Alignment on Longview Landing filter input
- Clear Linode config form when opening the modal
- Scrollbar overlaps with UserMenu dropdown
- Prevent wrapping of Linode Detail graph legends

## [2021-03-17] - v1.35.0

### Added:

- CopyTooltip next to tokens in Service Transfer tables
- Confirmation dialog when entering the migration queue
- Banners for open status.linode.com incidents displayed on all /support pages

### Changed:

- Billing Summary updates
- Update hover states
- "Status" column removed from Community StackScripts landing page

### Fixed:

- Fix UI collision on Firewall “Linodes” tab

## JS Client

### Fixed

- Update Firewall schema to make “label” required
- Update types for VLAN revamp

## [2021-03-09] - v1.34.0

### Added:

- Valheim Marketplace app

### Changed:

#### Cloud Firewalls:

- Allow Firewall Rules to be reordered
- Enable keyboard shortcuts for reordering Firewall Rules
- Inputs and table column for Firewall rule actions
- Enforce masks for Firewall Rules IPs
- Policy toggles for Firewall Rules tables
- Add actions and policies to default Firewall rules and factories

#### Service Transfers:

- Filter transfers by descending created date
- Improve responsiveness of Service Transfer tables
- Display text on empty state in checkout bar
- Transfer display tables are now paginated through the API

#### Miscellaneous

- Selecting a Linode auto-selects the region when creating a Volume
- Update style for table pagination controls

### Fixed:

- Search/pagination bug in LinodeTransferTable

## JS SDK

### Changed:

- Firewall rule type schema (add accept or drop policy field)

## [2021-03-01] - v1.33.1

### Fixed:

- Display account balance correctly

### Changed:

- Use /account/maintenance endpoint to display maintenance information

## JS Client

### Added:

- Types and methods for /account/maintenance

## [2021-02-24] - v1.33.0

### Added:

- Ability to transfer Linodes to another account

### Changed:

- Linode Configurations drawer is now a modal
- Improve responsiveness of NodeBalancers display

## [2021-02-21] - v1.32.0

### Added:

- One-Click Apps:
  - CyberPanel
  - ServerWand
  - Yacht
  - Zabbix

### Changed:

- Update TypeScript to v4

## [2021-02-19] - v1.31.0

### Changed:

- Update maintenance notice text on Linodes Landing
- Add outline style variant for Buttons
- Remove VLANs landing, create, and Linode detail tables

### Fixed:

- Event progress bars should always be full width

## [2021-02-15] - v1.30.0

### Added:

#### Cloud Firewalls:

- Firewalls beta notification
- Presets for port selection when creating/editing a Firewall rule
- Label and Description fields for firewall rules
- Clone action for firewall rules

- Visual indicator for "Skip to Main Content" link
- Update Breadcrumb styles
- New Accordion expand/collapse icons
- Network Transfer Display on NodeBalancer, Object Storage, and Kubernetes landing pages

### Changed:

#### Cloud Firewalls:

- Move save changes button to bottom of rules table

#### Notification Drawer:

Remove existing sections and replace with Notifications and Events sections
Show balance past due notification in the Notifications section
Mark all events as read when the drawer is closed

- Upgrade Node version from 10.16 to 14.15.4
- Change wording for OBJ utilization
- Network Transfer Display: redesigned text-based display
- Use React-Query when fetching regions
- Hide "Linode Expert" for Linode accounts in Support ticket replies
- Move summary and Auto Enroll toggle to the top of the Enable Backups drawer

### Fixed:

- Scheduled migration banner font color on dark mode
- Prevent SelectPlanPanel wrap in Linode Create flow
- Disk selection when opening Rebuild from /linodes
- Alignment of ActionMenu in mobile on Firewall landing page
- Calculate days to billing in EST to match billing practices

## [2020-01-25] - v1.29.0

### Added:

- Ability to recycle LKE nodes
- Ability to recycle all nodes in an LKE cluster
- Upgrade flow for LKE Kubernetes minor versions
- “Plan” column in the Linodes list table
- Copyable StackScript ID field on StackScripts Detail page

### Changed:

- Remove "Pilot" language from GPU tab under Linodes
- Update URL appropriately when opening, closing, and navigating to Resize, Rebuild, Rescue, and Migrate modals
- Use query params for routing for Resize, Rebuild, Rescue, and Migrate dialogs (e.g. linodes/123/storage?resize=true)
- Improve responsiveness of Linode Network Summary
- Hide Volumes table for Linodes in regions without Block Storage
- Sort Firewall rule ports in ascending order
- Make empty state message for outbound Firewall rules more explicit
- Remove icons from buttons on Domain Detail page

### Fixed:

- Fix wrapping in UserMenu causing disappearing “Log Out” button

## [2021-01-20] - v1.28.3

### Fixed:

- Missing metadata and images for Kepler Builder OCA
- Documentation links broken for several apps

## [2021-01-15] - v1.28.2

### Fixed:

- Resize action not appearing in Linode detail entity header

## [2021-01-14] - v1.28.1

### Fixed:

- Make sure inline reboot action isn't disabled for Linodes

## [2021-01-13] - v1.28.0

### Added:

- Add Network Transfer Graph to Linodes Landing
- Add Marketplace Q4 apps
- Sort Linode Details > Storage > Disks table by created (ascending) on default

### Changed:

- Remove rounded corners for buttons
- Disable submission until required fields are present and remove tags field from the Domain create flow
- Disable Firewall and Image create flows for restricted users
- Increase timeout for Longview on accounts with more Longviews
- Convert Support Ticket drawer to a dialog and make inputs bigger
- Update text to accurately reflect what read_only account access lets you do

### Fixed:

- Set highlight.js theme on app load
- Color scheme for Dark Mode toggle button's enabled state
- Disable create flow fields for restricted users
- Remove duplicate restricted banner for Marketplace
- Tooltip and disabled action functionality in action menus
- Update timezone logic to account for time zones that use a quarter hour
- Object Storage list not showing more than 100 objects

## [2020-12-18] - 1.27.1

### Fixed:

- Revert upgrade to Chart.js that was causing Sentry errors and graph display errors

## [2020-12-16] - 1.27.0

This release includes sweeping changes to the Cloud Manager UI. For more details, please visit https://www.linode.com/blog/linode/cloud-manager-enhancements-dec2020/

### Added:

- Deep link to the Payment drawer
- Add missing link to invoice details in invoice rows

### Changed:

- Replace all user-facing Domains master/slave terminology with primary/secondary
- Sortable tables now update the URL on sort change to make sort preferences bookmarkable
- Upgrade: Chart.js 3.0 (beta)
- Move theme toggle to My Profile > Settings
- New icon set for CMR
- Update empty states for all entities
- Add warning when migrating a Linode with VLANs to a region w/o VLANs
- Make time displays consistent throughout the app (ISO format)
- Smaller page sizes for Longview Landing
- Move abuse ticket banner to global notifications
- Update URL query param on input change on support search landing page
- Remove the Dashboard
- Hide Longview pagination footer if there's only one page
- Use Region Select styles in Object Storage Cluster selection
- Improve Backups column in Linode .csv file

### Fixed:

- Low reputation error when resizing a Linode intercepted by disk size error logic
- Prevent multiple imagize submissions in succession

## [2020-12-03] - 1.26.0

### Added:

- Secure Your Server One-Click App

## [2020-11-18] - 1.25.2

### Fixed:

- Only display 5 Linodes on the Dashboard
- Performance regression for large accounts
- Longview graph data not displaying correctly

## [2020-11-17] - 1.25.1

### Fixed:

- Users with no Domains were unable to create a Domain
- Table cell arrow icons had an incorrect color

## [2020-11-17] - 1.25.0

### Added:

- Bucket and Object level access controls
- Display total Object Storage usage on Bucket Landing page
- Progress bar to LinodeDiskRow when a disk is resizing
- “Objects” column to the Bucket Landing table
- Bucket Details Drawer
- Bucket results to search bar

### Changed:

- Add hideOnTablet prop to Entity Table component
- Remove 'Copy to Clipboard' text in OBJ drawers
- Disable API polling from inactive tabs
- Add copy explaining billing address restrictions
- Make typeToConfirm optional in DeletionDialog
- Lazy load OBJ Buckets
- Remove "Delete" option from DBaaS backups table
- Hide permissions table if user has no buckets
- Move Domain creation drawer content to a separate page at /domains/create
- Handle API warnings after a successful payment.
- Update Resize error message and add link

### Fixed:

- Remove filtering of app tokens
- IP popover displaying incorrectly when adding a private IP address to a Linode

## [2020-11-13] - v1.24.1

### Fixed:

- Overreporting Sentry errors

## [2020-11-02] - v1.24.0

### Added:

- Ability to update username from Profile > Display

DBaaS:

- Landing
- Creation modal
- Details page

### Changed:

- Group kernels in dropdown when selecting in Config drawer
- Show all devices (not just root) in Config rows
- Allow multi-select when adding VLANs during Linode create
- Polling improvements
- Hide billing section of dashboard for users without account access
- Apply CMR table components to search results landing

VLANS:

- Warning notice to reboot Linodes attached to a VLAN
- Don't filter out VLANs without an IP address from the table in linode/networking
- Use type-to-confirm in Deletion Dialog Modal
- Remove default value for IP range and mark Region as required
- Display ‘None’ for IP for interfaces without an address
- Hide backups CTA on Linodes Landing in VLAN context

### Fixed:

- Make sure we don't filter private images containing 'kube'
- Documentation link on the Linodes Landing page
- Code typo in "Paginating Things" example
- Extraneous comma display in Linode > Networking > VLANs
- IP addresses truncation link and Volumes landing
- "null" progress on CMR Dashboard
- Linodes Landing docs link (CMR)

## [2020-10-20] - v1.23.0

### Added:

VLAN:

- Landing table
- Details table
- Linode Networking panel
- Attach and detach Linode to VLAN drawer
  CMR:
- Banner for open abuse tickets

### Changed:

- Request Domains on load to determine account size
- Update dark theme styling
- Add helper text for NodeBalancer Proxy Protocol field
- Add tooltip for sort in Notifications drawer

### Fixed:

VLAN:

- Attach Linode drawer fixes
  CMR:
- Wide table width with overflow when cloning Linodes
- Fix Lish link
- Sync animations for pending actions
- Remove underscores in Linode statuses in LinodeEntityDetail

- Long Domain records overflowing table rows
- Incorrect flag shown for Sydney in Linode Migrate
- Search results not displaying for some restricted users

## JS Client

### Changed:

- Update VLAN Linodes typing

## [2020-10-13] - v1.22.1

### Changed:

- Make CVV required when adding a credit card.

## [2020-10-05] - v1.22.0

### Added:

- Notification for when an email to a user couldn’t be delivered
- Warning about 24 hour wait period before disabling backups for a Linode
- Warning about blocked SMTP ports for new accounts
- CMR:
  - Apply animations and adjustments to Linode Summary view
  - Apply table styles for Longview tables
  - Hide status chip if there are no corresponding Linodes with that status
  - "Message" column to the Activity Feed table
  - Prevent overflow of resolvers in Linode Network tab
  - Prevent text from being flush to the screen
- Object Storage:
  - Add ability to upload an SSL/TLS certificate for a Bucket
  - Add access management for OBJ access keys
  - Add loading state in OBJ access key drawer if buckets are loading
  - Add view mode to OBJ access key drawer
- VLANs:
  - Create modal
  - Add VLAN attachment option to Linode Create flow
  - Add VLAN table to Linode Network tab
  - Add VLAN column to Linode Configuration table

### Changed:

- Improve handling of Managed accounts when backing up Linodes

### Fixed:

- Cloning a Domain leads to “Not Found” page
- Navigation bug in Longview
- Tab-based navigation

## JS Client

### Added:

- UploadCertificateSchema endpoint
- uploadSSLCert endpoint
- getSSLCert endpoint
- deleteSSLCert endpoint
- ObjectStorageBucketSSLRequest endpoint
- ObjectStorageBucketSSLResponse endpoint
- CreateVLANPayload endpoint
- createVlanSchema endpoint
- getVlans endpoint
- getVlan endpoint
- createVlan endpoint
- deleteVlan endpoint
- connectVlan endpoint
- disconnectVlan endpoint
- getInterfaces endpoint
- getInterface endpoint
- createInterface endpoint
- deleteInterface endpoint
- linodeInterfaceItemSchema endpoint
- linodeInterfaceSchema endpoint
- LinodeInterfacePayload endpoint
- LinodeInterface endpoint

### Fixed:

- getLinode method now returns Promise<Linode> instead of Axios response
- getLinodeLishToken method now returns Promise<{ lish_token: string}> instead of Axios response
- deleteLinode method now returns Promise<{}> instead of Axios response

## [2020-09-29] - v1.21.0

### Added:

One-Click Apps:

- Jitsi
- Webmin
- Virtualmin
- Plex
- phpMyAdmin
- Azuracast

## [2020-09-21] - v1.20.0

### Added:

- Object Details Drawer
- Proxy Protocol field in NodeBalancer settings
- Add link to NotificationDrawer from Linode busy status
- Prevent text and other components from being flushed to the edge when <1280px

### Changed:

- Improve handling for unknown Linode types
- List allowed regions when creating or adding Linodes to Firewalls
- Prevent migration of a Linode with attached Firewalls to an unsupported Data Center
- CMR:
- Close notification drawer on internal links
- Style updates for:
- Object Storage > Buckets & Object Storage > Access Key headers
- OBJ Bucket Detail table

### Fixed:

- Change "Create Kubernetes" to "Create Kubernetes Cluster"
- Calculations for large LKE clusters (total CPU/memory) were incorrect
- Missing/duplicate page titles throughout app
- OrderBy lifecycle bug
- Typos: consecutive occurrences of 'the'
- MigrateLanding routing bug
- Add units (GB) to RAM in Linode Detail view
- Various CMR menu issues

## [2020-09-14] - 1.19.1

### Fixed:

- Cloud Firewalls could be attached to Linodes in unsupported regions
- Duplicate rows when editing Firewall rules

## [2020-09-09] - 1.19.0

### Added:

CMR:

- Managed Dashboard card to CMR dashboard
- System Status section in Notification drawer

- Environment switcher for dev tools
- Controls for mock service worker in dev tools

### Changed:

CMR:

- Change URL on Linode modal close
- Make OAuth apps table sortable
- Linode status icons should blink for in-progress actions
- Adding CMR header to the config/disk clone landing
- Table style updates for: - Account > Users
- Managed
- Billing
- SelectPlanPanel
- Make API tokens table sortable
- Make Rescue dialog full height
- Routing for Linode Modals
- Graph labels hidden for mobile

Cloud Firewalls:

- All IPv6 for Firewalls should be read as ::/0
- Disable port range in Firewalls drawer when selecting ICMP protocol
- Update Firewall doc URL
- Don't set outbound rules for firewall presets
- Firewall labels are not required; remove required annotation from textfield

- Fix tab change handler
- Improve error handling for API token drawer
- Always honor Linodes "group by tag” setting
- Stabilize table sort
- Update MySQL info to clarify that we install MariaDB
- Change Minecraft OCA to Minecraft: Java Edition
- Display general errors at top of VolumeAttachmentDrawer

### Fixed:

CMR:

- Hide hidden links from mobile nav
- Close action menu after action is selected
- Move domains banner above table

- Prevent error message overlap on Firewalls detail
- getLinode errors blocking landing page display
- Console error (isResponsive prop not recognized)
- Casing of NodeBalancer breadcrumb was incorrect
- NodeBalancer Config form submission
- Firewall detail breadcrumb
- The search bar sometimes returned no results for restricted users
- Managed Issue Drawer was crashing for users with empty timezones
- Longview: MySQL tab not rendering if NGINX is not installed
- Firewalls: handling of empty IPv6 responses

## [2020-08-25] - v1.18.0

### Changed:

- Disable Atlanta region for most customers, add messaging regarding the datacenter upgrade

## [2020-08-25] - v1.17.0

### Added:

- CMR:
- Primary Nav responsive scaffold + styles
- Use CMR action menu for Longview client rows
- Plan link in Linode detail header should open the resize dialog
- Table Styles:
  Managed: SSH Access, Credentials
  Profile: SSH Keys, API Tokens, OAuth Apps
  Support Tickets
- Linode Table Adjustments
- Notification drawer: chronological display
- Linode Storage Tab
- Linode Rebuild Dialog
- Flavor text in LinodeNews banner
- Backups enable from Linode action menu
- Mark events as seen when requesting in the notificationContext
- Completed progress events
- Longview processes tables to preferences sortKeys
- Enforced 64 character limit on text input
- Confirm enabling backups
- Handling strange timezone cases for summary graphs

### Changed:

- Longview installation instructions
- Clear UDF data on tab change in Linode Create
- Language to “allowlist” and “blocklist”

### Fixed:

- Interoperability issues
- Linode creation preselection params for from Clone, from Image, from Backup
- Loading spinner in Notification drawer
- Missing yup types dependency
- SSH fingerprint display issues for various key types
- Issue where loading a Domain’s Detail page directly wasn’t working on large accounts

## [2020-08-14] - v1.16.2

### Fixed:

- Clear UDF data on tab change
- Form fields issue on One-click Apps and StackScripts creation flows

## [2020-08-13] - v1.16.1

### Fixed:

- Add withRouter to LinodeRescue
- Update NodeBalancer details routing

## [2020-08-11] - v.1.16.0

### Added:

- CMR
- Table styles for Profile > Trusted Devices
- Table styles for Volumes landing table
- Table styles for Images landing table
- Table styles for NodeBalancer landing table
- Table styles for Firewall > Rules
- Table styles for Firewall > Linodes
- Responsive table styles for Firewall Landing and K8 Cluster landing
- Responsive styling for entity header (all variants)
- Responsive styling for Dashboard
- Dashboard Notifications: Add Community Updates, Pending Actions, and “Show more” button to Drawer
- Dialog full height
- Rescue Linode dialog
- Migration dialog
- Static banner for Linode changelog
- Tag styles
- Support Tickets and loading state
- Notification context
- Notification drawer

### Changed:

- Refactor tabbable content to be accessible by keyboard
- Update Popular Posts on /help page
- Use API Pagination for Domains when account size is large
- Display tax id of customer in invoice if available
- Use longview/plan endpoint to get active plan

### Fixed:

- Default zone if no user timezone
- Dates in several places displayed as “Invalid DateTime”
- OAuth tokens with expiry of null were crashing the app

## [2020-07-27] - v1.15.0

### Added:

- Ability to recycle all LKE pool nodes
- CMR: Dashboard
- Notifications
- View for single Linodes
- View for multiple Linodes
- CMR: Linode Details - Filter Linodes by status - Implement LinodeEntityDetail component
- Networking tab:
- Add Linode Monthly Transfer graph
- Add Historic Network Data graph - Add IP actions
- CMR: Responsiveness
- Linodes Landing
- Domains Landing
- Add reusable InlineMenuActions component - Apply updated table styles and action menu to Firewalls
- Custom dev tools
- User preferences editor

### Changed:

- CMR: Update Linode status pill designs
- Use API search and hide search tips for large accounts

- Use base 10 for network graphs

### Fixed:

- CMR: Adjust grid sizes to prevent EntityHeader elements from wrapping
- Brasilia timezone offset should be GMT-3
- Correct years in Linode Summary graph options
- Create Object Storage Bucket types
- Per-Linode network transfer total

## JS Client

### Added

- getLinodeTransferByDate endpoint
- recycleAllNodes endpoint (LKE)

### Changed

- Add access control and CORS fields to ObjectStorageBucketRequestPayload interface

## [2020-07-13] - v1.14.0

### Added:

- Color palette component in Storybook

### Changed:

- CMR: Linode Detail - Storage tab - Analytics tab - Network tab
- CMR: Linodes Landing - Add tag cell to Linode row - Summary view (replaces Grid view)
- CMR: Move Linode Resize action from tab to new modal component
- CMR: Apply updated table styles and action menus to LKE and Domains
- CMR: Secondary nav width
- Linode maintenance improvements
- Show maintenance time in UTC in downloaded CSV

### Fixed:

- Consistent Notices for restricted users when creating a Volume
- Longview CPU formatting
- Handle null dates in invoice details logic
- Expiry date check

## [2020-07-02] - v1.13.1

### Changed:

- Changed Percona OCA to Percona (PMM)

### Fixed:

- Matching logic for OCAs was breaking on parentheses

## [2020-06-30] - v1.13.0

### Added:

- Size column on the Object Storage Buckets table
- OCA: Percona PPM and Nextcloud
- Billing notice on Object Storage landing page when a user without Buckets has Object Storage enabled
- Notice that powered down Linodes still accrue charges
- Notice when user tries adding an NS record to a Domain without a A/AAAA record

### Changed:

- Adjustments to the Linode plan selection table
- Update password validation to match API change
- Update form validation for the Linode Disk drawer
- Make target field for TXT records multiline

### Fixed:

- Set autocomplete to false in password inputs
- Restricted users were able to view unavailable actions in Linode action menus
- Sort order on Domains page
- Prevent clickable events for deleted entities
- Prevent multiple Not found displays for Linodes

## [2020-06-16] - v1.12.1

Fix:

- 404 logic for Linodes Detail crashing for some Linodes

## [2020-06-16] - v1.12.0

### Added:

- Support for OBJ Singapore

### Changed:

- Move Nanode to “Standard” tab, change label to “Shared CPU”
- Handle host maintenance status
- Improve handling of negative amount on invoice details
- Upon rebooting Linode into Rescue Mode, prevent dropdown from reverting to "None"
- Save StackScript progress when creating or editing a script

## [2020-06-09] - v1.11.0

### Changed:

- Clarify Linode password fields in Reset Root Password vs. Rebuild
- Hide SSH key remove button for LISH settings when no keys are present
- Make main content banner dismissible
- Show error when Volumes limit has been reached but attempt is made to add a new Volume

### Fixed:

- CAA record input duplicating name/value

## [2020-06-03] - @linode/api-v4 v.0.27.1

### Fixed

- Remove required from createDomain validation schema

## [2020-06-02] - v1.10.0

### Added:

- Progress bar for newly-created Images

### Changed:

- Improve UX for GPU selection
- Add a link to Support in all “Verification is required” errors
- Allow clearable numeric inputs in Domain Records Drawer
- Remove Cloud Manager version tag from Support Tickets

### Fixed:

- Broken SVG combination when creating a Linode
- Profile routing didn’t handle incorrect routes
- Firewall document title
- ICMP port bug when editing Firewall rules
- Update textfield to use input id for "for" attribute
- Copy fix for Profile -> Referrals
- Accessibility of Dashboard “View Details” links

## [2020-05-21] - 1.9.0

### Added:

- @-expansion for Target field in Domain records
- “Last Modified” column to Domains landing page
- Support for Third-Party Authentication

### Changed:

- Default support ticket option to 'General'
- Defer requests to Linodes and Images until after app has loaded
- Redesign Billing section of app
- Request Domains when hovering over Primary Nav link
- Update behavior for TFA cancel button
- Rename linode-js-sdk to @linode/api-v4 to prepare for NPM publication
- Update @linode/api-v4 documentation
- Lazy load Linodes on BackupsDashboardCard

### Fixed:

- Keyboard access to open Support ticket creation drawer
- Missing SSH keys in some flows for Linode creation
- Second column alignment for NodeBalancer on dashboard
- Tag display on mobile viewport
- Removed extra requests
- Prevent crashing for unactivated users
- Remove duplicate instance requests

## [2020-05-04] - v1.8.0

### Changed:

- "Node Status" is now "Backend Status" on NodeBalancers list and detail view
- Minimum payment placeholder text
- Hide Recycle Node in the LKE Node action menu
- Provide cluster summary information for LKE search results

### Fixed:

- Remove invalid credits
- NodeBalancer Error Handling (SSL)
- Xterm flow control errors
- Remove stray characters in FromBackupsContent

## [2020-04-20] - v1.7.0

### Added:

- Firewalls: Client-side form validation

### Changed:

- Make LKE available regardless of customer account response
- Request OBJ Buckets per-cluster
- Theming performance optimizations

### Fixed:

- Correct alignment for “Date Created” field on mobile invoice table
- NodeBalancer error handling
- Current size of pool was updating along with target size when resizing a Node Pool.

## [2020-04-15] - v1.6.0

### Added:

- EnhancedNumberInput component

### Changed:

- Redesign of LKE interface, including Detail and Create Cluster views
- Add LKE clusters to search results

### Fixed:

- Case where some long-running actions may not be updated when complete

## [2020-04-10] - 1.5.1

### Changed:

- Update LKE schema to reflect breaking API changes (version is now k8s_version)

## [2020-04-07] - 1.5.0

### Changed:

- [Performance] Lazy load Domains data
- Set a timeout when requesting Gravatars
- Preserve Support ticket text on page reload

### Fixed:

- Account tab crashing for some users
- Fix handling of local storage on logout
- Longview NGINX tab crashing for some users
- Screen readers cannot access "Create Linode" interface
- Values on LV Network graphs displayed incorrectly
- Placeholder component double h1 display issue

## [2020-03-30] - v.1.4.1

### Fixed:

- Images not available on Marketplace flow

## [2020-03-30] - v1.4.0

### Changed:

- Change "One-Click Apps" to "Marketplace"
- Change message in the Events table empty state
- Allow up to 10,000 USD payment with PayPal
- Lazy load Images

### Fixed:

- Improve skeleton loading screen in the Events table
- Fix bug in Image select
- Fix visual bug in OAuth Apps table header (dark mode)
- Edit DNS Records containing "linode.com" substring

## [2020-03-23] - v1.3.0

### Added:

- Firewalls:
  - Add, Edit, and Delete rules
  - Prompt when navigating away from unsaved rule
  - Add icon to table rows

### Changed:

- Remove “Active Deploys” StackScripts table column and add “Total Deploys” column
- Update customer referral criteria text
- Improve syntax highlighting
- Include LKE clusters in Support tickets dropdown
- Make Support Ticket table sortable by summary, ID, and updated_by
- Update Images messaging to reflect new 6144 MB default limit
- Remove deprecated border on graph legends
- Adjust header padding in Linode Group By Tag
- Cloud Manager PDF invoices pull in customer tax ID regardless of added date

### Fixed:

- Volumes creation bug
- Accessibility warnings for password inputs
- Remove page break on invoices
- Fix collision of tax ID and address on invoices
- 404 error after importing Domain Zone
- Enable editing of DNS Records containing "linode.com" substring
- Removed extraneous table header cell on Search Landing table
- Add error handling for Kubernetes breadcrumb
- Prevent Linode Power Control menu from being empty upon click

## [v1.2.0] - 2020-03-09

### Added:

Cloud Firewalls:

- Firewall Linode view
- Add Device drawer in Firewall Linodes view
- Remove device modal in Firewall Linodes view
- Firewall Rule Table
- Firewall Rule Drawer
- Remove devices from Firewall Devices action menu

### Changed:

- Make Linode links in Firewall rows clickable
- Pin GitHub release link to linode-manager tag
- Add support for secondary promo button
- Delay data request until user types in Search bar
- Display invalid StackScript errors on Linode rebuild
- Show error when request to /pools fails in LKE
- Respond to linode_config events

### Fixed:

- Uptime calculation in Longview
- Sorting by Object Storage region
- Sorting the OBJ Bucket table resulted in duplicate rows when there were multiple buckets with the same name

## [v1.1.1] - 2020-02-28

### Fixed:

- Ensure Object Storage is displayed for restricted users.

## [v1.1.0] - 2020-02-25

### Added:

- Cloud Firewalls:
  - Add Firewalls endpoints to SDK
  - Allow enable/disable/delete Firewall actions
  - Enable Firewall creation
- LKE:
  - Warn users before creating/resizing a cluster to a single node
  - Handling for LKE events (lke_node_create)
- Accessibility improvements:
  - Add aria attributes on Linodes, Images, and Kubernetes Landing pages
  - Add aria attributes to Action Menu items
  - Improve accuracy of column header count
  - Add title to ADA chat bot

### Changed:

- Update CPU threshold alert validation
- Use display: standalone in manifest.json for IOS support
- Update event toasts and add new toasts for clone/resize events
- Increase line height of rendered Markdown for readability
- Remove Import Tags CTA on the Dashboard
- Remove obsolete GDPR Modal
- Close all active Lish sessions when logging out
- Unify IP address input patterns for Domains
- Allow direct links to OCA details drawers
- Always allow TCP Connection as a health check for NodeBalancers
- Hide duration for host_reboot events

### Fixed:

- Mode persistence in Linode Disk drawer
- Formatting/highlighting in kubeconfig preview drawer
- Incorrect disks sometimes displayed in different tabs
- Regression from Notistack update
- fixing selected table row for rows with active caret variant
- Remove plural for hour on DNS manager
- Use appropriate button text when restoring from an Image

## [v1.0.1] - 2020-02-13

### Added:

- Support for Object Storage in Frankfurt, DE

### Fixed:

- Removed feature flag logic preventing some users from accessing Longview

## [v1.0.0] - 2020-02-10

### Added:

- New One-Click Apps:
  - MEAN
  - MongoDB
  - Flask
  - Django
  - Redis
  - Ruby on Rails
  - PostgreSQL

### Changed:

- Change default distro to Debian 10
- Fix changelog to match GitHub release
- Update graph units on Linode Details page
- Fetch backups after selecting Linode in Linode Create
- Toast notifications for Image related events
- Unify graph colors across the app
- LKE: Warn users before allowing a single-node cluster
- LKE: Update typings for node pools
- Show Domains Import Zone Drawer button when a user has no Domains
- Improve compile time
- Cleanup axios version management and aligning
- Prevent unneeded requests when loading Lish window

### Fixed:

- Updating a Linode causes in-progress events to stop being displayed
- Safari: Open ticket button issue
- Remove plural for hour on DNS manager
- 'Show More' tooltip accessibility fix

## [0.84.1] - 2020-02-04

### Fixed:

- Fix issue where only 100 Images were displayed

## [v0.84.0] - 2020-01-28

### Added:

- Add Domain Transfers to Domain Drawer for slave Domains
- “Delete” button to Domain Drawer
- Improve Form context help/info in Configuration Edit
- Ability to delete a Domain from Domain Detail
- Show a banner when one or more Regions experience outages
- New One-Click App: phpMyAdmin
- Show progress on the target Linode while cloning

### Changed:

- Add link to Resizing a Linode Guide
- [LKE] Node pools should have 3 nodes by default
- Longview Process Arrow Rework
- StackScript author links from StackScript Detail page
- Sort Kubernetes versions by label descending in dropdown
- OAuth Scopes can be space separated
- Store Longview time selection in user preferences

### Fixed:

- Longview Overview graphs were incorrectly showing data as “today”
- Refactor LineGraphs to allow mixed units for network graphs
- Routing on Search Landing page for slave Domains
- Fix Linode network graph units
- Display updated credit card info in Billing Summary when credit card is updated
- Visual regression on Clone Configs/Disks
- Loading state for Longview landing page (visual bug)

## [v0.83.0] - 2020-01-17

### Added:

- Longview:
  - Apache
  - MySQL
  - Processes
- “Show All” option on Domain Records
- Ability to edit AXFR for slave Domains

### Changed:

- Hide Backups CTAs from restricted users
- Update Longview graph colors
- Support API requests for up to 200 entities at a time
- Make One-Click apps visible to all users from primary navigation

### Fixed:

- Rounding in Longview line graphs
- Add space to API Tokens HTML title
- Allow rebooting from Rescue mode

## [v0.82.0] - 2020-01-08

### Added:

- Source Linodes from Redux in Networking and Backups
- Longview: empty and loading states for Disks tab
- Longview: NGINX tab
- Longview: Network tab
- Show All option for Volumes, Domains, NodeBalancers
- Sentry improvements
- Ignore newrelic and chrome extension errors
- Add security.txt at cloud.linode.com/.well-known/security.txt

### Changed:

- Copy for Prometheus and Grafana One-Click Apps
- Show confirmation dialog when resizing a Linode
- Update LV documentation to include info on warnings/errors
- Add copy explaining prorated transfer
- Move untagged items under tagged items for all entities
- Allow primary nav to set multiple active links
- Allow Charts.js native (canvas) legends for graphs
- Filter processes by username or process name
- Error feedback for failed snapshot backups
- Support for Disks/Configs events
- Add URL param to reset password button
- Linode details accessibility adjustments

### Fixed:

- Layout overflow on Longview overview graph section
- Missing error/loading states in AccessKey table & drawer
- Older invoices causing an error when creating PDF
- Weblish error (safe access properties)
- Docs links for Longview installation instructions

## [v0.81.1] - 2019-12-23

### Change:

- Update error reporting to reduce unnecessary reports

## [v0.81.0] - 2019-12-19

### Added:

- Longview:
  - Display non-error Notifications from Longview API on Longview Details page
  - Empty and loading states for Overview graphs

### Changed:

- Use “Last Backup” data on /linode/instances endpoint to avoid multiple requests to /backups (improves performance)
- Show deprecated label for distros in Images dropdown

### Fixed:

- Display invoice PDF total, tax, and amount values in \$0.00 format
- Reduce OCA tile spacing between icon and label

## [v0.80.0] - 2019-12-16

### Added:

- Remove check zone from domain action menu
- Move sidebar in Domains detail
- Duration time to Events Landing and Activity Feed
- Display billing notice when deleting last Object Storage Bucket
- Longview: - Landing page - Overview page - Installation page - Enable client sorting on Landing page - Packages drawer
- New One-Click Apps:
- Docker
- Jenkins
- Grafana
- Prometheus
- MySQL
- LEMP Stack
- Shadowsocks

### Changed:

- Remove ZXCVBN and improve password hints
- Remove (disabled) Check Zone and Zone File actions from Domains
- LKE added to PAT Scopes
- Make search bar case-insensitive
- Option to show all Linodes on Linode Landing
- Remove same-domain SOA email restriction (client-side validation)
- Update release docs
- Styling adjustment to IconTextLink

### Fixed:

- Accessibility features overhaul
- Update Object Storage icon color
- Error formatting on editable input labels
- Event badge hidden behind scrollbar
- Linode status not updated after resizing is complete
- State not responding to Longview events

## [v0.79.0] - 2019-11-19

### Added:

- Longview: Static tables for listening services/active connections
- Longview: Line Graph abstraction
- Longview: Sort clients by values
- Longview: Client count warning modal
- Longview: Installation tab
- Longview: Overview section scaffolding
- Longview: Footer text for non-Pro users
- Longview: Uptime, Packages, and Hostname data added to client rows
- Longview: Display circle loader if client doesn’t exist or is still being loaded
- Longview: Overview icon section with some static data
- Ability to edit rDNS for IPv6 ranges and pools
- Display of route target for IPv6 ranges
- Abstraction of buttonLink
- Ability to collapse main navigation on larger screen sizes

### Changed:

- Longview: Change landing view from table to cards
- LKE Landing documentation link target
- Loading state and clear errors on Linode Backups form submission
- Longview documentation link target
- Remove welcome banner
- Updated logo asset
- Updated header and footer styles

### Fixed:

- Linode list not being updated when creating Linodes externally
- Type checking in getAPIErrorFor
- Duplicate error display in account/settings
- Empty volumes create button

## [v0.78.0] - 2019-11-12

### Added:

- Support for new Sydney datacenter
- Longview: Handle restricted users
- Longview: Plan Details page
- React a11y Linters
- Ability to Search For Longview Clients

### Changed:

- Longview: Use live SysInfo data on landing page
- Longview: Landing page uses card layout rather than table
- Longview: Use cached data to populate Gauges
- LKE: split details page into Details and Resize tabs
- Enhanced BreadCrumb Component
- A/AAAA record drawer title

### Fixed:

- LKE Node pool deletion
- LKE Routing

## [v0.77.1] - 2019-11-11

### Fixed:

- Hotfix: Safe access event.secondary_entity

## [v0.77.0] - 2019-11-06

### Added:

- Supply the LKE Cluster options from APIv4
- Longview Client Gauges for Swap and Storage
- Ability to paste clipboard content into the Glish interface from your local machine
- Longview landing tabs
- Skeleton loader to table rows

### Changed:

- [SDK] - Implement Object Storage endpoints
- Longview Client creation workflow
- Display the booted configuration in Linode Boot and Reboot event messages
- Pre-fill Disk select fields rescue tab with available Disks
- Refactor Create Volume Workflow
- Update Object Storage confirmation modal copy
- Client-side validation for CVV field on the Billing page
- Making CVV code a required field within Billing page
- Update favicon
- Updated syntax for Linode details specs
- Filter out GPU from plan selection for LKE
- Filter out regions that don’t have LKE capabilities

### Fixed:

- Blog feed on Dashboard
- StackScript detail breadcrumbs
- Adjustments to Kubeconfig buttons on smaller breakpoints

## [v0.76.0] - 2019-10-30

### Added:

- cPanel and Plesk One-Click Apps
- Confirmation modal when adding Object Storage service
- Option to cancel Object Storage service in account/settings
- Object Storage to list of Personal Access Token scopes

### Changed:

- Download Objects instead of opening them in a new window
- Make Object Storage Bucket URLs clickable
- Invoice/Payment PDF Updates
- Remove tags from Kubernetes cluster creation and detail

### Fixed:

- Error handling for 404s on Kubernetes cluster detail

## [v0.75.0] - 2019-10-22

### Added:

- Ability to view, add, edit, and delete Longview Clients
- Interactive flag for Linode card
- Maintenance status schedule date always visible on table row
- Maintenance status to Linodes Dashboard Card
- Confirmation modal when creating new backup snapshot

### Changed:

- Add helper text to Kubernetes Node Pool rows if not all Nodes are accounted for
- Adjust display of expiring credit in expandable panel header
- Collapse primary nav at wider breakpoint
- Copy changes for Plesk and cPanel One-Click Apps
- Update Managed dashboard graphs
- Update Access Key creation message (Object Storage)

### Fixed:

- Sort by status (Linodes)
- Consistency with display of charts legend units
- NodeBalancers configuration layout
- Maintenance status not be displayed after updated a Linode

## [v0.74.1] - 2019-10-08

### Changed:

- Managed Dashboard chart colors to match corresponding charts from the Linode Detail screen

### Fixed:

- Issue with TextField components missing labels
- Issue with Managed Dashboard "Open a Ticket" button not functioning

## [v0.74.0] - 2019-10-07

### Breaking:

- Remove ability to delete buckets that contain objects

### Added:

- File Uploads for Object Storage
- Ability to delete Objects
- Managed Dashboard widget
- Ability to Edit Domain Status

### Changed:

- Expand Linode public SSH Key on hover
- Add copy indicator to Linode public SSH Key button

### Fixed:

- Issue with chart tooltips not showing correct time
- Cell height for Kubernetes Clusters while in edit mode
- Link to status.linode.com for all maintenance notifications

## [v0.73.0] - 2019-10-01

### Added:

- One-Click App support for feature flags
- cPanel to One-Click App Library
- Plesk to One-Click App Library
- Firewall Landing and Table

### Changed:

- Update manifest.json to allow for iOS and Android “pin-to-home-screen” functionality
- Display country flag after Region has been selected
- Improve links in Add New menu
- Disallow duplicate bucket names
- Allow deletion of disks on active Linodes
- Sort support tickets by order created
- Add AU tax ID to invoice generator
- Move Managed activation flow to /account/settings
- Add height to radio cell for resize table
- Adjustments to chip label styles
- Linode JS SDK Documentation usage guide with examples

### Fixed:

- Overflow-x in select drop downs on compact mode

## [v0.72.0] - 2019-09-23

### Added:

- Managed service monitor history drawer
- Firewall Landing and Routing
- New landing page for unactivated users
- New table-based flow for selecting a Linode plan
- Managed endpoints to JavaScript SDK

### Changed:

- Display Never for Managed credentials that have never been decrypted.
- Use password input component for credential drawers
- Don’t show DNS “Your Linodes are not being served” banner for restricted users

### Fixed:

- Error handling for Managed dashboard card
- Tooltip for current plan on resize Linode workflow
- Layout issue with nodeBalancers create workflow
- Stackscripts creation routing and CTAs

## [v0.71.0] - 2019-09-18

### Added:

- Bucket Detail page (Object Storage)

### Changed:

- Display “Never” for Managed credentials without a last_encrypted field
- Update copy on EnableManagedPlaceholder
- Add Normalized Data Structure to Images in Redux
- Hide active caret on mobile navigation
- Add Edit action to Kubernetes Cluster action menu
- Add Kubernetes cluster label to filename when downloading kubeconfig
- Switch position of “Region” and “Last Backup” columns on Linode table
- Account for over limit case for account transfer display on dashboard
- [SDK] Migrate /regions
- [SDK] Migrate /linodes
- [SDK] Migrate /kubernetes
- [SDK] Migrate /profile
- [SDK] Migrate authentication requests

### Fixed:

- Overflow in react selects
- Error with Placeholders missing key prop
- Image select bug
- LinodeConfig memory size limit not displayed
- Style regression for notification thresholds panel
- Tooltip not showing for selection cards
- Update dependencies to resolve vulnerabilities
- Security issue with external links

## [v0.70.0] - 2019-09-9

### Added:

- One-Click App navigation
- Placeholder to enable Managed for an account

### Changed:

- Remove Private IP Checkbox from Clone Linode form
- Edit drawer for Managed service monitors
- Use dropdown instead of cards when selecting an image/distribution
- Replace Region/Province Select with Text field in the Update Contact Information form
- Managed credential drawer now uses separate forms for label and password/username
- Update Managed icon on the dashboard to align with entity icons
- Messaging and billing calculations for expiring credits
- Use account credentials and groups when creating or editing a Monitor
- Monitor dashboard card links to /managed/monitors instead of /support/tickets
- Better error messaging for Inter-datacenter migrations

### Fixed:

- Client Secret key wrapping
- Backups and clones always labeled as Debian
- Correctly show upgrade banner for all deprecated types
- Issue with kernel input not being populated with a default value in the Edit Linode Configuration form
- Stop inverting SSH key access to account for the API fix for this bug

## [v0.69.0] - 2019-08-28

### Added:

- Inter-datacenter Migrations for Linodes
- Warning text to detach volume dialog
- Ability to add, edit, and delete Managed credentials
- Ability to add, edit, and delete Managed contacts
- Ability to add, update, and delete Managed service monitors
- Ability to update Managed SSH Access for Linodes
- Button to navigate to Create Linode workflow from the Linodes landing page

### Changed:

- Use dynamic versions for Kubernetes create workflow
- Remove tags from Domains landing table rows
- Support Tickets refactor
- Improve splash page loader animation
- Required textfields now show “(required)” instead of an asterisk
- Show tax banner on dashboard and account landing only
- Region selection in both the Create Linode and Create Volume workflows
- Object Storage documentation

### Fixed:

- Update copy in credentials table
- StackScript error handling

## [v0.68.0] - 2019-08-15

### Added:

- Support for promotion codes and expiring credits
- SSH Access Key Table for Managed
- Delete monitor action to MonitorActionMenu
- GST notification for users in Australia and India

### Fixed:

- CSS animations in JSS
- NodeBalancer connection grid display
- Long titles broken on image names
- Button types for cancel actions
- Issue with entity labels not being able to be updated when an event was in-progress
- Billing form state resets when changing country selection
- One-click cards display on large breakpoints

## [v0.67.0] - 2019-08-12

### Added:

- Ability to close account from Cloud Manager
- Managed SSH Access: Linode Public Key component
- Disable Managed service monitor
- Display list of Managed service monitors
- Adding tooltip display variant + styles
- Breadcrumb enhancements
- Tooltip for cluster command on Kubernetes detail page
- Managed service monitor list
- Add SupportWidget to Managed landing
- Adjustments to view config drawer
- Adjustments to buttons
- Optional CVV field when updating credit card information

### Changed:

- Region selection in create workflow
- Improve error handling for LKE node pools
- LKE form element UI adjustments
- Make search link the first option in Algolia search bar
- Add Logic to CSV Link to Prevent CSV Injections
- Add Mutation Time to Banner
- Disable Add User Button for Restricted Users
- Select user by default after adding an SSH key using the AccessPanel
- Add max-width to main content
- Handling for new event types
- Improve link styles for PDF downloads in account
- Enable hot reload for local development

### Fixed:

- Charts display issue
- Issue with css transitions on theme switch
- Firefox issue with flag icons
- Broken error key scrolling in Get Help search bar

## [v0.66.0] - 2019-07-30

### Added:

- Public Cloud manager codebase is now officially a monorepo, leveraging Lerna
- New splash screen on initial app load
- Linodes list status column
- Show Linode tax ID on invoices for users in EU
- Unauthorized messaging for tokens and users
- User preferences for Domains group-by-tag
- User preferences for NodeBalancers group-by-tag
- User preferences for Linode view
- Tooltips for zone-related actions

### Changed:

- Abstract Link component so that it can handle external links
- Better helper text for failed image creation
- Make SSH key-fetching conditional on whether user is restricted
- Error handling for adding SSH keys in creation workflow

### Fixed:

- Events regressions and add handling for new event types
- IP Transfer panel refreshing when a long-running event was occurring
- Issue with empty data set render blocking the app
- Issue with power control not showing “Busy” status when Linode was busy
- Configs view crashing after Linode rebuild
- Clone config/disk not updating when number of disks changed

## [v0.65.0] - 2019-07-17

### Added:

- Mutation estimated time to Drawer
- Cookies enabled check
- Option to create SSH Keys in the Linode creation workflow
- Tooltip to Zone File action item for Domains
- Time-delayed patience text when editing RDNS
- Loading state for submit button in edit RDNS drawer

### Changed:

- Observe user preferences for Volumes-group-by-tag
- Observe user preferences for Linodes-group-by-tag
- Linode Backup helper text

### Fixed:

- White screen issue affecting users with slower connections

## [v0.64.0] - 2019-07-15

### Added:

- Feature: Clone configs/disks from Linode detail page

### Changed:

- Improve markup for click behaviors for entity titles in clickable rows
- Remove allocation of private IP on Linode create
- Filter private IPs in NodeBalancer config node by region
- Update NB config node schema

### Fixed:

- Domain record validation
- Important notice icon placement
- Fix spelling mistake in LinodeConfigDrawer
- Safe access backups.snapshot

## [v0.63.1] - 2019-07-08

### Changed:

- Remove VAT banner.

## [v0.63.0] - 2019-07-03

### Added:

- Add username to event rows on both Events Landing and Linode Detail views
- Use preferences endpoint to save theme and spacing
- Show helper text for auto-backups for Managed users
- Use account.capabilities for displaying LKE

### Changed:

- Update monthly network transfer panels
- Update breadcrumbs site-wide
- Update primary navigation active state icon
- Disable auto-resize option when moving to a smaller plan

### Fixed:

- Linode Notification Threshold updates not displaying
- Group by Tag behaving inconsistently
- Progress button loading icon
- Fix console warnings for sidebar styles
- Margin in header on PDF invoices
- LinodeCreate selected region tab state
- Issue with Volume size not updating
- Do not attempt to create DNS records for Linodes with IPv6 disabled

## [v0.62.0] - 2019-06-21

### Added:

- Add One-Click Apps detail view
- Add helper text for auto backups
- Add links to Object Storage documentation
- Allow external links to open Support ticket drawer

### Changed:

- Updates to base theme
- Make entity links in Support tickets clickable
- Do not attempt to create domain records for slave domains
- Update max length for Bucket label
- Reduce NodeBalancer price
- Copy for maintenance notifications
- Update styles for important/critical notifications
- Add link to support ticket in SelectTabPanel
- UI for selecting memory limit on Linode Config Profiles
- Adjustments for compact mode, some adjustments for mobile compact on help banner panel as well

### Fixed:

- Dashboard header spacing
- User-defined fields not resetting on App/StackScript change
- Catch deleted events errors
- IP sharing private addresses not showing
- Regression with maintenance notification list item severity
- Expandable panel icons
- Point of entry in dashboard
- Animation isolation logic
- Abuse ticket banner fix

## [v0.61.0] - 2019-06-14

### Added:

- Add support for GPU instances
- Validate no whitespace in bucket name
- Implement ctrl+click on the events drop down options
- Radio Toggle For Config Memory Limit
- Maintenance window to CSV
- Add support for Mumbai datacenter
- New Bucket icon for Object Storage
- Check SOA email when updating domain
- Add normal error handling for delete/detach Volume confirmation modals
- Add validation to prevent email addresses in the target domain
- Add client validation for duplicate domain records
- Added tooling to capture performance metrics

### Changed:

- Always update profile with authorized_keys (LISH)
- Source Dashboard cards from Redux
- Replace Algolia search bar with React-Select
- Makes the maintenance notification badge a warning instead of error

### Fixed:

- Conditional Logic When Validating SOA Record for Slave Domains
- Fix Linode Clone kebab
- REACT_APP_LISH_ROOT typo
- Maintenance Banner Styles
- Added missing issuer to TFA URI
- Adds Linode Label to Notification Drawer List Item

## [v0.60.0] - 2019-06-07

### Added:

- Support for critical maintenance banners, times, and tickets
- Clone Linode from Linode Action Menu

### Changed:

- LKE: Creation Table UI for editable node count and remove actions
- Remove Tags input field when cloning a Domain
- Default Linode config memory limit to 0 if a limit is not already set

### Fixed:

- Show progress for Linode upgrades
- Select Plan Panel default tab select logic
- Primary Nav was showing a scrollbar
- Support Ticket Drawer should retrieve all entities for selection
- Nodebalancer config select values
- Split token on logout before revoking it
- Re-add Kubernetes button in Create menu

## [v0.59.0] - 2019-05-31

### Changed:

- Add name of data center in outage notifications
- Update table cell styles

### Fixed:

- Main search bar styles

## [v0.58.0] - 2019-05-29

### Added:

- Ability to optionally resize disks after Linode resize
- Option to automatically create domain records
- VAT banner

### Changed:

- Replace circle progress on Linode summary
- Replace circle progress on dashboard
- IP component placement
- Adjustments for tablet Linode list view styles
- Update NB empty state copy
- Update empty copy for Images and StackScripts
- Include app name in reset and delete oAuth app modal
- Use account.capabilities to determine if OBJ is enabled.

### Fixed:

- Show all line items on invoice PDF and detail screen
- Error and loading states for OAuth view
- Error handling re: Linode settings panels
- Uncaught error in disks and configs requests
- Domain SPA record editing error
- StackScripts sorting issue

## [v0.57.0] - 2019-05-21

### Added:

- Markdown and Markup Support for Support Tickets and Replies
- Notice for domains when they aren't being served
- Abuse ticket banner
- Enable ctrl+click on profile dropdown buttons and clickable rows
- Ability to update email from Account -> User Profile
- Add event messages for host reboots, Lassie reboots, and Lish boots
- Create a Kubernetes cluster
- Action menu item to download Kubernetes kubeconfig.yaml

### Changed:

- Include the Linode Label in delete dialog modals
- Include Linode and Volume labels in Volume dialog modals
- Re-enable plan type copy and update the text
- Small style change for NodeBalancer config action panel
- Update timezone selection
- Update Linode backup selects
- Copy in delete Bucket confirmation modal
- Object Storage: separate "Size" column into "Objects" and "Size"
- Improved Select components across the app

### Fixed:

- Linode network transfer stats
- Linode migration success/error states
- IPv6 DNS Resolvers
- Typo in Disable TFA dialog
- Block device assignment
- Issue where error views were displaying after data was loaded

## [v0.56.0] - 2019-05-08

### Changed:

- Update Sentry Whitelist URLs
- Display bucket size using base 2 instead of base 10
- Update Events Landing in Real-Time
- Validate Rebuild from Image form before modal opens

### Fixed:

- App crashes when downloading an invoice PDF for unlabeled backups
- Deploy new Linode from backup
- Fixing Sentry Errors
- Prefix Length to the IPv6 Pools and Ranges
- Pagination Footer numbering

## [v0.55.0] - 2019-05-06

### Added:

- Improve GA Event Imports in Manager
- Local storage optimizations
- Remove Volumes From MaybeRenderError
- Add error handling documentation
- Replace all pathOr<string>s with getErrorStringOrDefault
- Placement of Object Storage in Primary Navbar
- Add /buckets to OBJ link in PrimaryNav
- Add Ada google analytics
- Reverse sorting arrows for sortable tables
- Explicitly display regions error in Linode volumes form
- Taxes and Subtotal on Invoice
- Fixed positioning of ADA CTA
- Add docs for pushing tags to upstream
- Add polling for NBs on landing page
- Add polling to NB detail
- Check region filtering
- Make Linode dropdown menus searchable via React Select

### Changed:

- Scroll-to logic for Disks and Configs page changes
- Stats request optimization
- Display reserved IPs in IPv4 table (Linode Detail)
- Style Updates to Invoice PDF
- Update Activity Stream Based on Events
- Sentry Updates
- Move Object Storage keys to the OBJ Landing page
- Update Notistack and make toasts dismissible
- Update IP address listing on card view and styling
- Paginate Disks and Configs with Paginate Render Props Component
- Removing tag column and cells styles updates
- Lish tabs style updates
- Sync up with disk select changes and reset disk options on Linode select clear
- adjustments to UDF widths for medium + breakpoints
- Manual backup errors appear within form instead of as toasts

### Fixed:

- Fix issue with error appearing on volume attach drawer
- Fix pre-selected Cluster select
- fix to action menu on mobile (align right for consistency)

## [v0.54.0] - 2019-04-23

### Added:

- Ada support bot available app-wide
- Ability to delete Object Storage buckets

### Changed:

- Update ListBuckets
- Don't use last Stats reading on Linode/NodeBalancer graphs
- Adjust messaging in UserEventsList for deleted entities
- Add documentation to CONTRIBUTING.md
- Expire token on logout
- Catch disk error correctly for blocked requests
- Use EnhancedSelect for the DiskSelect component

### Fixed:

- AxiosError handling for getErrorStringOrDefault

## [v0.53.0] - 2019-04-18

### Added:

- Event stream summary
- Empty search logic
- List all IP addresses in summary panel
- Activity tab on Linode Details
- Account Creation Date to Summary Panel
- GA event for compact mode switcher
- GA events for billing-related actions
- New icons for Managed Services and StackScripts

### Changed:

- Styling no results page
- Styles and mobile handling
- Remove tag column and styling for NodeBalancers Landing
- Remove tag column and styling for Linode Landing
- Re-order fields on monthly network transfer panels
- Place disk spaces in sidebar
- Moving disk space component
- Adjustments for tables for devices
- Making beta tag blue for both themes
- Adjust spacing for add buttons for domain records
- Remove bolding from notices
- Styling of disk storage panel
- Adjustments to table row for DT and activity feed updates
- Scroll buttons styles for mobile tabs
- Resolvers object to match new Toronto name
- Table cell sizes
- Focus states for clickable rows
- Styling for graph legend on Linode detail page

### Fixed:

- Wrap domains text on Domain landing
- Routing on Support Ticket pages
- Detach from deleted Linode
- Image creation drawer labels spacing
- Linodes graphs legends placement
- Minor copy fixes
- Typos and init code guidelines

## [v0.52.1] - 2019.04.09

### Added:

- Feature: One-Click Apps
- Events landing page
- Image expiry date to Image table
- Drop-shadow on "Create" menu
- Setup GA to track usage of Linode create screens
- Missing typography for backup placeholder text
- Front-end validation for tag input error
- Loading states to tag panel
- Added "nofail" to Volume Config Form

### Changed:

- Do not show Hively icons from Linode user
- Removed Linode StackScripts from StackScript Landing page
- Combined My StackScripts and Account StackScripts under one tab
- UDF Style Updates
- Hide helper text for UDFs so it will display for Linode Root Password
- Update Linode Detail permissions
- Change Toronto display from CA to ON
- Update Volume Landing on Linode Details
- Update label for Taiwan in the Update Contact info panel

### Fixed:

- User events dropdown items styles
- Delete Linode button modal button style
- Backup CTA link
- Backups creation error display
- Styling for disabled destructive buttons
- Wrong header for accessibility tags
- Settings icon placement
- Restore process finished event handling
- Config updating bug
- Non-field errors for NodeBalancers

## [v0.51.2] - 2019.03.28

### Fixed:

- Fix issue with Lish console not rendering correctly (#4736)

## [0.51.0] - 2019.03.25

### Added:

- Add uninvoiced balance display
- Delete Linode from kebab menu
- Support and icon for Alpine Linux
- Missing typography for crash message
- New event types and account events messages
- Card payment confirmation modal
- Add aria labels to inputProps for textfields and radios

### Changed:

- Update list of available timezones and fix offset sorting
- Include pagination on clone from Linode flow
- Adjust dialog size to md to accommodate for api token width
- Request notifications after migration finished
- Reset error state on disk and configs request
- Improve placement of entity icons on mobile tables
- Make sure all radios inherit proper labeling
- Dim main content when searching
- iOS/Mobile Cloud Manager Welcome Screen
- Make CVV Optional when making a credit card payment
- Adjust "No Results" message when searching in a Select element
- Handle volume permissions
- Update Auth Code
- UI for restricted edit volumes form
- Delete confirmation includes Linode Label
- Source Linode Rescue volumes/disks from redux
- Update slave domain editing UX
- Add props.classes for RenderGuard updateFor

### Fixed:

- Only disable Linode Boot if there are no configs
- Prevent NodeBalancers from crashing during creation
- Linodes with no type data cause error state
- Kernel Select sometimes was not populated on load
- Upgrade and Fix PayPal
- Fix logger, add report button
- Remove extra scrollbar on tables on Firefox
- Request notifications after migration finished
- Issue with Created Linodes with no image being in an indefinite loading state
- Issue with 0600-0800 not being a valid backups timeslot

## [0.50] - 2019.03.11

### Added:

- Fix Linode label update error
- Display guidance to bottom of search bar to make it easier for users to work with enhanced search functionality
- Add Compact Mode (theme toggle) and corresponding settings panel on PrimaryNav
- Users can now rebuild a Linode from a StackScript
- Backup mode support for NB nodes
- Support for Toronto region
- Improve spacing of Domain table
- Password requirements to the PasswordInputField
- Add last auth IP address and last auth time to trusted devices table
- Include transfer stats to Linode summary panel
- Additional helper text for Volumes creation drawer
- Helper text when creating NodeBalancers
- Enable user to Remove Public IP Addresses
- Add tags column to NBs and volumes
- Filter volume select based on grants
- Apply convention for HEX values in theme files
- Updated-by column to support tickets
- Adjustments for Dark Theme in account pdf links

### Changed:

- Display confirmation dialog before rebuilding Linode
- For Backups creation flow, only reset selection if different Linode is clicked
- Linode Resize flow adjusted to follow API changes (resizing Linodes now enter the migration queue)
- Rebuild Linode image select now uses tiles instead of a dropdown
- Update list of whitelisted events to include new event types returned by the API
- Update all instances of updateFor to include props.classes
- Remove Tokyo 1 as an option when creating Linodes and NodeBalancers
- Pre-populate payment amount to the current Balance
- Add disk imagize events to show progress
- Volume Labels Sorting
- Hide global backups setting from managed users

### Fixed:

- Request notifications after migration finished
- Keyboard scrolling on custom MenuList component
- Regression with pagination dropdown
- Show error message when a Linode on the user's account is jailed.
- 2FA panel
- Creation workflow styles
- Instances of renderGuard not updating components
- React-select isClearable logic
- Dashboard spacing
- PDF generation failure
- Error handling for SSL certificate and key when creating a NodeBalancer.
- Default lastFour (credit card digits) to empty string to prevent visual bug
- Graphs need better breakpoints

## [0.49.0] - 2019.02.25

### Added:

- Enhanced Search functionality!
  - Users can now specify the search entity with `type:{linode, volume, domain, nodebalancer}` or `is:{linode, volume, domain, nodebalancer}`
  - Aside from entities, other searchable fields are `label:`, `tags:`, `ips:`
    - Users can search for entries with multiple tags applied by adding the desired tags to a comma separated list after specifying the tags field. Example `tags:tagA,tagB` will return all entities with tagA and tagB applied.
    - The same pattern described above applies to the ips as well.
  - Logical operators can by applied to queries: `&&`/`AND`, `||`/`OR`, `-` for the not operator, and grouping with `()`. A query with multiple fields and no operators is implicitly treated as true for all.
- Status indicators have been incorporated into the entity icons for Linodes and Domains to provide a better visual experience.
  - Also added the Linode icon and status to the power button.
- A reset password button in Profile > Password & Authentication that will open the reset password workflow in a separate tab.
- A better user experience for secondary/restricted account users that displays messaging around and disables features that the user doesn't have access to.

### Changed:

- Domains now displayed in alphabetical order on the Domain listing page.
- Timestamps display in last backup table rather than humanized dates.
- Added a tooltip on the power icon for a Linode with no image, indicating that an image must be added to the Linode in order to boot.

### Fixed:

- Removed client side validation that incorrectly prevented user from creating a Linode when the label started with a numeric character.

## [0.48.0] - 2019.02.11

### Added:

- Support tickets now appended with current Cloud Manager version.
- Individual Node status in NodeBalancer Detail > Configuration > Ports
- Implemented pagey pagination to all Domain DNS records, for example a user with over 25 A/AAAA records will have a paginated table in Domain > DNS records page.
- Public and Private IP addresses are now searchable fields, displaying the corresponding Linode in the search suggestion dropdown.
- Sidebar components in Account Settings page:
  - Contact information component displaying company name, name, dddress, email, and phone number.
  - Billing information component displaying current account balance, credit card, and credit card expiration date.

### Changed:

- Linode summary moved to the sidebar with individual components for:
  - Linode details
  - IP addresses
  - Last backup
  - Tags
- NodeBalancer summary moved to the sidebar with individual components for:
  - NodeBalancer details
  - IP addresses
  - Tags
- Domain Tags input field moved to the sidebar in an individual componenet
- Underlined text removed from application, notably:
  - Breadcrumb headers
  - Event notifications
  - Help landing page
  - Secondary links in table rows
- Backups CTA is now dismissible.
- NodeBalancer ports now clickable links on the NodeBalancer listing page
  - When a NodeBalancer port is clicked, the user is navigated to the Port Configuration page with the accordion panel of the port clicked expanded by default.
- NodeBalancer Graphs were removed from accordion panels, and are now displayed prominently on the NodeBalancer summary page.
- Disks added to Linodes default to the maximum size, so the user can adjust form there.
- In the additions disks table located in Linode Detail > Settings > Advanced Configuration now display the disk file system type located between the label and size columns.
- The option to reboot a Linode is removed unless the Linode is powered on.
- Only regions with block storage available are displayed in Volume creation panel.
  - Additional messaging added to Volume creation panel informing user of the data center limitations.

### Fixed:

- Typo in Manual Snapshot copy.
- Spacing of Grouped NodeBalancer headers.

## [0.47.0] - 2019.01.29

### Added:

- Sorting for remaining Linode table headers.
- Entity icons on Dashboard page, and entity listing pages for:
  - NodeBalancers
  - Domains
  - Volumes
- Group by Tag for NodeBalancers.
- Group by Tag for Volumes.
- Friendly error message when graph data is unavailable for a newly created Linode.

### Changed:

- Graph Display Options (Last 30 Days).
- Removed Documentation panel sidebar.
- Improve pagination experience.
- Friendly error message when graph data is unavailable.
- Order of tabs on the Profile page.
- My Profile > My Apps changed to My Profile > OAuth Apps.

### Fixed:

- Update timezone error.
- Fix pagination display logic.
- Invalid Date on OAuth Apps.

## [0.46.0] - 2019.01.18

### Added:

- Dedicated CPU in plan selection in Create Linode workflow.

## [0.45.0] - 2019.01.14

### Added:

- Disk storage information modal in Linode > Settings > Advanced
- Grouping of Domains by tags on Domain listing page.
- Add payment PDF generation
- Add invoice PDF generation
- Display loading until images are available.
  - Source images data from Redux.
  - Add images to Redux on load.
- Improved linode listing page table.
  - Remove + icon to display all ip addresses on linode row.
  - Hide copy icon for ip addresses until hover.
  - The icon for a Linode was added to the Linode row.
  - Plan column removed, linode plan and details now listed under the label in the Linodes columns.
  - Added a column for tags.
- Account tab for StackScripts, lists all scripts created on the account the user has permissions to read/write.
  - If an account user does not have access to StackScripts, then a message indicating the user does not have the proper permissions will display.
- Trusted Device table in My Profile> Password & Authentication> New section titled Trusted Devices.
  - Lists devices that have been active on the account for the past 30 days, device name and browser used.
  - Ability to untrust/delete a trusted device.

### Changed:

- Explicitly check for errors before setting local storage.
- Move image toast logic to ToastNotifications.tsx
- Allow submitting empty array for IP sharing
- Explicitly declaring background color on table cells for printer compatibility.
- Update documentation. Update casing on label.
- Set default image in Create from Image flow.
- Default label name during Linode creation.
- Update react-dev-utils and webpack-dev-server
- Update Radio Input Label text size on Create Volume drawer
- Update pagination styling
- Update source Linode on linode_clone schedule/start
- Refactor domains dashboard card to use Redux state
- Update community events, make all clickable.
- Update dashboard transfer card to new design
- Add Render Guard to Contact Info/Config Forms
- Change Pagination Controls to handle many pages
- Add reduxed images to LinodeRebuild
- Improved error handling.
- Respond to community_like events, display in menu
- Update Copy Around Restricted Users
- Update search results size limit to 100
- Capitalize linode progress bar text

### Fixed:

- Credit card payment request ccv field.
- Safari autofill on root password reset.
- Parse timestamps in UTC for notifications.
- Hide radio buttons on edit disk drawer.
- Display notice on successful deletion of a user.
- Submission of the enable back ups for all Linodes drawer caused duplicate listings of Linodes.
- Display Scratch Code when enabling TFA

## [0.44.1] - 2019.01.10

### Fixed:

- Credit card payment request ccv field.

## [0.44.0] - 2019.01.03

### Added:

- Printer friendly invoice page by navigating to Account > Billing info > Recent Invoices > Invoice
  - Clicking Print/Download navigates to a printer friendly invoice page and opens a a browser print preview to print and save to a PDF.
  - CTL/Command + P from the invoice page will achieve the same as clicking the Print/Download button.

## [0.43.0] - 2018.12.20

### Added:

- Users can now display their Linodes grouped by its tags.
- Users can import existing display groups from Linodes and Domains as tags from the dashboard.
- For example; If a user were to have three Linodes in the display group "production", a new tag
  of "production" would be created and applied to those three Linodes.
- The existing display groups remain unchanged.

### Fixed:

- Linode chart statistics sometimes cause a crash.
- Viewing one StackScript, out of 1100, caused the application to crash. Gee thanks!
- URL encoded text was being injected into the search bar.

## [0.42.0] - 2018.12.17

### Added:

- Add Total Traffic to stats
- Styling for Stats/Units
- Paypal Client-Side Validation
- Revert error poc
- Reorder providers. Convert ThemeProvider to renderChildren.
- style toast messages
- create component abstraction for toasts
- add: toasts story
- pass props to tags to close suggestion menu on click\
- error poc
- make CVV field optional
- Add analytics to GetAllEntities()
- Correct permission decision logic in API token utils.
- code cleanup and destructure new asSuggestion prop
- style tags inside search result suggestion
- event propagation and focus styles
- Stats/Units on graphs
- make tags in selects consistent with new styles
- refactor tag button styles
- Tag links
- updating back up data section for dark theme
- updating copy icon component colors, removing the override from IP address component
- better padding for dashboard table cells
- Make clickable row UX more consistent
- switch volume columns
- add search data
- Upgrade Typography component consistent with @material-ui/core@3.5.1
- Display resize instructions on form submission.
- Add SSH key event message...
- Refresh volumes list on volume_clone event.
- Report counts of successes and failures for backups
- Remove sendToast for enqueSnacback
- Replace Toasts with Notistack

### Changed:

- reduce main nav items padding under medium breakpoint
- update progress bar for linodes
- Update docs links to Cloud Manager versions.
- update notistck version and remove unecessary declaration
- Update email notification setting label for clarity
- Events polling updated.

### Fixed:

- fix: send config id with attach volume request
- Edit SOA drawer loading button styling bug
- fix typing for notistack
- Fix NodeBalancer Tag Error
- Fix mutation error handling

## [0.41.0] - 2018.12.04

##Added:

- Tags for NodeBalancers
  - Tags can be added during NodeBalancer creation
  - Tags can be added/removed from an existing NodeBalancer

##Changed:

- Search results page link appears first in the search bar results
- Reverted StackScript table pagination

## [0.40.0] - 2018.12.03

##Added:

- Search results page with a dedicated URL
  - Search results page is grouped by entities (Linodes, NodeBalancers, etc.)
  - Search results page displays the first five results per entity, and a button to display remaining results for the given entity
  - Search can be used to display all entities with a common tag
- Tags for Volumes
  - Tags can be added during Volume creation
  - Tags can be added/removed from an existing Volume
- Pagination on the StackScripts page
- Network helper global setting
  - Users now have the option to enable/disable
  - Network helper is enabled by default
- Ability to attach a file to a support ticket
- Breadcrumb navigation to Users and User Detail
- Mobile typography was implemented throughout the app

##Changed:

- UX improvement when creating/resizing a volume attached to a linode with the addition steps necessary to complete the volume creation process
- Get Help section links and tiles were updated for consistent displays and interactions
- Added pricing to Volume clone and resize panel

##Fixed:

- External (public) Ip's are displayed first (before private IPs) on Linode grid cards, and Linode Details page
- Character decoding on the blog feed
- Tags extending beyond the search bar results now wrap

# [0.39.0] - 2018.11.15

## Breaking:

- User management has been merged into the account section.
  - The Account & Billing and Users navigation items have been removed in favor of just "Account".
  - This caused breaking changes to the URL pattern.
    - /users -> account/users
    - /users/stevemcqueen -> /account/users/stevemcqueen
    - /users/stevemcqueen/permissions -> /account/users/stevemcqueen/permissions

# Added:

- Domains can now be tagged and will be included in search results when searching for tags.
- Linode Backups
  - Users can now enable automatic backups for all existing Linodes which do not have backups.
  - Users can now enroll in automatic backups for all newly created Linodes.
  - Added backup information and actions on the dashboard.
  - Added time since last backup to the list view of user's Linodes.
- Pricing information has been added to the;
  - Volume creation drawer
  - Volumes call to action placeholder
  - Backups call to action placeholder
- Updated by/closed by details to support tickets.
- Breadcrumb navigation to Linodes, NodeBalancers, Domains, and Support Tickets.
-

# Changed:

- We're now preventing users from submitting the create a support ticket form until all necessary
  information has been provided.
- Hide the "current credit card" if there is no credit card on file.
- The CPU chart on the Linode detail page has been updated to scale the to usage.
- Details about a Linode and Domains are no longer tucked away in accordions.
- Payments and invoices are now sorted by descending date (newest first).
- We've made some mobile friendly adjustments to the display of our menu!
- Documentation links now have a persistent underline to make it clear they're links.
- Providing feedback via Hively now opens in a new window.
- Made tab navigation much easier on mobile.
- Enhanced select styles are now visually consistent with regular selects.

# Fixed:

- Side navigation was hidden for certain users.
- Toggling between grid and list view on the Linodes screen would not persist event progress information.
- Attempting to delete the active user would crash the application. (Hey, it's better than deleting yourself!)
- TTL can now be set/changed for MX records.
- Booting from a user created configuration was failing.
- H1s are now used only once per page site-wide.

## [0.38.0] - 2018.11.05

### Added:

- Customer Support
  - Linode Community questions are now searchable from the Support Landing Page
  - Customers can now close their own support tickets under the following conditions:
    - Ticket is in "autoclose" status
    - Ticket has not been opened by Linode (covered by autoclose requirement)
    - May not close tickets that have not been interacted with by Linode (covered by autoclose requirement)
    - Tickets closed by customer should be marked as closed by customer
    - Support Ticket objects should indicate if they are closable

### Changed:

- Tightened whitespace on tables. Considerably reduced the padding on table cells to give users the ability to see more items at a glance. Similar changes were made to summary panels in an ongoing effort to improve our information density overall.
- We changed the way that a user will view their DNS records. Today when you view DNS records you have to expand all of the accordions to see details of your domains. Now when you view a domain you can see all details of the domain without having to expand all the accordions.
- Updated Launch console button to appear as a link on mobile devices.
- Hively got an upgrade!
  - Icons have been enhanced to support new icons.
  - Hively icons will not show on tickets more than 7 days old

### Fixed:

- The account owner was able to restrict their account by toggling the permissions.
- A recent refactor didn't take into account paginated API methods that take an entityId. This was causing an API 404 error when requesting Disks from the LinodeConfig menu.
- Issue on the List Linodes page, where switching to list view after linode creation would display the Linode as "Provisioning" after it already booted.
- On the volumes listing page, addressed an issue where updating a volume label would fail.
- In order to make the clickable table row entries more efficient, we made tags clickable.
- Fixed an issue where attempting to create a linode from a snapshot (coming from the linode detail page) displayed plans smaller than the original Linode snapshot as selectable.
- When creating a linode from a backup or snapshot, the linode created does not automatically boot, rather it must be booted manually after the restoration from backup is complete. Also, the Distro image fails to display in the manager, until the linode has been booted.
- Issue where users were unable to deploy a new linode from a snapshot when landing on the Create From Backup creation page from the Linode Detail - Backups page.
- Resolved an edge case where attempting to restore a snapshot to an existing linode, if the restore drawer was dismissed and then reopened, the Linodes select would fail to list any linodes.

## [0.37.1] - 2018-10.22

### Fixed:

- Backup restore not restoring to destination Linode

## [0.37.0] - 2018-10.22

### Added:

- Pagination!
  - Users can now page through large lists of entities thoughout the app, including: Nodebalancers/Images/Oauth Clients(Apps)/Tokens/Users/Volumes/Invoices/LinodeConfigs
- Documentation!
  - The documentation panel has received some updates, including Docs for volumes, domains and stackscripts

### Changed:

- Eliminate pencil icon site-wide, using hover/edit state instead.
- Defer API requests on Linode summary, settings and Nodebalancer summary until user action is taken

### Fixed:

- Error reporting when creating a new Nodebalancer config
- Ellipsis being truncated on blog texts incorrectly
- Text overflow in the dashboard of entities with long names
- Linodes with flags/long names breaking the layout on list linodes
- Issue where a users settings are erroneously requested multiple times
- Linodes with unknown images failing to display in the linode summary panel

## [0.36.0] - 2018-10.08

### Changed:

- Support
  - Allow selecting multiple files when attaching to a ticket
  - Auto-collapse attachments when a ticket contains more than 5 attachments
  - Increase support search results to display up to 20 results
- Profile
  - Truncate whitespace when adding SSH keys
- Billing
  - Display last four credit card digits when submitting payment

### Fixed:

- Volumes
  - Issue where creating a volume would potentially display the wrong region for the attached linode
- Stackscripts
  - When creating a linode from Stackscript, the SSH Key access panel failed to display on image selection
- Misc.
  - Issue where certain modals could not be dismissed with the escape key
  - On Linode creation, the password field now appears disabled until an image is selected
  - Two-factor authentication QR code border visibility in dark theme

## [0.35.0] - 2018-10.01

### Added:

- Users can now provide feedback on Linode support in tickets.
- Added a welcome banner describing new features.
- Users can now migrate/mutate Linodes.

## [0.34.1] - 2018-09-24

### Added:

- Linodes
  - Users can now add tags to a Linode on creation or on the detail page
  - Tags display on Linode list, grid and detail views
  - Tags can be managed on Linode detail view
- Search
  - Tags are searchable. The main Search bar will return a list of Linodes with a tag or tags that match the search term
- Small Screen Enhancements
  - Tables on small screens are now useable and beautiful
  - Expanded all inputs to full width on small screens

### Changed:

- Copy updates
- Create header icon on small screens
- Updated profile timezone and volume creation selects to be searchable

### Fixed:

- Search issue affecting small screens using the dark theme
- Bug where deleting a linode erroneously routed the user to the dashboard, now routes to linodes
- Issue where updating contact information results in a blank credit card
- Issue where changing tabs on the user profile would enable the Delete button for your own user
- "Unknown Plan" would display during Linode resizing
- Prevent user from submitting empty replies in support tickets

## [0.33.2] - 2018-09-11

### Added:

- Profile
  - Users can now add SSH keys to their profile
- Linodes
  - Create or Rebuild Linodes with SSH keys that have been added to the user's profile
- Dashboard
  - Notify users an upgrade is available for their Linode
- Support
  - Search the Linode Docs for answers within the manager support section

### Changed:

- Make tiles clickable site-wide
- Table rows are now clickable on instances where the row links to another page
- Linode disk resize free space calculation made more clear
- Support tickets now respect customer's timezone preference

### Fixed:

- Bug where cloned domains failed to display until the page was manually refreshed
- Bug where image creation would return an error message
- Bug where revoked personal access tokens still displayed in the access token table
- Delete volume action being available while the Linode it was attached to was powered on

## [0.32.1] - 2018-08-27

### Added:

- Project version link as been added to the global footer.
- Enable backups from the list Linodes page.
- Create a domain record from the global "Create" button.
- Users can now make a payment via Paypal.
- Update document title based on location within the application.
- Support
  - Added "Get Help" link to primary navigation.
  - Users can now reply to support tickets and attach files.

### Changed:

- "Managed" item removed from primary navigation unless user already has the managed service.
- "Account security" was renamed "Whitelist IP (legacy)" to better clarify intent.

### Fixed:

- Bug during NodeBalancer creation that would prevent the user from creating a NodeBalancer.
- Bug where the UI would not update after allocating a new private IP.

## [0.31.5] - 2018-08-16

### Fixed:

- Various bugfixes for Account information display

## [0.31.4] - 2018-08-14

### Added:

- Toggle for dark theme

### Fixed:

- Support ticket links in event menu
- Images links in search bar

## [0.31.3] - 2018-08-13

### Added:

- Account
  - Update credit card on file
  - Make a payment
- Support
  - View open support tickets
  - Open a support ticket
  - View ticket replies
  - Reply to ticket
- Polyfill for ES2015+ methods, createImageBitmap
- Linode Settings
  - Create image from disk, "Imagize"
- Get Help
  - Get Help landing page
  - Popular Documentation and Community Posts
  - Ada chat bot
- Dashboard
  - Linode services Dashboard
  - Make Dashboard the default route
- Add warning for unsupported browser

### Changed:

- StackScripts
  - Added placeholders to User-Defined Fields
  - Show UDF errors adjacent to each field
  - Infinite-scroll on Community StackScript selection
- Linodes
  - Linodes without IPv6 do not attempt to render ipv6 components
- Documentation
  - Summary truncated at 200 characters
- Volumes
  - Warn user before they attempt to create a Volume larger than 10TB
- Confirmation Dialogs
  - Actions to the right, Power-Off and Reboot not considered destructive
- Notices
  - New appearance
- SelectionCards
  - Consistent appearance with/without selection
- Region Names
  - Format consistently throughout the application
- TextField Select
  - Show select icon

### Fixed:

- Safari compatibilty with SelectionCard interaction
- Ripple effect when using Toggle component
- Domain deletion confirmation no longer flashes "Undefiend"
- Pressing the spacebar to select a SelectionCard no longer scrolls the page
- Rebuilding a Linode appears as a transitional state
- PrimaryNav does not seem to open randomly on window resize
- Focus state for Toggle components
- Some instances where functions were not bound to component instance
- Re-request domains on successful creation
- Settings helper text language improvements
- Address spacing in Account settings
- Some instances where state properties were being read directly
- LinodeRow plan name does not wrap below status indicator
- Ability to create a NodeBalancer with a check path of '/'

## [0.30.1] - 2018-07-26

### Fixed:

- Notification icon position
- Description of billing permission levels
- Tooltip for user delete action

## [0.30.0] - 2018-07-26

### Added:

- My Profile
  - Toggle for disabling "Whitelist IPs" feature
  - Update e-mail address
  - Enable/disable two-factor authentication using QR code
  - Update Timezone
- User Management
  - List users
  - Add new users
  - Edit user profile
  - Edit user permissions, including entity-specific permissions
  - Change user type restricted/unrestricted
- Billing
  - View recent billing activity: invoices and payments
  - View contact information
  - Update contact information
- StackScripts
  - Update StackScript

### Changed:

- "Notifications" (global and product level notices) are now displayed in a side-wide menu located in the top-right corner of the screen
- "Events" (entity-specific notices) are shown in a different color when they have been marked as read
- "Events" are clickable and direct the user to the page of the entity
- Privacy Policy notice is now shown using a persistent modal dialog

### Fixed:

- When creating a Linode from StackScript, an error notice is now displayed when the user does not select an image

## [0.29.3] - 2018-07-13

### Added:

- StackScripts
  - List StackScripts
  - Search StackScripts by label
  - Create StackScript
  - Delete private StackScripts
- NodeBalancers
  - Search Node IPs by label or IP
- Linodes Networking
  - IP Sharing
- Domains
  - Create Slave Domains
  - Zone Import
- Images
  - View Image Details
  - Delete Image
  - Rebuild Linode from Image
  - Create Image from Linode Disk
- Disks
  - Edit the size of a Disk
- Account
  - Referral codes and completed referrals shown
  - Disable/enable e-mail notifications
  - Add SSH Keys for Lish, choose authentication method
- Glish
  - Switch quickly between Weblish and Glish
  - Auto re-connect on power status change

### Changed:

- Disabled plans during deployment have a tooltip explaining why
- Successful volume creation shows a message in the drawer
- Show progress bar for
  - Volume Attach/Detatch
  - Disk Creation
  - Snapshot Creation
- Create a Volume drawer is now "Add a Volume" drawer, which allows both creation and adding of existing volumes
- Remove "Status" from Domains List

### Fixed:

- Linode Detail Progress Bar on all types of in-progress events
- IP Transfer Actions Disabled if there are no IPs to Transfer

## [0.28.0] - 2018-07-02

### Added:

- Networking
  - Default DNS resolvers for both IPv4 and IPv6, SSH access, and Lish via SSH are now all available on the Linode Networking feature.
  - Users can now add a private IP to their Linode via the Linode Networking feature.
  - Transfer or move an IP to another Linode.
- Display a progress bar during back-up snapshot generation.
- Linode Watchdog settings; Enable to automatically restart a Linode.
- Added help text to the volume creation drawer.
- Display the remaining space on a Linode during disk creation.

### Changed:

- Linode
  - Page scrolls to top upon switching pages on Linode landing view
  - Disable current plan in list of target plans for LinodeResize view
  - Disable Linode Resize submit btn if no plan is selected
  - Rebooting a Linode is disabled while provisioning.
  - Display "Unknown Image" on Linode cards when using a non-standard image.
  - Corrected sort order of available images in dropdown during Linode rebuild.
  - Users will now see a 404 when attempting to access a nonexistent Linode.
  - Simplified the password change form in the Linode settings feature.
  - When changing Linode alert thresholds, we no longer hide the input field.
  - Users without any Linodes, who are attempting to create a Linode by cloning, will now see a placeholder.
  - The backup window selection is now displayed in the timezone the user has selected in their profile.
  - Linodes without backups are no longer displayed in the Create Linode from Backup feature.
- Node Balancer
  - NodeBalancer creation, including configurations and nodes, is now made with a single request.
  - Updated changes to interval text on and view features.
  - "Client Connection Throttle" is no longer displayed on creation (Still available during editing).
  - "Session Stickiness" is now defaulted to "table" during creation.
  - "Mode" option is now available during editing (but not creation) of a Node Balancer Node.
- StackScripts
  - StackScripts which only apply to deprecated images are no longer displayed during creation of a Linode from StackScript.
  - StackScripts can now be sorted by label, revision date, and active deploys in the create Linode from StackScript form
  - Title of required fields updated to reflect the StackScript's name.
  - Changed the color of image tags during creation from Linode.
  - Use a Github style naming convention for StackScripts. (username/Title)
  - Corrected "active deploy" to "active deploys".
  - Update dates to use ISO-8601.

### Fixed:

- Users are now correctly scrolled to the top of the list when using pagination.
- Users are now correctly scrolled to the first error in a form on submission.
- Fix an issue where users could issue a resize command without selecting a plan or their current plan.
- Removed several duplicate form labels.
- During StackScript creation Linode StackScripts will no longer appear under the "community" category.
- Corrected an issue preventing the search bar from displaying results.

## [0.27.1] - 2018-06-15

### Added:

- NodeBalancer Management
  - List NodeBalancers
  - Create NodeBalancer from action menu
    - Configure protocol and TLS
    - Configure stickiness
    - Configure health checks
    - Client-side validation
    - Create, update, delete backend Nodes
  - NodeBalancer Details Page
  - NodeBalancer Summary
  - NodeBalancer Performance Charts
  - Create, update, delete NodeBalancer Configurations
  - NodeBalancer Settings
- Create Linode From StackScript
  - Select StackScripts Panel
  - StackScript Detail Row
  - User Defined Fields dynamic form inputs
  - Select Image based on selected StackScript
- AddNewLink component
- Documentation links on Volumes landing page
- Documentation links on Linodes detail page
- Documentation links on NodeBalancers detail page

### Changed:

- Prevent changing root password on disks if Linode is not offline
- Force active status when updating domain
- Domain records, "Edit" changed to "Save"
- Rename "Master Record" to "Edit SOA Record"
- Edit-in-place component now displays errors locally

### Fixed:

- List Domains, cancel button fails to dismiss confirmation modal
- Page crash when editing SOA record
- Disable ineligible plans in the clone Linode creation flow
- Don't allow create from backup without selecting a backup
- Update Linode Volume count on create/delete on Linodes Detail page
- Display newly created Linodes in the global create Volume drawer
- Reset password strength indicator after submitting a new password
- External Links open in a new tab
- Edit SOA Record, Remove "edit mode" from Domain Status
- Index the formatted IPs array from public to private
- Close button on delete domain modal crashing page
- On hover and focus destructive/cancel button background color
- Typo in volume drawer

## [0.25.3] - 2018-05-23

### Fixed:

- Fixed an issue causing the search bar to crash.

### Changed:

- Disabled toast notifications for failed stat requests.
- No longer display the Region panel when creating a new Linode from a backup.

## [0.25.2] - 2018-05-22

### Added:

- Create, update, and delete Domains.
- Create, update, and delete SOA, NS, MX, A/AAAA, CNAME, TXT, SRV, and CAA records.
- Create Linode from an existing Linode's backup.
- Create Linode from cloning an existing Linode.
- A flag icon to product level notification to better direct users.
- Added documentation to volumes and Linode detail sections.
- Confirmation dialogs when attempting to shutdown a Linode, reboot a Linode, and cancel backups on a Linode.
- "Select All" options for permissions when creating a Personal Access Token.

### Fixed:

- Several typographical anomalies.
- Prevent multiple submit clicks upon creating Linode.
- Close expansion panel only if the header is clicked.
- Resizing linodes will not have a pre-selected option.
- Allow deletion of default value in several form inputs.
- "Show Older Images" panel when creating a new Linode would close when selecting an image.
- Filtered ineligible volumes/disks from rescue selects.
- Remove edit option from client generated (apps) tokens.
- Resolved an issue where resizing was not being tracked/displayed.
- Reduced the overall number of API requests for certain features.
- Fixed an issue where Gravatar requests were duplicated.
- A CSS rendering which cause the footer to unexpected jump up the page.

## Changed:

- Display client generated (Apps) tokesn below user generated (Personal Access Tokesn).

## [0.24.2] - 2018-05-07

### Fixed:

- Logout

## [0.24.1] - 2018-05-07

### Added:

- Change the label of a Linode via settings
- Reset a Linode's root password
- Alert Thresholds: set and modify
- Linode Configurations: add, edit and delete
- Linode Disks: add, edit and delete
- Delete a Linode via settings
- Product level notifications
- Account-level notifications
- IPv4 and IPv6 addresses: display and edit
- Backup actions, restore and deploy
- Global volume creation drawer
- Volumes section: show commands for configuration
- CopyTooltip component
- Volumes section: edit, resize, attach, detach, delete, clone

### Changed:

- Toast timeout set to 6 seconds

### Fixed:

- Prevent showing null image name on CheckoutBar
- Show relative date for date created on backups page
- Don't show expired /app tokens
- Show app tokens and PATs in chronological order

## [0.23.1] - 2018-04-19

### Fixed:

- Fixed an issue where unexpected requests were sent when opening the notification menu.
- Fixed an issue Firefox on Windows would report "to much recursion".
- Fixed an issue preventing Linode reboots from ever finishing.
- Fixed an issue preventing users from creating Linodes in Frankfurt Germany.

## [0.23.0] - 2018-04-18

### Added:

- Added toast notifications for several Linode actions.
- Added usage charts to the Linode summary page.
- Users can now search for their Linodes, Volumes, Domains, and NodeBalancers.
- Users can now resize their Linode.
- Users can now rebuild their Linode.
- Users can now rescue their Linode using Finnix.
- Users can now enable or disable backups for a Linode.
- Users can now view a list of their backups for a Linode.
- Users can now take a manual backup snapshot of their Linodes.
- Users can now set their automatic backup time and day of the week preferences for a Linode.
- Users can now view a list of attached Volumes for a Linode.
- Users can now rename, resize, detach, and delete a volume attached to their Linode.
- Users can now attach an existing volume to their Linode.
- Users can now access Weblish, a web-based shell, for their Linodes.
- Linode label is now editable on the Linode detail page.

### Changed:

- Darkened the header of the Linode cards when viewing the Linodes grid.

### Known Issues:

- Linode Detail - Attach volume drawer menu should display "Select a Volume" be default.
- Linode Detail - Linodes Rescue menus show invalid items (volumes attached to other Linodes).
- Actions which produce a loading status sometime become stuck and require the user to reload the application.
- Linode Summary - Volume count fails to update on create/delete.
- App API Tokens cannot be edited or revoked.
- Rebooting or shutting down a Linode should prompt for confirmation.
- Cannot read property 'getBoundingClientRect' of null.
- n.response.data is undefined on LinodesLanding.
- Personal Access Token still displays after revoke.
- Under rare circumstances the Linode detail page may be blank due to an unexpected user configuration.

## [0.22.6] - 2018-04-10

### Fixed:

- Issues related to uncommon regions, plan types, and images
- Clipping of copy animation on linode row

## [0.22.5] - 2018-04-10

### Fixed:

- Show personal access tokens upon creation
- Show notifications for Linode community site

## [0.22.4] - 2018-04-10

### Added:

- Early-access notice

### Changed:

- Updated placeholder components and copy

## [0.22.3] - 2018-04-09

### Added:

- API Token Management
- OAuth Client Management
- Linode Config selection on boot actions
- Notifications and Events menu
- Display flag on Linode row/card for notifications.
- Linode Busy indicator to Linode Details page
- Linode summary panel to details page
- Documentation for unit testing
- Linode Detail tabs and routes
- TESTING.md, Updates to CONTRIBUTING.md
- Responsive tables
- Add Grid wrapper in response to MUI changes.
- Create a simple confirm/decline dialog
- Editable text component
- Docker script commands
- Add gitchangelog configuration and documentation
- data-qa selectors for e2e tests

### Changed:

- Navigate to storybook before each e2e test w/wdio before hook

### Fixed:

- Show user feedback immediately upon Linode power action

## [0.21.0] - 2018-03-26

### Added

- A variety of style and appearance updates
- Linode Logo as scaleable SVG
- Use Lato as our sitewide font
- Use Axios interceptor to redirect to login on 401
- Storybook for component development in isolation
- Abstract ShowMore component for IPs and Tags
- Event polling with backoff using RxJS Observable and Subject
- Linode menu power actions function as expected
- Grid view when user as <= 3 Linodes
- Grid view when user is on mobile
- loading state to Linode Row
- loading state to Linode Card
- TabbedPanel abstraction
- Linodes Pagination
- Import SVGs as React Components
- SelectionCard component
- Linux Distro icon font font-logos
- Password Input Component
- CheckoutBar sidebar during Linode Creation
- Linode Creation from Image
- Linode Creation Validation
- Notice Component

### Fixed

- Shifting of user menu when popover menus are used

## [0.20.3] - 2018-03-06

A new visual design has begun!

### Added

- Main navigation
- User menu
- "Add New" menu
- Linodes list view
- Linodes grid view
- Documentation sidebar
- Footer
- Promise preloader HOC
- Request/response Redux action creators

## [0.18.7] - 2018-04-02

### Changed

- Update region names for upcoming changes (#3104)
- Update API calls for API-53 (#3108)

## [0.18.6] - 2018-03-29

### Changed

- enable block storage volume support in us-south-1a (Dallas)

## [0.18.5] - 2018-03-05

### Fixed

- fix non-expiring token creation
- fix stats graphs rendering by correcting destructuring
- throttle OAuth refresh between tabs
- Refresh OAuth token only on user interaction

## [0.18.4] - 2018-02-26

## [0.18.3] - 2018-02-20

### Added

- Pagination added to `/domains`
- Added vendor specific CSS prefixes via PostCSS and Autoprefixer.
- Glish window now contains a link to the Linode page.
- Added unit tests for Redux generator functions. (api/internal.js api/external.js).

### Changed

- Significant build changes to reduce initial page load.
- Added asset filename hashes for caching purposes.
- Moved from the OAuth2 code flow to the implicit flow for security and performance.

### Removed

- Removed unnecessary “No VNC” text on Linode detail page Glish button.

### Fixed

- Corrected an issue that was forcing a full re-render of the application when clicking session/notifications menu.
- Corrected an issue preventing a disk label from appearing in the Add Image modal.
- Corrected an issue which prevented proper redirection on logout.
- Corrected an issue where notification banners weren’t provided the ID of the Linode they referenced.
- Corrected an issue preventing users from deleting Volumes.

## [0.18.2] 2018-01-25

### Fixed

- Prevent notifications from fetching during login and logout

## [0.18.1] 2018-01-24

### Fixed

- Glish and weblish token fetching bug corrected

## [0.18.0] 2018-01-24

### Added

- Glish - a web-based VNC connection to your Linodes
- Implement some modals using React 16 Portals

### Changed

- Initial bundle sizes reduced with code splitting
- Upgraded to React 16
- Upgrade to React Router 4
- Moved "Volumes" to top-level navigation

## [0.17.3] 2018-01-15

### Fixed

- Allow config selection when adding a Volume to a Linode

## [0.17.2] 2018-01-09

### Fixed

- fix image selection being filtered on status
- fix backups listing on create from backup modal

## [0.17.1] 2018-01-08

### Fixed

- Fix permissions page for usernames with numbers (#2884)

## [0.17.0] 2018-01-08

### Added

- Pre-commit hook to run "yarn test && yarn lint"
- Paravirt and Fullvirt appear with a description
- Notification Banners for various account and Linode states
- User feedback when there is an error performing a power action

### Fixed

- Allow users to reboot into something other than Finnix after using Finnix
- Backups window descriptions can cross midnight
- OAuth Redirect UI doesn't overflow its container
- Updates to and removals of IP RDNS appear without refresh
- Clean up a variety of required-prop warnings
- Updates for changes to the /images field names

### Changed

- The Add Image form now shows disk selection only for complex Linodes
- Upgraded to React 15.6 from React 15.1
- Tests now run using Jest instead of Karma
- Manager, Docs, and Components now in separate repos
- Backup window selection is a multi-step process
- Reduced payload size via specific lodash imports

## [0.16.4] 2017-12-12

### Fixed

- 0.16.3 changes were lost in a squash

## [0.16.3] 2017-12-11

### Fixed

- always show user images last (after distributions) (#2838)
- submit volume attachment requests with a numeric linode id
- fix UI bugs where configs were not updated and errors were not reflected upon changing linodes in volume modals

## [0.16.2] 2017-12-11

### Fixed

- Changing Region in Volume attach dialog did not reset Linode Config (#2812)
- Volume attachment API requests must use integer config_id (#2813)

### Changed

- Image and Distro selector combined and fields renamed to match API (#2803)
- Addresses /volumes API endpoint moving from /linode/volumes (#2803)

## [0.16.1] 2017-12-01

### Fixed

- Pricing information showed `[Object Object]` in some places since 0.16.0 (#2808)

## [0.16.0] 2017-11-29

### Added

- List CoreOS in Linode create (#2576)
- Support for CAA records (#2626)
- Public option for OAuth clients (#2655)
- Create disks from images (#2680)
- Rebuild Linodes from images (#2681)
- Use more specific page titles (#2701)
- Display current balance on payment page (#2704)

### Changed

- Disable Linode power actions during transition states (#2319)
- Render backup schedule time slots in the user's local timezone (#2563)
- User permissions page matches the new options (#2656)
- Exclude "swap" from the disk list for imagizing (#2710)
- Make "Create Image" behave the same from all entrypoints (#2717)

### Fixed

- Negative numbers in invoices should appear with parenthesis (#2705)
- Credit card dropdowns should line up with their container (#2706)
- Don't crash if we try to create a Linode from image with no images (#2717)

## [0.15.5] 2017-11-20

### Added

- Contact info can be edited (#2684)
- Images can be listed, created, and deployed as Linodes
- CoreOS is included in Distribution lists

### Changed

- (Docs) updated to 0.15.0
- All User Grants are now represented
- User Grants have been remapped to None,ReadOnly,ReadWrite

### Fixed

- Handle unknown event types to prevent error splash (#2624, #2621)

## [0.15.4] 2017-11-05

### Added

- Added Billing components and pages

### Changed

- Handle deprecations in preparation for React 16.0
- (Docs) updated to 0.14.1

## [0.15.3] 2017-10-13

### Fixed

- Send custom integers correctly on volume create

## [0.15.2] 2017-10-13

### Fixed

- Rendering of selects
- Filtering Linodes by region correctly when attaching

## [0.15.1] 2017-10-13

### Added

- Fremont as available Volume region

## [0.15.0] 2017-10-10

### Added

- Added volume_clone, credit_card_updated, payment_submitted event support #2622
- KVMify #2562, #2611
- Noscript #2565
- Logout if in maintenance mode #2627

### Changed

- Use full backup names in dialogs #2564
- Restore from Backup should not offer Region #2586
- Buttons that are dropdowns include the default action in the dropdown #2585
- Configs should be offered when creating from volume #2544
- Restrict Volumes to availability regions #2623
- Hide volume Linodes and Configs when appropriate #2630
- (Docs) updated to 0.13.3

### Fixed

- Allow Notifications to poll with no previous Events #2618
- Fix multi select (stackscript distros ui) #2614

## [0.14.2] 2017-10-04

### Changed

- Changes to work with the latest API changes
- (Docs) Updated to 0.13.2

## [0.14.1] 2017-09-28

### Fixed

- Oauth Client default image renders properly
- IP Transfer didn't send region correctly
- Rebooting did not work when multiple configs exist
- Reset RDNS did not show the default value after reset
- Reset RDNS should not be offered when default is in use
- (Docs) Updated to 0.13.1

## [0.14.0] 2017-09-26

### Added

- Transfer pool is shown (#2508)
- (Docs) Add a sidebar (#2494)
- Add Volume resize (#2500)
- Option to clone with label and backup (#2482)

### Changed

- Use Yarn rather than NPM (#2520)
- More graph options (#2501)
- show number of duplicates when deleting (#2484)
- set an initial disk array for rescue configs (#2491)
- (Docs) Bumped to 0.13.0
- (Docs) removed extraneous "\_" from properties
- (Docs) Show more of example up front
- (Docs) Smarter height on collapsed examples

### Fixed

- More fixes for API changes (#2549)
- Fix IP setRDNS creating duplicate (#2542)
- Fix disk delete (#2543)
- Fixes for docs and manager regressions (#2526)
- fix default root device in new linode configs (#2523)
- handle xen disk labels correctly (xvda-xvdh) (#2510)
- Render no graphs message correctly (#2518)
- CNAME hostname placeholder should not be a FQDN (#2514)
- Give tooltip a max width (#2513)
- Restart polling on actions

## [0.13.1] 2017-09-18

### Fixed

- API breaking changes #2547

## [0.13.0] 2017-08-29

### Added

- set a label when taking a snapshot #2366
- handle oauth token errors #2323
- enable private IP button separate from public #2370
- dns zone status on dns zone list page #2368
- plan visible on Linode list #2364
- add create Linode from backup #2380
- display all block storage volumes #2406
- Lish settings page #2365
- indeterminate checkbox state #2407
- support for implicit OAuth flow #2402
- attachments shown in tickets #2428
- input auto focus when enabling TFA #2419
- advanced filter for all lists #2416
- volumes shown on Linode advanced page #2408
- support for volumes in configs #2440

### Changed

- Linode, domain, NodeBalancer, and user creates are modals #2352
- use Bearer token type in OAuth flow #2280
- PAT creation defaults to no access #2421
- creating a ticket can now reference volumes and "Other" #2415

### Fixed

- stop long notifications from overflowing #2381
- stop secondary tables from overflowing #2379
- prevent public stackscripts from appearing to be privatizable #2378
- stop notifications in header from breaking on small screens #2363
- show correct links in CONTRIBUTING.md #2409
- show public ipv4 in SSH line in Access section #2429
- notification hover and dropdown fixes for Firefox #2426
- error formatting when snapshots fail #2425
- misc fixes for support tickets #2437
- crashing when no distro is selected in add disk modal #2438

## [0.12.7] 2017-08-08

### Added

- volume event formatters #2403

## [0.12.6] 2017-08-08

### Fixed

- don't crash when you have no weekly backups #2404

## [0.12.5] 2017-08-08

### Changed

- setState when using default value in Select #2401

## [0.12.4] 2017-08-07

### Fixed

- don't crash on rescue page when no disks are present because of bad Select logic

## [0.12.3] 2017-08-04

### Fixed

- allow no distro option when creating disk #2375

## [0.12.2] 2017-08-04

### Fixed

- reset disk slot to null correctly when deselecting a slot #2369

## [0.12.1] 2017-08-03

### Fixed

- breaking api changes #2354

## [0.12.0] 2017-08-01

### Added

- added linode filtering #2271
- added user filtering #2282
- added nodebalancer filtering #2273
- added domains filtering #2272
- added support link to main header #2296
- enabled external source map #2314
- added stackscript list and delete support #2317
- moar contrast #2292
- added subheader for navigation to stackscripts, volumes, lists #2321
- added support for adding and editing stackscripts #2322

### Changed

- switched to webpack 2.6.0 #2278
- fetch api pages asynchronously #2274
- users view is a list #2282
- regrouped tokens and PATs and moved out oauth tokens #2284
- use source-map instead of module-eval-source-map for better errors #2214
- expire token automatically rather than after attempting a request #2295
- refactor and use modal body components more consistently #2189
- default to sort by label #2360

### Fixed

- set min zero requirements on relevant nodebalancer config fields #2313
- render correct tooltip data when switching between units #2315
- allow shutdown from Linode status dropdown #2340

## [0.11.6] 2017-07-21

### Added

- response_type to OAuth flow to conform to RFC 6749

## [0.11.5] 2017-07-18

### Fixed

- no 3rd-party script includes # 2294

## [0.11.4] 2017-07-18

### Fixed

- group by lowercase distribution vendor names #2309

## [0.11.3] 2017-07-18

### Added

- rebuild confirm check #2302

## [0.11.2] 2017-07-12

### Changed

- don't track pageviews on /oauth page #2269

## [0.11.1] 2017-07-12

### Added

- add delete IP support #2270

### Fixed

- add linode_deleteip event formatting #2270

## [0.11.0] 2017-07-11

### Added

- unit selection to graphs #2185
- support for no access tokens #2192
- volumes to oauth scopes #2224

### Changed

- shared vertical nav updates for components, styleguide, docs, #2218
- tone down the miniheader #2229

### Fixed

- input placeholder styles on nodebalancers ssl fields and domains fields #2188
- buttons page in styleguide #2213

### Removed

- NodeBalancer config label field where present #2224

## [0.10.0] 2017-06-27

### Added

- analytics in modals and selects #2083
- sentry for error tracking #2149

### Changed

- prevent graph from re-rendering needlessly #2153
- contributing guidelines to include new git flow #2106
- minor wording updates, beta > early-access #2146
- console.trace is now console.error #2111

### Fixed

- reset RDNS wording and only display when relevant #2140
- other linode in iptransfer must be in same datacenter #2145
- oauth scope formatting # 2139
- redirect to /linodes on delete #2147
- updated srv record target placeholder #2161
- removed details from TTL defaults on domains #2161
- add TTL defaults to dropdowns on domain record edits #2161
- adjust how editing A/AAAA records handles ipv4 and ipv6 #2161
- logout redirection #2177
- user permission page crash #2175
- a duplicate scss import #2172
- component imports that reference manager #2166
- renamed track event to emit event #2166

## [0.9.10] 2017-06-27

### Changed

- rename dnszone grant to domain

## [0.9.9] 2017-06-26

### Fixed

- overflowing text in domains txt record values now gets truncated

## [0.9.8] 2017-06-19

### Changed

- remove ReactGA completely and more detailed errors

## [0.9.7] 2017-06-19

### Changed

- skip ReactGA for sending exceptions

## [0.9.6] 2017-06-19

### Changed

- added ips to oauth scopes constants

## [0.9.5] 2017-06-16

### Fixed

- don't render private ipv4 on Linode list

## [0.9.4] 2017-06-16

### Fixed

- allow saving soa records on slave domains

## [0.9.3] 2017-06-16

### Fixed

- don't crash on no nodebalancer ipv6

## [0.9.2] 2017-06-16

### Fixed

- hide ipv6 when no slaac is available on linode dashboard

## [0.9.1] 2017-06-16

### Fixed

- networking glue code when no slaac and link-local ips are present

## [0.9.0] 2017-06-16

### Added

- object count to the delete modal #2062
- tooltip component, defaults to disabled, included on primary label and link table cells #2007, #2073, #2074
- ability to add additional IPs, links to opening a support ticket #2066
- enable private IP to the networking tab #2066
- delete IP functionality to the networking tab #2066
- global IP pools to networking tab #2066
- beta banner including link to the classic manager #2088
- required overwrite modal to backup restore #800
- missing check_body and check_path fields to NodeBalancer config active health check form section #2089

### Changed

- long text in link and label table cells are now truncated based on the width of the th,
  an ellipsis is shown with a tooltip enabled #2007
- network tab revamped, IP Sharing and IP Transfer split into 2 separate tabs #2066
- network tab now shows proper gateway for all addresses #2066
- API_ROOT and LOGIN_ROOT constants in manager no longer default to alpha, and instead default to cloud.linode.com #2088

### Fixed

- linode list and linode dashboard correctly shows ipv4 addresses #2066
- destroy all disks and configs when checked using backup restore #2084
- ensure Linodes outside of region are not available to backup restore #2084
- breaks in styleguide forms, styles, header etc #2081

## [0.8.3] 2017-06-12

### Changed

- reinstate hover states, collapsed borders on adjacent active tabs

## [0.8.2] 2017-06-12

### Fixed

- retain tab active border color

## [0.8.1] 2017-06-12

### Changed

- reduced padding and margin on tabs

## [0.8.0] 2017-06-08

### Changed

- added Linode Employee identifier to ticket reply #2038
- confirmation added to revoke token button #2033
- uses classic Manager graph colors #2002
- confirmation added to reboot and power off #1987
- delete added to Linode dropdown #1987

### Fixed

- fixed support ticket layout and clearing text field on reply submission #2038
- fixed notification text not granular enough #2032
- fixed page title changes when the user triggers a change on the page #2016
- fixed error handling to display a modal on error except for 401s and 404s #2009
- launch lish is available from any Linode state #1987
- rebuild and bulk actions trigger power progress bar #1987
- fixed page source link 404 #2044

## [0.7.2] 2017-06-02

### Fixed

- two_factor_auth on profile is a boolean #1997

## [0.7.1] 2017-05-31

### Fixed

- fixed nodebalancer config create #1981

## [0.7.0] 2017-05-31

### Changed

- added delete nodebalancer config #1879
- added delete nodebalancer config node #1880
- added missing fields to soa record #1768
- dropped help buttons #1897
- scroll to top of page in docs on page change #1918
- reworded docs error section #1917
- added app loader #1859
- redirect /reference to home #1958
- added referral page #1914
- increased docs endpoint column width #1978
- replaced docs warning html #1966
- delayed preload calls #1962
- remove built docs files #1970
- graphs start y access at zero #1969
- optimized networking requests #1923

### Fixed

- updated oauth docs to link to new location #1896
- render nodebalancer config events correctly #1895
- format graph tooltip data correctly #1837
- fixed echoed docs snippet to prevent shell interpretation #1898
- fixed array rendering in docs #1899
- fixed tabs bug #1892
- fixed UK flag rendering and stop displaying tokyo1 #1893
- fixed weblish connection #1925
- fixed ipv4 rendering on dashboard #1919
- fixed slave create bug #1957
- fixed bad reference in docs breadcrumbs #1963
- fixed PAT creation #1924
- fixed disk password reset #1961
- misc css fixes #1922
- fixed docs linode types #1964
- fixed rescue mode disk mapping #1959
- fixed domain record deletion messages #1960

## [0.6.1] 2017-05-26

### Fixed

- fixed domain event rendering

## [0.6.0] 2017-05-24

### Changed

- lookup lish domains based on datacenter #1795
- delay fetching kernels until config pages #1846
- increase timeout between event requests #1856
- border-right on docs layout #1843
- added indicator to elements with title attribute #1840
- added nested response objects #1755
- removed referrals page #1838
- added docs python guide #1763
- lish not hard-coded to alpha #1795
- added nodebalancer graphs #1805

### Fixed

- domain groups displayed correctly #1844
- fixed mass delete #1845
- fixed missing response examples #1849
- fixed plan style #1783
- fixed node up down display #1780
- fixed backup price calculation #1783
- fixed plan price calculation #1814

## [0.5.6] 2017-05-19

### Fixed

- fixed ipv4 rendering in nodebalancers list #1826

## [0.5.5] 2017-05-19

### Fixed

- fixed region rendering #1823

## [0.5.4] 2017-05-19

### Fixed

- fixed ipv4 rendering #1817

## [0.5.3] 2017-05-18

### Fixed

- fixed miscalculated plan values #1811

## [0.5.2] 2017-05-18

### Fixed

- fixed user restricted radio #1808

## [0.5.1] 2017-05-18

### Fixed

- fixed reset my application secret #1801

## [0.5.0] 2017-05-18

### Fixed

- fix tests and linter errors #1770
- excess profile requests #1793
- static endpoint requests reference error #1800

### Changed

- update TFA forms with success states #1774
- simplify initial api call logic #1770
- now using `npm --no-git-tag-version version patch|minor|major` to bump versions so that shrinkwrap also gets updated
