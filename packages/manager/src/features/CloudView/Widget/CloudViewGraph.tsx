import React from "react";
import { useProfile } from 'src/queries/profile';
import { seriesDataFormatter } from "./Formatters/CloudViewFormatter";
import { CircleProgress } from "src/components/CircleProgress";
import { CloudViewLineGraph } from "./CloudViewLineGraph";
import { useCloudViewMetricsQuery } from "src/queries/cloudview/metrics";
import { CloudViewMetricsRequest, Widgets } from "@linode/api-v4";
import { FiltersObject } from "../Models/GlobalFilterProperties";
import { getMetrics, formatPercentage } from "src/utilities/statMetrics";
import Grid from '@mui/material/Unstable_Grid2';
import { ZoomIcon } from "./Components/Zoomer";
import { styled, useTheme } from '@mui/material/styles';

export interface CloudViewGraphProperties {

    ariaLabel?: string;
    unit:string; // this should come from dashboard, which maintains map for service types in a separate API call
    errorLabel?: string; //error label can come from dashboard
    dashboardFilters: FiltersObject;    
    widget: Widgets; //this comes from dashboard, has inbuilt metrics, agg_func,group_by,filters,gridsize etc , also helpful in publishing any changes

    //any change in the current widget, call and pass this function and handle in parent component
    handleWidgetChange: (widget: Widgets) => void;
}



export const CloudViewGraph = (props: CloudViewGraphProperties) => {

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const [data, setData] = React.useState<Array<any>>([]);

    const [legendRows, setLegendRows] = React.useState<any[]>([]);    

    const [error, setError] = React.useState<boolean>(false);

    const [zoomIn, setZoomIn] = React.useState<boolean>(props.widget.size == 12);

    const [widget, setWidget] = React.useState<Widgets>({...props.widget}); //any change in agg_functions, step, group_by, will be published to dashboard component for save

    const theme = useTheme();



    const getShowToday = () => {
        return (props.dashboardFilters?.timeRange.start -
            props.dashboardFilters?.timeRange.end) / 3600 <= 24;
    }

    const getCloudViewMetricsRequest = (): CloudViewMetricsRequest => {
        let request = {} as CloudViewMetricsRequest;
        request.aggregate_function = props.widget.aggregate_function;
        request.group_by = props.widget.group_by;
        request.instance_id = props.dashboardFilters?.resource!;
        request.metric = props.widget.metric!;
        request.duration = props.dashboardFilters?.duration!;
        request.step = props.dashboardFilters?.step!; //todo, move to widgets
        request.startTime = props.dashboardFilters?.timeRange.start;
        request.endTime = props.dashboardFilters?.timeRange.end;
        return request;
    };


    const { data: metricsList, isLoading, status } = useCloudViewMetricsQuery(props.widget.serviceType!,
        getCloudViewMetricsRequest(), props); //fetch the metrics on any property change
    
    React.useEffect(() => {

        //on any change in the widget object, just publish the changes to parent component using a callback function
        props.handleWidgetChange(widget);

    }, [widget])

    /**
     * This will be executed, each time when we receive response from metrics api 
     * and does formats the data compatible for the graph
     */
    React.useEffect(() => {

        let dimensions: any[] = [];

        //for now we will use this guy, but once we decide how to work with coloring, it should be dynamic
        let colors: string[] = [theme.graphs.cpu.system,
        theme.graphs.cpu.user,
        theme.graphs.cpu.wait]


        if (status == 'success') {

            let index = 0;

            metricsList.data.result.forEach(graphData => {
                let dimension = {
                    borderColor: colors[index],
                    backgroundColor: colors[index++],
                    data: seriesDataFormatter(graphData.values,
                        props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.start : 0,
                        props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.end : 0),
                    label: graphData.metric.state                                        
                }

                //construct a legend row with the dimension
                constructLegendRow(dimension);
                dimensions.push(dimension);
            })            
            
            //chart dimensions
            setData(dimensions);                      
        }

        if(status == 'error') {
            setError((error) => true);
        } else {
            //set error false
            setError((error) => false);
        }

    }, [status, metricsList])


    if (isLoading) {
        return (<CircleProgress />);
    }

    const constructLegendRow = (dimension: any) => {

        let legendRow = {
            data: getMetrics(dimension.data as number[][]),
            format: formatPercentage,
            legendColor: dimension.backgroundColor,
            legendTitle: dimension.label,
        }

        setLegendRows((legendRows) => {
            legendRows?.push(legendRow)
            return legendRows;
        });
    }

    const handleZoomToggle = (zoomIn: boolean) => {
        setZoomIn(zoomIn);
    }

    const StyledZoomIcon = styled(ZoomIcon, {
        label:"StyledZoomIcon"
    })({
        float:"right"
    })

    return (
        <Grid xs={zoomIn ? 12 : 6}>
            {/* add further components like group by resource, aggregate_function, step here , for sample added zoom icon here*/}
            <StyledZoomIcon zoomIn={zoomIn} handleZoomToggle={handleZoomToggle}/>            
            <CloudViewLineGraph
                data={data}
                ariaLabel={props.ariaLabel?props.ariaLabel:''}
                error={error ? (props.errorLabel 
                    && props.errorLabel.length>0?props.errorLabel:'Error while rendering widget') : undefined}
                loading={isLoading}
                nativeLegend={true}
                showToday={getShowToday()}
                subtitle={props.unit}
                timezone={timezone}
                title={props.widget.label}
                unit={props.unit}
                gridSize={props.widget.size}
                suggestedMax={10}
                legendRows={legendRows} />
        </Grid>
    )
}
