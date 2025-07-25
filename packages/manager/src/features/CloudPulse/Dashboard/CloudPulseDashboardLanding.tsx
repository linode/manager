import { Box, Paper } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseAppliedFilterRenderer } from '../shared/CloudPulseAppliedFilterRenderer';
import { CloudPulseDashboardRenderer } from './CloudPulseDashboardRenderer';

import type { Dashboard, DateTimeWithPreset } from '@linode/api-v4';

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

  const [timeDuration, setTimeDuration] = React.useState<
    DateTimeWithPreset | undefined
  >();

  const [dashboard, setDashboard] = React.useState<Dashboard>();

  const [showAppliedFilters, setShowAppliedFilters] =
    React.useState<boolean>(false);

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
      <DocumentTitleSegment segment="Dashboards" />
      <LandingHeader
        breadcrumbProps={{ pathname: '/metrics' }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/akamai-cloud-pulse"
      />
      <GridLegacy container spacing={3} sx={{ width: 'inherit !important' }}>
        <GridLegacy item xs={12}>
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
        </GridLegacy>
        <CloudPulseDashboardRenderer
          dashboard={dashboard}
          filterValue={filterData.id}
          timeDuration={timeDuration}
        />
      </GridLegacy>
    </React.Suspense>
  );
};
