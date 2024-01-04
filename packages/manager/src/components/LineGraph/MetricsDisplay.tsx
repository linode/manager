import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { Typography } from 'src/components/Typography';
import { Metrics } from 'src/utilities/statMetrics';

import { useMetricsDisplayStyles } from './MetricDisplay.styles';

interface Props {
  rows: MetricsDisplayRow[];
}

export interface MetricsDisplayRow {
  data: Metrics;
  format: (n: number) => string;
  handleLegendClick?: () => void;
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
  const { classes } = useMetricsDisplayStyles();

  return (
    <Table aria-label="Stats and metrics" className={classes.root}>
      <TableHead sx={{ borderTop: 'none !important' }}>
        <TableRow sx={{ borderTop: 'none !important' }}>
          <TableCell sx={{ borderTop: 'none !important' }}>{''}</TableCell>
          {rowHeaders.map((section, idx) => (
            <TableCell
              data-qa-header-cell
              key={idx}
              sx={{ borderTop: 'none !important' }}
            >
              {section}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const {
            data,
            format,
            handleLegendClick,
            legendColor,
            legendTitle,
          } = row;
          return (
            <TableRow data-qa-metric-row key={legendTitle}>
              <TableCell className={classes.legend}>
                <Button
                  className={classes[legendColor]}
                  data-testid="legend-title"
                  onClick={handleLegendClick}
                >
                  <Typography component="span">{legendTitle}</Typography>
                </Button>
              </TableCell>
              {metricsBySection(data).map((section, idx) => {
                return (
                  <TableCell
                    data-qa-body-cell
                    key={idx}
                    parentColumn={rowHeaders[idx]}
                  >
                    {format(section)}
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
