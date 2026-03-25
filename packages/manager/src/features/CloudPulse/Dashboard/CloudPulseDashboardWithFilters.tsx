import { useProfile } from '@linode/queries';
import { Box, CircleProgress, Divider, ErrorState, Paper } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';

import {
  useCloudPulseDashboardByIdQuery,
  useCloudPulseDashboardsQuery,
} from 'src/queries/cloudpulse/dashboards';

import { CloudPulseContextProvider } from '../Context/CloudPulseContextProvider';
import { useCloudPulseContext } from '../Context/useCloudPulseContext';
import { GlobalFilterGroupByRenderer } from '../GroupBy/GlobalFilterGroupByRenderer';
import { CloudPulseAppliedFilterRenderer } from '../shared/CloudPulseAppliedFilterRenderer';
import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseDateTimeRangePicker } from '../shared/CloudPulseDateTimeRangePicker';
import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import {
  convertToGmt,
  defaultTimeDuration,
} from '../Utils/CloudPulseDateTimePickerUtils';
import { PARENT_ENTITY_REGION } from '../Utils/constants';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import {
  checkIfFilterBuilderNeeded,
  checkMandatoryFiltersSelected,
  getDashboardProperties,
} from '../Utils/ReusableDashboardFilterUtils';
import { getAllDashboards } from '../Utils/utils';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { FilterData, FilterValueType } from './CloudPulseDashboardLanding';
import type {
  CloudPulseServiceType,
  Dashboard,
  DateTimeWithPreset,
} from '@linode/api-v4';

export interface CloudPulseDashboardWithFiltersProp {
  /**
   * The id of the dashboard that needs to be rendered
   */
  dashboardId?: number;
  /**
   * The region for which the metrics will be listed
   */
  region?: string;
  /**
   * The resource id for which the metrics will be listed
   */
  resource: number | string;
  /**
   * The service type for which the metrics will be listed
   */
  serviceType?: CloudPulseServiceType;
}

export const CloudPulseDashboardWithFilters = React.memo(
  (props: CloudPulseDashboardWithFiltersProp) => {
    return (
      <CloudPulseContextProvider>
        <CloudPulseDashboardWithFiltersRenderer {...props} />
      </CloudPulseContextProvider>
    );
  }
);

