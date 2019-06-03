import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { getNetworkUtilization } from 'src/services/account';
import DashboardCard from '../DashboardCard';

export type ClassNames =
  | 'root'
  | 'card'
  | 'grid'
  | 'poolUsageProgress'
  | 'circleChildren'
  | 'used'
  | 'quota'
  | 'initialLoader'
  | 'title'
  | 'divider'
  | 'itemText'
  | 'itemTextFirst';

const styles = (theme: Theme) =>
  createStyles({
  root: {
    marginTop: 0,
    padding: `${theme.spacing(4)}px ${theme.spacing(3)}px`
  },
  card: {
    marginTop: 24,
    [theme.breakpoints.down('sm')]: {
      marginTop: 0
    }
  },
  grid: {
    paddingLeft: 8,
    paddingRight: 8
  },
  poolUsageProgress: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('lg')]: {}
  },
  circleChildren: {
    textAlign: 'center',
    position: 'relative',
    top: -6
  },
  used: {
    fontSize: '1.5rem',
    fontFamily: theme.font.bold,
    color: theme.color.green
  },
  quota: {
    marginTop: theme.spacing(1)
  },
  initialLoader: {
    minHeight: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    paddingBottom: theme.spacing(2)
  },
  divider: {
    backgroundColor: theme.palette.divider,
    margin: `${theme.spacing(1)}px 0`
  },
  itemText: {
    fontSize: '1rem'
  },
  itemTextFirst: {
    marginBottom: theme.spacing(1)
  }
});

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  used?: number;
  quota?: number;
}

type CombinedProps = WithStyles<ClassNames>;

export const renderPercentageString = (percentage: number) =>
  percentage < 1 ? '<1%' : `${Math.floor(percentage)}%`;
class TransferDashboardCard extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true
  };

  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
    this.requestNetworkUtilization(true);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { errors, loading, used, quota } = this.state;
    const { classes } = this.props;

    if (loading) {
      return this.renderLoadingState();
    }

    if (errors) {
      /** If it's an error state, we're not going to display it at all.  */
      return this.renderErrorState(errors);
    }

    if (!used || !quota) {
      return null;
    }

    const poolUsagePct = (used / quota) * 100;

    return (
      <DashboardCard className={classes.card}>
        <Paper className={classes.root}>
          <Grid
            container
            className={classes.grid}
            data-qa-card="Monthly Transfer"
          >
            <Grid item container direction="column">
              <Typography variant="h2" className={classes.title}>
                This Month's Network Transfer Pool
              </Typography>
              <BarPercent
                max={100}
                value={Math.ceil(poolUsagePct)}
                className={classes.poolUsageProgress}
              />
              <Typography>
                You have used{' '}
                <strong>{renderPercentageString(poolUsagePct)}</strong> of your
                available network transfer during the current billing cycle.
              </Typography>
              <Divider className={classes.divider} />
              <Typography
                className={classes.itemText + ' ' + classes.itemTextFirst}
              >
                Total: <strong>{quota}</strong> GB
              </Typography>
              <Typography className={classes.itemText}>
                Used: <strong>{used}</strong> GB
              </Typography>
              <Divider className={classes.divider} />
              <Typography className={classes.itemText}>
                Free: <strong>{quota - used}</strong> GB
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </DashboardCard>
    );
  }

  renderErrorState = (e: Linode.ApiFieldError[]) => null;

  renderLoadingState = () => (
    <DashboardCard>
      <Paper className={this.props.classes.initialLoader}>
        <CircleProgress mini />
      </Paper>
    </DashboardCard>
  );

  requestNetworkUtilization = (initial: boolean = false) => {
    this.setState({ loading: initial });

    getNetworkUtilization()
      .then(
        ({ used, quota }) =>
          this.mounted && this.setState({ used, quota, loading: false })
      )
      .catch(
        error =>
          this.mounted &&
          this.setState({
            loading: false,
            errors: [{ reason: 'Unable to load network utilization.' }]
          })
      );
  };
}

export const styled = withStyles(styles);

export default styled(TransferDashboardCard);
