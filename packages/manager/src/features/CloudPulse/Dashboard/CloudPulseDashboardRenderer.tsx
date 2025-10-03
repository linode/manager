import React from 'react';

import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import {
  LINODE_REGION,
  REFRESH,
  REGION,
  RESOURCE_ID,
  TAGS,
} from '../Utils/constants';
import {
  checkIfAllMandatoryFiltersAreSelected,
  getMetricsCallCustomFilters,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { DashboardProp } from './CloudPulseDashboardLanding';

export const CloudPulseDashboardRenderer = React.memo(
  (props: DashboardProp) => {
    const { dashboard, filterValue, timeDuration, groupBy } = props;
    const selectDashboardAndFilterMessage =
      'Select a dashboard and apply filters to visualize metrics.';

    const getMetricsCall = React.useMemo(
      () => getMetricsCallCustomFilters(filterValue, dashboard?.id),
      [dashboard?.id, filterValue]
    );

    if (!dashboard) {
      return (
        <CloudPulseErrorPlaceholder
          errorMessage={selectDashboardAndFilterMessage}
        />
      );
    }

    if (!FILTER_CONFIG.get(dashboard.id)) {
      return (
        <CloudPulseErrorPlaceholder errorMessage="No filters are configured for the selected dashboard's service type." />
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
        additionalFilters={getMetricsCall}
        dashboardId={dashboard.id}
        duration={timeDuration}
        groupBy={groupBy}
        linodeRegion={
          filterValue[LINODE_REGION] &&
          typeof filterValue[LINODE_REGION] === 'string'
            ? (filterValue[LINODE_REGION] as string)
            : undefined
        }
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
        savePref={true}
        serviceType={dashboard.service_type}
        tags={
          filterValue[TAGS] && Array.isArray(filterValue[TAGS])
            ? (filterValue[TAGS] as string[])
            : []
        }
      />
    );
  }
);
