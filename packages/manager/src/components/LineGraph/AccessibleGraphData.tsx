/**
 * ONLY USED IN THE LINE GRAPH COMPONENT (Longview)
 * Delete when LineGraph is sunsetted
 */
import { Box } from '@linode/ui';
import { visuallyHidden } from '@mui/utils';
import { DateTime } from 'luxon';
import * as React from 'react';

import type { ChartData, ChartPoint } from 'chart.js';

export interface GraphTabledDataProps {
  accessibleUnit: string;
  ariaLabel?: string;
  chartInstance: React.MutableRefObject<Chart | null>['current'];
  hiddenDatasets: number[];
}

/**
 * This component is used to provide an accessible representation of the data
 * It does not care about styles, it only cares about presenting the data in bare HTML tables,
 * visually hidden from the user, yet available to screen readers.
 */
const AccessibleGraphData = (props: GraphTabledDataProps) => {
  const { accessibleUnit, ariaLabel, chartInstance, hiddenDatasets } = props;

  // This is necessary because the chartInstance is not immediately available
  if (!chartInstance?.config?.data?.datasets) {
    return null;
  }

  const { datasets }: ChartData = chartInstance.config.data;

  const tables = datasets.map((dataset, tableID) => {
    const { data, label } = dataset;
    const hidden = hiddenDatasets.includes(tableID);

    const TableHeader = (
      <tr>
        <th>Time</th>
        <th>{label}</th>
      </tr>
    );

    const TableBody =
      data &&
      data.map((entry, idx) => {
        const { t: timestamp, y: value } = entry as ChartPoint;

        return (
          <tr key={`accessible-graph-data-body-row-${idx}`}>
            <td>
              {timestamp
                ? DateTime.fromMillis(Number(timestamp)).toLocaleString(
                    DateTime.DATETIME_SHORT
                  )
                : 'timestamp unavailable'}
            </td>
            <td>
              {value !== undefined
                ? Number(value).toFixed(2)
                : 'value unavailable'}
              {value !== undefined && accessibleUnit}
            </td>
          </tr>
        );
      });

    return (
      !hidden && (
        <table
          key={`accessible-graph-data-table-${tableID}`}
          summary={`This table contains the data for the ${
            ariaLabel && label ? ariaLabel + ` (${label})` : 'graph below'
          }`}
        >
          <thead>{TableHeader}</thead>
          <tbody>{TableBody}</tbody>
        </table>
      )
    );
  });

  return <Box sx={visuallyHidden}>{tables}</Box>;
};

export default AccessibleGraphData;
