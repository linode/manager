import KeyboardArrowDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardArrowRightIcon from '@mui/icons-material/ArrowRight';
import { Grid, Typography } from '@mui/material';
import * as React from 'react';

import InfoIcon from 'src/assets/icons/info.svg';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
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
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFilters } from '../Utils/models';
import type { CloudPulseResources } from './CloudPulseResourcesSelect';
import type { Dashboard } from '@linode/api-v4';

export interface CloudPulseDashboardFilterBuilderProps {
  /**
   * We need the dashboard here, as we can infer serviceType and other required properties from it.
   * Since it is going to integrated after a dashboard selection component, it is easily available to pass.
   */
  dashboard: Dashboard;

  /**
   * all the selection changes in the filter goes through this method
   */
  emitFilterChange: (filterKey: string, value: FilterValueType) => void;

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
      [key: string]: FilterValueType;
    }>({});

    const [showFilter, setShowFilter] = React.useState<boolean>(true);

    const dependentFilterReference: React.MutableRefObject<{
      [key: string]: FilterValueType;
    }> = React.useRef({});

    const checkAndUpdateDependentFilters = React.useCallback(
      (filterKey: string, value: FilterValueType) => {
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
      (filterKey: string, filterValue: FilterValueType) => {
        emitFilterChange(filterKey, filterValue);
        checkAndUpdateDependentFilters(filterKey, filterValue);
      },
      [emitFilterChange, checkAndUpdateDependentFilters]
    );

    const handleResourceChange = React.useCallback(
      (resourceId: CloudPulseResources[]) => {
        emitFilterChangeByFilterKey(
          RESOURCE_ID,
          resourceId.map((resource) => resource.id)
        );
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
        } else {
          return {};
        }
      },
      [
        dashboard,
        handleRegionChange,
        handleResourceChange,
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
          <ErrorState
            CustomIcon={InfoIcon}
            CustomIconStyles={{ height: '40px', width: '40px' }}
            errorText={'Please configure filters to continue'}
          ></ErrorState>
        );
      }

      return filters
        .filter(
          (config) =>
            isServiceAnalyticsIntegration
              ? config.configuration.neededInServicePage
              : config.configuration.filterKey != RELATIVE_TIME_DURATION // time duration is always defined explicitly
        )
        .map((filter, index) => (
          <Grid item key={filter.configuration.filterKey} md={4} sm={6} xs={12}>
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
          CustomIconStyles={{ height: '30px', width: '30px' }}
          errorText={'Please pass valid dashboard to render the filters'}
        />
      );
    }

    return (
      <Grid container item xs={12}>
        <Grid item key={'toggleFilter'} px={2} xs={12}>
          <Box>
            <Button
              startIcon={
                showFilter ? (
                  <KeyboardArrowDownIcon
                    sx={{ color: 'grey', height: '30px', width: '30px' }}
                  />
                ) : (
                  <KeyboardArrowRightIcon
                    sx={{ color: 'grey', height: '30px', width: '30px' }}
                  />
                )
              }
              onClick={toggleShowFilter}
              sx={{ justifyContent: 'start', mb: showFilter ? 0 : 2, p: 0 }}
            >
              <Typography>Filters</Typography>
            </Button>
          </Box>
        </Grid>
        <Grid display={showFilter ? 'block' : 'none'} item xs={12}>
          <Divider />
        </Grid>
        <Grid
          columnSpacing={2}
          container
          display={showFilter ? 'flex' : 'none'}
          item
          maxHeight={'120px'}
          mb={3}
          overflow={'auto'}
          px={2}
          xs={12}
        >
          <RenderFilters />
        </Grid>
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
