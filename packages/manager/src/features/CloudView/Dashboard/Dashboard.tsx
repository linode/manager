import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useCloudViewDashboardByIdQuery } from 'src/queries/cloudview/dashboards';
import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { GlobalFilters } from '../Overview/GlobalFilters';
import { GlobalFiltersObject } from '../Models/GlobalFilterProperties';
import { CloudViewGraph } from '../Widget/CloudViewGraph';
import { CloudViewGraphProperties } from '../Models/CloudViewGraphProperties';
import Grid from '@mui/material/Unstable_Grid2';
import { LandingHeader } from 'src/components/LandingHeader';
import { styled } from '@mui/material/styles';
import { Widgets } from '@linode/api-v4';

export const Dashboard = (props: any) => { //todo define a proper properties class


    const [cloudViewGraphProperties, setCloudViewGraphProperties] = React.useState<CloudViewGraphProperties>({} as CloudViewGraphProperties);



    if (props.needDefault && props.dashboardId) {
        var dashboardId = props.dashboardId;
    } else {
        dashboardId = 1
    }

    const { data: dashboard, isError: dashboardLoadError,
        isLoading: dashboardLoadLoding } = useCloudViewDashboardByIdQuery(dashboardId);

    if (dashboardLoadLoding) {
        return <CircleProgress />
    }

    if (dashboardLoadError) {
        return <ErrorState errorText={'Error while fetching dashboards with id ' + 1 + ', please retry.'}></ErrorState>
    }


    const handleGlobalFilterChange = (globalFilter: GlobalFiltersObject) => {
        //set as dashboard filter
        setCloudViewGraphProperties({ ...cloudViewGraphProperties, dashboardFilters: globalFilter })
    }

    const getCloudViewGraphProperties = (widget:Widgets) => {

        let graphProp:CloudViewGraphProperties = {} as CloudViewGraphProperties;

        graphProp = {...cloudViewGraphProperties};
        graphProp.title = widget.label;
        graphProp.aggregate_function = widget.aggregate_function;
        graphProp.metric = widget.metric;
        graphProp.color = widget.color;
        graphProp.gridSize = widget.size;

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

    const StyledGlobalFilters = styled(GlobalFilters, {
        label: "StyledGlobalFilters"
    })({
        width:"1%"
    })

    //if nothing above matches return a dummy component
    return (
        <>
            <LandingHeader title={dashboard.label}/>            
            <GlobalFilters handleAnyFilterChange={(filters:GlobalFiltersObject) => 
                handleGlobalFilterChange(filters)}></GlobalFilters>            
           <Grid container spacing={2}>
                <RenderWidgets />
            </Grid>
        </>
    )

}