import { Grid, Paper } from '@mui/material';
import deepEqual from 'fast-deep-equal';
import * as React from 'react';

import CloudPulseIcon from 'src/assets/icons/entityIcons/monitor.svg';
import { StyledPlaceholder } from 'src/features/StackScripts/StackScriptBase/StackScriptBase.styles';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { REFRESH, REGION, RESOURCE_ID } from '../Utils/constants';
import {
  checkIfAllMandatoryFiltersAreSelected,
  getMetricsCallCustomFilters,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { Dashboard, TimeDuration } from '@linode/api-v4';

export type FilterValueType = number | number[] | string | string[] | undefined;

interface DashboardProp {
  dashboard?: Dashboard;
  filterValue: {
    [key: string]: FilterValueType;
  };
  timeDuration?: TimeDuration;
}

const selectDashboardAndFilterMessage =
  'Select Dashboard and filters to visualize metrics.';

export const CloudPulseDashboardLanding = () => {
  const [filterValue, setFilterValue] = React.useState<{
    [key: string]: FilterValueType;
  }>({});
  const [timeDuration, setTimeDuration] = React.useState<TimeDuration>();

  const [dashboard, setDashboard] = React.useState<Dashboard>();

  const onFilterChange = React.useCallback(
    (filterKey: string, filterValue: FilterValueType) => {
      setFilterValue((prev: { [key: string]: FilterValueType }) => ({
        ...prev,
        [filterKey]: filterValue,
      }));
    },
    []
  );

  const onDashboardChange = React.useCallback((dashboardObj: Dashboard) => {
    setDashboard(dashboardObj);
    setFilterValue({}); // clear the filter values on dashboard change
  }, []);
  const onTimeDurationChange = React.useCallback(
    (timeDurationObj: TimeDuration) => {
      setTimeDuration(timeDurationObj);
    },
    []
  );
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper>
          <GlobalFilters
            handleAnyFilterChange={onFilterChange}
            handleDashboardChange={onDashboardChange}
            handleTimeDurationChange={onTimeDurationChange}
          />
        </Paper>
      </Grid>
      <RenderDashboard
        dashboard={dashboard}
        filterValue={filterValue}
        timeDuration={timeDuration}
      />
    </Grid>
  );
};

/**
 * Incase of errors and filter criteria not met, this renders the required error message placeholder and in case of success checks, renders a dashboard
 * @returns Placeholder | Dashboard
 */
const RenderDashboard = React.memo(
  (props: DashboardProp) => {
    const { dashboard, filterValue, timeDuration } = props;
    if (!dashboard) {
      return renderErrorPlaceholder(selectDashboardAndFilterMessage);
    }

    if (!FILTER_CONFIG.get(dashboard.service_type)) {
      return renderErrorPlaceholder(
        "No Filters Configured for selected dashboard's service type"
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
      return renderErrorPlaceholder(selectDashboardAndFilterMessage);
    }

    return (
      <CloudPulseDashboard
        additionalFilters={getMetricsCallCustomFilters(
          filterValue,
          dashboard.service_type
        )}
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
        dashboardId={dashboard.id}
        duration={timeDuration}
        savePref={true}
      />
    );
  },
  (oldProps: DashboardProp, newProps: DashboardProp) => {
    if (!deepEqual(oldProps.dashboard, newProps.dashboard)) {
      return false;
    }

    if (!deepEqual(oldProps.filterValue, newProps.filterValue)) {
      return false;
    }

    if (!deepEqual(oldProps.timeDuration, newProps.timeDuration)) {
      return false;
    }

    return true;
  }
);

/**
 * Takes an error message as input and renders a placeholder with the error message
 * @param errorMessage {string} - Error message which will be displayed
 *
 */
const renderErrorPlaceholder = (errorMessage: string) => {
  return (
    <Grid item xs={12}>
      <Paper>
        <StyledPlaceholder
          icon={CloudPulseIcon}
          isEntity
          subtitle={errorMessage}
          title=""
        />
      </Paper>
    </Grid>
  );
};
