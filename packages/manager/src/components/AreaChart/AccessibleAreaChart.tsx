import { Box } from '@linode/ui';
import { visuallyHidden } from '@mui/utils';
import * as React from 'react';

import { getAccessibleTimestamp } from './utils';

export interface AccessibleAreaChartProps {
  ariaLabel?: string;
  data: any;
  dataKeys: string[];
  timezone: string;
  unit: string;
}

/**
 * This component is used to provide an accessible representation of the data
 * It does not care about styles, it only cares about presenting the data in bare HTML tables,
 * visually hidden from the user, yet available to screen readers.
 */
export const AccessibleAreaChart = (props: AccessibleAreaChartProps) => {
  const { ariaLabel, data, dataKeys, timezone, unit } = props;

  const tables = dataKeys.map((dataKey, tableID) => {
    const TableHeader = (
      <tr>
        <th>Time</th>
        <th>{dataKey}</th>
      </tr>
    );

    const TableBody =
      data &&
      data.map((entry: any, idx: number) => {
        const { [dataKey]: value, timestamp } = entry;

        return (
          <tr key={`accessible-graph-data-body-row-${idx}`}>
            <td>
              {timestamp
                ? getAccessibleTimestamp(Number(timestamp), timezone)
                : 'timestamp unavailable'}
            </td>
            <td>
              {value !== undefined
                ? Number(value).toFixed(2)
                : 'value unavailable'}
              {value !== undefined && unit}
            </td>
          </tr>
        );
      });

    return (
      <table
        key={`accessible-graph-data-table-${tableID}`}
        summary={`This table contains the data for the ${
          ariaLabel && dataKey ? ariaLabel + ` (${dataKey})` : 'graph below'
        }`}
      >
        <thead>{TableHeader}</thead>
        <tbody>{TableBody}</tbody>
      </table>
    );
  });

  return <Box sx={visuallyHidden}>{tables}</Box>;
};
