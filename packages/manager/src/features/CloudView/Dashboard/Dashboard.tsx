import { Dashboard, GetJWETokenPayload, Widgets } from '@linode/api-v4';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import {
  useCloudViewDashboardByIdQuery,
  useCloudViewJWEtokenQuery,
} from 'src/queries/cloudview/dashboards';
import { useResourcesQuery } from 'src/queries/cloudview/resources';

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
    dashboard ? dashboard.service_type : undefined!,
    dashboard && dashboard.service_type ? true : false
  );

  const { data: jweToken, isError, isSuccess } = useCloudViewJWEtokenQuery(
    dashboard ? dashboard.service_type! : undefined!,
    getResourceIDsPayload(),
    resources ? true : false
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

  if (isError) {
    return (
      <Paper style={{ height: '100%' }}>
        <StyledErrorState title="Failed to get jwe token" />
      </Paper>
    );
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

          // update ref
          dashboardRef.current?.widgets.forEach((obj) => {
            if (obj.label == widgetObj.label) {
              obj.size = widgetObj.size;
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
    let colorIndex = 0;
    if (dashboard != undefined) {
      dashboardRef.current = { ...dashboard };
      if (
        dashboard?.service_type &&
        cloudViewGraphProperties.globalFilters?.region &&
        cloudViewGraphProperties.globalFilters?.resource &&
        cloudViewGraphProperties.globalFilters?.resource.length > 0 &&
        jweToken?.token
      ) {
        return (
          <Grid columnSpacing={1.5} container rowSpacing={0} spacing={2}>
            {dashboard.widgets.map((element, index) => {
              if (element && element != undefined) {
                return (
                  <CloudViewWidget
                    key={index}
                    {...getCloudViewGraphProperties(element)}
                    authToken={jweToken?.token}
                    handleWidgetChange={handleWidgetChange}
                    useColorIndex={colorIndex++} // todo, remove the color index
                  />
                );
              } else {
                return <React.Fragment key={index}></React.Fragment>;
              }
            })}{' '}
          </Grid>
        );
      } else {
        return (
          <Paper>
            <StyledPlaceholder
              icon={CloudViewIcon}
              subtitle="Select Service Type, Region and Resource to visualize metrics"
              title=""
            />
          </Paper>
        );
      }
    } else {
      return (
        <Paper>
          <StyledPlaceholder
            subtitle="No visualizations are available at this moment.
        Create Dashboards to list here."
            icon={CloudViewIcon}
            title=""
          />
        </Paper>
      );
    }
  };

  const StyledPlaceholder = styled(Placeholder, {
    label: 'StyledPlaceholder',
  })({
    flex: 'auto',
  });

  return (
    <>
      <RenderWidgets />;
    </>
  );
};
