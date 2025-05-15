import {
  useAllAccountMaintenanceQuery,
  useNotificationsQuery,
} from '@linode/queries';

import {
  PENDING_MAINTENANCE_FILTER,
  PLATFORM_MAINTENANCE_TYPE,
} from 'src/features/Account/Maintenance/utilities';

import type { AccountMaintenance, Linode } from '@linode/api-v4';

interface UsePlatformMaintenanceResult {
  accountHasPlatformMaintenance: boolean;
  linodesWithPlatformMaintenance: Set<Linode['id']>;
  platformMaintenanceByLinode: Record<Linode['id'], AccountMaintenance[]>;
}

/**
 * Determines whether an account has platform maintenance, which
 * is system-wide maintenance requiring a reboot, and returns
 * associated maintenance items.
 */
export const usePlatformMaintenance = (): UsePlatformMaintenanceResult => {
  const { data: accountNotifications } = useNotificationsQuery();

  const accountHasPlatformMaintenance =
    accountNotifications?.find(
      (notification) => notification.type === PLATFORM_MAINTENANCE_TYPE
    ) !== undefined;

  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    PENDING_MAINTENANCE_FILTER,
    accountHasPlatformMaintenance
  );

  const platformMaintenanceItems = accountMaintenanceData?.filter(
    isPlatformMaintenance
  );

  return getPlatformMaintenanceResult(
    accountHasPlatformMaintenance,
    platformMaintenanceItems
  );
};

export const isPlatformMaintenance = (
  maintenance: AccountMaintenance
): boolean =>
  maintenance.type === 'reboot' &&
  maintenance.status === 'pending' &&
  maintenance.entity.type === 'linode';

const getPlatformMaintenanceResult = (
  accountHasPlatformMaintenance: boolean,
  maintenanceItems: AccountMaintenance[] = []
): UsePlatformMaintenanceResult => {
  const platformMaintenanceByLinode: Record<
    Linode['id'],
    AccountMaintenance[]
  > = {};
  for (const maintenance of maintenanceItems) {
    if (!(maintenance.entity.id in platformMaintenanceByLinode))
      platformMaintenanceByLinode[maintenance.entity.id] = [];
    platformMaintenanceByLinode[maintenance.entity.id].push(maintenance);
  }

  const linodesWithPlatformMaintenance = new Set(
    Object.keys(platformMaintenanceByLinode).map(Number)
  );

  return {
    accountHasPlatformMaintenance,
    platformMaintenanceByLinode,
    linodesWithPlatformMaintenance,
  };
};
