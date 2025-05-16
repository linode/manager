// Various constants for the VPCs package

// Labels
export const VPC_LABEL = 'Virtual Private Cloud (VPC)';

// Keys
export const UNRECOMMENDED_CONFIGURATION_PREFERENCE_KEY =
  'not-recommended-configuration';

export const WARNING_ICON_UNRECOMMENDED_CONFIG =
  'warning-icon-for-unrecommended-config';

// Copy
export const REGION_CAVEAT_HELPER_TEXT =
  'A Linode may be assigned only to a VPC in the same region.';

export const NODEBALANCER_REGION_CAVEAT_HELPER_TEXT =
  'A NodeBalancer may be assigned only to a VPC in the same region.';

export const REGIONAL_LINODE_MESSAGE =
  "Select the Linodes you would like to assign to this subnet. Only Linodes in this VPC's region are displayed.";

export const MULTIPLE_CONFIGURATIONS_MESSAGE =
  'This Linode has multiple configurations. Select which configuration you would like added to the subnet.';

export const VPC_AUTO_ASSIGN_IPV4_TOOLTIP =
  'Automatically assign an IPv4 address as the private IP address for this Linode in the VPC.';

export const CANNOT_CREATE_VPC_MESSAGE =
  "You don't have permissions to create a new VPC. Please contact an account administrator for details.";

export const VPC_CREATE_FORM_SUBNET_HELPER_TEXT =
  'Each VPC can further segment itself into distinct networks through the use of multiple subnets. These subnets can isolate various functionality of an application.';

export const VPC_CREATE_FORM_VPC_HELPER_TEXT =
  'A VPC is an isolated network that enables private communication between Compute Instances within the same data center.';

export const VPC_REBOOT_MESSAGE =
  'The VPC configuration has been updated. Reboot the Linode to reflect configuration changes.';

export const VPC_READ_ONLY_TOOLTIP = 'VPC does not support Read Only access';

export const ASSIGN_IPV4_RANGES_TITLE = 'Assign additional IPv4 ranges';

// Linode Config dialog helper text for unrecommended configurations
export const LINODE_UNREACHABLE_HELPER_TEXT =
  'This network configuration is not recommended. The Linode will not be reachable or able to reach Linodes in the other subnets of the VPC. We recommend selecting VPC as the primary interface and checking the “Assign a public IPv4 address for this Linode” checkbox.';

export const NATTED_PUBLIC_IP_HELPER_TEXT =
  'This network configuration is not recommended. The Linode will have no public connectivity as the public IPv4 is assigned to the non-primary VPC interface. We recommend selecting VPC as the primary interface.';

export const NOT_NATTED_HELPER_TEXT =
  'The Linode will not be able to access the internet. If this Linode needs access to the internet, we recommend checking the “Assign a public IPv4 address for this Linode” checkbox which will enable 1:1 NAT on the VPC interface.';

// Links
export const VPC_DOCS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/vpc';

export const VPC_GETTING_STARTED_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-vpc';

export const VPC_MULTIPLE_CONFIGURATIONS_LEARN_MORE_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/manage-configuration-profiles-on-a-compute-instance';

export const ASSIGN_COMPUTE_INSTANCE_TO_VPC_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/assign-a-compute-instance-to-a-vpc';

// constants used for tanstack routing:
export const VPC_LANDING_TABLE_PREFERENCE_KEY = 'vpcs';
export const VPC_LANDING_ROUTE = '/vpcs';
export const VPC_DETAILS_ROUTE = '/vpcs/$vpcId';
export const VPC_CREATE_ROUTE = '/vpcs/create';
export const SUBNET_ACTION_PATH =
  '/vpcs/$vpcId/subnets/$subnetId/$subnetAction';
