import { IconButton, useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import Reload from 'src/assets/icons/refresh.svg';
import { Divider } from 'src/components/Divider';

import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseTimeRangeSelect } from '../shared/CloudPulseTimeRangeSelect';
import { CloudPulseTooltip } from '../shared/CloudPulseTooltip';
import { DASHBOARD_ID, REFRESH, TIME_DURATION } from '../Utils/constants';
import { useAclpPreference } from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { AclpConfig, Dashboard, TimeDuration } from '@linode/api-v4';

export interface GlobalFilterProperties {
  handleAnyFilterChange(filterKey: string, filterValue: FilterValueType): void;
  handleDashboardChange(dashboard: Dashboard | undefined): void;
  handleTimeDurationChange(timeDuration: TimeDuration): void;
}

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const {
    handleAnyFilterChange,
    handleDashboardChange,
    handleTimeDurationChange,
  } = props;

  const {
    preferences,
    updateGlobalFilterPreference: updatePreferences,
  } = useAclpPreference();
  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Dashboard | undefined
  >();

  const handleTimeRangeChange = React.useCallback(
    (
      timerDuration: TimeDuration,
      timeDurationValue: string = 'Auto',
      savePref: boolean = false
    ) => {
      if (savePref) {
        updatePreferences({ [TIME_DURATION]: timeDurationValue });
      }
      handleTimeDurationChange(timerDuration);
    },
    []
  );

  const onDashboardChange = React.useCallback(
    (dashboard: Dashboard | undefined, savePref: boolean = false) => {
      if (savePref) {
        updatePreferences({
          [DASHBOARD_ID]: dashboard?.id,
        });
      }
      setSelectedDashboard(dashboard);
      handleDashboardChange(dashboard);
    },
    []
  );

  const emitFilterChange = React.useCallback(
    (
      filterKey: string,
      value: FilterValueType,
      savePref: boolean = false,
      updatedPreferenceData: AclpConfig = {}
    ) => {
      if (savePref) {
        updatePreferences(updatedPreferenceData);
      }
      handleAnyFilterChange(filterKey, value);
    },
    []
  );

  const handleGlobalRefresh = React.useCallback(() => {
    handleAnyFilterChange(REFRESH, Date.now());
  }, []);

  const theme = useTheme();

  return (
    <Grid container>
      <Grid container item m={3} rowGap={1} xs={12}>
        <Grid
          columnSpacing={2}
          container
          item
          justifyContent="space-between"
          rowSpacing={2}
        >
          <Grid display={'flex'} item md={4} sm={5} xs={12}>
            <CloudPulseDashboardSelect
              defaultValue={preferences?.dashboardId}
              handleDashboardChange={onDashboardChange}
              savePreferences
            />
          </Grid>
          <Grid display="flex" gap={1} item md={4} sm={5} xs={12}>
            <CloudPulseTimeRangeSelect
              defaultValue={preferences?.timeDuration}
              handleStatsChange={handleTimeRangeChange}
              hideLabel
              label="Time Range"
              savePreferences
            />
            <CloudPulseTooltip placement="bottom-end" title="Refresh">
              <IconButton
                sx={{
                  marginBlockEnd: 'auto',
                  marginTop: theme.spacing(3.5),
                }}
                aria-label="Refresh Dashboard Metrics"
                data-testid="global-refresh"
                disabled={!selectedDashboard}
                onClick={handleGlobalRefresh}
                size="small"
              >
                <StyledReload />
              </IconButton>
            </CloudPulseTooltip>
          </Grid>
        </Grid>
      </Grid>
      {selectedDashboard && (
        <Grid item xs={12}>
          <Divider
            sx={{
              borderColor: theme.color.grey5,
              margin: 0,
            }}
          />
        </Grid>
      )}

      {selectedDashboard && (
        <CloudPulseDashboardFilterBuilder
          dashboard={selectedDashboard}
          emitFilterChange={emitFilterChange}
          isServiceAnalyticsIntegration={false}
          preferences={preferences}
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
