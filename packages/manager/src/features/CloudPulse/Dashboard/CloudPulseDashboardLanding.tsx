import { Grid, Paper } from '@mui/material';
import * as React from 'react';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseDashboardRenderer } from './CloudPulseDashboardRenderer';

import type { Dashboard, TimeDuration } from '@linode/api-v4';

export type FilterValueType = number | number[] | string | string[] | undefined;

export interface FilterValue {
  id: { [key: string]: FilterValueType };
  label: string[];
}
export interface DashboardProp {
  dashboard?: Dashboard;
  filterValue: {
    [key: string]: FilterValueType;
  };
  timeDuration?: TimeDuration;
}

export const CloudPulseDashboardLanding = () => {
  const [filterValue, setFilterValue] = React.useState<FilterValue>({
    id: {},
    label: [],
  });

  const [timeDuration, setTimeDuration] = React.useState<TimeDuration>();

  const [dashboard, setDashboard] = React.useState<Dashboard>();

  const onFilterChange = React.useCallback(
    (filterKey: string, filterValue: FilterValueType, labels: string[]) => {
      setFilterValue((prev: FilterValue) => {
        return {
          id: {
            ...prev.id,
            [filterKey]: filterValue,
          },
          label: {
            ...prev.label,
            [filterKey]: labels,
          },
        };
      });
    },
    []
  );

  const onDashboardChange = React.useCallback((dashboardObj: Dashboard) => {
    setDashboard(dashboardObj);
    setFilterValue({
      id: {},
      label: [],
    }); // clear the filter values on dashboard change
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
        filterValue={filterValue.id}
        timeDuration={timeDuration}
      />
    </Grid>
  );
};
