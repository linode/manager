import { Autocomplete, BetaChip, Box, Typography } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useCloudPulseDashboardsQuery } from 'src/queries/cloudpulse/dashboards';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { getAllDashboards, getEnabledServiceTypes } from '../Utils/utils';

import type {
  CloudPulseServiceType,
  Dashboard,
  FilterValue,
} from '@linode/api-v4';

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
   * The service type to be used for the dashboard select in service level integration
   */
  integrationServiceType?: CloudPulseServiceType;
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
      savePreferences,
      integrationServiceType,
    } = props;

    const {
      data: serviceTypesList,
      error: serviceTypesError,
      isLoading: serviceTypesLoading,
    } = useCloudPulseServiceTypes(!integrationServiceType);

    const { aclpServices } = useFlags();
    // Check if the integration service type is enabled
    const serviceType =
      integrationServiceType &&
      aclpServices?.[integrationServiceType]?.metrics?.enabled
        ? integrationServiceType
        : undefined;

    // Get formatted enabled service types based on the LD flag
    const serviceTypes: CloudPulseServiceType[] = serviceType
      ? [serviceType]
      : getEnabledServiceTypes(serviceTypesList, aclpServices);

    const serviceTypeMap: Map<CloudPulseServiceType, string> = new Map(
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
        (savePreferences || !!serviceType) &&
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
        disableClearable={!!serviceType}
        disabled={
          !dashboardsList.length || (serviceType && dashboardsList.length === 1)
        }
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
            <Box display="flex">
              <Typography
                data-qa-id={params.group}
                sx={{ marginLeft: '3.5%' }}
                variant="h3"
              >
                {!serviceType &&
                  (serviceTypeMap.get(params.group as CloudPulseServiceType) ||
                    params.group)}
              </Typography>
              {!serviceType &&
                aclpServices?.[params.group as CloudPulseServiceType]?.metrics
                  ?.beta && <BetaChip />}
            </Box>
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
