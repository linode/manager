/* eslint-disable no-console */
import { Dashboard } from '@linode/api-v4';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import Select from 'src/components/EnhancedSelect/Select';
import { Typography } from 'src/components/Typography';
import { useCloudViewDashboardsQuery } from 'src/queries/cloudview/dashboards';
import { fetchUserPrefObject, updateGlobalFilterPreference } from '../Utils/UserPreference'
import { DASHBOARD_ID, REGION, RESOURCES, WIDGETS } from '../Utils/CloudPulseConstants';
export interface CloudViewDashbboardSelectProps {
  handleDashboardChange: (
    dashboard: Dashboard | undefined
  ) => void;
}

export const CloudViewDashboardSelect = React.memo(
  (props: CloudViewDashbboardSelectProps) => {
    const {
      data: dashboardsList,
      error,
      isLoading,
    } = useCloudViewDashboardsQuery();


    const errorText: string = error ? 'Error loading dashboards' : '';

    // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
    const getSortedDashboardsList = (options: Dashboard[]) => {
      return options.sort(
        (a, b) => -b.service_type.localeCompare(a.service_type)
      );
    };

    const getPrefferedBoard = () => {
      const defaultValue = fetchUserPrefObject()?.dashboardId
      if (
        defaultValue
      ) {
        const match = dashboardsList?.data.find(
          (obj) => obj.id == defaultValue
        );
        props.handleDashboardChange(match);
        return match;
      }

      props.handleDashboardChange(undefined);
      return undefined;
    };

    if (!dashboardsList) {
      return (
        <Select
          disabled={true}
          isClearable={true}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => { }}
          placeholder="Select Dashboard"
        />
      );
    }

    return (
      <Autocomplete
        onChange={(_: any, dashboard: Dashboard) => {
          updateGlobalFilterPreference({
            [DASHBOARD_ID]: dashboard?.id,
            [REGION]: null,
            [RESOURCES]: [],
            [WIDGETS]: {}
          });
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
        defaultValue={getPrefferedBoard()}
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
  }
);
