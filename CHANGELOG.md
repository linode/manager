# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
- Revert  error poc
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
      - May not close tickets that have not been interacted with by Linode  (covered by autoclose requirement)
      - Tickets closed by customer should be marked as closed by customer
      - Support Ticket objects should indicate if they are closable

### Changed:
  - Tightened whitespace on tables. Considerably reduced the padding on table cells to give users the ability to see more items at a glance. Similar changes were made to summary panels in an ongoing effort to improve our information density overall.
  - We changed the way that a user will view their DNS records.  Today when you view DNS records you have to expand all of the accordions to see details of your domains. Now when you view a domain you can see all details of the domain without having to expand all the accordions.
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
- Volume attachment API requests must use integer config\_id (#2813)

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
