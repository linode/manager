import { CircleProgress, ErrorState } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import {
  useCloudPulseJWEtokenQuery,
  useGetCloudPulseMetricDefinitionsByServiceType,
} from 'src/queries/cloudpulse/services';

import { useAclpPreference } from '../Utils/UserPreference';
import { RenderWidgets } from '../Widget/CloudPulseWidgetRenderer';

import type { CloudPulseMetricsAdditionalFilters } from '../Widget/CloudPulseWidget';
import type { DateTimeWithPreset, JWETokenPayLoad } from '@linode/api-v4';

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
  duration: DateTimeWithPreset;

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

  /**
   * Selected tags for the dashboard
   */
  tags?: string[];
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
      entity_ids: resources?.map((resource) => Number(resource)) ?? [],
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
    isFetching: isJweTokenFetching,
  } = useCloudPulseJWEtokenQuery(
    dashboard?.service_type,
    getJweTokenPayload(),
    Boolean(resources) && !isDashboardLoading && !isDashboardApiError
  );

  if (isDashboardApiError) {
    return renderErrorState('Failed to fetch the dashboard details.');
  }

  if (isResourcesApiError) {
    return renderErrorState('Failed to fetch Resources.');
  }

  if (isJweTokenError) {
    return renderErrorState('Failed to get the authentication token.');
  }

  if (isMetricDefinitionError) {
    return renderErrorState('Error loading the definitions of metrics.');
  }

  if (isMetricDefinitionLoading || isDashboardLoading || isResourcesLoading) {
    return <CircleProgress />;
  }

  return (
    <RenderWidgets
      additionalFilters={additionalFilters}
      dashboard={dashboard}
      duration={duration}
      isJweTokenFetching={isJweTokenFetching}
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
    <Grid>
      <ErrorState errorText={errorMessage} />
    </Grid>
  );
};
