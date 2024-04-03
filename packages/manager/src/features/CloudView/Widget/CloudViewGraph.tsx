import React from "react";
import { useProfile } from 'src/queries/profile';
import { seriesDataFormatter } from "./Formatters/CloudViewFormatter";
import { CircleProgress } from "src/components/CircleProgress";
import { CloudViewLineGraph } from "./CloudViewLineGraph";
import { useCloudViewMetricsQuery } from "src/queries/cloudview/metrics";
import { CloudViewMetricsRequest, Widgets } from "@linode/api-v4";
import { GlobalFiltersObject } from "../Models/GlobalFilterProperties";
import { getMetrics, formatPercentage } from "src/utilities/statMetrics";
import Grid from '@mui/material/Unstable_Grid2';
import { ZoomIcon } from "./Components/Zoomer";
import { styled, useTheme } from '@mui/material/styles';

export interface CloudViewGraphProperties {

    isToday: boolean;
    ariaLabel: string;
    errorLabel: string;
    unit: string;
    dashboardFilters: GlobalFiltersObject;
    serviceType: string;
    widget: Widgets;

    //any change in the current widget, call and pass this function and handle in parent component
    widgetChange: (widget: Widgets) => void;
}



export const CloudViewGraph = (props: CloudViewGraphProperties) => {

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const [data, setData] = React.useState<Array<any>>([]);

    const [legendRows, setLegendRows] = React.useState<any[]>([]);

    const [loading, setLoading] = React.useState<boolean>(true);

    const [error, setError] = React.useState<boolean>(false);

    const [zoomIn, setZoomIn] = React.useState<boolean>(props.widget.size == 12);

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
        request.duration = props.dashboardFilters?.duration;
        request.step = props.dashboardFilters?.step;
        request.startTime = props.dashboardFilters?.timeRange.start;
        request.endTime = props.dashboardFilters?.timeRange.end;
        return request;
    };


    const { data: metricsList, isLoading, isError, status } = useCloudViewMetricsQuery(props.dashboardFilters.serviceType,
        getCloudViewMetricsRequest(), props); //fetch the metrics on any property change

    /**
     * This will be executed, each time when we receive response from metrics api 
     * and does formats the data compatible for the graph
     */
    React.useEffect(() => {

        let dimensions: any[] = [];

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
                    label: graphData.metric.state,                    
                    borderWidth: 3
                }

                //construct a legend row with the dimension
                constructLegendRow(dimension);
                dimensions.push(dimension);
            })
            
            //chart dimensions
            setData(dimensions);

            //loading off
            setLoading(false);
        }

    }, [status, metricsList])


    if (isLoading) {
        return (<CircleProgress />);
    }

    if (isError) {
        setError((error) => true);
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
                ariaLabel={props.ariaLabel}
                error={error ? props.errorLabel : undefined}
                loading={loading}
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
