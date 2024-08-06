import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Grid, Typography } from '@mui/material';
import * as React from 'react';

import InfoIcon from 'src/assets/icons/info.svg';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

import RenderComponent from '../shared/CloudPulseComponentRenderer';
import {
  REGION,
  RELATIVE_TIME_DURATION,
  RESOURCE_ID,
} from '../Utils/constants';
import {
  getRegionProperties,
  getResourcesProperties,
  getTimeDurationProperties,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { CloudPulseServiceTypeFilters } from '../Utils/models';
import type { Dashboard, TimeDuration } from '@linode/api-v4';

export interface CloudPulseDashboardFilterBuilderProps {
  /**
   * We need the dashboard here, as we can infer serviceType and other required properties from it.
   * Since it is going to integrated after a dashboard selection component, it is easily available to pass.
   */
  dashboard: Dashboard;

  /**
   * all the selection changes in the filter goes through this method
   */
  emitFilterChange: (
    filterKey: string,
    value: TimeDuration | number | number[] | string | string[] | undefined
  ) => void;

  /**
   * this will handle the restrictions, if the parent of the component is going to be integrated in service analytics page
   */
  isServiceAnalyticsIntegration: boolean;
}

export const CloudPulseDashboardFilterBuilder = React.memo(
  (props: CloudPulseDashboardFilterBuilderProps) => {
    const {
      dashboard,
      emitFilterChange,
      isServiceAnalyticsIntegration,
    } = props;

    const [, setDependentFilters] = React.useState<{
      [key: string]:
        | TimeDuration
        | number
        | number[]
        | string
        | string[]
        | undefined;
    }>({});

    const [showFilter, setShowFilter] = React.useState<boolean>(true);

    const dependentFilterReference: React.MutableRefObject<{
      [key: string]:
        | TimeDuration
        | number
        | number[]
        | string
        | string[]
        | undefined;
    }> = React.useRef({});

    const checkAndUpdateDependentFilters = React.useCallback(
      (
        filterKey: string,
        value: TimeDuration | number | number[] | string | string[] | undefined
      ) => {
        if (dashboard && dashboard.service_type) {
          const serviceTypeConfig = FILTER_CONFIG.get(dashboard.service_type!);
          const filters = serviceTypeConfig?.filters ?? [];

          for (const filter of filters) {
            if (
              Boolean(filter?.configuration.dependency?.length) &&
              filter?.configuration.dependency?.includes(filterKey) &&
              dependentFilterReference.current[filterKey] !== value
            ) {
              dependentFilterReference.current[filterKey] = value;
              setDependentFilters(() => ({
                ...dependentFilterReference.current,
              }));
              break;
            }
          }
        }
      },
      [dashboard]
    );

    const emitFilterChangeByFilterKey = React.useCallback(
      (
        filterKey: string,
        filterValue:
          | TimeDuration
          | number
          | number[]
          | string
          | string[]
          | undefined
      ) => {
        emitFilterChange(filterKey, filterValue);
        checkAndUpdateDependentFilters(filterKey, filterValue);
      },
      [emitFilterChange, checkAndUpdateDependentFilters]
    );

    const handleResourceChange = React.useCallback(
      (resourceId: number[]) => {
        emitFilterChangeByFilterKey(RESOURCE_ID, resourceId);
      },
      [emitFilterChangeByFilterKey]
    );

    const handleTimeRangeChange = React.useCallback(
      (timeDuration: TimeDuration) => {
        emitFilterChangeByFilterKey(RELATIVE_TIME_DURATION, timeDuration);
      },
      [emitFilterChangeByFilterKey]
    );

    const handleRegionChange = React.useCallback(
      (region: string | undefined) => {
        emitFilterChangeByFilterKey(REGION, region);
      },
      [emitFilterChangeByFilterKey]
    );

    const getProps = React.useCallback(
      (config: CloudPulseServiceTypeFilters) => {
        if (config.configuration.filterKey === REGION) {
          return getRegionProperties(
            { config, dashboard, isServiceAnalyticsIntegration },
            handleRegionChange
          );
        } else if (config.configuration.filterKey === RESOURCE_ID) {
          return getResourcesProperties(
            {
              config,
              dashboard,
              dependentFilters: dependentFilterReference.current,
              isServiceAnalyticsIntegration,
            },
            handleResourceChange
          );
        } else if (config.configuration.filterKey === RELATIVE_TIME_DURATION) {
          return getTimeDurationProperties(
            { config, dashboard, isServiceAnalyticsIntegration },
            handleTimeRangeChange
          );
        } else {
          return {}; // if the above doesn't match use out custom select for rendering filters, the equivalent component for this will be implemented in upcoming PR's
        }
      },
      [
        dashboard,
        handleRegionChange,
        handleResourceChange,
        handleTimeRangeChange,
        isServiceAnalyticsIntegration,
      ]
    );

    const toggleShowFilter = () => {
      setShowFilter((showFilterPrev) => !showFilterPrev);
    };

    const RenderFilters = React.useCallback(() => {
      const filters = FILTER_CONFIG.get(dashboard.service_type)?.filters || [];

      if (!filters || filters.length === 0) {
        // if the filters are not defined , print an error state
        return (
          <Grid item key={'filtererror'} xs={12}>
            <ErrorState
              CustomIcon={InfoIcon}
              CustomIconStyles={{ height: '10', width: '10' }}
              errorText={'Please configure filters to continue'}
            ></ErrorState>
          </Grid>
        );
      }

      return filters
        .filter((config) =>
          isServiceAnalyticsIntegration
            ? config.configuration.neededInServicePage
            : !config.configuration.neededInServicePage
        )
        .map((filter, index) => (
          <Grid
            item
            key={filter.configuration.filterKey}
            lg={4}
            md={6}
            sm={12}
            xs={12}
          >
            {RenderComponent({
              componentKey: filter.configuration.filterKey,
              componentProps: { ...getProps(filter) },
              key: index + filter.configuration.filterKey,
            })}
          </Grid>
        ));
    }, [dashboard, getProps, isServiceAnalyticsIntegration]);

    if (
      !dashboard ||
      !dashboard.service_type ||
      !FILTER_CONFIG.has(dashboard.service_type)
    ) {
      return (
        <ErrorState
          CustomIcon={InfoIcon}
          CustomIconStyles={{ height: '10%', width: '10%' }}
          errorText={'Please pass valid dashboard to render the filters'}
        />
      );
    }

    return (
      <Grid container>
        <Grid item key={'toggleFilter'} lg={12} xs={12}>
          <Box>
            <Button
              startIcon={
                showFilter ? (
                  <KeyboardArrowDownIcon />
                ) : (
                  <KeyboardArrowRightIcon />
                )
              }
              onClick={toggleShowFilter}
              buttonType={'outlined'}
            >
              {/* {showFilter ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )} */}
              <Typography>Filters</Typography>
            </Button>
          </Box>
        </Grid>
        {showFilter && <RenderFilters />}
      </Grid>
    );
  },
  compareProps
);

function compareProps(
  oldProps: CloudPulseDashboardFilterBuilderProps,
  newProps: CloudPulseDashboardFilterBuilderProps
) {
  return oldProps.dashboard?.id === newProps.dashboard?.id;
}
