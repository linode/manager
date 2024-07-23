import { Grid, Paper } from '@mui/material';
import React from 'react';

import CloudPulseIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import {
  useCloudPulseJWEtokenQuery,
  useGetCloudPulseMetricDefinitionsByServiceType,
} from 'src/queries/cloudpulse/services';

import { getUserPreferenceObject } from '../Utils/UserPreference';
import { createObjectCopy } from '../Utils/utils';
import { CloudPulseWidget } from '../Widget/CloudPulseWidget';
import {
  all_interval_options,
  getInSeconds,
  getIntervalIndex,
} from '../Widget/components/CloudPulseIntervalSelect';

import type { CloudPulseWidgetProperties } from '../Widget/CloudPulseWidget';
import type {
  AvailableMetrics,
  Dashboard,
  JWETokenPayLoad,
  TimeDuration,
  Widgets,
} from '@linode/api-v4';

export interface DashboardProperties {
  /**
   * Id of the selected dashboard
   */
  dashboardId: number;

  /**
   * time duration to fetch the metrics data in this widget
   */
  duration: TimeDuration;

  /**
   * optional timestamp to pass as react query param to forcefully re-fetch data
   */
  manualRefreshTimeStamp?: number | undefined;

  /**
   * Selected region for the dashboard
   */
  region?: string;

  /**
   * Selected resources for the dashboard
   */
  resources: string[];

  /**
   * optional flag to check whether changes should be stored in preferences or not (in case this component is reused)
   */
  savePref?: boolean;
}

export const CloudPulseDashboard = (props: DashboardProperties) => {
  const {
    dashboardId,
    duration,
    manualRefreshTimeStamp,
    resources,
    savePref,
  } = props;

  const getJweTokenPayload = (): JWETokenPayLoad => {
    return {
      resource_id: resourceList?.map((resource) => String(resource.id)) ?? [],
    };
  };

  const getCloudPulseGraphProperties = (
    widget: Widgets
  ): CloudPulseWidgetProperties => {
    const graphProp: CloudPulseWidgetProperties = {
      ariaLabel: widget.label,
      authToken: '',
      availableMetrics: undefined,
      duration,
      errorLabel: 'Error While Loading Data',
      resourceIds: resources,
      resources: [],
      serviceType: dashboard?.service_type ?? '',
      timeStamp: manualRefreshTimeStamp,
      unit: widget.unit ?? '%',
      widget: { ...widget },
    };
    if (savePref) {
      setPreferredWidgetPlan(graphProp.widget);
    }
    return graphProp;
  };

  const setPreferredWidgetPlan = (widgetObj: Widgets) => {
    const widgetPreferences = getUserPreferenceObject().widgets;
    const pref = widgetPreferences?.[widgetObj.label];
    if (pref) {
      Object.assign(widgetObj, {
        aggregate_function: pref.aggregateFunction,
        size: pref.size,
        time_granularity: { ...pref.timeGranularity },
      });
    }
  };

  const getTimeGranularity = (scrapeInterval: string) => {
    const scrapeIntervalValue = getInSeconds(scrapeInterval);
    const index = getIntervalIndex(scrapeIntervalValue);
    return index < 0 ? all_interval_options[0] : all_interval_options[index];
  };

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
  } = useCloudPulseDashboardByIdQuery(dashboardId);

  const {
    data: resourceList,
    isLoading: isResourcesLoading,
  } = useResourcesQuery(
    Boolean(dashboard?.service_type),
    dashboard?.service_type,
    {},
    {}
  );

  const {
    data: metricDefinitions,
    isError: isMetricDefinitionError,
    isLoading: isMetricDefinitionLoading,
  } = useGetCloudPulseMetricDefinitionsByServiceType(
    dashboard?.service_type,
    Boolean(dashboard?.service_type)
  );

  const {
    data: jweToken,
    isError: isJweTokenError,
  } = useCloudPulseJWEtokenQuery(
    dashboard?.service_type,
    getJweTokenPayload(),
    Boolean(resourceList)
  );

  if (isJweTokenError) {
    return (
      <Grid item xs>
        <ErrorState errorText="Failed to get jwe token" />
      </Grid>
    );
  }

  if (isMetricDefinitionLoading || isDashboardLoading || isResourcesLoading) {
    return <CircleProgress />;
  }

  if (isMetricDefinitionError) {
    return <ErrorState errorText={'Error loading metric definitions'} />;
  }

  const RenderWidgets = () => {
    if (!dashboard || Boolean(dashboard.widgets?.length)) {
      return renderPlaceHolder(
        'No visualizations are available at this moment. Create Dashboards to list here.'
      );
    }

    if (
      !dashboard.service_type ||
      !Boolean(resources.length > 0) ||
      !jweToken?.token ||
      !Boolean(resourceList?.length)
    ) {
      return renderPlaceHolder(
        'Select Dashboard, Region and Resource to visualize metrics'
      );
    }

    // maintain a copy
    const newDashboard: Dashboard = createObjectCopy(dashboard)!;
    return (
      <Grid columnSpacing={1} container item rowSpacing={2} xs={12}>
        {{ ...newDashboard }.widgets.map((widget, index) => {
          // check if widget metric definition is available or not
          if (widget) {
            // find the metric defintion of the widget label
            const availMetrics = metricDefinitions?.data.find(
              (availMetrics: AvailableMetrics) =>
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
              cloudPulseWidgetProperties.widget.time_granularity = getTimeGranularity(
                availMetrics.scrape_interval
              );
            }
            return (
              <CloudPulseWidget
                key={widget.label}
                {...cloudPulseWidgetProperties}
                authToken={jweToken?.token}
                availableMetrics={availMetrics}
                resources={resourceList!}
                savePref={savePref}
              />
            );
          } else {
            return <React.Fragment key={index}></React.Fragment>;
          }
        })}
      </Grid>
    );
  };

  const renderPlaceHolder = (subtitle: string) => {
    return (
      <Grid item xs>
        <Paper>
          <Placeholder icon={CloudPulseIcon} subtitle={subtitle} title="" />
        </Paper>
      </Grid>
    );
  };

  return <RenderWidgets />;
};
