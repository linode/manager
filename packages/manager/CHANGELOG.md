# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

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
