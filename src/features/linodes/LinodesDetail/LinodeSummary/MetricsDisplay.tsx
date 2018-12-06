import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell';
import { Metrics } from 'src/utilities/statMetrics';

type ClassNames = 'root'
  | 'legend'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'green';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    '& *': {
      border: 'none',
    },
    border: 'none',
    backgroundColor: '#FBFBFB',
    '& th': {
      paddingBottom: 4
    }
  },
  red: {
    '&:before': {
      backgroundColor: theme.color.red,
    },
  },
  yellow: {
    '&:before': {
      backgroundColor: theme.color.yellow,
    },
  },
  blue: {
    '&:before': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  green: {
    '&:before': {
      backgroundColor: theme.color.green,
    },
  },
  legend: {
    width: '33%',
    '& > div': {
      display: 'flex',
      '&:before': {
        content: '""',
        display: 'block',
        width: 20,
        height: 20,
        marginRight: theme.spacing.unit,
      },
    }
  }
});

interface MetricsDisplayProps {
  rows: MetricsDisplayRow[];
}

interface MetricsDisplayRow {
  legendColor: 'yellow' | 'red' | 'blue' | 'green';
  legendTitle: string;
  format: (n: number) => string;
  data: Metrics;
}

type CombinedProps = MetricsDisplayProps & WithStyles<ClassNames>

export const MetricsDisplay = ({ classes, rows }: CombinedProps) => {
  return (
    <Table padding="dense" className={classes.root}>
      <TableHead>
        <TableRow>
          <TableCell>
            {''} {/* Empty TableCell for layout */}
          </TableCell>
          {['Max', 'Avg', 'Last'].map((section, idx) =>
            <TableCell key={idx} data-qa-header-cell>
              <Typography variant="subheading">
                {section}
              </Typography>
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        <React.Fragment>
          {rows.map(row => {
            const { legendTitle, legendColor, data, format } = row;
            return (
              <TableRow key={legendTitle} data-qa-metric-row>
                <TableCell className={classes.legend}>
                  <div className={classes[legendColor]} data-qa-legend-title>
                    {legendTitle}
                  </div>
                </TableCell>
                {metricsBySection(data).map((section, idx) => {
                  return (<TableCell key={idx} data-qa-body-cell>
                    <Typography variant="subheading">
                      {format(section)}
                    </Typography>
                  </TableCell>)
                }
                )}
              </TableRow>
            );
          })}
        </React.Fragment>
      </TableBody>
    </Table>
  );
}

export const metricsBySection = (data: Metrics): number[] =>
  [data.max, data.average, data.last]

const styled = withStyles(styles);

export default styled(MetricsDisplay);
