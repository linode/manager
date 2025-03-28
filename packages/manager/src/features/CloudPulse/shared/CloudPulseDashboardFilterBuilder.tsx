import { Button, ErrorState, Typography } from '@linode/ui';
import { Grid, useTheme } from '@mui/material';
import * as React from 'react';

import KeyboardCaretDownIcon from 'src/assets/icons/caret_down.svg';
import KeyboardCaretRightIcon from 'src/assets/icons/caret_right.svg';
import InfoIcon from 'src/assets/icons/info.svg';
import NullComponent from 'src/components/NullComponent';

import RenderComponent from '../shared/CloudPulseComponentRenderer';
import {
  DASHBOARD_ID,
  NODE_TYPE,
  REGION,
  RELATIVE_TIME_DURATION,
  RESOURCE_ID,
  RESOURCES,
  TAGS,
} from '../Utils/constants';
import {
  getCustomSelectProperties,
  getFilters,
  getNodeTypeProperties,
  getRegionProperties,
  getResourcesProperties,
  getTagsProperties,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseServiceTypeFilters } from '../Utils/models';
import type { CloudPulseResources } from './CloudPulseResourcesSelect';
import type { CloudPulseTags } from './CloudPulseTagsFilter';
import type { AclpConfig, Dashboard } from '@linode/api-v4';

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
    value: FilterValueType,
    labels: string[],
    savePref?: boolean,
    updatePreferenceData?: {}
  ) => void;

  handleToggleAppliedFilter: (isVisible: boolean) => void;

  /**
   * this will handle the restrictions, if the parent of the component is going to be integrated in service analytics page
   */
  isServiceAnalyticsIntegration: boolean;

  /**
   * Last selected values from user preferences
   */
  preferences?: AclpConfig;

  /**
   * selected resource ids
   */
  resource_ids?: number[];
}

