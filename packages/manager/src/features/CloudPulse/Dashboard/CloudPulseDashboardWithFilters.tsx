import { Box, CircleProgress, Divider, ErrorState, Paper } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React from 'react';

import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';

import { GlobalFilterGroupByRenderer } from '../GroupBy/GlobalFilterGroupByRenderer';
import { CloudPulseAppliedFilterRenderer } from '../shared/CloudPulseAppliedFilterRenderer';
import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseDateTimeRangePicker } from '../shared/CloudPulseDateTimeRangePicker';
import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { convertToGmt } from '../Utils/CloudPulseDateTimePickerUtils';
import { LINODE_REGION } from '../Utils/constants';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import {
  checkIfFilterBuilderNeeded,
  checkMandatoryFiltersSelected,
  getDashboardProperties,
} from '../Utils/ReusableDashboardFilterUtils';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { FilterData, FilterValueType } from './CloudPulseDashboardLanding';
import type { DateTimeWithPreset } from '@linode/api-v4';

export interface CloudPulseDashboardWithFiltersProp {
  /**
   * The id of the dashboard that needs to be rendered
   */
  dashboardId: number;
  /**
   * The region for which the metrics will be listed
   */
  region?: string;
  /**
   * The resource id for which the metrics will be listed
   */
  resource: number | string;
}

export const CloudPulseDashboardWithFilters = React.memo(
  (props: CloudPulseDashboardWithFiltersProp) => {
    const { dashboardId, resource, region } = props;
    const { data: dashboard, isError } =
      useCloudPulseDashboardByIdQuery(dashboardId);
    const [filterData, setFilterData] = React.useState<FilterData>({
      id: {},
      label: {},
    });

    const [groupBy, setGroupBy] = React.useState<string[]>([]);

    const [timeDuration, setTimeDuration] =
      React.useState<DateTimeWithPreset>();

    const [showAppliedFilters, setShowAppliedFilters] =
      React.useState<boolean>(false);

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

    const renderPlaceHolder = (title: string) => {
      return (
        <Paper>
          <CloudPulseErrorPlaceholder errorMessage={title} />
        </Paper>
      );
    };

    if (isError) {
      return (
        <ErrorState
          errorText={`Error while loading Dashboard with Id - ${dashboardId}`}
        />
      );
    }

    if (!dashboard) {
      return <CircleProgress />;
    }

    if (!FILTER_CONFIG.get(dashboardId)) {
      return (
        <ErrorState
          errorText={`No Filters Configured for Service Type - ${dashboard.service_type}`}
        />
      );
    }

    const isFilterBuilderNeeded = checkIfFilterBuilderNeeded(dashboard);
    const isMandatoryFiltersSelected = checkMandatoryFiltersSelected({
      dashboardObj: dashboard,
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
                  defaultValue={dashboardId}
                  isServiceIntegration
                />
                <Box
                  display="flex"
                  flexDirection={{ md: 'row', xs: 'column' }}
                  flexWrap="wrap"
                  gap={2}
                >
                  <CloudPulseDateTimeRangePicker
                    handleStatsChange={handleTimeRangeChange}
                    savePreferences
                  />
                  <GlobalFilterGroupByRenderer
                    handleChange={handleGroupByChange}
                    selectedDashboard={dashboard}
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
                dashboard={dashboard}
                emitFilterChange={onFilterChange}
                handleToggleAppliedFilter={toggleAppliedFilter}
                isServiceAnalyticsIntegration
                resource_ids={[resource]}
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
                  dashboardId={dashboard.id}
                  filters={filterData.label}
                />
              )}
            </GridLegacy>
          </GridLegacy>
        </Paper>
        {isMandatoryFiltersSelected ? (
          <CloudPulseDashboard
            {...getDashboardProperties({
              dashboardObj: dashboard,
              filterValue: filterData.id,
              resource,
              region,
              timeDuration,
              groupBy,
            })}
            linodeRegion={
              filterData.id[LINODE_REGION]
                ? (filterData.id[LINODE_REGION] as string)
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
