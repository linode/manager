import { Grid, Paper } from '@mui/material';
import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { StyledPlaceholder } from 'src/features/StackScripts/StackScriptBase/StackScriptBase.styles';

import { GlobalFilters } from '../Overview/GlobalFilters';
import { REGION, RESOURCE_ID } from '../Utils/constants';
import { checkIfAllMandatoryFiltersAreSelected } from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { useLoadUserPreferences } from '../Utils/UserPreference';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { Dashboard, TimeDuration } from '@linode/api-v4';

export const CloudPulseDashboardLanding = () => {
  const [filterValue, setFilterValue] = React.useState<{
    [key: string]: number | number[] | string | string[] | undefined;
  }>({});

  const [timeDuration, setTimeDuration] = React.useState<TimeDuration>();

  const [dashboard, setDashboard] = React.useState<Dashboard>();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onFilterChange = React.useCallback(
    (
      filterKey: string,
      filterValue: number | number[] | string | string[] | undefined
    ) => {
      filterReference.current[filterKey] = filterValue;
      setFilterValue((prev) => ({ ...prev, ...filterReference.current }));
    },
    []
  );

  const onDashboardChange = React.useCallback((dashboardObj: Dashboard) => {
    setDashboard(dashboardObj);
  }, []);

  const onTimeDurationChange = React.useCallback(
    (timeDurationObj: TimeDuration) => {
      setTimeDuration(timeDurationObj);
    },
    []
  );

  const { isLoading } = useLoadUserPreferences();

  const filterReference: React.MutableRefObject<{
    [key: string]: number | number[] | string | string[] | undefined;
  }> = React.useRef({});

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ border: '1px solid #e3e5e8' }}>
          <GlobalFilters
            handleAnyFilterChange={onFilterChange}
            handleDashboardChange={onDashboardChange}
            handleTimeDurationChange={onTimeDurationChange}
          />
        </Paper>
      </Grid>
      {dashboard && !FILTER_CONFIG.get(dashboard.service_type) && (
        <Paper>
          <StyledPlaceholder
            icon={CloudViewIcon}
            isEntity
            subtitle="No Filters Configured for selected dashboard's service type"
            title=""
          />
        </Paper>
      )}
      {(!dashboard ||
        !checkIfAllMandatoryFiltersAreSelected(
          dashboard,
          filterValue,
          timeDuration
        )) && (
        <Paper>
          <StyledPlaceholder
            icon={CloudViewIcon}
            isEntity
            subtitle="Select Dashboard and filters  to visualize metrics."
            title=""
          />
        </Paper>
      )}
      {dashboard &&
        checkIfAllMandatoryFiltersAreSelected(
          dashboard,
          filterValue,
          timeDuration
        ) && (
          <CloudPulseDashboard
            region={
              typeof filterValue[REGION] === 'string'
                ? (filterValue[REGION] as string)
                : undefined
            }
            resources={
              filterValue[RESOURCE_ID]
                ? (filterValue[RESOURCE_ID] as string[])
                : []
            }
            dashboardId={dashboard!.id!}
            duration={timeDuration!}
            savePref={true}
          />
        )}
    </Grid>
  );
};
