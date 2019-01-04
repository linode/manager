import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { getNetworkUtilization } from 'src/services/account';
import DashboardCard from '../DashboardCard';

type ClassNames = 'root'
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

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    marginTop: 0,
    padding: 24,
  },
  card: {
    [theme.breakpoints.down('sm')]: {
      marginTop: 0
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
    marginRight: theme.spacing.unit * 3,
    height: 'auto',
  },
  circleChildren: {
    textAlign: 'center',
    position: 'relative',
    top: -6,
  },
  used: {
    fontSize: '1.5rem',
    fontFamily: 'LatoWebBold',
    color: theme.color.headline,
  },
  quota: {
    marginTop: theme.spacing.unit,
  },
  initialLoader: {
    minHeight: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.unit * 2
  },
  divider: {
    backgroundColor: theme.palette.divider,
  },
  itemText: {
    fontSize: '1rem',
  },
  itemTextFirst: {
    marginBottom: theme.spacing.unit,
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
  percentage < 1 ? "<1%" : `${Math.floor(percentage)}%`;
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

    const poolUsagePct = ((used / quota) * 100);

    return (
      <DashboardCard className={classes.card}>
        <Paper className={classes.root}>
          <Typography variant='h2' className={classes.title}>This Month's Network Transfer Pool</Typography>
          <Grid
            container
            direction="column"
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
                value={Math.ceil(poolUsagePct)}
                className={classes.poolUsageProgress}
              >
                <span className={classes.circleChildren}>
                  <Typography
                    className={classes.used}
                    data-qa-transfer-used
                  >
                    {renderPercentageString(poolUsagePct)}
                  </Typography>
                </span>
              </CircleProgress>
            </Grid>
            <Grid item container direction="column">
              <Grid item>
                <Typography>You have used {renderPercentageString(poolUsagePct)} of your available network bandwidth during the current billing cycle.</Typography>
              </Grid>
              <Grid item>
                <Divider className={classes.divider}/>
              </Grid>
              <Grid item>
                <Typography className={classes.itemText + ' ' + classes.itemTextFirst}>Free: <strong>{quota - used}</strong> GB</Typography>
                <Typography className={classes.itemText}>Used: <strong>{used}</strong> GB</Typography>
              </Grid>
              <Grid item>
                <Divider className={classes.divider} />
              </Grid>
              <Grid item>
                <Typography className={classes.itemText}>Total: <strong>{quota}</strong> GB</Typography>
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
      .then(({ used, quota }) => this.mounted && this.setState({ used, quota, loading: false, }))
      .catch((error) => this.mounted && this.setState({ loading: false, errors: [{ reason: 'Unable to load network utilization.' }] }))
  };
}

const styled = withStyles(styles);

export default styled(TransferDashboardCard);
