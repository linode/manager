import React from 'react';

import { Dashboard } from '@linode/api-v4';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { useCloudViewDashboardsQuery } from 'src/queries/cloudpulse/dashboards';
import { getUserPreferenceObject, updateGlobalFilterPreference } from '../Utils/UserPreference';
import { DASHBOARD_ID, REGION, RESOURCES } from '../Utils/CloudPulseConstants';
import Select from 'src/components/EnhancedSelect/Select';

export interface CloudPulseDashboardSelectProps {
  handleDashboardChange: (
    dashboard: Dashboard | undefined,
    isDefault? : boolean
  ) => void
}

export const CloudPulseDashboardSelect = React.memo(
  (props: CloudPulseDashboardSelectProps) => {
    const {
      data: dashboardsList,
      error,
      isLoading,
    } = useCloudViewDashboardsQuery(true); //Fetch the list of dashboards

    const errorText: string = error ? 'Error loading dashboards' : '';

    const placeHolder = 'Select a Dashboard';

  // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
  const getSortedDashboardsList = (options: Dashboard[]) => {
    return options.sort(
      (a, b) => -b.service_type.localeCompare(a.service_type)
    );
  };

  //get the selected dashboard from user preference
  const getPreferredDashboard = () : Dashboard | undefined =>{
    const defaultValue = getUserPreferenceObject()?.dashboardId;

    let selectedDashboard = undefined;
    if(dashboardsList && defaultValue){
      selectedDashboard = dashboardsList.data.find(dashboard => dashboard.id === defaultValue);
      props.handleDashboardChange(selectedDashboard, true);
    }
    return selectedDashboard;
  }

  if (!dashboardsList) {
    return (
      <Select
          disabled={true}
          isClearable={true}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => { }}
          placeholder={placeHolder}
        />
    )
  }

  return (
    <Autocomplete
      onChange={(_: any, dashboard: Dashboard) => {
        updateGlobalFilterPreference({
          [DASHBOARD_ID] : dashboard?.id,
          [REGION] : undefined,
          [RESOURCES] : []
        });
        props.handleDashboardChange(dashboard);
      }}
      options={ getSortedDashboardsList(dashboardsList.data) }
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
      defaultValue={getPreferredDashboard()}
      errorText={errorText}
      fullWidth
      groupBy={(option: Dashboard) => option.service_type}
      isOptionEqualToValue={(option, value) => option.label === value.label}
      label=""
      loading={isLoading}
      noMarginTop
      placeholder={placeHolder}
    />
  );
});
