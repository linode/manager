// Various constants for the VPCs package

export const ASSIGN_LINODES_DRAWER_REBOOT_MESSAGE =
  'Assigning a Linode to a subnet requires you to reboot the Linode to update its configuration.';

export const REGIONAL_LINODE_MESSAGE = `Select the Linodes you would like to assign to this subnet. Only Linodes in this VPC's region are displayed.`;

export const MULTIPLE_CONFIGURATIONS_MESSAGE =
  'This Linode has multiple configurations. Select which configuration you would like added to the subnet.';

export const REBOOT_LINODE_WARNING_VPCDETAILS =
  'Assigned or unassigned Linodes will not take affect until the Linodes are rebooted.';

export const SUBNET_UNASSIGN_LINODES_WARNING = `Unassigning Linodes from a subnet requires you to reboot the Linodes to update its configuration.`;

export const VPC_LABEL = 'Virtual Private Cloud (VPC)';

export const VPC_AUTO_ASSIGN_IPV4_TOOLTIP =
  'A VPC IPv4 is the private IP address for this Linode in the VPC.';

export const CANNOT_CREATE_VPC_MESSAGE = `You don't have permissions to create a new VPC. Please contact an account administrator for details`;

export const VPC_CREATE_FORM_SUBNET_HELPER_TEXT =
  'Each VPC can further segment itself into distinct networks through the use of multiple subnets. These subnets can isolate various functionality of an application.';

export const VPC_CREATE_FORM_VPC_HELPER_TEXT =
  'A VPC is an isolated network that enables private communication between Compute Instances within the same data center.';

export const VPC_FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScvWbTupCNsBF5cz5YEsv5oErHM4ONBZodDYi8KuOgC8fyfag/viewform';

export const VPC_REBOOT_MESSAGE =
  'The VPC configuration has been updated and the Linode needs to be rebooted.';

export const NETWORK_INTERFACES_GUIDE_URL =
  'https://www.linode.com/docs/products/compute/compute-instances/guides/configuration-profiles/';

export const UNRECOMMENDED_CONFIGURATION_PREFERENCE_KEY =
  'not-recommended-configuration';

export const WARNING_ICON_UNRECOMMENDED_CONFIG =
  'warning-icon-for-unrecommended-config';

// Linode Config dialog helper text for unrecommended configurations
export const LINODE_UNREACHABLE_HELPER_TEXT =
  'This network configuration is not recommended. The Linode will not be reachable or be able to reach Linodes in the other subnets of the VPC. We recommend selecting VPC as the primary interface and checking the “Assign a public IPv4 address for this Linode” checkbox.';

export const NATTED_PUBLIC_IP_HELPER_TEXT =
  "This network configuration is not recommended. The VPC interface with 1:1 NAT will use the Public IP even if it's not on the default network interface. The Linode will lose access to public network connectivity since the default route isn't able to route through the public IPv4 address. We recommend selecting VPC as the primary interface.";

export const NOT_NATTED_HELPER_TEXT =
  'The Linode will not be able to access the internet. If this Linode needs access to the internet we recommend checking the “Assign a public IPv4 address for this Linode” checkbox to enable 1:1 NAT on the VPC interface.';
