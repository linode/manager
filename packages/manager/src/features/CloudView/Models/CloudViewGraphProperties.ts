import { TimeDuration, TimeGranularity } from "@linode/api-v4";
import { GlobalFiltersObject } from "./GlobalFilterProperties";

export interface CloudViewGraphProperties {

    start:number;
    end:number;
    duration:TimeDuration;
    step:TimeGranularity;
    isToday:boolean;
    ariaLabel:string;
    errorLabel:string;
    title:string;
    subtitle:string;
    unit:string;
    dashboardFilters:GlobalFiltersObject;
    gridSize:number;
    serviceType:string;
    metric:string;
    aggregate_function:string;
    color:string
    yLabel:string;
    chartType:string;
}