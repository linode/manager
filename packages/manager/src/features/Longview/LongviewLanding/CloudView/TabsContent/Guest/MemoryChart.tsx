import React from "react";
import { getMetrics } from "../../CloudViewRequest";
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { useTheme } from "@mui/material/styles";
import { seriesDataFormatter } from "../../shared/CloudViewFormatters";

export const MemoryChart = (props: any) => {
    const theme = useTheme();

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const metricName: string = 'system_memory_usage_bytes';

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
                    backgroundColor: theme.graphs.cloudView.memory.buffered,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[0]?.values, props.start, props.end),
                    label: 'Buffered',
                },
                {
                    backgroundColor: theme.graphs.cloudView.memory.cached,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[1]?.values, props.start, props.end),
                    label: 'Cached',
                },
                {
                    backgroundColor: theme.graphs.cloudView.memory.free,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[2]?.values, props.start, props.end),
                    label: 'Free',
                },
                {
                    backgroundColor: theme.graphs.cloudView.memory.reclaimable,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[3]?.values, props.start, props.end),
                    label: 'Slab Reclaimable',
                },
                {
                    backgroundColor: theme.graphs.cloudView.memory.unreclaimable,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[4]?.values, props.start, props.end),
                    label: 'Slab Unreclaimable',
                },
                {
                    backgroundColor: theme.graphs.cloudView.memory.used,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[5]?.values, props.start, props.end),
                    label: 'Used',
                },
                
            ]}
            ariaLabel="System Memory Usage Bytes Graph"
            error={error ? "Unable to retrieve data" : undefined}
            loading={loading}
            nativeLegend
            showToday={props.isToday}
            subtitle=""
            timezone={timezone}
            title="System Memory Usage Bytes"
            unit=""
        />
    );
};