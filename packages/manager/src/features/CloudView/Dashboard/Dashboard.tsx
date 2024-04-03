import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useCloudViewDashboardByIdQuery } from 'src/queries/cloudview/dashboards';
import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { GlobalFiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewGraph, CloudViewGraphProperties } from '../Widget/CloudViewGraph';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { Dashboard, Widgets } from '@linode/api-v4';


export interface DashboardProperties {    
    dashbaord:Dashboard; // this will be done in upcoming sprint
    dashboardFilters:GlobalFiltersObject;
}

export const CloudPulseDashboard = (props: DashboardProperties) => { //todo define a proper properties class


    const [cloudViewGraphProperties, setCloudViewGraphProperties] = React.useState<CloudViewGraphProperties>({} as CloudViewGraphProperties);

    var dashboardId = 1    

    const { data: dashboard, isError: dashboardLoadError,
        isLoading: dashboardLoadLoding } = useCloudViewDashboardByIdQuery(dashboardId);

    React.useEffect(() => {

        //set as dashboard filter
        setCloudViewGraphProperties({ ...cloudViewGraphProperties, dashboardFilters: props.dashboardFilters })

    }, [props.dashboardFilters]) //execute every time when there is dashboardFilters change

    if (dashboardLoadLoding) {
        return <CircleProgress />
    }

    if (dashboardLoadError) {
        return <ErrorState errorText={'Error while fetching dashboards with id ' + 1 + ', please retry.'}></ErrorState>
    }

    const getCloudViewGraphProperties = (widget:Widgets) => {

        let graphProp:CloudViewGraphProperties = {} as CloudViewGraphProperties;
        graphProp.widget = {...widget};
        graphProp.dashboardFilters = props.dashboardFilters;
        graphProp.unit = "%";
        graphProp.serviceType = widget.serviceType!;
        graphProp.ariaLabel = widget.label;
        graphProp.errorLabel = 'Error While loading data'     

        return graphProp;

    }

    const RenderWidgets = () => {

        if (dashboard != undefined) {

            if (cloudViewGraphProperties.dashboardFilters?.serviceType &&
                cloudViewGraphProperties.dashboardFilters?.region &&
                cloudViewGraphProperties.dashboardFilters?.resource) {
                return dashboard.widgets.map((element, index) => {
                    return <CloudViewGraph key={index} {...getCloudViewGraphProperties(element)} />
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