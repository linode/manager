import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import CircleProgress from 'src/components/CircleProgress';
import Grid from 'src/components/Grid';
import { getNetworkUtilization } from 'src/services/account';

import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
 | 'poolUsageProgress';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
  },
  poolUsageProgress: {

  },
});

interface Props { }

interface State {
  loading: boolean;
  errors?: Linode.ApiFieldError[];
  used?: number;
  quota?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

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
          <Grid container>
            <Grid item xs={12} md={6}>
              <CircleProgress
                variant="static"
                noTopMargin
                value={poolUsagePct}
                className={classes.poolUsageProgress}
              >
                <span>{`${used} of ${quota}`}</span>
              </CircleProgress>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='subheading'>This Month's Network Transfer Pool</Typography>
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
      <Paper>
        {/* @todo This looks a bit wonky, if you wouldn't mind fixing it up Alban. */}
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
