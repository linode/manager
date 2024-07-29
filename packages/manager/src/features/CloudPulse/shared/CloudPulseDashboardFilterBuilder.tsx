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
  RESOURCES,
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
              filter?.configuration.dependency?.includes(filterKey)
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

    const handleCustomSelectChange = React.useCallback(
      (filterType: string, value: number[] | string[]) => {
        emitFilterChangeByFilterKey(filterType, value);
      },
      [emitFilterChangeByFilterKey]
    );

    const getDependantConfig = React.useCallback(
      (filterKey: string): string[] => {
        const serviceTypeConfig = FILTER_CONFIG.get(dashboard.service_type!);

        if (!serviceTypeConfig) {
          return [];
        }

        return serviceTypeConfig.filters
          .filter((filter) =>
            filter.configuration?.dependency?.includes(filterKey)
          )
          .map((filter) =>
            filter.configuration.filterKey === RESOURCE_ID
              ? RESOURCES
              : filter.configuration.filterKey
          );
      },
      [dashboard]
    );

    const getCustomSelectProperties = React.useCallback(
      (config: CloudPulseServiceTypeFilters) => {
        return {
          apiResponseIdField: config.configuration.apiIdField,
          apiResponseLabelField: config.configuration.apiLabelField,
          clearSelections: getDependantConfig(config.configuration.filterKey),
          componentKey: 'customDropDown', // needed for renderer to choose the component
          dataApiUrl: config.configuration.apiUrl,
          filterKey: config.configuration.filterKey,
          filterType: config.configuration.filterType,
          handleSelectionChange: handleCustomSelectChange,
          isMultiSelect: config.configuration.isMultiSelect,
          key: config.configuration.filterKey,
          maxSelections: config.configuration.maxSelections,
          options: config.configuration.options,
          placeholder: config.configuration.placeholder,
          savePreferences: !isServiceAnalyticsIntegration,
          type: config.configuration.type,
        };
      },
      [
        getDependantConfig,
        handleCustomSelectChange,
        isServiceAnalyticsIntegration,
      ]
    );

    const getProps = React.useCallback(
      (config: CloudPulseServiceTypeFilters) => {
        if (config.configuration.filterKey == REGION) {
          return getRegionProperties(
            config,
            handleRegionChange,
            dashboard,
            isServiceAnalyticsIntegration
          );
        } else if (config.configuration.filterKey == RESOURCE_ID) {
          return getResourcesProperties(
            config,
            handleResourceChange,
            dashboard,
            isServiceAnalyticsIntegration,
            dependentFilterReference.current
          );
        } else if (config.configuration.filterKey == RELATIVE_TIME_DURATION) {
          return getTimeDurationProperties(
            config,
            handleTimeRangeChange,
            isServiceAnalyticsIntegration
          );
        } else {
          return getCustomSelectProperties(config); // if the above doesn't match use out custom select for rendering filters, the equivalent component for this will be implemented in upcoming PR's
        }
      },
      [
        dashboard,
        getCustomSelectProperties,
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

      if (!filters || filters.length == 0) {
        // if the filters are not defined , print an error state
        return (
          <Grid item key={'filtererror'} xs={12}>
            <ErrorState
              CustomIcon={InfoIcon}
              CustomIconStyles={{ height: '10%', width: '10%' }}
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
            sx={{ marginLeft: 2 }}
            xs
          >
            {RenderComponent({
              ...getProps(filter),
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
        ></ErrorState>
      );
    }

    return (
      <Grid container>
        <Grid item key={'toggleFilter'} sx={{ marginLeft: 2 }} xs={12}>
          <Box>
            <Button onClick={toggleShowFilter} sx={{ marginTop: 2 }}>
              {showFilter ? (
                <KeyboardArrowDownIcon />
              ) : (
                <KeyboardArrowRightIcon />
              )}
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
  return (
    oldProps.dashboard?.id === newProps.dashboard?.id &&
    !newProps.isServiceAnalyticsIntegration
  );
}
