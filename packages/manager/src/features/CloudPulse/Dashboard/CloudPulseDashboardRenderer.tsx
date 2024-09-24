import deepEqual from 'fast-deep-equal';
import React from 'react';

import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { REFRESH, REGION, RESOURCE_ID } from '../Utils/constants';
import {
  checkIfAllMandatoryFiltersAreSelected,
  getMetricsCallCustomFilters,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { DashboardProp } from './CloudPulseDashboardLanding';

export const CloudPulseDashboardRenderer = React.memo(
  (props: DashboardProp) => {
    const { dashboard, filterValue, timeDuration } = props;

    const selectDashboardAndFilterMessage =
      'Select Dashboard and filters to visualize metrics.';

    const getMetricsCall = React.useMemo(
      () => getMetricsCallCustomFilters(filterValue, dashboard?.service_type),
      [dashboard?.service_type, filterValue]
    );

    if (!dashboard) {
      return (
        <CloudPulseErrorPlaceholder
          errorMessage={selectDashboardAndFilterMessage}
        />
      );
    }

    if (!FILTER_CONFIG.get(dashboard.service_type)) {
      return (
        <CloudPulseErrorPlaceholder errorMessage="No Filters Configured for selected dashboard's service type" />
      );
    }

    if (
      !checkIfAllMandatoryFiltersAreSelected({
        dashboard,
        filterValue,
        timeDuration,
      }) ||
      !timeDuration
    ) {
      return (
        <CloudPulseErrorPlaceholder
          errorMessage={selectDashboardAndFilterMessage}
        />
      );
    }

    return (
      <CloudPulseDashboard
        manualRefreshTimeStamp={
          filterValue[REFRESH] && typeof filterValue[REFRESH] === 'number'
            ? filterValue[REFRESH]
            : undefined
        }
        region={
          typeof filterValue[REGION] === 'string'
            ? (filterValue[REGION] as string)
            : undefined
        }
        resources={
          filterValue[RESOURCE_ID] && Array.isArray(filterValue[RESOURCE_ID])
            ? (filterValue[RESOURCE_ID] as string[])
            : []
        }
        additionalFilters={getMetricsCall}
        dashboardId={dashboard.id}
        duration={timeDuration}
        savePref={true}
      />
    );
  },
  (oldProps: DashboardProp, newProps: DashboardProp) => {
    if (oldProps.dashboard?.id !== newProps.dashboard?.id) {
      return false;
    }

    if (!deepEqual(oldProps.filterValue, newProps.filterValue)) {
      return false;
    }

    if (
      oldProps.timeDuration?.unit !== newProps.timeDuration?.unit ||
      oldProps.timeDuration?.value !== newProps.timeDuration?.value
    ) {
      return false;
    }

    return true;
  }
);
