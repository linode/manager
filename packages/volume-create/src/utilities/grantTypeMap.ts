export const grantTypeMap = {
    account: 'Account',
    database: 'Databases',
    domain: 'Domains',
    firewall: 'Firewalls',
    image: 'Images',
    linode: 'Linodes',
    lkeCluster: 'LKE Clusters', // Note: Not included in the user's grants returned from the API.
    longview: 'Longview Clients',
    nodebalancer: 'NodeBalancers',
    placementGroups: 'Placement Groups',
    stackscript: 'StackScripts',
    volume: 'Volumes',
    vpc: 'VPCs',
  } as const;