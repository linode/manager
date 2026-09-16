import { Box } from '@linode/ui';
import { GridLegacy, Paper } from '@mui/material';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { CloudPulseSingleCellWidget } from './CloudPulseSingleCellWidget';
import { CloudPulseWidget } from './CloudPulseWidget';
import {
  allIntervalOptions,
  autoIntervalOption,
  getInSeconds,
  getIntervalIndex,
} from './components/CloudPulseIntervalSelect';

import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type {
  CloudPulseMetricsAdditionalFilters,
  CloudPulseWidgetProperties,
} from './CloudPulseWidget';
import type {
  AclpConfig,
  Dashboard,
  DateTimeWithPreset,
  JWEToken,
  MetricDefinition,
  ResourcePage,
  Widgets,
} from '@linode/api-v4';

export interface WidgetProps {
  additionalFilters?: CloudPulseMetricsAdditionalFilters[];
  dashboard: Dashboard;
  duration: DateTimeWithPreset;
  groupBy: string[];
  /**
   * False when the widget group is mounted but hidden behind another tab.
   */
  isActiveGroup?: boolean;
  isJweTokenFetching: boolean;
  jweToken?: JWEToken | undefined;
  linodeRegion?: string;
  manualRefreshTimeStamp?: number;
  metricDefinitions: ResourcePage<MetricDefinition> | undefined;
  preferences?: AclpConfig;
  /**
   * Selected region for the widget
   */
  region?: string;
  resourceList: CloudPulseResources[] | undefined;
  resources: string[];
  savePref?: boolean;
  widgetGroup?: string;
  widgetGroups?: Map<string, Widgets[]>;
}

export const renderPlaceHolder = (subtitle: string) => {
  return (
    <GridLegacy item xs>
      <Paper>
        <CloudPulseErrorPlaceholder errorMessage={subtitle} />
      </Paper>
    </GridLegacy>
  );
};

