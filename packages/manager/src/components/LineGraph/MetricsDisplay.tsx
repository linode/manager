import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { Metrics } from 'src/utilities/statMetrics';
import { useMetricsDiaplyStyles } from './MetricDisplay.styles';

interface Props {
  rows: MetricsDisplayRow[];
}

interface MetricsDisplayRow {
  data: Metrics;
  format: (n: number) => string;
  legendColor:
    | 'blue'
    | 'darkGreen'
    | 'green'
    | 'lightGreen'
    | 'purple'
    | 'red'
    | 'yellow';
  legendTitle: string;
}

export const MetricsDisplay = ({ rows }: Props) => {
  const rowHeaders = ['Max', 'Avg', 'Last'];
  const { classes } = useMetricsDiaplyStyles();

  return (
    <Table aria-label="Stats and metrics" className={classes.root} noBorder>
      <TableHead>
        <TableRow>
          <TableCell>{''}</TableCell>
          {rowHeaders.map((section, idx) => (
            <TableCell
              className={classes.tableHeadInner}
              data-qa-header-cell
              key={idx}
            >
              <Typography className={classes.text} variant="body1">
                {section}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const { data, format, legendColor, legendTitle } = row;
          return (
            <TableRow data-qa-metric-row key={legendTitle}>
              <TableCell className={classes.legend}>
                <div
                  className={classes[legendColor]}
                  data-testid="legend-title"
                >
                  <Typography component="span">{legendTitle}</Typography>
                </div>
              </TableCell>
              {metricsBySection(data).map((section, idx) => {
                return (
                  <TableCell
                    data-qa-body-cell
                    key={idx}
                    parentColumn={rowHeaders[idx]}
                  >
                    <Typography className={classes.text} variant="body1">
                      {format(section)}
                    </Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

// Grabs the sections we want (max, average, last) and puts them in an array
// so we can map through them and create JSX
export const metricsBySection = (data: Metrics): number[] => [
  data.max,
  data.average,
  data.last,
];

export default MetricsDisplay;
