import { IconButton } from '@mui/material';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import Reload from 'src/assets/icons/reload.svg';
import { Divider } from 'src/components/Divider';

import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseTimeRangeSelect } from '../shared/CloudPulseTimeRangeSelect';
import { REFRESH } from '../Utils/constants';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { Dashboard, TimeDuration } from '@linode/api-v4';
import type { WithStartAndEnd } from 'src/features/Longview/request.types';

export interface GlobalFilterProperties {
  handleAnyFilterChange(filterKey: string, filterValue: FilterValueType): void;
  handleDashboardChange(dashboard: Dashboard | undefined): void;
  handleTimeDurationChange(timeDuration: TimeDuration): void;
}

export interface FiltersObject {
  interval: string;
  region: string;
  resource: string[];
  serviceType?: string;
  timeRange: WithStartAndEnd;
}

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const {
    handleAnyFilterChange,
    handleDashboardChange,
    handleTimeDurationChange,
  } = props;
  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Dashboard | undefined
  >();

  const handleTimeRangeChange = React.useCallback(
    (timerDuration: TimeDuration) => {
      handleTimeDurationChange(timerDuration);
    },
    [handleTimeDurationChange]
  );

  const onDashboardChange = React.useCallback(
    (dashboard: Dashboard | undefined) => {
      setSelectedDashboard(dashboard);
      handleDashboardChange(dashboard);
    },
    [handleDashboardChange]
  );

  const emitFilterChange = React.useCallback(
    (filterKey: string, value: FilterValueType) => {
      handleAnyFilterChange(filterKey, value);
    },
    [handleAnyFilterChange]
  );

  const handleGlobalRefresh = React.useCallback(
    (dashboardObj?: Dashboard) => {
      if (!dashboardObj) {
        return;
      }
      handleAnyFilterChange(REFRESH, Date.now());
    },
    [handleAnyFilterChange]
  );

  return (
    <Grid container gap={1}>
      <Grid
        columnSpacing={2}
        container
        item
        justifyContent="space-between"
        mt={2}
        px={2}
        rowGap={2}
        xs={12}
      >
        <Grid display={'flex'} item md={4} sm={5} xs={12}>
          <CloudPulseDashboardSelect
            handleDashboardChange={onDashboardChange}
          />
        </Grid>
        <Grid display="flex" gap={1} item md={4} sm={5} xs={12}>
          <CloudPulseTimeRangeSelect
            handleStatsChange={handleTimeRangeChange}
            hideLabel
            label="Select Time Range"
          />
          <IconButton
            sx={{
              marginBlockEnd: 'auto',
            }}
            data-qa-refresh-button
            disabled={!selectedDashboard}
            onClick={() => handleGlobalRefresh(selectedDashboard)}
            size="small"
          >
            <StyledReload />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      {selectedDashboard && (
        <CloudPulseDashboardFilterBuilder
          dashboard={selectedDashboard}
          emitFilterChange={emitFilterChange}
          isServiceAnalyticsIntegration={false}
        />
      )}
    </Grid>
  );
});

const StyledReload = styled(Reload, { label: 'StyledReload' })(({ theme }) => ({
  '&:active': {
    color: `${theme.palette.success}`,
  },
  '&:hover': {
    cursor: 'pointer',
  },
  height: '24px',
  width: '24px',
}));
