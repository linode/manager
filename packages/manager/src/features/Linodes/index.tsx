import {
  useAllAccountMaintenanceQuery,
  useAllLinodesQuery,
} from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { useInProgressEvents } from 'src/queries/events/events';
import { addMaintenanceToLinodes } from 'src/utilities/linodes';
import { storage } from 'src/utilities/storage';

import { PENDING_AND_IN_PROGRESS_MAINTENANCE_FILTER } from '../Account/Maintenance/utilities';
import { usePermissions } from '../IAM/hooks/usePermissions';
import { regionFilterOptions } from './LinodesLanding/RegionTypeFilter';
import { statusToPriority } from './LinodesLanding/utils';
import { linodesInTransition } from './transitions';

import type { ExtendedStatus } from './LinodesLanding/utils';
import type { RegionFilter } from 'src/utilities/storage';

const LinodesLanding = React.lazy(
  () => import('./LinodesLanding/LinodesLanding')
);

// Light wrapper around LinodesLanding that injects "extended" Linodes (with
// plan type and maintenance information). This extra data used to come from
// mapStateToProps, but since I wanted to use a query (for accountMaintenance)
// I needed a Function Component. It seemed safer to do it this way instead of
// refactoring LinodesLanding.
export const LinodesLandingWrapper = React.memo(() => {
  const navigate = useNavigate();
  const search = useSearch({
    strict: false,
  });
  const { data: accountMaintenanceData } = useAllAccountMaintenanceQuery(
    {},
    PENDING_AND_IN_PROGRESS_MAINTENANCE_FILTER
  );
  const flags = useFlags();

  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );

  const { data: permissions } = usePermissions('account', ['create_linode']);
  const [regionFilter, setRegionFilter] = React.useState<RegionFilter>(
    storage.regionFilter.get() ?? regionFilterOptions[0].value
  );

  // We need to grab all linodes so a filtered result of 0 does not display the empty state landing page
  const { data: allLinodes, isLoading: allLinodesLoading } =
    useAllLinodesQuery();
  const {
    data: filteredLinodes,
    error,
    isLoading: filteredLinodesLoading,
  } = useAllLinodesQuery(
    {},
    isGeckoLAEnabled ? generateLinodesXFilter(regionFilter) : {}
  );

  const someLinodesHaveScheduledMaintenance = accountMaintenanceData?.some(
    (thisAccountMaintenance) => thisAccountMaintenance.entity.type === 'linode'
  );

  const { data: events } = useInProgressEvents();

  const filteredLinodesData = addMaintenanceToLinodes(
    accountMaintenanceData ?? [],
    filteredLinodes ?? []
  );

  const _linodesInTransition = linodesInTransition(events ?? []);

  const orderBy = useOrderV2({
    data: (filteredLinodesData ?? []).map((linode) => {
      // Determine the priority of this Linode's status.
      // We have to check for "Maintenance" and "Busy" since these are
      // not actual Linode statuses (we derive them client-side).
      let _status: ExtendedStatus = linode.status;
      if (linode.maintenance) {
        _status = 'maintenance';
      } else if (_linodesInTransition.has(linode.id)) {
        _status = 'busy';
      }

      return {
        ...linode,
        _statusPriority: statusToPriority(_status),
        displayStatus: linode.maintenance ? 'maintenance' : linode.status,
      };
    }),
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: someLinodesHaveScheduledMaintenance
          ? '_statusPriority'
          : 'label',
      },
      from: '/linodes',
    },
    preferenceKey: 'linodes-landing',
  });

  const handleRegionFilter = (regionFilter: RegionFilter) => {
    setRegionFilter(regionFilter);
    storage.regionFilter.set(regionFilter);
  };

  return (
    <LinodesLanding
      filteredLinodesLoading={filteredLinodesLoading}
      handleRegionFilter={handleRegionFilter}
      linodesData={filteredLinodesData}
      linodesInTransition={linodesInTransition(events ?? [])}
      linodesRequestError={error ?? undefined}
      linodesRequestLoading={allLinodesLoading}
      navigate={navigate}
      orderBy={orderBy}
      permissions={permissions}
      regionFilter={regionFilter}
      search={search}
      someLinodesHaveScheduledMaintenance={Boolean(
        someLinodesHaveScheduledMaintenance
      )}
      totalNumLinodes={allLinodes?.length ?? 0}
    />
  );
});

const generateLinodesXFilter = (regionFilter: RegionFilter | undefined) => {
  if (regionFilter === 'core' || regionFilter === 'distributed') {
    return {
      site_type: regionFilter,
    };
  }
  return {};
};
