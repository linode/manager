import {
  AccountMaintenance,
  Grant,
  GrantLevel,
  Grants,
  Linode,
} from '@linode/api-v4';

export interface Maintenance {
  when: null | string;
}

export interface LinodeWithMaintenance extends Linode {
  maintenance?: Maintenance | null;
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
