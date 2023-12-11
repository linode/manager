import React from "react";
import { getMetrics } from "../../CloudViewRequest";
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { useTheme } from "@mui/material/styles";
import { seriesDataFormatter } from "../../shared/CloudViewFormatters";

export const CPUChart = (props: any) => {
    const theme = useTheme();

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const metricName: string = 'system_cpu_utilization_ratio';

    const { data, loading, error } = useAPIRequest(
        () => getMetrics(metricName, props.start, props.end, props.linodeId ,props.currentToken).
        then((response) => response.data.data.result),
        [],
        [props.start, props.end, props.linodeId]
    );

    return (
        <LongviewLineGraph
            data={[
                {
                    backgroundColor: theme.graphs.cloudView.cpu.idle,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[0]?.values, props.start, props.end),
                    label: 'Idle',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.interrupt,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[1]?.values, props.start, props.end),
                    label: 'interrupt',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.nice,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[2]?.values, props.start, props.end),
                    label: 'Nice',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.softirq,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[3]?.values, props.start, props.end),
                    label: 'Softirq',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.steal,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[4]?.values, props.start, props.end),
                    label: 'Steal',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.system,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[5]?.values, props.start, props.end),
                    label: 'System',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.user,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[6]?.values, props.start, props.end),
                    label: 'User',
                },
                {
                    backgroundColor: theme.graphs.cloudView.cpu.wait,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[7]?.values, props.start, props.end),
                    label: 'Wait',
                },
                
            ]}
            ariaLabel="System CPU Utilization Graph"
            error={error ? "Unable to retrieve data" : undefined}
            loading={loading}
            nativeLegend
            showToday={props.isToday}
            subtitle=""
            timezone={timezone}
            title="System CPU Utilization"
            unit=""
        />
    );
};