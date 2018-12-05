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
  | 'legendCol';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    border: 'none',
    backgroundColor: '#FBFBFB',
    '& th': {
      paddingBottom: 4
    }
  },
  legend: {
    display: 'flex',
    '&:before': {
      backgroundColor: theme.palette.primary.main,
      content: '""',
      display: 'block',
      width: 20,
      height: 20,
      marginRight: theme.spacing.unit,
    },
  },
  legendCol: {
    width: '20%'
  }
});

interface MetricProps {
  max: string;
  average: string;
  last: string
}

interface Props {
  metrics: MetricProps;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const CPUMetrics = (props: CombinedProps) => {
  const { classes } = props;
  const { max, average, last } = props.metrics;

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
              <TableCell className={classes.legendCol}>
                <div className={classes.legend}>
                  CPU %
                </div>
              </TableCell>
              {[max, average, last].map(section =>
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

export default styled(CPUMetrics);