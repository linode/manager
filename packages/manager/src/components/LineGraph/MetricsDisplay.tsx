import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { Metrics } from 'src/utilities/statMetrics';
import styled, { StyleProps } from './MetricDisplay.styles';

interface MetricsDisplayProps {
  rows: MetricsDisplayRow[];
}

interface MetricsDisplayRow {
  legendColor:
    | 'yellow'
    | 'red'
    | 'blue'
    | 'green'
    | 'purple'
    | 'lightGreen'
    | 'darkGreen';
  legendTitle: string;
  format: (n: number) => string;
  data: Metrics;
}

type CombinedProps = MetricsDisplayProps & StyleProps;

export const MetricsDisplay = ({ classes, rows }: CombinedProps) => {
  const rowHeaders = ['Max', 'Avg', 'Last'];

  return (
    <Table aria-label="Stats and metrics" className={classes.root} noBorder>
      <TableHead>
        <TableRow>
          <TableCell>{''}</TableCell>
          {rowHeaders.map((section, idx) => (
            <TableCell
              key={idx}
              data-qa-header-cell
              className={classes.tableHeadInner}
            >
              <Typography variant="body1" className={classes.text}>
                {section}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => {
          const { legendTitle, legendColor, data, format } = row;
          return (
            <TableRow key={legendTitle} data-qa-metric-row>
              <TableCell className={classes.legend}>
                <div className={classes[legendColor]} data-qa-legend-title>
                  <Typography component="span">{legendTitle}</Typography>
                </div>
              </TableCell>
              {metricsBySection(data).map((section, idx) => {
                return (
                  <TableCell
                    key={idx}
                    parentColumn={rowHeaders[idx]}
                    data-qa-body-cell
                  >
                    <Typography variant="body1" className={classes.text}>
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

export default styled(MetricsDisplay);
