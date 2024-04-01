import React from "react";
import { useProfile } from 'src/queries/profile';
import { seriesDataFormatter } from "./Formatters/CloudViewFormatter";
import { CloudViewGraphProperties } from "../Models/CloudViewGraphProperties";
import { CircleProgress } from "src/components/CircleProgress";
import { CloudViewLineGraph } from "./CloudViewLineGraph";
import { useCloudViewMetricsQuery } from "src/queries/cloudview/metrics";
import { CloudViewMetricsRequest } from "@linode/api-v4";
import { ErrorState } from "src/components/ErrorState/ErrorState";



export const CloudViewGraph = (props: CloudViewGraphProperties) => {

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const [data, setData] = React.useState<Array<number[]>>([]);

    const [loading, setLoading] = React.useState<boolean>(true);

    //these values are selected at widget level
    const [aggregate, setggregate] = React.useState<string>();

    //these values are selected at widget level
    const [instanceIdList, setInstanceId] = React.useState<string[]>();



    const getShowToday = () => {
        return (props.end - props.start) / 3600 <= 24;
    }

    const getCloudViewMetricsRequest = (): CloudViewMetricsRequest => {
        let request = {} as CloudViewMetricsRequest;
        request.aggregate_function = "sum";
        request.group_by = "metric";
        request.instance_id = instanceIdList!;
        request.metric = props.metric!;
        //TODO, need to come from top, lets see how to achieve this
        request.duration = props.duration;
        request.step = props.dashboardFilters?.step;
        request.counter = 2;
        return request;
    };


    const { data: metricsList, isLoading, isError, status } = useCloudViewMetricsQuery(props.serviceType,
        getCloudViewMetricsRequest(), props.dashboardFilters?.timeRange);

    React.useEffect(() => { //This will be executed, each time when we receive response from metrics api and formats the data compatible for the graph

        if (status == 'success') {
            //TODO, format the widgetList and feed data to chart
            let start = 0;
            let end = 0;
            if (props.dashboardFilters) {

                if (props.dashboardFilters.timeRange && props.dashboardFilters.timeRange.start) {
                    // console.log(props.dashboardFilters.timeRange.start)
                    start = props.dashboardFilters.timeRange.start;
                }

                if (props.dashboardFilters.timeRange && props.dashboardFilters.timeRange.end) {
                    // console.log(props.dashboardFilters.timeRange.end)
                    end = props.dashboardFilters.timeRange.end;
                }

                //Instead of setting data statically, we can get and set from API call
                let arrayData: Array<number[]> = [];
                let j = 1;
                for (let i = start;
                    i < end; i = i + 1000) {
                    let element: number[] = [];
                    element[0] = i;
                    element[1] = j + 5;
                    j = j + 5;
                    arrayData.push(element);
                }
                setData(arrayData)
                setLoading(false)
            }
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
            data={[
                {
                    backgroundColor: props.color,
                    borderColor: 'skyblue',
                    data: seriesDataFormatter(data, props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.start : 0,
                        props.dashboardFilters && props.dashboardFilters.timeRange ? props.dashboardFilters.timeRange.end : 0),
                    label: props.title
                }
            ]}
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
