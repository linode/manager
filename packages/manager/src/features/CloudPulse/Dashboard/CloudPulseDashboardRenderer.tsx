import React from 'react';

import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { REFRESH, REGION, RESOURCE_ID } from '../Utils/constants';
import {
  checkIfAllMandatoryFiltersAreSelected,
  getMetricsCallCustomFilters,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { arrayDeepEqual } from '../Utils/utils';
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

    if (
      oldProps.timeDuration?.unit !== newProps.timeDuration?.unit ||
      oldProps.timeDuration?.value !== newProps.timeDuration?.value
    ) {
      return false;
    }

    const oldKeys = Object.keys(oldProps.filterValue);
    const newKeys = Object.keys(newProps.filterValue);

    if (oldKeys.length !== newKeys.length) {
      return false;
    }

    for (const key of oldKeys) {
      const oldValue = oldProps.filterValue[key];
      const newValue = newProps.filterValue[key];

      if (
        Array.isArray(oldValue) &&
        Array.isArray(newValue) &&
        !arrayDeepEqual(oldValue, newValue)
      ) {
        return false;
      }

      if (oldValue !== newValue) {
        return false;
      }
    }
    return true;
  }
);
