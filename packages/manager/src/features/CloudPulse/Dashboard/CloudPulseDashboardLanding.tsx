import { Grid, Paper } from '@mui/material';
import * as React from 'react';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseDashboardRenderer } from './CloudPulseDashboardRenderer';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { Dashboard, TimeDuration } from '@linode/api-v4';

export type FilterValueType =
  | CloudPulseResources[]
  | number
  | number[]
  | string
  | string[]
  | undefined;

export interface DashboardProp {
  dashboard?: Dashboard;
  filterValue: {
    [key: string]: FilterValueType;
  };
  timeDuration?: TimeDuration;
}

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
      <CloudPulseDashboardRenderer
        dashboard={dashboard}
        filterValue={filterValue}
        timeDuration={timeDuration}
      />
    </Grid>
  );
};
