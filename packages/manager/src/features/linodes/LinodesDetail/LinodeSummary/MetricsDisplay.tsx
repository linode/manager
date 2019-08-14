import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { Metrics } from 'src/utilities/statMetrics';

type ClassNames =
  | 'root'
  | 'legend'
  | 'purple'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'text'
  | 'tableHeadInner';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 600,
      '& *': {
        height: 'auto',
        border: 'none',
        backgroundColor: 'transparent'
      },
      '& td:first-child': {
        backgroundColor: 'transparent !important'
      },
      '& .data': {
        minWidth: 100
      },
      [theme.breakpoints.down('lg')]: {
        '& th, & td': {
          padding: '4px !important'
        }
      },
      [theme.breakpoints.down('sm')]: {
        maxWidth: '100%',
        '& td': {
          justifyContent: 'normal',
          minHeight: 'auto'
        }
      },
      [theme.breakpoints.only('xs')]: {
        '& tr:not(:first-child) td': {
          '&:first-child': {
            marginTop: theme.spacing(2)
          }
        }
      },
      [theme.breakpoints.only('sm')]: {
        '& tr:not(:nth-last-child(n+3)) td:first-child': {
          marginTop: theme.spacing(2)
        },
        '& tbody': {
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        },
        '& tr': {
          flexBasis: '45%'
        }
      }
    },
    tableHeadInner: {
      paddingBottom: 4
    },
    purple: {
      '&:before': {
        backgroundColor: theme.color.graphPurple
      }
    },
    yellow: {
      '&:before': {
        backgroundColor: theme.color.graphYellow
      }
    },
    blue: {
      '&:before': {
        backgroundColor: theme.color.graphBlue
      }
    },
    green: {
      '&:before': {
        backgroundColor: theme.color.graphGreen
      }
    },
    legend: {
      [theme.breakpoints.up('md')]: {
        width: '38%'
      },
      '& > div': {
        display: 'flex',
        alignItems: 'center',
        '&:before': {
          content: '""',
          display: 'inline-block',
          width: 20,
          height: 20,
          marginRight: theme.spacing(1)
        }
      }
    },
    text: {
      color: theme.color.black
    }
  });

interface MetricsDisplayProps {
  rows: MetricsDisplayRow[];
}

interface MetricsDisplayRow {
  legendColor: 'yellow' | 'purple' | 'blue' | 'green';
  legendTitle: string;
  format: (n: number) => string;
  data: Metrics;
}

type CombinedProps = MetricsDisplayProps & WithStyles<ClassNames>;

export const MetricsDisplay = ({ classes, rows }: CombinedProps) => {
  const rowHeaders = ['Max', 'Avg', 'Last'];

  return (
    <Table aria-label="Stats and metrics" className={classes.root}>
      <TableHead>
        <TableRow>
          <TableCell>{''}</TableCell>
          {rowHeaders.map((section, idx) => (
            <TableCell
              key={idx}
              data-qa-header-cell
              className={classes.tableHeadInner}
            >
              <Typography variant="body2" className={classes.text}>
                {section}
              </Typography>
            </TableCell>
          ))}
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
                    <span>{legendTitle}</span>
                  </div>
                </TableCell>
                {metricsBySection(data).map((section, idx) => {
                  return (
                    <TableCell
                      key={idx}
                      parentColumn={rowHeaders[idx]}
                      data-qa-body-cell
                    >
                      <Typography variant="body2" className={classes.text}>
                        {format(section)}
                      </Typography>
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </React.Fragment>
      </TableBody>
    </Table>
  );
};

// Grabs the sections we want (max, average, last) and puts them in an array
// so we can map through them and create JSX
export const metricsBySection = (data: Metrics): number[] => [
  data.max,
  data.average,
  data.last
];

const styled = withStyles(styles);

export default styled(MetricsDisplay);
