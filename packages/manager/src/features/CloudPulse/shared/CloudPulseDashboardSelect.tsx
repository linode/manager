import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { useCloudPulseDashboardsQuery } from 'src/queries/cloudpulse/dashboards';

import { DASHBOARD_ID, REGION, RESOURCES } from '../Utils/constants';
import {
  getUserPreferenceObject,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';

import type { Dashboard } from '@linode/api-v4';

export interface CloudPulseDashboardSelectProps {
  handleDashboardChange: (
    dashboard: Dashboard | undefined,
    isDefault?: boolean
  ) => void;
}

export const CloudPulseDashboardSelect = React.memo(
  (props: CloudPulseDashboardSelectProps) => {
    const {
      data: dashboardsList,
      error,
      isLoading,
    } = useCloudPulseDashboardsQuery(true); // Fetch the list of dashboards

    const [
      selectedDashboard,
      setSelectedDashboard,
    ] = React.useState<Dashboard>();

    const errorText: string = error ? 'Error loading dashboards' : '';

    const placeHolder = 'Select a Dashboard';

    // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
    const getSortedDashboardsList = (options: Dashboard[]) => {
      return options.sort(
        (a, b) => -b.service_type.localeCompare(a.service_type)
      );
    };

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      if (dashboardsList) {
        const dashboardId = getUserPreferenceObject()?.dashboardId;

        if (dashboardId) {
          const dashboard = dashboardsList.data.find(
            (obj) => obj.id === dashboardId
          );
          setSelectedDashboard(dashboard);
          props.handleDashboardChange(dashboard, true);
        } else {
          props.handleDashboardChange(undefined, true);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardsList]);

    return (
      <Autocomplete
        onChange={(_: any, dashboard: Dashboard) => {
          updateGlobalFilterPreference({
            [DASHBOARD_ID]: dashboard?.id,
            [REGION]: undefined,
            [RESOURCES]: undefined,
          });
          setSelectedDashboard(dashboard);
          props.handleDashboardChange(dashboard);
        }}
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
        data-testid="cloudpulse-dashboard-select"
        disabled={!dashboardsList}
        errorText={dashboardsList ? '' : errorText}
        fullWidth
        groupBy={(option: Dashboard) => option.service_type}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label=""
        loading={isLoading}
        noMarginTop
        options={getSortedDashboardsList(dashboardsList?.data ?? [])}
        placeholder={placeHolder}
        value={selectedDashboard ?? null} // Undefined is not allowed for uncontrolled component
      />
    );
  }
);
