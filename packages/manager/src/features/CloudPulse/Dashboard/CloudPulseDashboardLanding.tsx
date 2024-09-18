import { Grid, Paper, useTheme } from '@mui/material';
import * as React from 'react';

import CloudPulseIcon from 'src/assets/icons/entityIcons/monitor.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { StyledPlaceholder } from 'src/features/StackScripts/StackScriptBase/StackScriptBase.styles';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { REFRESH, REGION, RESOURCE_ID } from '../Utils/constants';
import {
  checkIfAllMandatoryFiltersAreSelected,
  getMetricsCallCustomFilters,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { useLoadUserPreferences } from '../Utils/UserPreference';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { Dashboard, TimeDuration } from '@linode/api-v4';

export type FilterValueType = number | number[] | string | string[] | undefined;

export const CloudPulseDashboardLanding = () => {
  const [filterValue, setFilterValue] = React.useState<{
    [key: string]: FilterValueType;
  }>({});

  const [timeDuration, setTimeDuration] = React.useState<TimeDuration>();

  const [dashboard, setDashboard] = React.useState<Dashboard>();

  const selectDashboardAndFilterMessage =
    'Select Dashboard and filters to visualize metrics.';

  const onFilterChange = React.useCallback(
    (filterKey: string, filterValue: FilterValueType) => {
      setFilterValue((prev) => ({ ...prev, [filterKey]: filterValue }));
    },
    []
  );

  const onDashboardChange = React.useCallback((dashboardObj: Dashboard) => {
    setDashboard(dashboardObj);
    setFilterValue({}); // clear the filter values on dashboard change
  }, []);

  const onTimeDurationChange = React.useCallback(
    (timeDurationObj: TimeDuration) => {
      setTimeDuration(timeDurationObj);
    },
    []
  );

  const { isLoading } = useLoadUserPreferences();

  const theme = useTheme();

  /**
   * Takes an error message as input and renders a placeholder with the error message
   * @param errorMessage {string} - Error message which will be displayed
   *
   */
  const renderErrorPlaceholder = (errorMessage: string) => {
    return (
      <Grid item xs={12}>
        <Paper>
          <StyledPlaceholder
            icon={CloudPulseIcon}
            isEntity
            subtitle={errorMessage}
            title=""
          />
        </Paper>
      </Grid>
    );
  };

  /**
   * Incase of errors and filter criteria not met, this renders the required error message placeholder and in case of success checks, renders a dashboard
   * @returns Placeholder | Dashboard
   */
  const RenderDashboard = () => {
    if (!dashboard) {
      return renderErrorPlaceholder(selectDashboardAndFilterMessage);
    }

    if (!FILTER_CONFIG.get(dashboard.service_type)) {
      return renderErrorPlaceholder(
        "No Filters Configured for selected dashboard's service type"
      );
    }

    if (
      !checkIfAllMandatoryFiltersAreSelected({
        dashboard,
        filterValue,
        timeDuration,
      }) ||
      !timeDuration
    ) {
      return renderErrorPlaceholder(selectDashboardAndFilterMessage);
    }

    return (
      <CloudPulseDashboard
        additionalFilters={getMetricsCallCustomFilters(
          filterValue,
          dashboard.service_type
        )}
        manualRefreshTimeStamp={
          filterValue[REFRESH] && typeof filterValue[REFRESH] === 'number'
            ? filterValue[REFRESH]
            : undefined
        }
        region={
          typeof filterValue[REGION] === 'string'
            ? (filterValue[REGION] as string)
            : undefined
        }
        resources={
          filterValue[RESOURCE_ID] && Array.isArray(filterValue[RESOURCE_ID])
            ? (filterValue[RESOURCE_ID] as string[])
            : []
        }
        dashboardId={dashboard.id}
        duration={timeDuration}
        savePref={true}
      />
    );
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Grid container paddingTop={theme.spacing(1)} spacing={theme.spacing(2)}>
      <Grid item xs={12}>
        <Paper>
          <GlobalFilters
            handleAnyFilterChange={onFilterChange}
            handleDashboardChange={onDashboardChange}
            handleTimeDurationChange={onTimeDurationChange}
          />
        </Paper>
      </Grid>
      <RenderDashboard />
    </Grid>
  );
};
