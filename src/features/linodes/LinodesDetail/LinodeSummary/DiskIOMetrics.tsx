import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import TableCell from 'src/components/TableCell';

type ClassNames = 'root'
  | 'legend'
  | 'red'
  | 'yellow';

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
  legend: {
    width: '20%',
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

interface MetricProps {
  max: number | string;
  average: number | string;
  last: number | string
}

interface Props {
  io: MetricProps;
  swap: MetricProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const DiskIOMetrics = (props: CombinedProps) => {
  const { classes, io, swap } = props;

  return (
    <Grid container>
      <Grid item xs={12} lg={6}>
        <Table padding="dense" className={classes.root}>
          <TableHead>
            <TableCell className={classes.root}>
              {''} {/* Empty TableCell for layout */}
            </TableCell>
            {['Max', 'Avg', 'Last'].map(section =>
              <TableCell key={section} className={classes.root} data-qa-header-cell>
                <Typography variant="subheading">
                  {section}
                </Typography>
              </TableCell>
            )}
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.legend}>
                <div className={classes.red}>
                  I/O Rate
                </div>
              </TableCell>
              {[io.max, io.average, io.last].map(section =>
                <TableCell key={section} className={classes.root} data-qa-body-cell>
                  <Typography variant="subheading">
                    {section}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell className={classes.legend}>
                <div className={classes.yellow}>
                  Swap Rate
                </div>
              </TableCell>
              {[swap.max, swap.average, swap.last].map(section =>
                <TableCell key={section} className={classes.root} data-qa-body-cell>
                  <Typography variant="subheading">
                    {section}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
}

const styled = withStyles(styles);

export default styled(DiskIOMetrics);