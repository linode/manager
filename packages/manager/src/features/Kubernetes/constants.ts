export const CLUSTER_TIER_DOCS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/linode-kubernetes-engine#compare-lke-and-lke-enterprise';
export const CLUSTER_VERSIONS_DOCS_LINK =
  'https://techdocs.akamai.com/cloud-computing/docs/lke-versioning-and-life-cycle-policy';
export const nodeWarning =
  'We recommend a minimum of 3 nodes in each Node Pool to avoid downtime during upgrades and maintenance.';
export const nodesDeletionWarning =
  'All nodes will be deleted and new nodes will be created to replace them.';
export const localStorageWarning =
  'Any data stored within local storage of your node(s) (such as ’hostPath’ volumes) is deleted.';
export const MULTI_NODE_POD_DELETION_WARNING =
  'Any pods running on these nodes are also deleted.';
export const SINGLE_NODE_POD_DELETION_WARNING =
  'Any pods running on this node are also deleted.';
export const MULTI_NODE_POD_RECYCLE_WARNING =
  'Any pods running on these nodes are also deleted and rescheduled.';
export const SINGLE_NODE_POD_RECYCLE_WARNING =
  'Any pods running on this node are also deleted and rescheduled.';

export const ACL_DRAWER_STANDARD_TIER_ACL_COPY =
  'Control Plane ACL secures network access to your LKE cluster’s control plane. Use this form to enable or disable the ACL on your LKE cluster, update the list of allowed IP addresses, and adjust other settings.';
export const ACL_DRAWER_ENTERPRISE_TIER_ACL_COPY =
  'Control Plane ACL secures network access to your LKE Enterprise cluster’s control plane. Use this form to update the list of allowed IP addresses and adjust other settings.';
export const ACL_DRAWER_STANDARD_TIER_ACTIVATION_STATUS_COPY =
  'Enable or disable the Control Plane ACL. If the ACL is not enabled, any public IP address can be used to access your control plane. Once enabled, all network access is denied except for the IP addresses and CIDR ranges defined on the ACL.';
export const ACL_DRAWER_ENTERPRISE_TIER_ACTIVATION_STATUS_COPY =
  'An access control list (ACL) is enabled by default on LKE Enterprise clusters.';

export const CREATE_CLUSTER_STANDARD_TIER_ACL_COPY =
  'An access control list (ACL) is enabled by default on LKE Enterprise clusters. All traffic to the control plane is restricted except from IP addresses listed in the ACL. Add at least one IP address or CIDR range.';
export const CREATE_CLUSTER_ENTERPRISE_TIER_ACL_COPY =
  'Enable an access control list (ACL) on your LKE cluster to restrict access to your cluster’s control plane. Only the IP addresses and ranges specified in the ACL can connect to the control plane.';