export const CloudPulseDashboardFilterBuilder = React.memo(
  (props: CloudPulseDashboardFilterBuilderProps) => {
    const {
      dashboard,
      emitFilterChange,
      handleToggleAppliedFilter,
      isServiceAnalyticsIntegration,
      preferences,
      resource_ids,
    } = props;

    const [, setDependentFilters] = React.useState<{
      [key: string]: FilterValueType;
    }>({});

    const [showFilter, setShowFilter] = React.useState<boolean>(true);

    const theme = useTheme();

    const dependentFilterReference: React.MutableRefObject<{
      [key: string]: FilterValueType;
    }> = React.useRef({});

    const checkAndUpdateDependentFilters = React.useCallback(
      (filterKey: string, value: FilterValueType) => {
        if (dashboard && dashboard.service_type) {
          const serviceTypeConfig = FILTER_CONFIG.get(dashboard.service_type);
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
        filterValue: FilterValueType,
        labels: string[],
        savePref: boolean = false,
        updatedPreferenceData: AclpConfig = {}
      ) => {
        emitFilterChange(
          filterKey,
          filterValue,
          labels,
          savePref,
          updatedPreferenceData
        );
        checkAndUpdateDependentFilters(filterKey, filterValue);
      },
      [emitFilterChange, checkAndUpdateDependentFilters]
    );

    const handleNodeTypeChange = React.useCallback(
      (
        nodeTypeId: string | undefined,
        label: string[],
        savePref: boolean = false
      ) => {
        emitFilterChangeByFilterKey(NODE_TYPE, nodeTypeId, label, savePref, {
          [NODE_TYPE]: nodeTypeId,
        });
      },
      [emitFilterChangeByFilterKey]
    );

    const handleTagsChange = React.useCallback(
      (tags: CloudPulseTags[], savePref: boolean = false) => {
        const selectedTags = tags.map((tag) => tag.label);
        emitFilterChangeByFilterKey(
          TAGS,
          selectedTags,
          selectedTags,
          savePref,
          {
            [RESOURCE_ID]: undefined,
            [TAGS]: selectedTags,
          }
        );
      },
      [emitFilterChangeByFilterKey]
    );

    const handleResourceChange = React.useCallback(
      (resourceId: CloudPulseResources[], savePref: boolean = false) => {
        emitFilterChangeByFilterKey(
          RESOURCE_ID,
          resourceId.map((resource) => resource.id),
          resourceId.map((resource) => resource.label),
          savePref,
          {
            [NODE_TYPE]: undefined,
            [RESOURCES]: resourceId.map((resource: { id: string }) =>
              String(resource.id)
            ),
          }
        );
      },
      [emitFilterChangeByFilterKey]
    );

    const handleRegionChange = React.useCallback(
      (
        region: string | undefined,
        labels: string[],
        savePref: boolean = false
      ) => {
        const updatedPreferenceData = {
          [REGION]: region,
          [RESOURCES]: undefined,
          [TAGS]: undefined,
        };
        emitFilterChangeByFilterKey(
          REGION,
          region,
          labels,
          savePref,
          updatedPreferenceData
        );
      },
      [emitFilterChangeByFilterKey]
    );

    const handleCustomSelectChange = React.useCallback(
      (
        filterKey: string,
        value: FilterValueType,
        labels: string[],
        savePref: boolean = false,
        updatedPreferenceData: {} = {}
      ) => {
        emitFilterChangeByFilterKey(
          filterKey,
          value,
          labels,
          savePref,
          updatedPreferenceData
        );
      },
      [emitFilterChangeByFilterKey]
    );

    const getProps = React.useCallback(
      (config: CloudPulseServiceTypeFilters) => {
        if (config.configuration.filterKey === TAGS) {
          return getTagsProperties(
            {
              config,
              dashboard,
              dependentFilters: dependentFilterReference.current,
              isServiceAnalyticsIntegration,
              preferences,
            },
            handleTagsChange
          );
        } else if (config.configuration.filterKey === REGION) {
          return getRegionProperties(
            {
              config,
              dashboard,
              isServiceAnalyticsIntegration,
              preferences,
            },
            handleRegionChange
          );
        } else if (config.configuration.filterKey === RESOURCE_ID) {
          return getResourcesProperties(
            {
              config,
              dashboard,
              dependentFilters: dependentFilterReference.current,
              isServiceAnalyticsIntegration,
              preferences,
            },
            handleResourceChange
          );
        } else if (config.configuration.filterKey === NODE_TYPE) {
          return getNodeTypeProperties(
            {
              config,
              dashboard,
              dependentFilters: resource_ids?.length
                ? { [RESOURCE_ID]: resource_ids }
                : dependentFilterReference.current,
              isServiceAnalyticsIntegration,
              preferences,
              resource_ids: resource_ids?.length
                ? resource_ids
                : (dependentFilterReference.current[
                    RESOURCE_ID
                  ] as string[])?.map((id: string) => Number(id)),
            },
            handleNodeTypeChange
          );
        } else {
          return getCustomSelectProperties(
            {
              config,
              dashboard,
              dependentFilters: dependentFilterReference.current,
              isServiceAnalyticsIntegration,
              preferences,
            },
            handleCustomSelectChange
          );
        }
      },
      [
        dashboard,
        handleNodeTypeChange,
        handleTagsChange,
        handleRegionChange,
        handleResourceChange,
        handleCustomSelectChange,
        isServiceAnalyticsIntegration,
        preferences,
      ]
    );

    const toggleShowFilter = () => {
      handleToggleAppliedFilter(showFilter);
      setShowFilter((showFilterPrev) => !showFilterPrev);
    };

    const RenderFilters = React.useCallback(() => {
      const filters = getFilters(dashboard, isServiceAnalyticsIntegration);

      if (!filters || filters.length === 0) {
        // if the filters are not defined , print an error state
        return (
          <ErrorState
            CustomIcon={InfoIcon}
            CustomIconStyles={{ height: '40px', width: '40px' }}
            errorText={'Please configure filters to continue'}
          />
        );
      }

      return filters
        .filter(
          (config) =>
            isServiceAnalyticsIntegration
              ? config.configuration.neededInServicePage
              : config.configuration.filterKey !== RELATIVE_TIME_DURATION // time duration is always defined explicitly
        )
        .map((filter, index) => (
          <Grid
            key={filter.configuration.filterKey}
            size={{ md: 4, sm: 6, xs: 12 }}
          >
            {RenderComponent({
              componentKey:
                filter.configuration.type !== undefined
                  ? 'customSelect'
                  : filter.configuration.filterKey,
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
      return <NullComponent />; // in this we don't want to show the filters at all
    }

    return (
      <Grid
        sx={{
          m: 3,
          paddingBottom: isServiceAnalyticsIntegration ? 3 : 0,
        }}
        container
        size={{ xs: 12 }}
      >
        <Grid
          sx={{
            m: 0,
            p: 0,
          }}
          key="toggleFilter"
          size={{ xs: 12 }}
        >
          <Button
            startIcon={
              showFilter ? (
                <KeyboardCaretDownIcon />
              ) : (
                <KeyboardCaretRightIcon />
              )
            }
            sx={{
              justifyContent: 'start',
              m: theme.spacing(0),
              marginBottom: theme.spacing(showFilter ? 1 : 0),
              minHeight: 'auto',
              minWidth: 'auto',
              p: theme.spacing(0),
              svg: {
                color: theme.color.grey4,
              },
            }}
            onClick={toggleShowFilter}
          >
            <Typography variant="h3">Filters</Typography>
          </Button>
        </Grid>
        <Grid
          sx={{
            display: showFilter ? 'flex' : 'none',
            maxHeight: theme.spacing(23),
            overflow: 'auto',
            pr: { sm: 0, xs: 2 },
            rowGap: theme.spacing(2),
          }}
          columnSpacing={theme.spacing(2)}
          container
          size={{ xs: 12 }}
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
  return (
    oldProps.dashboard?.id === newProps.dashboard?.id &&
    oldProps.preferences?.[DASHBOARD_ID] ===
      newProps.preferences?.[DASHBOARD_ID]
  );
}
