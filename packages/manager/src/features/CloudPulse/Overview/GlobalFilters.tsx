import { useProfile } from '@linode/queries';
import { Box, Divider, Notice } from '@linode/ui';
import { IconButton } from '@mui/material';
import { GridLegacy } from '@mui/material';
import { DateTime } from 'luxon';
import * as React from 'react';

import DownloadIcon from 'src/assets/icons/lke-download.svg';
import Reload from 'src/assets/icons/refresh.svg';
import { useFlags } from 'src/hooks/useFlags';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import { storage } from 'src/utilities/storage';

import { useCloudPulseContext } from '../Context/useCloudPulseContext';
import { GlobalFilterGroupByRenderer } from '../GroupBy/GlobalFilterGroupByRenderer';
import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import {
  CloudPulseDashboardSelect,
  type DashboardDiscoveryState,
} from '../shared/CloudPulseDashboardSelect';
import { CloudPulseDateTimeRangePickerRenderer } from '../shared/CloudPulseDateTimeRangePickerRenderer';
import { CloudPulseTooltip } from '../shared/CloudPulseTooltip';
import {
  convertToGmt,
  defaultTimeDuration,
  getTimeFromPreset,
} from '../Utils/CloudPulseDateTimePickerUtils';
import {
  DASHBOARD_ID,
  GROUP_BY,
  REFRESH,
  RESOURCE_FILTER_MAP,
  TIME_DURATION,
} from '../Utils/constants';
import { useAclpPreference } from '../Utils/UserPreference';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { AclpConfig, Dashboard, DateTimeWithPreset } from '@linode/api-v4';

export interface GlobalFilterProperties {
  appliedFilters?: React.ReactNode;
  handleAnyFilterChange(
    filterKey: string,
    filterValue: FilterValueType,
    labels: string[]
  ): void;
  handleDashboardChange(
    dashboard: Dashboard | undefined,
    skipReset?: boolean
  ): void;
  handleDownloadPDF: () => void;
  handleGroupByChange: (selectedValues: string[]) => void;
  handleTimeDurationChange(timeDuration: DateTimeWithPreset): void;
  handleToggleAppliedFilter(isVisible: boolean): void;
  isDownloadingPdf?: boolean;
  isMandatoryFiltersSelected?: boolean;
}

