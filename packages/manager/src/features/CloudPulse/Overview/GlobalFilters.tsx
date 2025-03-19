import { Box, Divider } from '@linode/ui';
import { IconButton } from '@mui/material';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import Reload from 'src/assets/icons/refresh.svg';

import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseDateTimeRangePicker } from '../shared/CloudPulseDateTimeRangePicker';
import { CloudPulseTooltip } from '../shared/CloudPulseTooltip';
import { convertToGmt } from '../Utils/CloudPulseDateTimePickerUtils';
import { DASHBOARD_ID, REFRESH, TIME_DURATION } from '../Utils/constants';
import { useAclpPreference } from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { AclpConfig, Dashboard, DateTimeWithPreset } from '@linode/api-v4';

export interface GlobalFilterProperties {
  handleAnyFilterChange(
    filterKey: string,
    filterValue: FilterValueType,
    labels: string[]
  ): void;
  handleDashboardChange(dashboard: Dashboard | undefined): void;
  handleTimeDurationChange(timeDuration: DateTimeWithPreset): void;
  handleToggleAppliedFilter(isVisible: boolean): void;
}

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const {
    handleAnyFilterChange,
    handleDashboardChange,
    handleTimeDurationChange,
    handleToggleAppliedFilter,
  } = props;

  const {
    preferences,
    updateGlobalFilterPreference: updatePreferences,
  } = useAclpPreference();
  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Dashboard | undefined
  >();

  const handleTimeRangeChange = React.useCallback(
    (timeDuration: DateTimeWithPreset, savePref: boolean = false) => {
      if (savePref) {
        updatePreferences({ [TIME_DURATION]: timeDuration });
      }
      handleTimeDurationChange({
        ...timeDuration,
        end: convertToGmt(timeDuration.end),
        start: convertToGmt(timeDuration.start),
      });
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
      labels: string[],
      savePref: boolean = false,
      updatedPreferenceData: AclpConfig = {}
    ) => {
      if (savePref) {
        updatePreferences(updatedPreferenceData);
      }
      handleAnyFilterChange(filterKey, value, labels);
    },
    []
  );

  const handleGlobalRefresh = React.useCallback(() => {
    handleAnyFilterChange(REFRESH, Date.now(), []);
  }, []);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box
          display="flex"
          flexDirection={{ lg: 'row', xs: 'column' }}
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
          m={3}
        >
          <CloudPulseDashboardSelect
            defaultValue={preferences?.dashboardId}
            handleDashboardChange={onDashboardChange}
            savePreferences
          />
          <Box
            display="flex"
            flexDirection={{ md: 'row', xs: 'column' }}
            flexWrap="wrap"
            gap={2}
          >
            <CloudPulseDateTimeRangePicker
              defaultValue={preferences?.timeRange}
              handleStatsChange={handleTimeRangeChange}
              savePreferences
            />
            <CloudPulseTooltip placement="bottom-end" title="Refresh">
              <IconButton
                sx={(theme) => ({
                  marginBlockEnd: 'auto',
                  marginTop: { md: theme.spacing(3.5) },
                })}
                aria-label="Refresh Dashboard Metrics"
                data-testid="global-refresh"
                disabled={!selectedDashboard}
                onClick={handleGlobalRefresh}
                size="small"
              >
                <StyledReload />
              </IconButton>
            </CloudPulseTooltip>
          </Box>
        </Box>
      </Grid>
      {selectedDashboard && (
        <Grid item xs={12}>
          <Divider
            sx={(theme) => ({
              borderColor: theme.color.grey5,
              margin: 0,
            })}
          />
        </Grid>
      )}

      {selectedDashboard && (
        <CloudPulseDashboardFilterBuilder
          dashboard={selectedDashboard}
          emitFilterChange={emitFilterChange}
          handleToggleAppliedFilter={handleToggleAppliedFilter}
          isServiceAnalyticsIntegration={false}
          preferences={preferences}
        />
      )}
    </Grid>
  );
});

const StyledReload = styled(Reload, { label: 'StyledReload' })(({ theme }) => ({
  '&:hover': {
    '& path': {
      fill: theme.color.blue,
    },
    cursor: 'pointer',
  },
  height: '24px',
  width: '24px',
}));
