import { Grid } from '@mui/material';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Paper } from 'src/components/Paper';
import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';

import { CloudPulseDashboardFilterBuilder } from '../shared/CloudPulseDashboardFilterBuilder';
import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { CloudPulseTimeRangeSelect } from '../shared/CloudPulseTimeRangeSelect';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import {
  checkIfFilterBuilderNeeded,
  checkMandatoryFiltersSelected,
  getDashboardProperties,
} from '../Utils/ReusableDashboardFilterUtils';
import { CloudPulseDashboard } from './CloudPulseDashboard';

import type { FilterValueType } from './CloudPulseDashboardLanding';
import type { TimeDuration } from '@linode/api-v4';

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

    const [filterValue, setFilterValue] = React.useState<{
      [key: string]: FilterValueType;
    }>({});

    const [timeDuration, setTimeDuration] = React.useState<TimeDuration>({
      unit: 'min',
      value: 30,
    });

    const onFilterChange = React.useCallback(
      (filterKey: string, value: FilterValueType) => {
        setFilterValue((prev) => ({ ...prev, [filterKey]: value }));
      },
      []
    );

    const handleTimeRangeChange = React.useCallback(
      (timeDuration: TimeDuration) => {
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
      filterValue,
      resource,
      timeDuration,
    });

    return (
      <>
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
            <Grid item md={4} sm={6} xs={12}>
              <CloudPulseTimeRangeSelect
                disabled={!dashboard}
                handleStatsChange={handleTimeRangeChange}
                savePreferences={true}
              />
            </Grid>
          </Grid>
          {isFilterBuilderNeeded && (
            <CloudPulseDashboardFilterBuilder
              dashboard={dashboard}
              emitFilterChange={onFilterChange}
              isServiceAnalyticsIntegration={true}
            />
          )}
        </Paper>
        {isMandatoryFiltersSelected ? (
          <CloudPulseDashboard
            {...getDashboardProperties({
              dashboardObj: dashboard,
              filterValue,
              resource,
              timeDuration,
            })}
          />
        ) : (
          renderPlaceHolder('Select filters to visualize metrics.')
        )}
      </>
    );
  }
);
