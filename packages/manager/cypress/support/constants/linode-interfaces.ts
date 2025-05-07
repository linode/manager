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

export const networkingTitleText = 'Networking';

export const networkInterfaceTypeSectionText = 'Network Interface Type';

export const linodeInterfacesLabelText = 'Linode Interfaces';

export const betaLabelText = 'beta';

export const linodeInterfacesDescriptionText1 = 'Linode Interfaces are the preferred option for VPCs and are managed directly through a Linode’s Network settings.';

export const linodeInterfacesDescriptionText2 = 'Cloud Firewalls are assigned to individual VPC and public interfaces.';

export const legacyInterfacesLabelText = 'Configuration Profile Interfaces (Legacy)';

export const legacyInterfacesDescriptionText1 = 'Interfaces in the Configuration Profile are part of a Linode’s configuration.';

export const legacyInterfacesDescriptionText2 = 'Cloud Firewalls are applied at the Linode level and automatically cover all non-VLAN interfaces in the Configuration Profile.';

export const networkConnectionSectionText = 'Network Connection';

export const networkConnectionDescriptionText = 'The default interface used by this Linode to route network traffic. Additional interfaces can be added after the Linode is created.';