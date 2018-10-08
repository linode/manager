# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
