import { CircleProgress, ErrorState } from '@linode/ui';
import { GridLegacy } from '@mui/material';
import React from 'react';

import { useCloudPulseDashboardByIdQuery } from 'src/queries/cloudpulse/dashboards';
import { useResourcesQuery } from 'src/queries/cloudpulse/resources';
import {
  useCloudPulseJWEtokenQuery,
  useGetCloudPulseMetricDefinitionsByServiceType,
} from 'src/queries/cloudpulse/services';

import { RESOURCE_FILTER_MAP } from '../Utils/constants';
import { useAclpPreference } from '../Utils/UserPreference';
import { getAssociatedEntityType } from '../Utils/utils';
import {
  renderPlaceHolder,
  RenderWidgets,
} from '../Widget/CloudPulseWidgetRenderer';

import type { CloudPulseMetricsAdditionalFilters } from '../Widget/CloudPulseWidget';
import type {
  CloudPulseServiceType,
  DateTimeWithPreset,
  JWETokenPayLoad,
} from '@linode/api-v4';

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
   * list of fields to group the metrics data by
   */
  groupBy: string[];

  /**
   * Selected linode region for the dashboard
   */
  linodeRegion?: string;

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
   * Selected service type for the dashboard
   */
  serviceType: CloudPulseServiceType;

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
    serviceType,
    groupBy,
    linodeRegion,
    region,
  } = props;

  const { preferences } = useAclpPreference();

  const getJweTokenPayload = (): JWETokenPayLoad => {
    if (serviceType === 'objectstorage') {
      return {};
    }
    return {
      entity_ids: resources?.map((resource) => Number(resource)) ?? [],
    };
  };

  const {
    data: dashboard,
    isError: isDashboardApiError,
    isLoading: isDashboardLoading,
  } = useCloudPulseDashboardByIdQuery(dashboardId);

  // Get the associated entity type for the dashboard
  const associatedEntityType = getAssociatedEntityType(dashboardId);

  const {
    data: resourceList,
    isError: isResourcesApiError,
    isLoading: isResourcesLoading,
  } = useResourcesQuery(
    Boolean(dashboard?.service_type),
    dashboard?.service_type,
    {},
    RESOURCE_FILTER_MAP[dashboard?.service_type ?? ''] ?? {},
    associatedEntityType
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
    return (
      <CircleProgress
        sx={(theme) => ({
          padding: theme.spacingFunction(16),
        })}
      />
    );
  }

  if (!dashboard) {
    return renderPlaceHolder(
      'No visualizations are available at this moment. Create Dashboards to list here.'
    );
  }
  return (
    <RenderWidgets
      additionalFilters={additionalFilters}
      dashboard={dashboard}
      duration={duration}
      groupBy={groupBy}
      isJweTokenFetching={isJweTokenFetching}
      jweToken={jweToken}
      linodeRegion={linodeRegion}
      manualRefreshTimeStamp={manualRefreshTimeStamp}
      metricDefinitions={metricDefinitions}
      preferences={preferences}
      region={region}
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
    <GridLegacy item xs>
      <ErrorState errorText={errorMessage} />
    </GridLegacy>
  );
};