export const GlobalFilters = React.memo((props: GlobalFilterProperties) => {
  const {
    appliedFilters,
    handleAnyFilterChange,
    handleDashboardChange,
    handleTimeDurationChange,
    handleToggleAppliedFilter,
    handleGroupByChange,
    handleDownloadPDF,
    isDownloadingPdf = false,
    isMandatoryFiltersSelected = false,
  } = props;

  const flags = useFlags();

  const { data: profile } = useProfile();

  // Type-safe guard: useProfile() data can be undefined (or not narrowed), so ensure timezone exists before reading it.
  const profileTimezone =
    profile &&
    typeof profile === 'object' &&
    'timezone' in profile &&
    typeof profile.timezone === 'string'
      ? profile.timezone
      : undefined;

  const timezone =
    profileTimezone === 'GMT'
      ? 'Etc/GMT'
      : (profileTimezone ?? DateTime.local().zoneName);

  const {
    preferences,
    updateGlobalFilterPreference: updatePreferences,
    isLoading: isPreferenceLoading,
  } = useAclpPreference();
  const [selectedDashboard, setSelectedDashboard] = React.useState<
    Dashboard | undefined
  >();
  const [timeDuration, setTimeDuration] = React.useState<DateTimeWithPreset>();
  const [dashboardDiscoveryState, setDashboardDiscoveryState] =
    React.useState<DashboardDiscoveryState>({ status: 'loading' });

  // Track whether we have already applied the saved time preference.
  // The picker's own useEffect fires on mount with defaultTimeDuration() because
  // preferences are loaded asynchronously. Once the API responds we need to
  // override that default with the real saved value — but only once, so we
  // don't fight with manual user selections made afterwards.
  const hasAppliedTimePref = React.useRef(false);
  const savedTimePref = preferences?.[TIME_DURATION] as
    | DateTimeWithPreset
    | undefined;

  React.useEffect(() => {
    if (savedTimePref && !hasAppliedTimePref.current) {
      hasAppliedTimePref.current = true;
      const refreshed = getTimeFromPreset(
        savedTimePref,
        savedTimePref.timeZone ?? ''
      );
      handleTimeDurationChange({
        ...refreshed,
        end: convertToGmt(refreshed.end, refreshed.timeZone),
        start: convertToGmt(refreshed.start, refreshed.timeZone),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTimePref]);

  const handleTimeRangeChange = React.useCallback(
    (timeDuration: DateTimeWithPreset, savePref: boolean = false) => {
      if (savePref) {
        updatePreferences({ [TIME_DURATION]: timeDuration });
      }
      setTimeDuration(timeDuration);
      handleTimeDurationChange({
        ...timeDuration,
        end: convertToGmt(timeDuration.end, timeDuration.timeZone),
        start: convertToGmt(timeDuration.start, timeDuration.timeZone),
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
      const defaultTimeDurationPreset = dashboard?.service_type
        ? flags.aclpServices?.[dashboard?.service_type]?.metrics?.defaultPreset
        : undefined;

      const timeDuration = defaultTimeDuration(
        timezone,
        defaultTimeDurationPreset
      );

      setTimeDuration(timeDuration);
      handleDashboardChange(
        dashboard,
        preferences?.[DASHBOARD_ID] === dashboard?.id
      );
    },
    [preferences, handleDashboardChange]
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

  const { isLoading, isError, error } = useResourcesQuery(
    selectedDashboard !== undefined,
    selectedDashboard?.service_type ?? '',
    {},

    RESOURCE_FILTER_MAP[selectedDashboard?.service_type ?? ''] ?? {}
  );

  const onGroupByChange = React.useCallback(
    (selectedValues: string[], savePref: boolean = false) => {
      if (savePref) {
        updatePreferences({ [GROUP_BY]: selectedValues });
      }

      handleGroupByChange(selectedValues);
    },
    []
  );

  const { isWidgetLoading } = useCloudPulseContext();

  const isUnAuthorizedError =
    isError &&
    ((error instanceof Error && error.message === 'Unauthorized') ||
      (error instanceof Array &&
        error.length > 0 &&
        error[0]?.reason === 'Unauthorized'));
  const isImpersonatedUser =
    storage.authentication.token.get()?.toLowerCase().startsWith('admin') ??
    false;
  const isDashboardDiscoveryReady = dashboardDiscoveryState.status === 'ready';

  return (
    <GridLegacy container>
      <GridLegacy item xs={12}>
        <Box
          alignItems={{ lg: 'center', xs: 'flex-start' }}
          display="flex"
          flexDirection={{ lg: 'row', xs: 'column' }}
          flexWrap="wrap"
          gap={2}
          justifyContent="space-between"
          marginBottom={1}
          marginLeft={2}
          marginRight={2}
          marginTop={1}
        >
          <CloudPulseDashboardSelect
            defaultValue={preferences?.dashboardId}
            handleDashboardChange={onDashboardChange}
            onDashboardDiscoveryStateChange={setDashboardDiscoveryState}
            savePreferences={!isImpersonatedUser} // no need to save preferences impersonated user, as it is disabled
          />
          <Box
            display="flex"
            flexDirection={{ md: 'row', xs: 'column' }}
            flexWrap="wrap"
            gap={2}
          >
            <CloudPulseDateTimeRangePickerRenderer
              defaultValue={
                isImpersonatedUser ? timeDuration : preferences?.[TIME_DURATION]
              }
              handleStatsChange={handleTimeRangeChange}
              isDisabled={
                isPreferenceLoading || !selectedDashboard?.service_type
              }
              savePreferences={!isImpersonatedUser}
              serviceType={selectedDashboard?.service_type}
            />

            <CloudPulseTooltip placement="bottom-end" title="Refresh">
              <IconButton
                aria-label="Refresh Dashboard Metrics"
                color="inherit"
                data-testid="global-refresh"
                disabled={!selectedDashboard}
                onClick={handleGlobalRefresh}
                size="small"
                sx={(theme) => ({
                  marginBlockEnd: 'auto',
                  marginTop: { md: theme.spacingFunction(24) },
                })}
              >
                <Reload height="24px" width="24px" />
              </IconButton>
            </CloudPulseTooltip>
            {flags.aclp?.enablePDFDownload && (
              <CloudPulseTooltip placement="bottom-end" title="Download PDF">
                <IconButton
                  aria-label="Download Dashboard PDF"
                  color="inherit"
                  data-testid="global-download-pdf"
                  disabled={
                    !selectedDashboard ||
                    isWidgetLoading ||
                    !isMandatoryFiltersSelected
                  }
                  loading={isDownloadingPdf}
                  onClick={handleDownloadPDF}
                  size="small"
                  sx={(theme) => ({
                    marginBlockEnd: 'auto',
                    marginTop: { md: theme.spacingFunction(24) },
                  })}
                >
                  <DownloadIcon height="24px" width="24px" />
                </IconButton>
              </CloudPulseTooltip>
            )}
            <GlobalFilterGroupByRenderer
              handleChange={onGroupByChange}
              preferenceGroupBy={preferences?.[GROUP_BY]}
              savePreferences={!isImpersonatedUser} // no need to save preferences impersonated user, as it is disabled
              selectedDashboard={
                preferences?.[DASHBOARD_ID] === selectedDashboard?.id // wait for dashboard id in preference to match selected dashboard id
                  ? selectedDashboard
                  : undefined
              }
            />
          </Box>
        </Box>
      </GridLegacy>
      {(selectedDashboard || !isDashboardDiscoveryReady) && (
        <GridLegacy item xs={12}>
          <Divider
            sx={(theme) => ({
              borderColor: theme.color.grey5,
              margin: 0,
            })}
          />
        </GridLegacy>
      )}

      {isDashboardDiscoveryReady && isUnAuthorizedError && (
        <GridLegacy item margin={2} xs={12}>
          <Notice
            text="You don't have permission to view the entities behind these metrics. Contact your account administrator to request access."
            variant="warning"
          />
        </GridLegacy>
      )}

      {!isUnAuthorizedError &&
        (!isDashboardDiscoveryReady || selectedDashboard) && (
          <CloudPulseDashboardFilterBuilder
            appliedFilters={appliedFilters}
            dashboard={selectedDashboard}
            dashboardErrorText={
              dashboardDiscoveryState.status === 'error'
                ? dashboardDiscoveryState.errorText
                : undefined
            }
            dashboardLoading={dashboardDiscoveryState.status === 'loading'}
            emitFilterChange={emitFilterChange}
            handleToggleAppliedFilter={handleToggleAppliedFilter}
            isError={isError}
            isLoading={isLoading}
            isServiceAnalyticsIntegration={false}
            preferences={preferences}
          />
        )}
    </GridLegacy>
  );
});
