import { useProfile, useRegionsQuery } from '@linode/queries';
import { Box, Paper, Typography } from '@linode/ui';
import { GridLegacy, Stack, useTheme } from '@mui/material';
import { DateTime } from 'luxon';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useCloudPulseMetricsQuery } from 'src/queries/cloudpulse/metrics';

import { useBlockStorageFetchOptions } from '../Alerts/CreateAlert/Criteria/DimensionFilterValue/useBlockStorageFetchOptions';
import { useFirewallFetchOptions } from '../Alerts/CreateAlert/Criteria/DimensionFilterValue/useFirewallFetchOptions';
import { WidgetFilterGroupByRenderer } from '../GroupBy/WidgetFilterGroupByRenderer';
import {
  generateGraphData,
  getCloudPulseMetricRequest,
} from '../Utils/CloudPulseWidgetUtils';
import {
  AGGREGATE_FUNCTION,
  GROUP_BY,
  SIZE,
  TIME_GRANULARITY,
} from '../Utils/constants';
import {
  constructAdditionalRequestFilters,
  constructWidgetDimensionFilters,
} from '../Utils/FilterBuilder';
import { FILTER_CONFIG } from '../Utils/FilterConfig';
import { generateCurrentUnit } from '../Utils/unitConversion';
import { useAclpPreference } from '../Utils/UserPreference';
import {
  convertStringToCamelCasesWithSpaces,
  getFilteredDimensions,
} from '../Utils/utils';
import { CloudPulseAggregateFunction } from './components/CloudPulseAggregateFunction';
import { CloudPulseIntervalSelect } from './components/CloudPulseIntervalSelect';
import { CloudPulseLineGraph } from './components/CloudPulseLineGraph';
import { CloudPulseDimensionFiltersSelect } from './components/DimensionFilters/CloudPulseDimensionFiltersSelect';
import { ZoomIcon } from './components/Zoomer';

import type { FilterValueType } from '../Dashboard/CloudPulseDashboardLanding';
import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { MetricsDimensionFilter } from './components/DimensionFilters/types';
import type {
  CloudPulseServiceType,
  DateTimeWithPreset,
  Filters,
  MetricDefinition,
  TimeGranularity,
  Widgets,
} from '@linode/api-v4';
import type { Metrics } from '@linode/utilities';
import type {
  AreaProps,
  ChartVariant,
  DataSet,
} from 'src/components/AreaChart/AreaChart';
import type { MetricsDisplayRow } from 'src/components/LineGraph/MetricsDisplay';

export interface CloudPulseWidgetProperties {
  /**
   * Apart from above explicit filters, any additional filters for metrics endpoint will go here
   */
  additionalFilters?: CloudPulseMetricsAdditionalFilters[];

  /**
   * Aria label for this widget
   */
  ariaLabel?: string;

  /**
   * token to fetch metrics data
   */
  authToken?: string;

  /**
   * metrics defined of this widget
   */
  availableMetrics: MetricDefinition | undefined;

  /**
   * ID of the selected dashboard
   */
  dashboardId: number;

  /**
   * time duration to fetch the metrics data in this widget
   */
  duration: DateTimeWithPreset;

  /**
   * entity ids selected by user to show metrics for
   */
  entityIds: string[];

  /**
   * Any error to be shown in this widget
   */
  errorLabel?: string;

  /**
   * Group by selected on global filter
   */
  globalFilterGroupBy: string[];

  /**
   * Jwe token fetching status check
   */
  isJweTokenFetching: boolean;

  /**
   * Selected linode region for the widget
   */
  linodeRegion?: string;

  /**
   * Selected region for the widget
   */
  region?: string;

  /**
   * List of resources available of selected service type
   */
  resources: CloudPulseResources[];

  /**
   * optional flag to check whether changes should be stored in preferences or not (in case this component is reused)
   */
  savePref?: boolean;

  /**
   * Service type selected by user
   */
  serviceType: CloudPulseServiceType;

  /**
   * optional timestamp to pass as react query param to forcefully re-fetch data
   */
  timeStamp?: number;

  /**
   * this should come from dashboard, which maintains map for service types in a separate API call
   */
  unit: string;
  /**
   * color index to be selected from available them if not theme is provided by user
   */
  useColorIndex?: number;

  /**
   * this comes from dashboard, has inbuilt metrics, agg_func,group_by,filters,gridsize etc , also helpful in publishing any changes
   */
  widget: Widgets;
}

