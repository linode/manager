import {
  AvailableMetrics,
  Dashboard,
  GetJWETokenPayload,
  Widgets,
} from '@linode/api-v4';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useCloudViewJWEtokenQuery } from 'src/queries/cloudview/dashboards';
import {
  useLinodeResourcesQuery,
  useLoadBalancerResourcesQuery,
} from 'src/queries/cloudview/resources';
import { useGetCloudViewMetricDefinitionsByServiceType } from 'src/queries/cloudview/services';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import {
  CloudViewWidget,
  CloudViewWidgetProperties,
} from '../Widget/CloudViewWidget';

export interface DashboardProperties {
  dashboard: Dashboard; // this will be done in upcoming sprint
  dashboardFilters: FiltersObject;

  // on any change in dashboard
  onDashboardChange?: (dashboard: Dashboard) => void;
}

export const CloudPulseDashboard = React.memo((props: DashboardProperties) => {
  const resourceOptions: any = {};
  // returns a list of resource IDs to be passed as part of getJWEToken call
  const getResourceIDsPayload = () => {
    const jweTokenPayload: GetJWETokenPayload = {
      resource_id: [],
    };
    jweTokenPayload.resource_id = resourceOptions[
      props?.dashboard?.service_type
    ]?.data?.map((resource: any) => resource.id);
    return jweTokenPayload;
  };

  ({ data: resourceOptions['linode'] } = useLinodeResourcesQuery(
    props?.dashboard?.service_type === 'linode'
  ));

  ({ data: resourceOptions['aclb'] } = useLoadBalancerResourcesQuery(
    props?.dashboard?.service_type === 'aclb'
  ));

  const {
    data: jweToken,
    isError: isJweTokenError,
    isSuccess,
  } = useCloudViewJWEtokenQuery(
    props?.dashboard?.service_type,
    getResourceIDsPayload(),
    resourceOptions[props?.dashboard?.service_type] ? true : false
  );

  // todo define a proper properties class

  const [
    cloudViewGraphProperties,
    setCloudViewGraphProperties,
  ] = React.useState<CloudViewWidgetProperties>(
    {} as CloudViewWidgetProperties
  );

  React.useEffect(() => {
    // set as dashboard filter
    setCloudViewGraphProperties({
      ...cloudViewGraphProperties,
      globalFilters: props.dashboardFilters,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dashboardFilters]); // execute every time when there is dashboardFilters change

  const StyledErrorState = styled(Placeholder, {
    label: 'StyledErrorState',
  })({
    height: '100%',
  });
  const {
    data: metricDefinitions,
    isError: isMetricDefinitionError,
    isLoading,
  } = useGetCloudViewMetricDefinitionsByServiceType(
    props.dashboard?.service_type,
    props.dashboard?.service_type !== undefined
  );

  if (isJweTokenError) {
    return (
      <Paper style={{ height: '100%' }}>
        <StyledErrorState title="Failed to get jwe token" />
      </Paper>
    );
  }
  if (props.dashboard?.service_type && isLoading) {
    return <CircleProgress />;
  }

  if (props.dashboard?.service_type && isMetricDefinitionError) {
    return <ErrorState errorText={'Error loading metric definitions'} />;
  }

  const getCloudViewGraphProperties = (widget: Widgets) => {
    const graphProp: CloudViewWidgetProperties = {} as CloudViewWidgetProperties;
    graphProp.widget = { ...widget };
    graphProp.globalFilters = props.dashboardFilters;
    graphProp.unit = widget.unit ? widget.unit : '%';
    graphProp.ariaLabel = widget.label;
    graphProp.errorLabel = 'Error While loading data';

    return graphProp;
  };

  const handleWidgetChange = (widget: Widgets) => {
    if (!props.onDashboardChange) {
      // service owners might not use this, so undefined check is needed here
      return;
    }

    const dashboard = { ...props.dashboard };

    const index = dashboard.widgets.findIndex(
      (obj) => obj.label === widget.label
    );

    dashboard.widgets[index] = { ...widget };

    props.onDashboardChange(dashboard);
  };

  const RenderWidgets = () => {
    if (props.dashboard != undefined) {
      if (
        props.dashboard?.service_type &&
        cloudViewGraphProperties.globalFilters?.region &&
        cloudViewGraphProperties.globalFilters?.resource &&
        cloudViewGraphProperties.globalFilters?.resource.length > 0 &&
        jweToken?.token &&
        resourceOptions[props.dashboard.service_type].data
      ) {
        return (
          <Grid columnSpacing={1.5} container rowSpacing={0} spacing={2}>
            {props.dashboard.widgets.map((element, index) => {
              if (element) {
                const availMetrics = metricDefinitions?.data.find(
                  (availMetrics: AvailableMetrics) =>
                    element.label === availMetrics.label
                );

                return (
                  <CloudViewWidget
                    key={index}
                    {...getCloudViewGraphProperties(element)}
                    resources={
                      resourceOptions[props.dashboard.service_type].data
                    }
                    authToken={jweToken?.token}
                    availableMetrics={availMetrics}
                    handleWidgetChange={handleWidgetChange}
                  />
                );
              } else {
                return <React.Fragment key={index}></React.Fragment>;
              }
            })}{' '}
          </Grid>
        );
      } else {
        return renderPlaceHolder(
          'Select Service Type, Region and Resource to visualize metrics'
        );
      }
    } else {
      return renderPlaceHolder(
        'No visualizations are available at this moment. Create Dashboards to list here.'
      );
    }
  };

  const StyledPlaceholder = styled(Placeholder, {
    label: 'StyledPlaceholder',
  })({
    flex: 'auto',
  });

  const renderPlaceHolder = (subtitle: string) => {
    return (
      <Paper>
        <StyledPlaceholder icon={CloudViewIcon} subtitle={subtitle} title="" />
      </Paper>
    );
  };

  return <RenderWidgets />;
});
