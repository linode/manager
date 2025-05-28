import { Box, CircleProgress, Divider, ErrorState, Paper } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React from 'react';

import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';

import { CloudPulseAppliedFilterRenderer } from '../shared/CloudPulseAppliedFilterRenderer';
import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import { CloudPulseDateTimeRangePicker } from '../shared/CloudPulseDateTimeRangePicker';
import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import {
  convertToGmt,
  defaultTimeDuration,
} from '../Utils/CloudPulseDateTimePickerUtils';
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
   * The resource id for which the metrics will be listed
   */
  resource: number;
}

export const CloudPulseDashboardWithFilters = React.memo(
  (props: CloudPulseDashboardWithFiltersProp) => {
    const { dashboardId, resource } = props;
    const { data: dashboard, isError } =
      useCloudPulseDashboardByIdQuery(dashboardId);

    const [filterData, setFilterData] = React.useState<FilterData>({
      id: {},
      label: {},
    });

    const [timeDuration, setTimeDuration] = React.useState<DateTimeWithPreset>(
      defaultTimeDuration()
    );

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

    const handleTimeRangeChange = React.useCallback(
      (timeDuration: DateTimeWithPreset) => {
        setTimeDuration({
          ...timeDuration,
          end: convertToGmt(timeDuration.end),
          start: convertToGmt(timeDuration.start),
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

    if (!FILTER_CONFIG.get(dashboard.service_type)) {
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
      timeDuration,
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

                <CloudPulseDateTimeRangePicker
                  handleStatsChange={handleTimeRangeChange}
                  savePreferences
                />
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
                  filters={filterData.label}
                  serviceType={dashboard.service_type}
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
              timeDuration,
            })}
          />
        ) : (
          renderPlaceHolder('Select filters to visualize metrics.')
        )}
      </Box>
    );
  }
);