const CloudPulseDashboardWithFiltersRenderer = React.memo(
  (props: CloudPulseDashboardWithFiltersProp) => {
    const { dashboardId, resource, region, serviceType } = props;

    const { setGlobalSelectedDashboard, setGlobalFilterData } =
      useCloudPulseContext();

    const { data: dashboardById, isError: isDashboardByIdError } =
      useCloudPulseDashboardByIdQuery(dashboardId, !serviceType);

    const { data: dashboardsList, error: isError } = getAllDashboards(
      useCloudPulseDashboardsQuery(serviceType ? [serviceType] : []),
      serviceType ? [serviceType] : []
    );

    const { data: profile } = useProfile();

    const [filterData, setFilterData] = React.useState<FilterData>({
      id: {},
      label: {},
    });

    const [dashboard, setDashboard] = React.useState<Dashboard | undefined>();

    // Update dashboard when dashboardsList loads
    React.useEffect(() => {
      if (dashboardsList.length > 0 && !dashboard) {
        setDashboard(dashboardsList[0]);
      }
    }, [dashboardsList, dashboard]);

    const currentDashboard = serviceType ? dashboard : dashboardById;

    const [groupBy, setGroupBy] = React.useState<string[]>([]);

    const [timeDuration, setTimeDuration] =
      React.useState<DateTimeWithPreset>();

    const [showAppliedFilters, setShowAppliedFilters] =
      React.useState<boolean>(false);

    const timezone =
      profile?.timezone === 'GMT'
        ? 'Etc/GMT' // this is present in timezone list for GMT
        : (profile?.timezone ?? DateTime.local().zoneName);

    const toggleAppliedFilter = (isVisible: boolean) => {
      setShowAppliedFilters(isVisible);
    };

    const onFilterChange = React.useCallback(
      (filterKey: string, value: FilterValueType, labels: string[]) => {
        setFilterData((prev) => {
          return {
            id: {
              ...prev.id,
              [filterKey]: value,
            },
            label: {
              ...prev.label,
              [filterKey]: labels,
            },
          };
        });
      },
      []
    );

    const handleGroupByChange = React.useCallback((groupBy: string[]) => {
      setGroupBy(groupBy);
    }, []);

    const handleDashboardChange = React.useCallback(
      (dashboard: Dashboard | undefined) => {
        setFilterData({ id: {}, label: {} });
        setDashboard(dashboard);
        setTimeDuration(defaultTimeDuration(timezone)); // clear time duration on dashboard change
      },
      [timezone]
    );

    const handleTimeRangeChange = React.useCallback(
      (timeDuration: DateTimeWithPreset) => {
        setTimeDuration({
          ...timeDuration,
          end: convertToGmt(timeDuration.end, timeDuration.timeZone),
          start: convertToGmt(timeDuration.start, timeDuration.timeZone),
        });
      },
      []
    );

    React.useEffect(() => {
      setGlobalFilterData(filterData);
    }, [filterData, setGlobalFilterData]);

    React.useEffect(() => {
      if (currentDashboard) {
        setGlobalSelectedDashboard(currentDashboard);
      }
    }, [currentDashboard, setGlobalSelectedDashboard]);

    const renderPlaceHolder = (title: string) => {
      return (
        <Paper>
          <CloudPulseErrorPlaceholder errorMessage={title} />
        </Paper>
      );
    };

    if (isError || isDashboardByIdError) {
      return <ErrorState errorText="Error loading dashboards" />;
    }

    if (!currentDashboard) {
      return <CircleProgress />;
    }

    if (!FILTER_CONFIG.get(currentDashboard.id)) {
      return (
        <ErrorState
          errorText={`No Filters Configured for Dashboard with Id - ${currentDashboard.id}`}
        />
      );
    }

    const isFilterBuilderNeeded = checkIfFilterBuilderNeeded(currentDashboard);
    const isMandatoryFiltersSelected = checkMandatoryFiltersSelected({
      dashboardObj: currentDashboard,
      filterValue: filterData.id,
      resource,
      region,
      timeDuration,
      groupBy,
    });

    return (
      <Box display="flex" flexDirection="column" gap={2.5}>
        <Paper
          sx={{
            padding: 0,
          }}
        >
          <GridLegacy container>
            <GridLegacy item xs={12}>
              <Box
                display="flex"
                flexDirection={{ lg: 'row', xs: 'column' }}
                flexWrap="wrap"
                gap={2}
                justifyContent="space-between"
                m={3}
              >
                <CloudPulseDashboardSelect
                  defaultValue={currentDashboard.id}
                  handleDashboardChange={handleDashboardChange}
                  integrationServiceType={currentDashboard.service_type}
                  onlyServiceLevelDashboardIdAvailable={
                    !!dashboardId && !serviceType
                  }
                />
                <Box
                  display="flex"
                  flexDirection={{ md: 'row', xs: 'column' }}
                  flexWrap="wrap"
                  gap={2}
                >
                  <CloudPulseDateTimeRangePicker
                    defaultValue={timeDuration}
                    handleStatsChange={handleTimeRangeChange}
                    savePreferences
                  />
                  <GlobalFilterGroupByRenderer
                    handleChange={handleGroupByChange}
                    selectedDashboard={currentDashboard}
                  />
                </Box>
              </Box>
            </GridLegacy>

            <GridLegacy item xs={12}>
              <Divider
                sx={(theme) => ({
                  borderColor: theme.color.grey5,
                  margin: 0,
                })}
              />
            </GridLegacy>

            {isFilterBuilderNeeded && (
              <CloudPulseDashboardFilterBuilder
                dashboard={currentDashboard}
                emitFilterChange={onFilterChange}
                handleToggleAppliedFilter={toggleAppliedFilter}
                isServiceAnalyticsIntegration
                resource_ids={
                  currentDashboard.service_type !== 'objectstorage'
                    ? typeof resource === 'number'
                      ? [resource]
                      : undefined
                    : undefined
                }
              />
            )}
            <GridLegacy
              item
              sx={{
                mb: 3,
                mt: -3,
              }}
              xs={12}
            >
              {showAppliedFilters && (
                <CloudPulseAppliedFilterRenderer
                  dashboardId={currentDashboard.id}
                  filters={filterData.label}
                />
              )}
            </GridLegacy>
          </GridLegacy>
        </Paper>
        {isMandatoryFiltersSelected ? (
          <CloudPulseDashboard
            {...getDashboardProperties({
              dashboardObj: currentDashboard,
              filterValue: filterData.id,
              resource,
              region,
              timeDuration,
              groupBy,
            })}
            linodeRegion={
              filterData.id[PARENT_ENTITY_REGION]
                ? (filterData.id[PARENT_ENTITY_REGION] as string)
                : undefined
            }
          />
        ) : (
          renderPlaceHolder('Select filters to visualize metrics.')
        )}
      </Box>
    );
  }
);
