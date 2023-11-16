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

export const VPC_CREATE_FORM_SUBNET_HELPER_TEXT = `A subnet divides a VPC into multiple logically defined networks to allow for controlled access to VPC resources. Subnets within a VPC are routable regardless of the address spaces they are in.`;

export const VPC_CREATE_FORM_VPC_HELPER_TEXT =
  'A virtual private cloud (VPC) is an isolated network which allows for control over how resources are networked and can communicate.';

export const VPC_FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScvWbTupCNsBF5cz5YEsv5oErHM4ONBZodDYi8KuOgC8fyfag/viewform';

export const NETWORK_INTERFACES_GUIDE_URL =
  'https://www.linode.com/docs/products/compute/compute-instances/guides/configuration-profiles/';

export const UNRECOMMENDED_CONFIGURATION_PREFERENCE_KEY =
  'not-recommended-configuration';
