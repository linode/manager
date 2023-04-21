import * as React from 'react';
import type { ChartData, ChartPoint } from 'chart.js';
import { DateTime } from 'luxon';

interface GraphTabledDataProps {
  chartInstance: React.MutableRefObject<any>['current'];
}

const AccessibleGraphData = (props: GraphTabledDataProps) => {
  const { chartInstance } = props;
  if (!chartInstance?.config?.data?.datasets) return null;

  const { datasets }: ChartData = chartInstance.config.data;

  const tables = datasets.map((dataset, tableID) => {
    if (!dataset.data) return '';

    const { label, data } = dataset;
    const tableHeader = (
      <tr>
        <th>Time</th>
        <th>{label}</th>
      </tr>
    );

    const tableBody = data.map((entry, idx) => {
      if (!entry) return 'no data';
      const { t: timestamp, y: value } = entry as ChartPoint;

      return (
        <tr key={`accessible-graph-data-body-row-${idx}`}>
          <td>
            {timestamp
              ? DateTime.fromMillis(+timestamp).toLocaleString(
                  DateTime.DATETIME_SHORT
                )
              : ''}
          </td>
          <td>{value}</td>
        </tr>
      );
    });

    return (
      <table
        key={`accessible-graph-data-table-${tableID}`}
        style={{ textAlign: 'left' }}
      >
        <thead>{tableHeader}</thead>
        <tbody>{tableBody}</tbody>
      </table>
    );
  });

  return <div>{tables}</div>;
};

export default AccessibleGraphData;
