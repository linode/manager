import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import Reload from 'src/assets/icons/reload.svg';

import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseTimeRangeSelect } from '../shared/CloudPulseTimeRangeSelect';

import type { Dashboard, TimeDuration } from '@linode/api-v4';
import type { WithStartAndEnd } from 'src/features/Longview/request.types';

export interface GlobalFilterProperties {
  handleAnyFilterChange(
    filterKey: string,
    filterValue:
      | TimeDuration
      | number
      | number[]
      | string
      | string[]
      | undefined
  ): undefined | void;
  handleDashboardChange(dashboard: Dashboard | undefined): undefined | void;
  handleTimeDurationChange(timeDuration: TimeDuration): undefined | void;
}

export interface FiltersObject {
  interval: string;
  region: string;
  resource: string[];
  serviceType?: string;
  timeRange: WithStartAndEnd;
}

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Dashboard | undefined
  >();

  const handleTimeRangeChange = React.useCallback(
    (timerDuration: TimeDuration) => {
      props.handleTimeDurationChange(timerDuration);
    },
    [props]
  );

  const handleDashboardChange = React.useCallback(
    (dashboard: Dashboard | undefined, isDefault: boolean = false) => {
      setSelectedDashboard(dashboard);
      props.handleDashboardChange(dashboard);
    },
    []
  );

  const emitFilterChange = React.useCallback(
    (
      filterKey: string,
      value: TimeDuration | number | number[] | string | string[] | undefined
    ) => {
      props.handleAnyFilterChange(filterKey, value);
    },
    [props]
  );

  const handleGlobalRefresh = React.useCallback(() => {}, []);

  return (
    <Grid container sx={{ ...itemSpacing, padding: '8px' }}>
      <StyledGrid xs={12}>
        <Grid sx={{ width: 300 }}>
          <CloudPulseDashboardSelect
            handleDashboardChange={handleDashboardChange}
          />
        </Grid>
        <Grid sx={{ marginLeft: 2, width: 250 }}>
          <StyledCloudPulseTimeRangeSelect
            handleStatsChange={handleTimeRangeChange}
            hideLabel
            label="Select Time Range"
          />
        </Grid>
        <Grid sx={{ marginLeft: -4, marginRight: 3 }}>
          <Tooltip arrow enterDelay={500} placement="top" title="Refresh">
            <IconButton onClick={handleGlobalRefresh} size="small">
              <StyledReload />
            </IconButton>
          </Tooltip>
        </Grid>
      </StyledGrid>
      <CloudPulseDashboardFilterBuilder // moving forward, every filter will be driven through filter builder component
        dashboard={selectedDashboard!}
        emitFilterChange={emitFilterChange}
        isServiceAnalyticsIntegration={false}
      />
    </Grid>
  );
});

const StyledCloudPulseTimeRangeSelect = styled(CloudPulseTimeRangeSelect, {
  label: 'StyledCloudPulseTimeRangeSelect',
})({
  width: 150,
});

const StyledGrid = styled(Grid, { label: 'StyledGrid' })(({ theme }) => ({
  alignItems: 'end',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'start',
  marginBottom: theme.spacing(1.25),
}));

const itemSpacing = {
  boxSizing: 'border-box',
  margin: '0',
};

const StyledReload = styled(Reload, { label: 'StyledReload' })(({ theme }) => ({
  '&:active': {
    color: `${theme.palette.success}`,
  },
  '&:hover': {
    cursor: 'pointer',
  },
  height: '27px',
  width: '27px',
}));
