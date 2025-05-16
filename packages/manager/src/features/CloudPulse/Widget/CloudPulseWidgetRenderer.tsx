import { GridLegacy, Paper } from '@mui/material';
import React from 'react';

import { CloudPulseErrorPlaceholder } from '../shared/CloudPulseErrorPlaceholder';
import { createObjectCopy } from '../Utils/utils';
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

interface WidgetProps {
  additionalFilters?: CloudPulseMetricsAdditionalFilters[];
  dashboard?: Dashboard | undefined;
  duration: DateTimeWithPreset;
  isJweTokenFetching: boolean;
  jweToken?: JWEToken | undefined;
  manualRefreshTimeStamp?: number;
  metricDefinitions: ResourcePage<MetricDefinition> | undefined;
  preferences?: AclpConfig;
  resourceList: CloudPulseResources[] | undefined;
  resources: string[];
  savePref?: boolean;
}

const renderPlaceHolder = (subtitle: string) => {
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
    } = props;

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
        serviceType: dashboard?.service_type ?? '',
        timeStamp: manualRefreshTimeStamp,
        unit: widget.unit ?? '%',
        widget: { ...widget, time_granularity: autoIntervalOption },
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
      if (pref) {
        return {
          ...widgetObj,
          aggregate_function:
            pref.aggregateFunction ?? widgetObj.aggregate_function,
          size: pref.size ?? widgetObj.size,
          time_granularity: {
            ...(pref.timeGranularity ?? autoIntervalOption),
          },
        };
      } else {
        return {
          ...widgetObj,
          time_granularity: autoIntervalOption,
        };
      }
    };

    if (!dashboard || !dashboard.widgets?.length) {
      return renderPlaceHolder(
        'No visualizations are available at this moment. Create Dashboards to list here.'
      );
    }

    if (
      !dashboard.service_type ||
      // eslint-disable-next-line sonarjs/no-inverted-boolean-check
      !(resources.length > 0) ||
      (!isJweTokenFetching && !jweToken?.token) ||
      !resourceList?.length
    ) {
      return renderPlaceHolder(
        'Select a dashboard and filters to visualize metrics.'
      );
    }

    // maintain a copy
    const newDashboard: Dashboard = createObjectCopy(dashboard)!;
    return (
      <GridLegacy columnSpacing={2} container item rowSpacing={2} xs={12}>
        {{ ...newDashboard }.widgets.map((widget, index) => {
          // check if widget metric definition is available or not
          if (widget) {
            // find the metric defintion of the widget label
            const availMetrics = metricDefinitions?.data.find(
              (availMetrics: MetricDefinition) =>
                widget.label === availMetrics.label
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
                isJweTokenFetching={isJweTokenFetching}
                resources={resourceList!}
                savePref={savePref}
              />
            );
          } else {
            return <React.Fragment key={index} />;
          }
        })}
      </GridLegacy>
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
    ];

    for (const key of keysToCompare) {
      if (oldProps[key] !== newProps[key]) {
        return false;
      }
    }

    return true;
  }
);