export const RenderWidgets = React.memo(
  (props: WidgetProps) => {
    const {
      additionalFilters,
      dashboard,
      duration,
      isJweTokenFetching,
      jweToken,
      manualRefreshTimeStamp,
      metricDefinitions,
      preferences,
      resourceList,
      resources,
      savePref,
      groupBy,
      linodeRegion,
      region,
      widgetGroup,
      widgetGroups,
      isActiveGroup = true,
    } = props;

    const flags = useFlags();

    const getCloudPulseGraphProperties = (
      widget: Widgets
    ): CloudPulseWidgetProperties => {
      const graphProp: CloudPulseWidgetProperties = {
        additionalFilters,
        ariaLabel: widget.label,
        authToken: '',
        availableMetrics: undefined,
        duration,
        entityIds: resources,
        errorLabel: 'Error occurred while loading data.',
        isJweTokenFetching: false,
        resources: [],
        serviceType: dashboard.service_type,
        timeStamp: manualRefreshTimeStamp,
        unit: widget.unit ?? '%',
        dashboardId: dashboard.id,
        globalFilterGroupBy: groupBy,
        widget: {
          ...widget,
          time_granularity: autoIntervalOption,
          group_by:
            dashboard?.service_type === 'inference'
              ? widget.group_by
              : undefined,
        },
      };
      if (savePref) {
        graphProp.widget = setPreferredWidgetPlan(graphProp.widget);
      }
      return graphProp;
    };

    const getTimeGranularity = (scrapeInterval: string) => {
      const scrapeIntervalValue = getInSeconds(scrapeInterval);
      const index = getIntervalIndex(scrapeIntervalValue);
      return index < 0 ? allIntervalOptions[0] : allIntervalOptions[index];
    };

    const setPreferredWidgetPlan = (widgetObj: Widgets): Widgets => {
      const widgetPreferences = preferences?.widgets;
      const pref = widgetPreferences?.[widgetObj.label];
      if (pref && widgetObj.chart_type !== 'kpi') {
        return {
          ...widgetObj,
          aggregate_function:
            pref.aggregateFunction ?? widgetObj.aggregate_function,
          size: pref.size ?? widgetObj.size,
          time_granularity: {
            ...(pref.timeGranularity ?? autoIntervalOption),
          },
          group_by: pref.groupBy ?? widgetObj.group_by,
          filters: flags.aclp?.showWidgetDimensionFilters
            ? (pref.filters ?? widgetObj.filters)
            : widgetObj.filters,
        };
      } else {
        return {
          ...widgetObj,
          time_granularity: autoIntervalOption,
          group_by:
            dashboard?.service_type === 'inference'
              ? widgetObj.group_by
              : undefined,
        };
      }
    };

    if (!dashboard.widgets?.length) {
      return renderPlaceHolder(
        'No visualizations are available at this moment. Create Dashboards to list here.'
      );
    }

    if (
      !dashboard.service_type ||
      (!isJweTokenFetching && !jweToken?.token) ||
      !resourceList?.length
    ) {
      return renderPlaceHolder(
        'Select a dashboard and filters to visualize metrics.'
      );
    }

    // maintain a copy
    const widgetsToRender =
      widgetGroup && widgetGroups
        ? (widgetGroups.get(widgetGroup) ?? [])
        : (dashboard.widgets ?? []);

    const singleKpiWidgets = widgetsToRender.filter(
      (widget) => widget.chart_type === 'kpi'
    );
    return (
      <>
        <Box
          sx={{
            display: singleKpiWidgets.length ? 'grid' : 'none',
            // 100% width single column on mobile (xs); 300px fixed columns on tablet/desktop (sm+)
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, 249.5px)',
            },
            gap: 1,
            marginTop: 3,
          }}
        >
          {singleKpiWidgets.map((widget, index) => {
            if (widget) {
              const availMetrics = metricDefinitions?.data.find(
                (availMetrics: MetricDefinition) =>
                  widget.metric === availMetrics.metric
              );
              const cloudPulseWidgetProperties = getCloudPulseGraphProperties({
                ...widget,
              });

              if (
                availMetrics &&
                !cloudPulseWidgetProperties.widget.time_granularity
              ) {
                cloudPulseWidgetProperties.widget.time_granularity =
                  getTimeGranularity(availMetrics.scrape_interval);
              }
              return (
                <Box
                  data-pendo-id={`cloud-pulse-single-cell-widget-${widget.label}`}
                  data-qa-id={`cloud-pulse-single-cell-widget-${widget.label}`}
                  key={index}
                  sx={{
                    borderRadius: 1,
                    minWidth: 0,
                    width: '100%',
                    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <CloudPulseSingleCellWidget
                    key={widget.label}
                    {...cloudPulseWidgetProperties}
                    authToken={jweToken?.token}
                    isActiveGroup={isActiveGroup}
                    isJweTokenFetching={isJweTokenFetching}
                    linodeRegion={linodeRegion}
                    region={region}
                    resources={resourceList ?? []}
                    savePref={savePref}
                  />
                </Box>
              );
            } else {
              return <React.Fragment key={index} />;
            }
          })}
        </Box>
        <GridLegacy
          columnSpacing={2}
          container
          item
          marginTop={1}
          rowSpacing={2}
          xs={12}
        >
          {widgetsToRender.map((widget, index) => {
            // check if widget metric definition is available or not
            if (widget && widget.chart_type !== 'kpi') {
              // find the metric defintion of the widget label
              const availMetrics = metricDefinitions?.data.find(
                (availMetrics: MetricDefinition) =>
                  widget.metric === availMetrics.metric
              );
              const cloudPulseWidgetProperties = getCloudPulseGraphProperties({
                ...widget,
              });

              // metric definition is available but time_granularity is not present
              if (
                availMetrics &&
                !cloudPulseWidgetProperties.widget.time_granularity
              ) {
                cloudPulseWidgetProperties.widget.time_granularity =
                  getTimeGranularity(availMetrics.scrape_interval);
              }
              return (
                <CloudPulseWidget
                  key={widget.label}
                  {...cloudPulseWidgetProperties}
                  authToken={jweToken?.token}
                  availableMetrics={availMetrics}
                  isActiveGroup={isActiveGroup}
                  isJweTokenFetching={isJweTokenFetching}
                  linodeRegion={linodeRegion}
                  region={region}
                  resources={resourceList!}
                  savePref={savePref}
                  showNonTableLegend={
                    widget.legacy_legend === undefined
                      ? false
                      : !widget.legacy_legend
                  }
                />
              );
            } else {
              return <React.Fragment key={index} />;
            }
          })}
        </GridLegacy>
      </>
    );
  },
  (oldProps: WidgetProps, newProps: WidgetProps) => {
    const keysToCompare: (keyof WidgetProps)[] = [
      'dashboard',
      'manualRefreshTimeStamp',
      'jweToken',
      'duration',
      'resources',
      'additionalFilters',
      'groupBy',
      'widgetGroup',
      'widgetGroups',
      'isActiveGroup',
    ];

    for (const key of keysToCompare) {
      if (oldProps[key] !== newProps[key]) {
        return false;
      }
    }

    return true;
  }
);
