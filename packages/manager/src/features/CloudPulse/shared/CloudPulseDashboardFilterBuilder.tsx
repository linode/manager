import { Button, CircleProgress, ErrorState, Typography } from '@linode/ui';
import { GridLegacy, useTheme } from '@mui/material';
import * as React from 'react';

import KeyboardCaretDownIcon from 'src/assets/icons/caret_down.svg';
import KeyboardCaretRightIcon from 'src/assets/icons/caret_right.svg';
import InfoIcon from 'src/assets/icons/info.svg';
import NullComponent from 'src/components/NullComponent';

import RenderComponent from '../shared/CloudPulseComponentRenderer';
import {
  DASHBOARD_ID,
  INTERFACE_ID,
  LINODE_REGION,
  NODE_TYPE,
  PORT,
  REGION,
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
  getTextFilterProperties,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { type CloudPulseServiceTypeFilters } from '../Utils/models';

import type {
  CloudPulseMetricsFilter,
  FilterValueType,
} from '../Dashboard/CloudPulseDashboardLanding';
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
   * Is cluster Call
   */
  isError?: boolean;

  /**
   * Property to disable filters
   */
  isLoading?: boolean;

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
      isError = false,
      isLoading = false,
    } = props;

    const [, setDependentFilters] = React.useState<CloudPulseMetricsFilter>({});

    const [showFilter, setShowFilter] = React.useState<boolean>(true);

    const theme = useTheme();

    const dependentFilterReference: React.MutableRefObject<CloudPulseMetricsFilter> =
      React.useRef({});

    const checkAndUpdateDependentFilters = React.useCallback(
      (filterKey: string, value: FilterValueType) => {
        if (dashboard && dashboard.service_type) {
          const serviceTypeConfig = FILTER_CONFIG.get(dashboard.id);
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

    const handleTextFilterChange = React.useCallback(
      (
        port: string,
        label: string[],
        filterKey: string,
        savePref: boolean = false
      ) => {
        const portList = port
          .replace(/,$/, '')
          .split(',')
          .filter((p) => p !== '');
        emitFilterChangeByFilterKey(
          filterKey,
          portList,
          label.filter((l) => l !== ''),
          savePref,
          {
            [filterKey]: port,
          }
        );
      },
      [emitFilterChangeByFilterKey]
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
        filterKey: string,
        region: string | undefined,
        labels: string[],
        savePref: boolean = false
      ) => {
        const updatedPreferenceData =
          filterKey === REGION
            ? {
                [filterKey]: region,
                [RESOURCES]: undefined,
                [TAGS]: undefined,
              }
            : {
                [filterKey]: region,
              };
        emitFilterChangeByFilterKey(
          filterKey,
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
              shouldDisable: isError || isLoading,
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
              dependentFilters: dependentFilterReference.current,
              shouldDisable: isError || isLoading,
            },
            handleRegionChange
          );
        } else if (config.configuration.filterKey === LINODE_REGION) {
          return getRegionProperties(
            {
              config,
              dashboard,
              isServiceAnalyticsIntegration,
              preferences,
              dependentFilters: resource_ids?.length
                ? { [RESOURCE_ID]: resource_ids.map(String) }
                : dependentFilterReference.current,
              shouldDisable: isError || isLoading,
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
              shouldDisable: isError || isLoading,
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
                : (
                    dependentFilterReference.current[RESOURCE_ID] as string[]
                  )?.map((id: string) => Number(id)),
              shouldDisable: isError || isLoading,
            },
            handleNodeTypeChange
          );
        } else if (
          config.configuration.filterKey === PORT ||
          config.configuration.filterKey === INTERFACE_ID
        ) {
          return getTextFilterProperties(
            {
              config,
              dashboard,
              isServiceAnalyticsIntegration,
              preferences,
              dependentFilters: dependentFilterReference.current,
              shouldDisable: isError || isLoading,
            },
            handleTextFilterChange
          );
        } else {
          return getCustomSelectProperties(
            {
              config,
              dashboard,
              dependentFilters: resource_ids?.length
                ? { [RESOURCE_ID]: resource_ids }
                : dependentFilterReference.current,
              isServiceAnalyticsIntegration,
              preferences,
              shouldDisable: isError || isLoading,
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
        handleTextFilterChange,
        handleResourceChange,
        handleCustomSelectChange,
        isServiceAnalyticsIntegration,
        preferences,
        isError,
        isLoading,
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

      return filters.map((filter, index) => (
        <GridLegacy
          item
          key={filter.configuration.filterKey}
          md={4}
          sm={6}
          xs={12}
        >
          {RenderComponent({
            componentKey:
              filter.configuration.type !== undefined
                ? 'customSelect'
                : filter.configuration.filterKey,
            componentProps: { ...getProps(filter) },
            key: index + filter.configuration.filterKey,
          })}
        </GridLegacy>
      ));
    }, [dashboard, getProps, isServiceAnalyticsIntegration]);

    if (
      !dashboard ||
      !dashboard.service_type ||
      !FILTER_CONFIG.has(dashboard.id)
    ) {
      return <NullComponent />; // in this we don't want to show the filters at all
    }

    return (
      <GridLegacy
        container
        item
        sx={{
          m: 3,
          paddingBottom: isServiceAnalyticsIntegration ? 3 : 0,
        }}
        xs={12}
      >
        <GridLegacy
          item
          key="toggleFilter"
          sx={{
            m: 0,
            p: 0,
          }}
          xs={12}
        >
          <Button
            onClick={toggleShowFilter}
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
          >
            <Typography variant="h3">Filters</Typography>
          </Button>
        </GridLegacy>
        {isLoading ? (
          <GridLegacy
            alignItems="center"
            container
            display="flex"
            justifyContent="center"
          >
            <CircleProgress size="md" />
          </GridLegacy>
        ) : (
          <GridLegacy
            columnSpacing={theme.spacingFunction(16)}
            container
            item
            sx={{
              display: showFilter ? 'flex' : 'none',
              maxHeight: '184px',
              overflow: 'auto',
              pr: { sm: 0, xs: 2 },
              rowGap: theme.spacingFunction(16),
            }}
            xs={12}
          >
            <RenderFilters />
          </GridLegacy>
        )}
      </GridLegacy>
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
      newProps.preferences?.[DASHBOARD_ID] &&
    oldProps.isLoading === newProps.isLoading &&
    oldProps.isError === newProps.isError
  );
}
