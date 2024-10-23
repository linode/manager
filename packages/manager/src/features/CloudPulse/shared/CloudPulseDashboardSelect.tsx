import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';
import { useCloudPulseDashboardsQuery } from 'src/queries/cloudpulse/dashboards';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { formattedServiceTypes, getAllDashboards } from '../Utils/utils';

import type { Dashboard, FilterValue } from '@linode/api-v4';

export interface CloudPulseDashboardSelectProps {
  defaultValue?: Partial<FilterValue>;
  handleDashboardChange: (
    dashboard: Dashboard | undefined,
    savePref?: boolean
  ) => void;
  savePreferences?: boolean;
}

export const CloudPulseDashboardSelect = React.memo(
  (props: CloudPulseDashboardSelectProps) => {
    const { defaultValue, handleDashboardChange, savePreferences } = props;

    const {
      data: serviceTypesList,
      error: serviceTypesError,
      isLoading: serviceTypesLoading,
    } = useCloudPulseServiceTypes(true);

    const serviceTypes: string[] = formattedServiceTypes(serviceTypesList);
    const serviceTypeMap: Map<string, string> = new Map(
      (serviceTypesList?.data || [])
        .filter((item) => item?.service_type !== undefined)
        .map((item) => [item.service_type, item.label ?? ''])
    );

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
      return [...options].sort(
        (a, b) => -b.service_type.localeCompare(a.service_type)
      );
    };

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      // only call this code when the component is rendered initially
      if (
        savePreferences &&
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
        onChange={(e, dashboard: Dashboard) => {
          setSelectedDashboard(dashboard);
          handleDashboardChange(dashboard, savePreferences);
        }}
        renderGroup={(params) => (
          <Box key={params.key}>
            <Typography sx={{ marginLeft: '3.5%' }} variant="h3">
              {serviceTypeMap.get(params.group) || params.group}
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
        label="Dashboard"
        loading={dashboardsLoading || serviceTypesLoading}
        noMarginTop
        options={getSortedDashboardsList(dashboardsList ?? [])}
        placeholder={placeHolder}
        value={selectedDashboard ?? null} // Undefined is not allowed for uncontrolled component
      />
    );
  }
);
