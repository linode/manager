import { AccountMaintenance, Linode } from '@linode/api-v4';

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
