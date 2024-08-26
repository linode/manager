import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { useCloudPulseDashboardsQuery } from 'src/queries/cloudpulse/dashboards';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { DASHBOARD_ID } from '../Utils/constants';
import { formattedServiceTypes, getAllDashboards } from '../Utils/utils';

import type { Dashboard } from '@linode/api-v4';

export interface CloudPulseDashboardSelectProps {
  defaultValue: number | undefined;
  handleDashboardChange: (
    dashboard: Dashboard | undefined,
    isDefault?: boolean
  ) => void;
  updatePreferences: (data: {}) => void;
}

export const CloudPulseDashboardSelect = React.memo(
  (props: CloudPulseDashboardSelectProps) => {
    const { defaultValue, handleDashboardChange, updatePreferences } = props;

    const {
      data: serviceTypesList,
      error: serviceTypesError,
      isLoading: serviceTypesLoading,
    } = useCloudPulseServiceTypes(true);

    const serviceTypes: string[] = formattedServiceTypes(serviceTypesList);

    const {
      data: dashboardsList,
      error: dashboardsError,
      isLoading: dashboardsLoading,
    } = getAllDashboards(
      useCloudPulseDashboardsQuery(serviceTypes),
      serviceTypes
    );
    const [
      selectedDashboard,
      setSelectedDashboard,
    ] = React.useState<Dashboard>();

    const getErrorText = () => {
      if (serviceTypesError) {
        return 'Unable to load service types';
      }

      if (dashboardsError.length > 0) {
        return `Unable to load ${dashboardsError.slice(0, -1)}`;
      }

      return '';
    };

    const errorText: string = getErrorText();

    const placeHolder = 'Select a Dashboard';

    // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
    const getSortedDashboardsList = (options: Dashboard[]): Dashboard[] => {
      return options.sort(
        (a, b) => -b.service_type.localeCompare(a.service_type)
      );
    };
    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      // only call this code when the component is rendered initially
      if (dashboardsList.length > 0 && selectedDashboard === undefined) {
        // const dashboardId = preferences.dashboardId;

        if (defaultValue) {
          const dashboard = dashboardsList.find(
            (obj: Dashboard) => obj.id === defaultValue
          );
          setSelectedDashboard(dashboard);
          handleDashboardChange(dashboard, true);
        } else {
          handleDashboardChange(undefined, true);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardsList]);
    return (
      <Autocomplete
        onChange={(_: any, dashboard: Dashboard) => {
          updatePreferences({
            [DASHBOARD_ID]: dashboard?.id,
          });
          setSelectedDashboard(dashboard);
          handleDashboardChange(dashboard);
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
        textFieldProps={{
          hideLabel: true,
        }}
        autoHighlight
        clearOnBlur
        data-testid="cloudpulse-dashboard-select"
        disabled={!dashboardsList}
        errorText={dashboardsList ? '' : errorText}
        fullWidth
        groupBy={(option: Dashboard) => option.service_type}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label="Select a Dashboard"
        loading={dashboardsLoading || serviceTypesLoading}
        options={getSortedDashboardsList(dashboardsList ?? [])}
        placeholder={placeHolder}
        value={selectedDashboard ?? null} // Undefined is not allowed for uncontrolled component
      />
    );
  }
);
