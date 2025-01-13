import { Box, CircleProgress, Divider, Paper } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';

import { CloudPulseAppliedFilterRenderer } from '../shared/CloudPulseAppliedFilterRenderer';
import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseDashboardSelect } from '../shared/CloudPulseDashboardSelect';
import {
  CloudPulseDateTimeRangePicker,
  defaultTimeDuration,
} from '../shared/CloudPulseDateTimeRangePicker';
import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import {
  checkIfFilterBuilderNeeded,
  checkMandatoryFiltersSelected,
  getDashboardProperties,
} from '../Utils/ReusableDashboardFilterUtils';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { FilterData, FilterValueType } from './CloudPulseDashboardLanding';
import type { TimeDurationDate } from '@linode/api-v4';

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
    const { data: dashboard, isError } = useCloudPulseDashboardByIdQuery(
      dashboardId
    );

    const [filterData, setFilterData] = React.useState<FilterData>({
      id: {},
      label: {},
    });

    const [timeDuration, setTimeDuration] = React.useState<TimeDurationDate>(
      defaultTimeDuration()
    );

    const [showAppliedFilters, setShowAppliedFilters] = React.useState<boolean>(
      false
    );

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
      (timeDuration: TimeDurationDate) => {
        setTimeDuration(timeDuration);
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
          <Grid
            justifyContent={{
              sm: 'flex-end',
              xs: 'center',
            }}
            columnSpacing={2}
            container
            display={'flex'}
            item
            maxHeight={'120px'}
            mb={1}
            overflow={'auto'}
            px={2}
            py={1}
            rowGap={2}
            xs={12}
          >
            <Grid
              display="flex"
              item
              justifyContent={'end'}
              md={8}
              sm={6}
              xs={12}
            >
              <CloudPulseDateTimeRangePicker
                handleStatsChange={handleTimeRangeChange}
                savePreferences={true}
              />
            </Grid>

            {isFilterBuilderNeeded && (
              <CloudPulseDashboardFilterBuilder
                dashboard={dashboard}
                emitFilterChange={onFilterChange}
                handleToggleAppliedFilter={toggleAppliedFilter}
                isServiceAnalyticsIntegration
              />
            )}
            <Grid item mb={3} mt={-3} xs={12}>
              {showAppliedFilters && (
                <CloudPulseAppliedFilterRenderer
                  filters={filterData.label}
                  serviceType={dashboard.service_type}
                />
              )}
            </Grid>
          </Grid>
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
