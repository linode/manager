import {
  AvailableMetrics,
  Dashboard,
  GetJWETokenPayload,
  TimeDuration,
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
import {
  useCloudViewDashboardByIdQuery,
  useCloudViewJWEtokenQuery,
} from 'src/queries/cloudview/dashboards';
import { useResourcesQuery } from 'src/queries/cloudview/resources';
import { useGetCloudViewMetricDefinitionsByServiceType } from 'src/queries/cloudview/services';

import {
  CloudViewWidget,
  CloudViewWidgetProperties,
} from '../Widget/CloudViewWidget';
import { fetchUserPrefObject } from '../Utils/UserPreference';

export interface DashboardProperties {
  dashboardId: number; // need to pass the dashboardId
  duration: TimeDuration;

  manualRefreshTimeStamp?: number | undefined;
  // on any change in dashboard
  onDashboardChange?: (dashboard: Dashboard) => void;
  region?: string;
  resources: string[];
  // widgetPreferences?: AclpWidget[]; // this is optional
  savePref? : boolean | undefined;
}

export const CloudPulseDashboard = React.memo((props: DashboardProperties) => {
  // const resourceOptions: any = {};

  // returns a list of resource IDs to be passed as part of getJWEToken call
  const getResourceIDsPayload = () => {
    const jweTokenPayload: GetJWETokenPayload = {
      resource_id: [],
    };
    jweTokenPayload.resource_id = resources
      ? resources.data?.map((resource: any) => resource.id)
      : undefined!;

    return jweTokenPayload;
  };
  const {
    data: dashboard,
    isError: isDashboardFetchError,
    isSuccess: isDashboardSuccess,
  } = useCloudViewDashboardByIdQuery(props.dashboardId!, props.savePref);

  const { data: resources } = useResourcesQuery(
    dashboard && dashboard.service_type ? true : false,
    {},
    {},
    dashboard ? dashboard.service_type : undefined!
  );

  const {
    data: jweToken,
    isError: isJweTokenError,
    isSuccess,
  } = useCloudViewJWEtokenQuery(
    dashboard ? dashboard.service_type! : undefined!,
    getResourceIDsPayload(),
    resources && dashboard ? true : false
  );

  const dashboardRef = React.useRef(dashboard);

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
    dashboard ? dashboard!.service_type : undefined!,
    dashboard && dashboard!.service_type !== undefined ? true : false
  );

  if (isJweTokenError) {
    return (
      <Paper style={{ height: '100%' }}>
        <StyledErrorState title="Failed to get jwe token" />
      </Paper>
    );
  }
  if (dashboard && dashboard.service_type && isLoading) {
    return <CircleProgress />;
  }

  if (dashboard && dashboard.service_type && isMetricDefinitionError) {
    return <ErrorState errorText={'Error loading metric definitions'} />;
  }

  const getCloudViewGraphProperties = (widget: Widgets) => {
    const graphProp: CloudViewWidgetProperties = {} as CloudViewWidgetProperties;
    graphProp.widget = { ...widget };
    if(props.savePref){
      setPrefferedWidgetPlan(graphProp.widget);
    }
    graphProp.serviceType = dashboard?.service_type ?? '';
    graphProp.resourceIds = props.resources;
    graphProp.duration = props.duration;
    graphProp.unit = widget.unit ? widget.unit : '%';
    graphProp.ariaLabel = widget.label;
    graphProp.errorLabel = 'Error While loading data';
    graphProp.timeStamp = props.manualRefreshTimeStamp!;

    return graphProp;
  };

  const setPrefferedWidgetPlan = (widgetObj: Widgets) => {
    const widgetPreferences = fetchUserPrefObject().widgets;
    if (widgetPreferences && widgetPreferences[widgetObj.label]) {
      const pref = widgetPreferences[widgetObj.label];
      widgetObj.size = pref.size;
      widgetObj.aggregate_function = pref.aggregateFunction;
      // interval from pref
      widgetObj.time_granularity = { ...pref.time_granularity };

      // update ref
      dashboardRef.current?.widgets.forEach((obj) => {
        if (obj.label == widgetObj.label) {
          obj.size = widgetObj.size;
          obj.aggregate_function = widgetObj.aggregate_function;
          obj.time_granularity = { ...widgetObj.time_granularity };
        }
      });
    }
  };

  const handleWidgetChange = (widget: Widgets) => {
    if (dashboard && props.onDashboardChange) {
      const dashboardObj = { ...dashboardRef.current } as Dashboard;

      if (dashboardObj) {
        const index = dashboardObj.widgets!.findIndex(
          (obj) => obj.label === widget.label
        );

        dashboardObj.widgets![index] = { ...widget };

        props.onDashboardChange({ ...dashboardObj });
      }
    }
  };

  const RenderWidgets = () => {
    if (dashboard != undefined) {
      if (
        dashboard.service_type &&
        props.resources &&
        props.resources.length > 0 &&
        jweToken?.token &&
        resources?.data
      ) {
        // maintain a copy
        dashboardRef.current = dashboard;
        return (
          <Grid columnSpacing={1.5} container rowSpacing={0} spacing={2}>
            {dashboard.widgets.map((element, index) => {
              if (element) {
                const availMetrics = metricDefinitions?.data.find(
                  (availMetrics: AvailableMetrics) =>
                    element.label === availMetrics.label
                );

                return (
                  <CloudViewWidget
                    key={element.label}
                    {...getCloudViewGraphProperties(element)}
                    authToken={jweToken?.token}
                    availableMetrics={availMetrics}
                    handleWidgetChange={handleWidgetChange}
                    resources={resources.data}
                    savePref = {props.savePref}
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

  return (
    <>
      <RenderWidgets />;
    </>
  );
});

// function compareProps(
//   prevProps: DashboardProperties,
//   newProps: DashboardProperties
// ) {
//   // this component should re-render only if the following properties changes
//   return (
//     prevProps.dashboardId == newProps.dashboardId &&
//     prevProps.duration == newProps.duration &&
//     prevProps.region == newProps.region &&
//     prevProps.resources == newProps.resources &&
//     prevProps.manualRefreshTimeStamp == newProps.manualRefreshTimeStamp
//   );
// }
