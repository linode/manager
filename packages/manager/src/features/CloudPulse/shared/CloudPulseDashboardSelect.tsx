import { Autocomplete, Box, Typography } from '@linode/ui';
import React from 'react';

import { useCloudPulseDashboardsQuery } from 'src/queries/cloudpulse/dashboards';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { formattedServiceTypes, getAllDashboards } from '../Utils/utils';

import type { Dashboard, FilterValue } from '@linode/api-v4';

export interface CloudPulseDashboardSelectProps {
  /**
   * default value selected on initial render
   */
  defaultValue?: Partial<FilterValue>;
  /**
   *
   * @param dashboard latest dashboard object selected from dropdown
   * @param savePref boolean value to check whether changes to be saved on preferences or not
   */
  handleDashboardChange?: (
    dashboard: Dashboard | undefined,
    savePref?: boolean
  ) => void;
  /**
   * flag value to identify whether this component is being used in service level integration or not
   */
  isServiceIntegration?: boolean;
  /**
   * boolean value to identify whether changes to be saved on preferences or not
   */
  savePreferences?: boolean;
}

export const CloudPulseDashboardSelect = React.memo(
  (props: CloudPulseDashboardSelectProps) => {
    const {
      defaultValue,
      handleDashboardChange = () => {},
      isServiceIntegration,
      savePreferences,
    } = props;

    const {
      data: serviceTypesList,
      error: serviceTypesError,
      isLoading: serviceTypesLoading,
    } = useCloudPulseServiceTypes(true);

    const serviceTypes: string[] = formattedServiceTypes(serviceTypesList);
    const serviceTypeMap: Map<string, string> = new Map(
      serviceTypesList?.data.map((item) => [item.service_type, item.label])
    );

    const {
      data: dashboardsList,
      error: dashboardsError,
      isLoading: dashboardsLoading,
    } = getAllDashboards(
      useCloudPulseDashboardsQuery(serviceTypes),
      serviceTypes
    );
    const [selectedDashboard, setSelectedDashboard] =
      React.useState<Dashboard>();

    const getErrorText = () => {
      if (serviceTypesError) {
        return 'Failed to fetch the services.';
      }

      if (dashboardsError.length > 0) {
        return 'Failed to fetch the dashboards.';
      }

      return '';
    };

    const errorText: string = getErrorText();

    const placeHolder = 'Select a Dashboard';

    // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
    const getSortedDashboardsList = (options: Dashboard[]): Dashboard[] => {
      return [...options].sort(
        (a, b) => -b.service_type.localeCompare(a.service_type)
      );
    };

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      // only call this code when the component is rendered initially
      if (
        (savePreferences || isServiceIntegration) &&
        dashboardsList.length > 0 &&
        selectedDashboard === undefined
      ) {
        const dashboard = defaultValue
          ? dashboardsList.find((obj: Dashboard) => obj.id === defaultValue)
          : undefined;
        setSelectedDashboard(dashboard);
        handleDashboardChange(dashboard);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardsList]);
    return (
      <Autocomplete
        autoHighlight
        clearOnBlur
        data-testid="cloudpulse-dashboard-select"
        disabled={isServiceIntegration || !dashboardsList}
        errorText={dashboardsList?.length ? '' : errorText}
        fullWidth
        groupBy={(option: Dashboard) => option.service_type}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label="Dashboard"
        loading={dashboardsLoading || serviceTypesLoading}
        noMarginTop
        onChange={(e, dashboard: Dashboard) => {
          setSelectedDashboard(dashboard);
          handleDashboardChange(dashboard, savePreferences);
        }}
        options={getSortedDashboardsList(dashboardsList ?? [])}
        placeholder={placeHolder}
        renderGroup={(params) => (
          <Box key={params.key}>
            <Typography sx={{ marginLeft: '3.5%' }} variant="h3">
              {serviceTypeMap.get(params.group) || params.group}
            </Typography>
            {params.children}
          </Box>
        )}
        sx={(theme) => ({
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: theme.tokens.color.Neutrals.Black,
          },
        })}
        textFieldProps={{
          color: 'primary',
        }}
        value={selectedDashboard ?? null} // Undefined is not allowed for uncontrolled component
      />
    );
  }
);
