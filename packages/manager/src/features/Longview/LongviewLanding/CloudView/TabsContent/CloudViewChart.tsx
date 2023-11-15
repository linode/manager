import React from "react";
import { getMetrics } from "../CloudViewRequest";
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { LongviewLineGraph } from "src/components/LongviewLineGraph/LongviewLineGraph";
import { useProfile } from 'src/queries/profile';
import { convertData } from "src/features/Longview/shared/formatters";
import { useTheme } from "@mui/material/styles";
import { StatWithDummyPoint } from "src/features/Longview/request.types";

export const CloudViewChart = (props: any) => {
    const theme = useTheme();

    const { data: profile } = useProfile();

    const timezone = profile?.timezone || 'US/Eastern';

    const metricName: string = 'system_memory_usage_bytes';

    const longviewFormat = (data: any) => {
        var formattedArray: StatWithDummyPoint[] = [];
        data?.forEach((element: any[]) => {
            var formattedPoint: StatWithDummyPoint = {
                x: Number(element[0]),
                y: element[1] ? Number(element[1]) : null
            };
            formattedArray.push(formattedPoint);
        });
        return formattedArray;
    }

    const { data, loading, error } = useAPIRequest(
        () => getMetrics(metricName,props.start,props.end).
        then((response) => longviewFormat(response
        .data.data.result[0].values)),
        [],
        [props.start, props.end]
    );

    const _convertData = React.useCallback(convertData, [data, props.start, props.end]);

    return (
        <LongviewLineGraph
            data={[
                {
                    backgroundColor: theme.graphs.memory.buffers,
                    borderColor: 'transparent',
                    data: loading ?
                        _convertData([], props.start, props.end) :
                        _convertData(data, props.start, props.end),
                    label: 'Buffered',
                }
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