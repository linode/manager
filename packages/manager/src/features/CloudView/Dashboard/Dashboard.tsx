import { Dashboard, Widgets } from '@linode/api-v4';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import {
  CloudViewWidget,
  CloudViewWidgetProperties,
} from '../Widget/CloudViewWidget';

export interface DashboardProperties {
  dashbaord: Dashboard; // this will be done in upcoming sprint
  dashboardFilters: FiltersObject;

  // on any change in dashboard
  onDashboardChange: (dashboard: Dashboard) => void;
}

export const CloudPulseDashboard = (props: DashboardProperties) => {
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

  // const {
  //   data: metricDefinitions,
  //   isError,
  //   isLoading,
  // } = useGetCloudViewServicesByServiceType(props.dashbaord.serviceType);

  // if (isLoading) {
  //   return <CircleProgress />;
  // }

  // if (isError) {
  //   return <ErrorState errorText={'Error loading metric definitions'} />;
  // }

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
    widget.color = 'black'; // todo, add functionality here
  };

  const RenderWidgets = () => {
    let colorIndex = 0;
    if (props.dashbaord != undefined) {
      if (
        props.dashbaord?.service_type &&
        cloudViewGraphProperties.globalFilters?.region &&
        cloudViewGraphProperties.globalFilters?.resource
      ) {
        return (
          <Grid
            className={'graphgrid'}
            columnSpacing={1.5}
            container
            rowSpacing={0}
            spacing={2}
          >
            {props.dashbaord.widgets.map((element, index) => {
              if (element && element != undefined) {
                return (
                  <CloudViewWidget
                    key={index}
                    {...getCloudViewGraphProperties(element)}
                    handleWidgetChange={handleWidgetChange}
                    useColorIndex={colorIndex++}
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

  return <RenderWidgets />;
};
