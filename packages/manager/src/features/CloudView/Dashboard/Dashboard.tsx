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
import {
  useCloudViewDashboardByIdQuery,
  useCloudViewJWEtokenQuery,
} from 'src/queries/cloudview/dashboards';
import { useResourcesQuery } from 'src/queries/cloudview/resources';
import { useGetCloudViewMetricDefinitionsByServiceType } from 'src/queries/cloudview/services';

import { AclpWidget } from '../Models/CloudPulsePreferences';
import { FiltersObject } from '../Models/GlobalFilterProperties';
import {
  CloudViewWidget,
  CloudViewWidgetProperties,
} from '../Widget/CloudViewWidget';

export interface DashboardProperties {
  dashboardFilters: FiltersObject;
  dashboardId: number; // need to pass the dashboardId
  // on any change in dashboard
  onDashboardChange?: (dashboard: Dashboard) => void;

  widgetPreferences?: AclpWidget[]; // this is optional
}

export const CloudPulseDashboard = (props: DashboardProperties) => {
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
  } = useCloudViewDashboardByIdQuery(props.dashboardId!);

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
  // todo define a proper properties class

  const [
    cloudViewGraphProperties,
    setCloudViewGraphProperties,
  ] = React.useState<CloudViewWidgetProperties>(
    {} as CloudViewWidgetProperties
  );

  const dashboardRef = React.useRef(dashboard);

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
    dashboard? dashboard!.service_type: undefined!,
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
    setPrefferedWidgetPlan(graphProp.widget);
    graphProp.globalFilters = props.dashboardFilters;
    graphProp.unit = widget.unit ? widget.unit : '%';
    graphProp.ariaLabel = widget.label;
    graphProp.errorLabel = 'Error While loading data';

    return graphProp;
  };

  const setPrefferedWidgetPlan = (widgetObj: Widgets) => {
    if (props.widgetPreferences && props.widgetPreferences.length > 0) {
      for (const pref of props.widgetPreferences) {
        if (pref.label == widgetObj.label) {
          widgetObj.size = pref.size;
          widgetObj.aggregate_function = pref.aggregateFunction;
          //interval from pref
          widgetObj.time_granularity = {...pref.time_granularity};

          // update ref
          dashboardRef.current?.widgets.forEach((obj) => {
            if (obj.label == widgetObj.label) {
              obj.size = widgetObj.size;
              obj.aggregate_function = widgetObj.aggregate_function;
              obj.time_granularity = {...widgetObj.time_granularity};
            }
          });

          break;
        }
      }
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
        cloudViewGraphProperties.globalFilters?.region &&
        cloudViewGraphProperties.globalFilters?.resource &&
        cloudViewGraphProperties.globalFilters?.resource.length > 0 &&
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
                    key={index}
                    {...getCloudViewGraphProperties(element)}
                    authToken={jweToken?.token}
                    availableMetrics={availMetrics}
                    handleWidgetChange={handleWidgetChange}
                    resources={resources.data}
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
};
