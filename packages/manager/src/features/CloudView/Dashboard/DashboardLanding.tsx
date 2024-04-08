import { Paper, Divider } from "@mui/material";
import { FiltersObject } from "../Models/GlobalFilterProperties";
import { GlobalFilters } from "../Overview/GlobalFilters";
import * as React from 'react';
import { DashboardProperties, CloudPulseDashboard } from "./Dashboard";
import { Dashboard } from "@linode/api-v4";
import { useCloudViewDashboardByIdQuery } from "src/queries/cloudview/dashboards";
import { CircleProgress } from "src/components/CircleProgress";
import { ErrorState } from "src/components/ErrorState/ErrorState";


export const DashBoardLanding = () => {

    const [dashboardProp, setDashboardProp] = React.useState<DashboardProperties>({} as DashboardProperties);

    var dashboardId = 1

    const { data: dashboard, isError: dashboardLoadError,
        isLoading: dashboardLoadLoding } = useCloudViewDashboardByIdQuery(dashboardId);


    if (dashboardLoadLoding) {
        return <CircleProgress />
    }

    if (dashboardLoadError) {
        return <ErrorState errorText={'Error while fetching dashboards with id ' + 1 + ', please retry.'}></ErrorState>
    }



    const handleGlobalFilterChange = (globalFilter: FiltersObject) => {
        //set as dashboard filter    
        setDashboardProp({ ...dashboardProp, dashboardFilters: globalFilter })
    }

    const saveOrEditDashboard = (dashboard: Dashboard) => {
        //todo, implement save option
    }

    const deleteDashboard = (dashboardId: number) => {
        //todo, implement delete option
    }

    const markDashboardAsFavorite = () => {
        //todo, implement mark dashboard as favorite
    }

    const resetView = () => {
        //todo, implement the reset view function
    }

    const onDashboardSelect = () => {
        //todo, whatever when a new dashboard is loaded
    }

    const dashbaordChange = (dashboard:Dashboard) => {

    }



    return (
        <Paper>
            <div style={{ "display": "flex" }}>
                <div style={{ width: "40%", marginTop: "30px" }}>
                    <h3 >{"Akamai Cloud Pulse Dashboard"}</h3>
                </div>
                <div style={{ width: "80%" }}>
                    <GlobalFilters handleAnyFilterChange={(filters: FiltersObject) =>
                        handleGlobalFilterChange(filters)}></GlobalFilters>
                </div>
            </div>
            <Divider></Divider>
            <CloudPulseDashboard {...dashboardProp} dashbaord={dashboard} onDashboardChange={dashbaordChange}/>
        </Paper>
    );

}