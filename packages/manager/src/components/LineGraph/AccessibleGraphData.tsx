import * as React from 'react';
import type { ChartData, ChartPoint } from 'chart.js';
import { DateTime } from 'luxon';
import Grid from '@mui/material/Unstable_Grid2';
import { visuallyHidden } from '@mui/utils';

interface GraphTabledDataProps {
  id?: string;
  ariaLabel?: string;
  accessibleUnit?: string;
  chartInstance: React.MutableRefObject<any>['current'];
  hiddenDatasets: number[];
}

/**
 * This component is used to provide an accessible representation of the data
 * It does not care about styles, it only cares about presenting the data in bare HTML tables,
 * visually hidden from the user, yet available to screen readers.
 */
const AccessibleGraphData = (props: GraphTabledDataProps) => {
  const {
    accessibleUnit,
    ariaLabel,
    chartInstance,
    hiddenDatasets,
    id,
  } = props;

  // This is necessary because the chartInstance is not immediately available
  if (!chartInstance?.config?.data?.datasets) {
    return null;
  }

  const { datasets }: ChartData = chartInstance.config.data;

  const tables = datasets.map((dataset, tableID) => {
    const { label, data } = dataset;
    const hidden = hiddenDatasets.includes(tableID);

    const tableHeader = (
      <tr>
        <th>Time</th>
        <th>{label}</th>
      </tr>
    );

    const tableBody =
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
                : ''}
            </td>
            <td>
              {value && Number(value).toFixed(2)}
              {accessibleUnit}
            </td>
          </tr>
        );
      });

    return (
      !hidden && (
        <table
          id={id}
          key={`accessible-graph-data-table-${tableID}`}
          summary={`This table contains the data for the ${
            ariaLabel ? ariaLabel : label + 'graph.'
          }`}
        >
          <thead>{tableHeader}</thead>
          <tbody>{tableBody}</tbody>
        </table>
      )
    );
  });

  return <Grid sx={visuallyHidden}>{tables}</Grid>;
};

export default AccessibleGraphData;
