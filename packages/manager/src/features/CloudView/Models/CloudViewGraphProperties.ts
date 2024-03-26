import { GlobalFiltersObject } from "./GlobalFilterProperties";

export interface CloudViewGraphProperties {

    start:number;
    end:number;
    isToday:boolean;
    ariaLabel:string;
    errorLabel:string;
    title:string;
    subtitle:string;
    unit:string;
    dashboardFilters:GlobalFiltersObject;
    counter:number; //testing

}