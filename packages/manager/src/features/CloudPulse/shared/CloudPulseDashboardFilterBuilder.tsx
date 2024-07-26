import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { Box, Grid, Typography } from '@mui/material';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { ErrorState } from 'src/components/ErrorState/ErrorState';

import RenderComponent from '../shared/CloudPulseComponentRenderer';
import {
  REGION,
  RELATIVE_TIME_DURATION,
  RESOURCE_ID,
  RESOURCES,
} from '../Utils/constants';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import {
  getRegionProperties,
  getResourcesProperties,
  getTimeDurationProperties,
} from '../Utils/utils';

import type { CloudPulseServiceTypeFilters } from '../Utils/models';
import type { Dashboard, TimeDuration } from '@linode/api-v4';

export interface CloudPulseDashboardFilterBuilderProps {
  // we need to dashboard here, as we can infer serviceType and other required properties from it. Since it is going to integrated after a dashboard selection component, it is easily available to pass
  dashboard: Dashboard;
  emitFilterChange: (filterKey: string, value: any) => void; // all the selection changes in the filter goes through this method
  isServiceAnalyticsIntegration: boolean; // this will handle the restrictions, if the parent of the component is going to be integrated in service analytics page
}

export const CloudPulseDashboardFilterBuilder = React.memo(
  (props: CloudPulseDashboardFilterBuilderProps) => {
    const [dependentFilters, setDependentFilters] = React.useState<{
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
      [key: string]: number | number[] | string | string[] | undefined;
    }> = React.useRef({});

    const handleResourceChange = (resourceId: number[]) => {
      emitFilterChangeByFilterKey(RESOURCE_ID, resourceId);
    };

    const handleTimeRangeChange = (timeDuration: TimeDuration) => {
      emitFilterChangeByFilterKey(RELATIVE_TIME_DURATION, timeDuration);
    };

    const handleRegionChange = (region: string | undefined) => {
      emitFilterChangeByFilterKey(REGION, region);
    };

    const handleCustomSelectChange = (
      filterType: string,
      value: number[] | string[]
    ) => {
      emitFilterChangeByFilterKey(filterType, value);
    };

    const emitFilterChangeByFilterKey = (
      filterKey: string,
      filterValue: any
    ) => {
      props.emitFilterChange(filterKey, filterValue);
      checkAndUpdateDependentFilters(filterKey, filterValue);
    };

    const getCustomSelectProperties = (
      config: CloudPulseServiceTypeFilters
    ) => {
      return {
        apiResponseIdField: config.configuration.apiIdField,
        apiResponseLabelField: config.configuration.apiLabelField,
        clearSelections: getDepedendantConfig(config.configuration.filterKey),
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
        savePreferences: !props.isServiceAnalyticsIntegration,
        type: config.configuration.type,
      };
    };

    const getProps = (config: CloudPulseServiceTypeFilters) => {
      if (config.configuration.filterKey == REGION) {
        return getRegionProperties(
          config,
          handleRegionChange,
          props.dashboard,
          props.isServiceAnalyticsIntegration
        );
      } else if (config.configuration.filterKey == RESOURCE_ID) {
        return getResourcesProperties(
          config,
          handleResourceChange,
          props.dashboard,
          props.isServiceAnalyticsIntegration,
          dependentFilterReference.current
        );
      } else if (config.configuration.filterKey == RELATIVE_TIME_DURATION) {
        return getTimeDurationProperties(
          config,
          handleTimeRangeChange,
          props.isServiceAnalyticsIntegration
        );
      } else {
        return getCustomSelectProperties(config); // if the above doesn't match use out custom select for rendering filters, the equivalent component for this will be implemented in upcoming PR's
      }
    };

    const checkAndUpdateDependentFilters = (filterKey: string, value: any) => {
      if (props.dashboard && props.dashboard.service_type) {
        const serviceTypeConfig = FILTER_CONFIG.get(
          props.dashboard.service_type!
        );
        const filters = serviceTypeConfig?.filters ?? [];

        for (const filter of filters) {
          if (
            filter &&
            filter.configuration &&
            filter.configuration.dependency &&
            filter.configuration.dependency.includes(filterKey)
          ) {
            dependentFilterReference.current[filterKey] = value;
            setDependentFilters({ ...dependentFilterReference.current });
            break;
          }
        }
      }
    };

    const getDepedendantConfig = (filterKey: string): string[] => {
      const serviceTypeConfig = FILTER_CONFIG.get(
        props.dashboard.service_type!
      );

      const dependants: string[] = [];

      for (
        let i = 0;
        serviceTypeConfig && i < serviceTypeConfig?.filters.length;
        i++
      ) {
        const filter = serviceTypeConfig.filters[i];
        if (
          filter.configuration &&
          filter.configuration.dependency != undefined &&
          filter.configuration.dependency.includes(filterKey)
        ) {
          dependants.push(
            filter.configuration.filterKey == RESOURCE_ID
              ? RESOURCES
              : filter.configuration.filterKey
          );
        }
      }

      return dependants;
    };

    const toggleShowFilter = () => {
      setShowFilter((showFilterPrev) => !showFilterPrev);
    };

    if (
      !props.dashboard ||
      !props.dashboard.service_type ||
      !FILTER_CONFIG.has(props.dashboard.service_type)
    ) {
      return (
        <ErrorState
          errorText={'Please pass a valid dashboard to render the filters'}
        ></ErrorState>
      );
    }

    return (
      <>
        {!showFilter && (
          <Button
            key={'right'}
            onClick={toggleShowFilter}
            sx={{ marginTop: 2 }}
          >
            <KeyboardArrowRightIcon />
            <Typography>Filters</Typography>
          </Button>
        )}
        {showFilter && (
          <Button key={'down'} onClick={toggleShowFilter} sx={{ marginTop: 2 }}>
            <KeyboardArrowDownIcon />
            <Typography>Filters</Typography>
          </Button>
        )}
        {showFilter &&
          FILTER_CONFIG.get(props.dashboard.service_type)
            ?.filters.filter((config) =>
              !props.isServiceAnalyticsIntegration
                ? config.configuration.filterKey != RELATIVE_TIME_DURATION
                : config.configuration.neededInServicePage
            )
            .map((filter, index) => {
              if (index % 3 == 0) {
                return (
                  <>
                    <Box style={{ width: '100%' }}></Box>
                    <Grid
                      key={filter.configuration.filterKey}
                      sx={{ marginLeft: 2 }}
                      xs
                    >
                      {RenderComponent({ ...getProps(filter), key: index })}
                    </Grid>
                  </>
                );
              }
              return (
                <Grid
                  key={filter.configuration.filterKey}
                  sx={{ marginLeft: 2 }}
                  xs
                >
                  {RenderComponent({ ...getProps(filter), key: index })}
                </Grid>
              );
            })}
      </>
    );
  },
  compareProps
);

function compareProps(
  oldProps: CloudPulseDashboardFilterBuilderProps,
  newProps: CloudPulseDashboardFilterBuilderProps
) {
  return (
    oldProps.dashboard &&
    newProps.dashboard &&
    oldProps.dashboard.id == newProps.dashboard.id &&
    !newProps.isServiceAnalyticsIntegration
  );
}
