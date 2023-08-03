import {
  AccountMaintenance,
  Grant,
  GrantLevel,
  Grants,
  Linode,
  VPC,
} from '@linode/api-v4';

export interface Maintenance {
  when: null | string;
}

export interface LinodeWithMaintenance extends Linode {
  maintenance?: Maintenance | null;
}

export interface LinodeWithVPC extends LinodeWithMaintenance {
  vpcLabel?: string;
  vpcId?: number;
}

export const addMaintenanceToLinodes = (
  accountMaintenance: AccountMaintenance[],
  linodes: Linode[]
): LinodeWithMaintenance[] => {
  return linodes.map((thisLinode) => {
    const foundMaintenance = accountMaintenance.find((thisMaintenance) => {
      return (
        thisMaintenance.entity.type === 'linode' &&
        thisMaintenance.entity.id === thisLinode.id
      );
    });

    return foundMaintenance
      ? {
          ...thisLinode,
          maintenance: {
            when: foundMaintenance.when,
          },
        }
      : { ...thisLinode, maintenance: null };
  });
};

export const getPermissionsForLinode = (
  grants: Grants | null | undefined,
  linodeId: number
): GrantLevel => {
  if (!grants) {
    return 'read_write';
  } // Default to write access
  const linodesGrants = grants.linode;
  const linodeGrants = linodesGrants.find(
    (grant: Grant) => grant.id === linodeId
  );

  return linodeGrants ? linodeGrants.permissions : 'read_write';
};

// TODO: VPC - see comments on src/features/Linodes/index.tsx about vpc query
export const addVPCToLinodes = (
  vpcs: VPC[],
  linodes: LinodeWithMaintenance[]
): LinodeWithVPC[] => {
  return linodes.map((linode) => {
    const vpc = findAssociatedVPC(vpcs, linode.id);

    return vpc
      ? { ...linode, vpcLabel: vpc.label, vpcId: vpc.id }
      : { ...linode };
  });
};

// breaking up into helper function due to large amount of looping
const findAssociatedVPC = (vpcs: VPC[], linodeId: number) => {
  for (const vpc of vpcs) {
    for (const subnet of vpc.subnets) {
      if (subnet.linodes.includes(linodeId)) {
        // a linode should have only one vpc associated with it (?) so we can
        // short circuit once we find the associated vpc
        return vpc;
      }
    }
  }

  return undefined;
};
