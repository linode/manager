import { Grid } from '@mui/material';
import React from 'react';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import {
  useCloudPulseJWEtokenQuery,
  useGetCloudPulseMetricDefinitionsByServiceType,
} from 'src/queries/cloudpulse/services';

import { useAclpPreference } from '../Utils/UserPreference';
import { RenderWidgets } from '../Widget/CloudPulseWidgetRenderer';

import type { CloudPulseMetricsAdditionalFilters } from '../Widget/CloudPulseWidget';
import type { JWETokenPayLoad, TimeDuration } from '@linode/api-v4';

export interface DashboardProperties {
  /**
   * Apart from above explicit filters, any additional filters for metrics endpoint will go here
   */
  additionalFilters?: CloudPulseMetricsAdditionalFilters[];

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
  manualRefreshTimeStamp?: number;

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
    additionalFilters,
    dashboardId,
    duration,
    manualRefreshTimeStamp,
    resources,
    savePref,
  } = props;

  const { preferences } = useAclpPreference();

  const getJweTokenPayload = (): JWETokenPayLoad => {
    return {
      resource_ids: resourceList?.map((resource) => Number(resource.id)) ?? [],
    };
  };

  const {
    data: dashboard,
    isError: isDashboardApiError,
    isLoading: isDashboardLoading,
  } = useCloudPulseDashboardByIdQuery(dashboardId);

  const {
    data: resourceList,
    isError: isResourcesApiError,
    isLoading: isResourcesLoading,
  } = useResourcesQuery(
    Boolean(dashboard?.service_type),
    dashboard?.service_type,
    {},
    dashboard?.service_type === 'dbaas' ? { platform: 'rdbms-default' } : {}
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
    isLoading: isJweTokenLoading,
  } = useCloudPulseJWEtokenQuery(
    dashboard?.service_type,
    getJweTokenPayload(),
    Boolean(resourceList)
  );

  if (isDashboardApiError) {
    return renderErrorState('Failed to fetch the dashboard details');
  }

  if (isResourcesApiError) {
    return renderErrorState('Failed to fetch Resources');
  }

  if (isJweTokenError) {
    return renderErrorState('Failed to get jwe token');
  }

  if (isMetricDefinitionError) {
    return renderErrorState('Error loading metric definitions');
  }

  if (
    isMetricDefinitionLoading ||
    isDashboardLoading ||
    isResourcesLoading ||
    isJweTokenLoading
  ) {
    return <CircleProgress />;
  }

  return (
    <RenderWidgets
      additionalFilters={additionalFilters}
      dashboard={dashboard}
      duration={duration}
      jweToken={jweToken}
      manualRefreshTimeStamp={manualRefreshTimeStamp}
      metricDefinitions={metricDefinitions}
      preferences={preferences}
      resourceList={resourceList}
      resources={resources}
      savePref={savePref}
    />
  );
};

/**
 * @param errorMessage The error message to be displayed
 * @returns The error state component with error message passed
 */
const renderErrorState = (errorMessage: string) => {
  return (
    <Grid item xs>
      <ErrorState errorText={errorMessage} />
    </Grid>
  );
};
