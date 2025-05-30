export const dryRunButtonText = 'Perform Dry Run';

export const upgradeInterfacesButtonText = 'Upgrade Interfaces';

export const upgradeTooltipText1 = 'Configuration Profile interfaces from a single profile can be upgraded to Linode Interfaces.';

export const upgradeTooltipText2 = 'After the upgrade, the Linode can only use Linode Interfaces and cannot revert to Configuration Profile interfaces. Use the dry-run feature to review the changes before committing.';

export const promptDialogDescription1 = 'Upgrading allows interface connections to be associated directly with the Linode, rather than its configuration profile.';

export const promptDialogDescription2 = 'We recommend performing a dry run before upgrading to identify and resolve any potential conflicts.';

export const promptDialogUpgradeWhatHappensTitle = 'What happens after the upgrade:';

export const promptDialogUpgradeDetails = [
  'New Linode Interfaces are created to match the existing Configuration Profile Interfaces.',
  'The Linode will only use Linode Interfaces and cannot revert to Configuration Profile Interfaces.',
  'Private IPv4 addresses are not supported on public Linode Interfaces—services relying on a private IPv4 will no longer function.',
  'All firewalls are removed from the Linode. Any previously attached firewalls are reassigned to the new public and VPC interfaces. Default firewalls are not applied if none were originally attached.',
  'Public interfaces retain the Linode’s existing MAC address and SLAAC IPv6 address.',
  'Configuration Profile Interfaces are removed from the Configurations tab. The new Linode Interfaces will appear in the Network tab.',
];

export const configSelectSharedText =
  'This Linode has multiple configuration profiles. Choose one to continue.';

export const upgradeInterfacesWarningText =
  'After upgrading, the Linode will use only Linode Interfaces and cannot revert back to Configuration Profile Interfaces. Private IPv4 addresses are not supported on public Linode Interfaces. Services depending on a private IPv4 will no longer function.';

export const errorDryRunText =
  'The dry run found the following issues. After correcting them, perform another dry run.';
