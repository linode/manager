import { useAllAccountMaintenanceQuery } from '@linode/queries';
import { useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { UPCOMING_MAINTENANCE_FILTER } from 'src/features/Account/Maintenance/utilities';

import type { AccountSettings } from '@linode/api-v4';

export type MaintenancePolicyValues = Pick<
  AccountSettings,
  'maintenance_policy'
>;

interface UseUpcomingMaintenanceNoticeProps {
  control: UseFormReturn<MaintenancePolicyValues>['control'];
  entityId?: number;
  entityType?: 'linode' | 'volume';
}

export const useUpcomingMaintenanceNotice = ({
  control,
  entityId,
  entityType = 'linode',
}: UseUpcomingMaintenanceNoticeProps) => {
  const selectedMaintenancePolicy = useWatch({
    control,
    name: 'maintenance_policy',
  });

  const { data: upcomingMaintenance } = useAllAccountMaintenanceQuery(
    {},
    UPCOMING_MAINTENANCE_FILTER,
    true // Always fetch for account-level settings
  );

  // Check if there's upcoming maintenance for the specific entity or any entity if no entityId provided
  const entityUpcomingMaintenance = upcomingMaintenance?.find((maintenance) => {
    const matchesEntityType = maintenance.entity.type === entityType;
    const matchesEntityId = entityId
      ? maintenance.entity.id === entityId
      : true;
    const isScheduled = maintenance.status === 'scheduled';
    const policyDiffers =
      maintenance.maintenance_policy_set !== selectedMaintenancePolicy;

    return matchesEntityType && matchesEntityId && isScheduled && policyDiffers;
  });

  const showUpcomingMaintenanceNotice =
    entityUpcomingMaintenance && selectedMaintenancePolicy;

  return {
    showUpcomingMaintenanceNotice,
    entityUpcomingMaintenance,
    selectedMaintenancePolicy,
  };
};
