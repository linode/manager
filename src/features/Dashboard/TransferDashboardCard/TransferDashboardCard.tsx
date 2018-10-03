import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import { getNetworkUtilization } from 'src/services/account';

import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
  | 'grid'
  | 'poolUsageProgress'
  | 'circleChildren'
  | 'used'
  | 'quota'
  | 'initialLoader';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 4,
    [theme.breakpoints.up('md')]: {
      marginTop: theme.spacing.unit,
    },
  },
  grid: {
    flexWrap: 'wrap',
    flexDirection: 'column',
    textAlign: 'center',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap',
      flexDirection: 'row',
      textAlign: 'left',
    },
    [theme.breakpoints.up('md')]: {
      flexWrap: 'wrap',
      flexDirection: 'column',
      textAlign: 'center',
    },
    [theme.breakpoints.up('lg')]: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      textAlign: 'left',
    },
  },
  poolUsageProgress: {
    marginRight: theme.spacing.unit * 4,
  },
  circleChildren: {
    textAlign: 'center',
    position: 'relative',
    top: -6,
  },
  used: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: theme.color.headline,
  },
  quota: {},
  initialLoader: {
    minHeight: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  used?: number;
  quota?: number;
}

type CombinedProps = WithStyles<ClassNames>;

class TransferDashboardCard extends React.Component<CombinedProps, State> {
  state: State = {
    loading: true,
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
      /** If it's an error state, we're not going to diplay it at all.  */
      return this.renderErrorState(errors);
    }

    if (!used || !quota) {
      return null;
    }

    const poolUsagePct = ((used / quota) * 100) < 1 ? 1 : (used / quota) * 100;

    return (
      <DashboardCard>
        <Paper className={classes.root}>
          <Grid
            container
            justify="center"
            alignItems="center"
            wrap="nowrap"
            className={classes.grid}
            data-qa-card="Monthly Transfer"
          >
            <Grid item>
              <CircleProgress
                variant="static"
                noTopMargin
                green
                value={poolUsagePct}
                className={classes.poolUsageProgress}
              >
                <span className={classes.circleChildren}>
                  <Typography
                    className={classes.used}
                    data-qa-transfer-used
                  >
                    {used}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={classes.quota}
                    data-qa-transfer-quota
                  >
                    of {quota} GB
                  </Typography>
                </span>
              </CircleProgress>
            </Grid>
            <Grid item>
              <Typography variant='title'>This Month's Network Transfer Pool</Typography>
              <Typography>Network bandwith during the current billing cycle.</Typography>
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
      .then(({ used, quota }) => this.mounted && this.setState({ used, quota, loading: false, }))
      .catch((error) => this.mounted && this.setState({ loading: false, errors: [{ reason: 'Unable to load network utilization.' }] }))
  };
}

const styled = withStyles(styles, { withTheme: true });

export default styled(TransferDashboardCard);
