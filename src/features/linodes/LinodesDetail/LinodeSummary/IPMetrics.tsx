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

interface MetricProps {
  max: number | string;
  average: number | string;
  last: number | string
}

interface Props {
  privateIn: MetricProps;
  privateOut: MetricProps;
  publicIn: MetricProps;
  publicOut: MetricProps
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const IPMetrics = (props: CombinedProps) => {
  const { classes, privateIn, privateOut, publicIn, publicOut } = props;

  return (
    <Grid container direction="row">
      <Grid item xs={12} lg={6}>
        <Table padding="dense" className={classes.root}>
          <TableHead>
            <TableCell>
              {''} {/* Empty TableCell for layout */}
            </TableCell>
            {['Max', 'Avg', 'Last'].map(section =>
              <TableCell key={section} data-qa-header-cell>
                <Typography variant="subheading">
                  {section}
                </Typography>
              </TableCell>
            )}
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.legend}>
                <div className={classes.yellow}>
                  Private IPv4 Outbound
                </div>
              </TableCell>
              {[privateOut.max, privateOut.average, privateOut.last].map(section =>
                <TableCell key={section} data-qa-body-cell>
                  <Typography variant="subheading">
                    {section}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell className={classes.legend}>
                <div className={classes.red}>
                Private IPv4 Inbound
                </div>
              </TableCell>
              {[privateIn.max, privateIn.average, privateIn.last].map(section =>
                <TableCell key={section} data-qa-body-cell>
                  <Typography variant="subheading">
                    {section}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Table padding="dense" className={classes.root}>
          <TableHead>
            <TableCell>
              {''} {/* Empty TableCell for layout */}
            </TableCell>
            {['Max', 'Avg', 'Last'].map(section =>
              <TableCell key={section} data-qa-header-cell>
                <Typography variant="subheading">
                  {section}
                </Typography>
              </TableCell>
            )}
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell className={classes.legend}>
                <div className={classes.green}>
                  Public IPv4 Outbound
                </div>
              </TableCell>
              {[publicOut.max, publicOut.average, publicOut.last].map(section =>
                <TableCell key={section} data-qa-body-cell>
                  <Typography variant="subheading">
                    {section}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell className={classes.legend}>
                <div className={classes.blue}>
                  Public IPv4 Inbound
                </div>
              </TableCell>
              {[publicIn.max, publicIn.average, publicIn.last].map(section =>
                <TableCell key={section} data-qa-body-cell>
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

export default styled(IPMetrics);