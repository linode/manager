import { Filters } from "@linode/api-v4";

export interface DashboardProperties {

    defaultNeeded:boolean;
    dashboardId:number | undefined;
    globalFilters:Filters[] | undefined;
}