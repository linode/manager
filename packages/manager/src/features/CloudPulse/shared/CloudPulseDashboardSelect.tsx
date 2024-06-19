import React from 'react';

import { Dashboard } from '@linode/api-v4'
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { useCloudViewDashboardsQuery } from 'src/queries/cloudpulse/dashboards';


export interface CloudPulseDashboardSelectProps {
  handleDashboardChange: (
    dashboard: Dashboard | undefined
  ) => void
}

export const CloudPulseDashboardSelect = React.memo((props: CloudPulseDashboardSelectProps) => {

  const {
    data: dashboardsList,
    error,
    isLoading,
  } = useCloudViewDashboardsQuery(true);  //Fetch the list of dashboards

  const errorText: string = error ? 'Error loading dashboards' : '';

  // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
  const getSortedDashboardsList = (options: Dashboard[]) => {
    return options.sort(
      (a, b) => -b.service_type.localeCompare(a.service_type)
    );
  };

  if (!dashboardsList) {
    return (
      <Autocomplete
        options={[]}
        label=''
        disabled={true}
        onChange={() => {}}
        data-testid="cloudview-dashboard-select"
        placeholder='Select Dashboard'
      />
    )
  }

  return (
    <Autocomplete
      onChange={(_: any, dashboard: Dashboard) => {
        props.handleDashboardChange(dashboard);
      }}
      options={
        !dashboardsList ? [] : getSortedDashboardsList(dashboardsList.data)
      }
      renderGroup={(params) => (
        <Box key={params.key}>
          <Typography
            sx={{ marginLeft: '3.5%', textTransform: 'capitalize' }}
            variant="h3"
          >
            {params.group}
          </Typography>
          {params.children}
        </Box>
      )}
      autoHighlight
      clearOnBlur
      data-testid="cloudview-dashboard-select"
      errorText={errorText}
      fullWidth
      groupBy={(option: Dashboard) => option.service_type}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label=""
      loading={isLoading}
      noMarginTop
      placeholder="Select a Dashboard"
    />
  );
});
