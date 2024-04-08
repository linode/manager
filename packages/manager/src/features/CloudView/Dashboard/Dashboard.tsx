import { Dashboard, Widgets } from '@linode/api-v4';
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
      dashboardFilters: props.dashboardFilters,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.dashboardFilters]); // execute every time when there is dashboardFilters change

  const getCloudViewGraphProperties = (widget: Widgets) => {
    const graphProp: CloudViewWidgetProperties = {} as CloudViewWidgetProperties;
    graphProp.widget = { ...widget };
    graphProp.dashboardFilters = props.dashboardFilters;
    graphProp.unit = '%';
    graphProp.ariaLabel = widget.label;
    graphProp.errorLabel = 'Error While loading data';

    return graphProp;
  };

  const handleWidgetChange = (widget: Widgets) => {
    widget.color = 'black'; // todo, add functionality here
  };

  const RenderWidgets = () => {
    if (props.dashbaord != undefined) {
      if (
        cloudViewGraphProperties.dashboardFilters?.serviceType &&
        cloudViewGraphProperties.dashboardFilters?.region &&
        cloudViewGraphProperties.dashboardFilters?.resource
      ) {
        return props.dashbaord.widgets.map((element, index) => {
          return (
            <CloudViewWidget
              key={index}
              {...getCloudViewGraphProperties(element)}
              handleWidgetChange={handleWidgetChange}
            />
          );
        });
      } else {
        return (
          <StyledPlaceholder
            icon={CloudViewIcon}
            subtitle="Select Service Type, Region and Resource to visualize metrics"
            title=""
          />
        );
      }
    } else {
      return (
        <StyledPlaceholder
          subtitle="No visualizations are available at this moment.
        Create Dashboards to list here."
          icon={CloudViewIcon}
          title=""
        />
      );
    }
  };

  const StyledPlaceholder = styled(Placeholder, {
    label: 'StyledPlaceholder',
  })({
    flex: 'auto',
  });

  return (
    <Grid container spacing={2}>
      <RenderWidgets />
    </Grid>
  );
};
