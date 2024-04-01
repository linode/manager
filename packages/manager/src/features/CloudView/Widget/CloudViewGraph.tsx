import React from "react";
import { useProfile } from 'src/queries/profile';
import { seriesDataFormatter } from "./Formatters/CloudViewFormatter";
import { CloudViewGraphProperties } from "../Models/CloudViewGraphProperties";
import { CircleProgress } from "src/components/CircleProgress";
import { CloudViewLineGraph } from "./CloudViewLineGraph";
import { useCloudViewMetricsQuery } from "src/queries/cloudview/metrics";
import { CloudViewMetricsRequest } from "@linode/api-v4";
import { ErrorState } from "src/components/ErrorState/ErrorState";
import { useTheme } from '@mui/material/styles';



export const CloudViewGraph = (props: CloudViewGraphProperties) => {

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const [data, setData] = React.useState<Array<any>>([]);

    const [loading, setLoading] = React.useState<boolean>(true);

    const theme = useTheme();



    const getShowToday = () => {
        return (props.end - props.start) / 3600 <= 24;
    }

    const getCloudViewMetricsRequest = (): CloudViewMetricsRequest => {
        let request = {} as CloudViewMetricsRequest;
        request.aggregate_function = props.aggregate_function;
        request.group_by = props.metric;
        request.instance_id = props.dashboardFilters?.resource!;
        request.metric = props.metric!;
        request.instance_id = props.dashboardFilters.resource;        
        request.duration = props.duration;
        request.step = props.dashboardFilters?.step;        
        request.startTime = props.dashboardFilters?.timeRange.start;
        request.endTime = props.dashboardFilters?.timeRange.end;
        return request;
    };


    const { data: metricsList, isLoading, isError, status } = useCloudViewMetricsQuery(props.dashboardFilters.serviceType,
        getCloudViewMetricsRequest(), props.dashboardFilters?.timeRange);

    React.useEffect(() => { //This will be executed, each time when we receive response from metrics api and does formats the data compatible for the graph
        
        let dimensions:any[] = [];

        let colors:string[] = [theme.graphs.cpu.system,
            theme.graphs.cpu.user,
            theme.graphs.cpu.wait]


        if (status == 'success') {

            let index = 0;

            metricsList.data.result.forEach(graphData => {
                let dimension = {
                    borderColor: colors[index],                    
                    backgroundColor:colors[index++],
                    data: seriesDataFormatter(graphData.values,
                        props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.start : 0,
                        props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.end : 0),
                    label: graphData.metric.state,
                    fill: true
                }                
                dimensions.push(dimension);
            })

            setData(dimensions);
            setLoading(false);
        }

    }, [status, metricsList])


    if (isLoading) {
        return (<CircleProgress />);
    }

    if (isError) {
        return (<ErrorState errorText={"Error While getting metrics"}>

        </ErrorState>);
    }

    return (
        <CloudViewLineGraph
            data={data}
            ariaLabel={props.ariaLabel}
            error={false ? props.errorLabel : undefined}
            loading={loading}
            nativeLegend
            showToday={getShowToday()}
            subtitle={props.metric}
            timezone={timezone}
            title={props.title}
            unit={props.metric}
            gridSize={props.gridSize}
            suggestedMax={10} />
    )
}
