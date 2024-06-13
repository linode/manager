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
import { all_interval_options, getInSeconds, getIntervalIndex } from '../Widget/Components/IntervalSelectComponent';
import { removeObjectReference } from '../Utils/CloudPulseUtils';

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

  const dashboardRef = React.useRef(removeObjectReference(dashboard));

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
      dashboardRef.current?.widgets.forEach((obj : Widgets) => {
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

  const getTimeGranularity= (scrapeInterval : string)=>{
      const scrapeIntervalValue = getInSeconds(scrapeInterval);
      const index = getIntervalIndex(scrapeIntervalValue)
      return index < 0 ? all_interval_options[0] : all_interval_options[index];
  }

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
        dashboardRef.current = removeObjectReference(dashboard);
        const newDashboard : Dashboard = removeObjectReference(dashboard);
        return (
          <Grid columnSpacing={1.5} container rowSpacing={0} spacing={2}>
            {
                     
            {...newDashboard}.widgets.map((element, index) => {
              if (element) {
                const availMetrics = metricDefinitions?.data.find(
                  (availMetrics: AvailableMetrics) =>
                    element.label === availMetrics.label
                );
                const cloudViewWidgetProperties = getCloudViewGraphProperties({...element});
                
                if(availMetrics && !cloudViewWidgetProperties.widget.time_granularity){
                  cloudViewWidgetProperties.widget.time_granularity = getTimeGranularity(availMetrics.scrape_interval);
                }
                return (
                  <CloudViewWidget
                    key={element.label}
                    {...cloudViewWidgetProperties}
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
