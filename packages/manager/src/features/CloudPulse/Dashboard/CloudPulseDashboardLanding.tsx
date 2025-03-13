import { Box, Paper } from '@linode/ui';
import { Grid } from '@mui/material';
import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseAppliedFilterRenderer } from '../shared/CloudPulseAppliedFilterRenderer';
import { defaultTimeDuration } from '../Utils/CloudPulseDateTimePickerUtils';
import { CloudPulseDashboardRenderer } from './CloudPulseDashboardRenderer';

import type { Dashboard, DateTimeWithPreset } from '@linode/api-v4';
import {Redirect} from 'react-router-dom'

export type FilterValueType = number | number[] | string | string[] | undefined;

export interface FilterData {
  id: { [filterKey: string]: FilterValueType };
  label: { [filterKey: string]: string[] };
}
export interface DashboardProp {
  dashboard?: Dashboard;
  filterValue: {
    [key: string]: FilterValueType;
  };
  timeDuration?: DateTimeWithPreset;
}

export const CloudPulseDashboardLanding = () => {
  const [filterData, setFilterData] = React.useState<FilterData>({
    id: {},
    label: {},
  });

  const [timeDuration, setTimeDuration] = React.useState<DateTimeWithPreset>(
    defaultTimeDuration()
  );

  const [dashboard, setDashboard] = React.useState<Dashboard>();

  const [showAppliedFilters, setShowAppliedFilters] = React.useState<boolean>(
    false
  );

  const toggleAppliedFilter = (isVisible: boolean) => {
    setShowAppliedFilters(isVisible);
  };

  const onFilterChange = React.useCallback(
    (filterKey: string, filterValue: FilterValueType, labels: string[]) => {
      setFilterData((prev: FilterData) => {
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
    setFilterData({
      id: {},
      label: {},
    }); // clear the filter values on dashboard change
  }, []);
  const onTimeDurationChange = React.useCallback(
    (timeDurationObj: DateTimeWithPreset) => {
      setTimeDuration(timeDurationObj);
    },
    []
  );
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <LandingHeader
        breadcrumbProps={{ pathname: '/metrics' }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/akamai-cloud-pulse"
      />
      <DocumentTitleSegment segment="Dashboards" />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 0 }}>
            <Box display="flex" flexDirection="column">
              <GlobalFilters
                handleAnyFilterChange={onFilterChange}
                handleDashboardChange={onDashboardChange}
                handleTimeDurationChange={onTimeDurationChange}
                handleToggleAppliedFilter={toggleAppliedFilter}
              />
              {dashboard?.service_type && showAppliedFilters && (
                <CloudPulseAppliedFilterRenderer
                  filters={filterData.label}
                  serviceType={dashboard.service_type}
                />
              )}
            </Box>
          </Paper>
        </Grid>
        <CloudPulseDashboardRenderer
          dashboard={dashboard}
          filterValue={filterData.id}
          timeDuration={timeDuration}
        />
      </Grid>
      <Redirect from="*" to ="/metrics"/>
    </React.Suspense>
  );
};

export const cloudPulseMetricsLandingLazyRoute = createLazyRoute('/metrics')({
  component: CloudPulseDashboardLanding,
});
