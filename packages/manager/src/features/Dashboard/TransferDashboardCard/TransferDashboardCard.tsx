import { getNetworkUtilization } from 'linode-js-sdk/lib/account';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import DashboardCard from '../DashboardCard';

export type ClassNames =
  | 'root'
  | 'card'
  | 'grid'
  | 'poolUsageProgress'
  | 'initialLoader'
  | 'title';

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
      marginBottom: theme.spacing(1) / 2
    },
    initialLoader: {
      minHeight: 150,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      paddingBottom: theme.spacing(2)
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
                Monthly Network Transfer Pool
              </Typography>
              <BarPercent
                max={100}
                value={Math.ceil(poolUsagePct)}
                className={classes.poolUsageProgress}
                rounded
              />
              <Grid container justify="space-between">
                <Grid item style={{ marginRight: 10 }}>
                  <Typography>{used} GB Used</Typography>
                </Grid>
                <Grid item>
                  <Typography>{quota - used} GB Available</Typography>
                </Grid>
              </Grid>
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
