import React from "react";
import { getMetrics } from "../../CloudViewRequest";
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { useTheme } from "@mui/material/styles";
import { seriesDataFormatter } from "../../shared/CloudViewFormatters";

export const DiskChart = (props: any) => {
    const theme = useTheme();

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const metricName: string = 'system_disk_operations_total';

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
                    backgroundColor: theme.graphs.cloudView.disk.loop0_read,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[1]?.values, props.start, props.end),
                    label: 'loop0 Read',
                },
                {
                    backgroundColor: theme.graphs.cloudView.disk.loop0_write,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[2]?.values, props.start, props.end),
                    label: 'loop0 Write',
                },
                {
                    backgroundColor: theme.graphs.cloudView.disk.sda_read,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[3]?.values, props.start, props.end),
                    label: 'sda Read',
                },
                {
                    backgroundColor: theme.graphs.cloudView.disk.sda_write,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[4]?.values, props.start, props.end),
                    label: 'sda Write',
                },
                {
                    backgroundColor: theme.graphs.cloudView.disk.sdb_read,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[5]?.values, props.start, props.end),
                    label: 'sdb Read',
                },
                {
                    backgroundColor: theme.graphs.cloudView.disk.sdb_write,
                    borderColor: 'transparent',
                    data: loading ?
                        seriesDataFormatter([], props.start, props.end) :
                        seriesDataFormatter(data[5]?.values, props.start, props.end),
                    label: 'sdb Write',
                }
                
            ]}
            ariaLabel="System Disk Operations Graph"
            error={error ? "Unable to retrieve data" : undefined}
            loading={loading}
            nativeLegend
            showToday={props.isToday}
            subtitle=""
            timezone={timezone}
            title="System Disk Operations"
            unit=""
        />
    );
};