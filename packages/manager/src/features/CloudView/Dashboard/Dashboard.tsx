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
import { Divider } from 'src/components/Divider';

export const Dashboard = (props: any) => { //todo define a proper properties class


    const [cloudViewGraphProperties , setCloudViewGraphProperties] = React.useState<CloudViewGraphProperties>({} as CloudViewGraphProperties);

    const [dashboardFilters, setDashboardFilters] = React.useState<GlobalFiltersObject>({} as GlobalFiltersObject);    


    if (props.needDefault && props.dashboardId) {
        var dashboardId = props.dashboardId;
    } else {
        dashboardId = 1
    }


    const { data: dashboard, isError: dashboardLoadError,
        isLoading: dashboardLoadLoding} = useCloudViewDashboardByIdQuery(dashboardId);

    if (dashboardLoadLoding) {
        return <CircleProgress />
    }

    if (dashboardLoadError) {
        return <ErrorState errorText={'Error while fetching dashboards with id ' + 1 + ', please retry.'}></ErrorState>
    }


    const handleGlobalFilterChange = (globalFilter:GlobalFiltersObject) => {
        setDashboardFilters({...globalFilter});         
        setCloudViewGraphProperties({...cloudViewGraphProperties, counter:2})
    }

    const renderWidgets = () => {

        if(dashboard!=undefined) {            
            return dashboard.widgets.map((element, index) => {                
                return <Grid xs={6}><CloudViewGraph key={index} {...cloudViewGraphProperties} title={element.label} dashboardFilters={{...dashboardFilters}}
                /></Grid>
            });             

        } else {
            return (<Placeholder
                subtitle="No visualizations are available at this moment.
        Create Dashboards to list here."
                icon={CloudViewIcon}
                title=""
            />);
        }        
    }

    //if nothing above matches return a dummy component
    return (
        <>
            <LandingHeader title={dashboard.label}/>
            <Divider orientation="horizontal"></Divider>
            <GlobalFilters handleAnyFilterChange={(filters:GlobalFiltersObject) => 
                handleGlobalFilterChange(filters)}></GlobalFilters>            
           <Grid container spacing={2}>{renderWidgets()}</Grid>
        </>
    )

}