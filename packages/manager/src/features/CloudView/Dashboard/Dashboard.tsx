import * as React from 'react';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { FiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewGraph, CloudViewGraphProperties } from '../Widget/CloudViewGraph';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Dashboard, Widgets } from '@linode/api-v4';


export interface DashboardProperties {    
    dashbaord:Dashboard; // this will be done in upcoming sprint
    dashboardFilters:FiltersObject;

    //on any change in dashboard
    onDashboardChange:(dashboard:Dashboard) => void;
}

export const CloudPulseDashboard = (props: DashboardProperties) => { //todo define a proper properties class


    const [cloudViewGraphProperties, setCloudViewGraphProperties] = React.useState<CloudViewGraphProperties>({} as CloudViewGraphProperties);

    React.useEffect(() => {

        //set as dashboard filter
        setCloudViewGraphProperties({ ...cloudViewGraphProperties, dashboardFilters: props.dashboardFilters })

    }, [props.dashboardFilters]) //execute every time when there is dashboardFilters change

    const getCloudViewGraphProperties = (widget:Widgets) => {

        let graphProp:CloudViewGraphProperties = {} as CloudViewGraphProperties;
        graphProp.widget = {...widget};
        graphProp.dashboardFilters = props.dashboardFilters;
        graphProp.unit = "%";        
        graphProp.ariaLabel = widget.label;
        graphProp.errorLabel = 'Error While loading data'     

        return graphProp;

    }

    const RenderWidgets = () => {

        if (props.dashbaord != undefined) {

            if (cloudViewGraphProperties.dashboardFilters?.serviceType &&
                cloudViewGraphProperties.dashboardFilters?.region &&
                cloudViewGraphProperties.dashboardFilters?.resource) {
                return props.dashbaord.widgets.map((element, index) => {
                    return <CloudViewGraph key={index} {...getCloudViewGraphProperties(element)} handleWidgetChange={(widget:Widgets) => {}}/>
                });
            } else {
                return (<StyledPlaceholder
                    subtitle="Select Service Type, Region and Resource to visualize metrics"
                    icon={CloudViewIcon}
                    title=""
                />);
            }

        } else {
            return (<StyledPlaceholder
                subtitle="No visualizations are available at this moment.
        Create Dashboards to list here."
                icon={CloudViewIcon}
                title=""
            />);
        }
    }


    const StyledPlaceholder = styled(Placeholder, {
        label: "StyledPlaceholder"
    })({
        flex: "auto"
    })

    return (
        <>                       
           <Grid container spacing={2}>
                <RenderWidgets />
            </Grid>
        </>
    )

}