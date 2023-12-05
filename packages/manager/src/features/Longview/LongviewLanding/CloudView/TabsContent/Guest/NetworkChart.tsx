import React from "react";
import { getMetrics } from "../../CloudViewRequest";
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { useTheme } from "@mui/material/styles";
import { seriesDataFormatter } from "../../shared/CloudViewFormatters";

export const NetworkChart = (props: any) => {
    const theme = useTheme();

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const metricName: string = 'system_network_io_bytes_total';

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
                    backgroundColor: theme.graphs.cloudView.network.eth0_receive,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[0]?.values, props.start, props.end),
                    label: 'Eth0 Receive',
                },
                {
                    backgroundColor: theme.graphs.cloudView.network.eth0_transmit,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[1]?.values, props.start, props.end),
                    label: 'Eth0 Transmit',
                },
                {
                    backgroundColor: theme.graphs.cloudView.network.lo_receive,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[2]?.values, props.start, props.end),
                    label: 'Lo Receive',
                },
                {
                    backgroundColor: theme.graphs.cloudView.network.lo_transmit,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[3]?.values, props.start, props.end),
                    label: 'Lo Transmit',
                }                
            ]}
            ariaLabel="System Network IO Bytes Graph"
            error={error ? "Unable to retrieve data" : undefined}
            loading={loading}
            nativeLegend
            showToday={props.isToday}
            subtitle=""
            timezone={timezone}
            title="System Network IO Bytes"
            unit=""
        />
    );
};