export interface CloudPulseMetricsAdditionalFilters {
  filterKey: string;
  filterValue: FilterValueType;
}

export interface LegendRow {
  data: Metrics;
  format: (value: number) => {};
  legendColor: string;
  legendTitle: string;
}

export const CloudPulseWidget = (props: CloudPulseWidgetProperties) => {
  const { updateWidgetPreference: updatePreferences } = useAclpPreference();
  const { data: profile } = useProfile();

  const [widget, setWidget] = React.useState<Widgets>({ ...props.widget });
  const [groupBy, setGroupBy] = React.useState<string[] | undefined>(
    props.widget.group_by
  );
  const theme = useTheme();

  const {
    globalFilterGroupBy,
    additionalFilters,
    ariaLabel,
    authToken,
    availableMetrics,
    duration,
    entityIds,
    isJweTokenFetching,
    resources,
    savePref,
    serviceType,
    timeStamp,
    unit,
    widget: widgetProp,
    linodeRegion,
    dashboardId,
    region,
  } = props;
  const [dimensionFilters, setDimensionFilters] = React.useState<
    MetricsDimensionFilter[] | undefined
  >(widget.filters);

  const timezone =
    duration.timeZone ?? profile?.timezone ?? DateTime.local().zoneName;

  const flags = useFlags();
  const scaledWidgetUnit = React.useRef(generateCurrentUnit(unit));

  const jweTokenExpiryError = 'Token expired';
  const { data: regions } = useRegionsQuery();
  const linodesFetch = useFirewallFetchOptions({
    dimensionLabel: 'linode_id',
    type: 'metrics',
    entities: entityIds,
    regions: regions?.filter((region) => region.id === linodeRegion) ?? [],
    scope: 'entity',
    serviceType,
    associatedEntityType: FILTER_CONFIG.get(dashboardId)?.associatedEntityType,
  });
  const vpcFetch = useFirewallFetchOptions({
    dimensionLabel: 'vpc_subnet_id',
    type: 'metrics',
    entities: entityIds,
    regions: regions?.filter((region) => region.id === linodeRegion) ?? [],
    scope: 'entity',
    serviceType,
    associatedEntityType: FILTER_CONFIG.get(dashboardId)?.associatedEntityType,
  });
  const linodeFromVolumes = useBlockStorageFetchOptions({
    entities: entityIds,
    dimensionLabel: 'linode_id',
    regions: regions?.filter(({ id }) => id === region) ?? [],
    type: 'metrics',
    scope: 'entity',
    serviceType,
  });
  // Determine which fetch object is relevant for linodes
  const activeLinodeFetch =
    serviceType === 'blockstorage' ? linodeFromVolumes : linodesFetch;

  // Combine loading states
  const isLoadingFilters = activeLinodeFetch.isLoading || vpcFetch.isLoading;

  const filteredSelections = React.useMemo(() => {
    if (isLoadingFilters) {
      return dimensionFilters ?? [];
    }

    return getFilteredDimensions({
      dimensions: availableMetrics?.dimensions ?? [],
      linodes: activeLinodeFetch,
      vpcs: vpcFetch,
      dimensionFilters,
    });
  }, [
    activeLinodeFetch,
    availableMetrics?.dimensions,
    dimensionFilters,
    isLoadingFilters,
    vpcFetch,
  ]);

  const convertToFilters = (
    selectedFilters: MetricsDimensionFilter[]
  ): Filters[] => {
    const dimensionFilters: Filters[] = [];
    for (const filter of selectedFilters) {
      if (filter.value && filter.dimension_label && filter.operator) {
        dimensionFilters.push({
          dimension_label: filter.dimension_label,
          operator: filter.operator,
          value: filter.value,
        });
      }
    }

    return dimensionFilters;
  };

  const filters: Filters[] | undefined = React.useMemo(() => {
    return additionalFilters?.length ||
      widget?.filters?.length ||
      dimensionFilters?.length
      ? [
          ...constructAdditionalRequestFilters(additionalFilters ?? []),
          ...(constructWidgetDimensionFilters(filteredSelections) ?? []), // dashboard level filters followed by widget filters
        ]
      : undefined;
  }, [
    additionalFilters,
    widget?.filters?.length,
    dimensionFilters?.length,
    filteredSelections,
  ]);

  /**
   *
   * @param zoomInValue: True if zoom in clicked &  False if zoom out icon clicked
   */
  const handleZoomToggle = React.useCallback((zoomInValue: boolean) => {
    if (savePref) {
      updatePreferences(widget.label, {
        [SIZE]: zoomInValue ? 12 : 6,
      });
    }

    setWidget((currentWidget: Widgets) => {
      return {
        ...currentWidget,
        size: zoomInValue ? 12 : 6,
      };
    });
  }, []);

  /**
   *
   * @param aggregateValue: aggregate function select from AggregateFunction component
   */
  const handleAggregateFunctionChange = React.useCallback(
    (aggregateValue: string) => {
      // To avoid updation if user again selected the currently selected value from drop down.

      if (savePref) {
        updatePreferences(widget.label, {
          [AGGREGATE_FUNCTION]: aggregateValue,
        });
      }

      setWidget((currentWidget: Widgets) => {
        return {
          ...currentWidget,
          aggregate_function: aggregateValue,
        };
      });
    },
    []
  );

  /**
   *
   * @param intervalValue : TimeGranularity object selected from the interval select
   */
  const handleIntervalChange = React.useCallback(
    (intervalValue: TimeGranularity) => {
      if (savePref) {
        updatePreferences(widget.label, {
          [TIME_GRANULARITY]: { ...intervalValue },
        });
      }

      setWidget((currentWidget: Widgets) => {
        return {
          ...currentWidget,
          time_granularity: { ...intervalValue },
        };
      });
    },
    []
  );
  const handleGroupByChange = React.useCallback(
    (selectedGroupBy: string[], savePreferences?: boolean) => {
      if (savePreferences) {
        updatePreferences(widget.label, {
          [GROUP_BY]: selectedGroupBy,
        });
      }
      setGroupBy(selectedGroupBy);
    },
    []
  );

  const handleDimensionFiltersChange = React.useCallback(
    (selectedFilters: MetricsDimensionFilter[]) => {
      if (savePref) {
        updatePreferences(widget.label, {
          filters: convertToFilters(selectedFilters),
        });
      }
      setDimensionFilters(selectedFilters);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const {
    data: metricsList,
    error,
    isLoading,
    status,
  } = useCloudPulseMetricsQuery(
    serviceType,
    {
      ...getCloudPulseMetricRequest({
        duration,
        entityIds,
        resources,
        widget,
        groupBy: [...globalFilterGroupBy, ...(groupBy ?? [])],
        linodeRegion,
        region,
        serviceType,
      }),
      filters, // any additional dimension filters will be constructed and passed here
    },
    {
      authToken,
      isFlags: Boolean(flags && !isJweTokenFetching),
      label: widget.label,
      timeStamp,
      url: flags.aclpReadEndpoint!,
    }
  );
  let data: DataSet[] = [];

  let legendRows: MetricsDisplayRow[] = [];
  let currentUnit = unit;
  let areas: AreaProps[] = [];
  const variant: ChartVariant = widget.chart_type;
  if (!isLoading && metricsList) {
    const generatedData = generateGraphData({
      label: widget.label,
      metricsList,
      resources,
      status,
      unit,
      serviceType,
      groupBy: [...globalFilterGroupBy, ...(groupBy ?? [])],
      metricLabel: availableMetrics?.label,
    });

    data = generatedData.dimensions;
    legendRows = generatedData.legendRowsData;
    scaledWidgetUnit.current = generatedData.unit; // here state doesn't matter, as this is always the latest re-render
    currentUnit = generatedData.unit;
    areas = generatedData.areas;
  }

  const metricsApiCallError = error?.[0]?.reason;
  const start = DateTime.fromISO(duration.start, { zone: 'GMT' });
  const end = DateTime.fromISO(duration.end, { zone: 'GMT' });
  const hours = end.diff(start, 'hours').hours;
  const tickFormat = hours <= 24 ? 'hh:mm a' : 'LLL dd';
  const excludeDimensionFilters = React.useMemo(() => {
    return (
      FILTER_CONFIG.get(dashboardId)
        ?.filters.filter(
          ({ configuration }) => configuration.dimensionKey !== undefined
        )
        .map(({ configuration }) => configuration.dimensionKey) ?? []
    );
  }, [dashboardId]);
  const filteredDimensions = React.useMemo(() => {
    return availableMetrics?.dimensions.filter(
      ({ dimension_label: dimensionLabel }) =>
        !excludeDimensionFilters.includes(dimensionLabel)
    );
  }, [availableMetrics?.dimensions, excludeDimensionFilters]);

  React.useEffect(() => {
    if (
      filteredSelections.length !== (dimensionFilters?.length ?? 0) &&
      !linodesFetch.isLoading &&
      !vpcFetch.isLoading &&
      !linodeFromVolumes.isLoading
    ) {
      handleDimensionFiltersChange(filteredSelections);
    }
  }, [
    filteredSelections,
    dimensionFilters,
    handleDimensionFiltersChange,
    linodesFetch.isLoading,
    vpcFetch.isLoading,
    linodeFromVolumes.isLoading,
  ]);
  return (
    <GridLegacy container item lg={widget.size} xs={12}>
      <Stack
        spacing={2}
        sx={{
          flexGrow: 1,
        }}
      >
        <Paper
          data-qa-widget={convertStringToCamelCasesWithSpaces(widget.label)}
          sx={{ flexGrow: 1 }}
        >
          <Stack
            direction={{ sm: 'row' }}
            sx={{
              alignItems: 'center',
              gap: { sm: 0, xs: 2 },
              justifyContent: { sm: 'space-between' },
              marginBottom: 1,
              padding: 1,
            }}
          >
            <Typography flex={{ sm: 2, xs: 0 }} marginLeft={1} variant="h2">
              {convertStringToCamelCasesWithSpaces(widget.label)} (
              {scaledWidgetUnit.current}
              {unit.endsWith('ps') && !scaledWidgetUnit.current.endsWith('ps')
                ? '/s'
                : ''}
              )
            </Typography>
            <Stack
              direction={{ sm: 'row' }}
              sx={{
                flex: { sm: 3, xs: 0 },
                justifyContent: 'end',
                alignItems: 'center',
                gap: 2,
                maxHeight: `calc(${theme.spacing(10)} + 5px)`,
                overflow: 'auto',
                width: { sm: 'inherit', xs: '100%' },
              }}
            >
              {availableMetrics?.scrape_interval && (
                <CloudPulseIntervalSelect
                  defaultInterval={widgetProp?.time_granularity}
                  onIntervalChange={handleIntervalChange}
                  scrapeInterval={availableMetrics.scrape_interval}
                />
              )}
              {Boolean(
                availableMetrics?.available_aggregate_functions?.length
              ) && (
                <CloudPulseAggregateFunction
                  availableAggregateFunctions={
                    availableMetrics!.available_aggregate_functions
                  }
                  defaultAggregateFunction={widgetProp?.aggregate_function}
                  onAggregateFuncChange={handleAggregateFunctionChange}
                />
              )}
              <Box sx={{ display: 'flex', gap: 2 }}>
                {flags.aclp?.showWidgetDimensionFilters && (
                  <CloudPulseDimensionFiltersSelect
                    dimensionOptions={filteredDimensions ?? []}
                    drawerLabel={availableMetrics?.label ?? ''}
                    handleSelectionChange={handleDimensionFiltersChange}
                    selectedDimensions={filteredSelections}
                    selectedEntities={entityIds}
                    selectedRegions={linodeRegion ? [linodeRegion] : undefined}
                    serviceType={serviceType}
                  />
                )}
                <WidgetFilterGroupByRenderer
                  dashboardId={dashboardId}
                  handleChange={handleGroupByChange}
                  label={widget.label}
                  metric={widget.metric}
                  preferenceGroupBy={groupBy}
                  savePreferences={savePref}
                  serviceType={serviceType}
                />
                <ZoomIcon
                  handleZoomToggle={handleZoomToggle}
                  zoomIn={widget?.size === 12}
                />
              </Box>
            </Stack>
          </Stack>
          <CloudPulseLineGraph
            areas={areas}
            ariaLabel={ariaLabel ? ariaLabel : ''}
            data={data}
            dotRadius={1.5}
            error={
              status === 'error' && metricsApiCallError !== jweTokenExpiryError // show the error only if the error is not related to token expiration
                ? (metricsApiCallError ?? 'Error while rendering graph')
                : undefined
            }
            height={424}
            legendRows={legendRows}
            loading={
              isLoading ||
              metricsApiCallError === jweTokenExpiryError ||
              isJweTokenFetching
            } // keep loading until we are trying to fetch the refresh token
            showDot
            showLegend={data.length !== 0}
            timezone={timezone}
            unit={`${currentUnit}${unit.endsWith('ps') ? '/s' : ''}`}
            variant={variant}
            xAxis={{ tickFormat, tickGap: 60 }}
          />
        </Paper>
      </Stack>
    </GridLegacy>
  );
};
