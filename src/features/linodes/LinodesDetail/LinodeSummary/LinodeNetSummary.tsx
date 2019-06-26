import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import BarPercent from 'src/components/BarPercent';
import CircleProgress from 'src/components/CircleProgress';
import { WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import {
  ClassNames,
  styled
} from 'src/features/Dashboard/TransferDashboardCard/TransferDashboardCard';
import { getLinodeTransfer } from 'src/services/linodes';
import { MapState } from 'src/store/types';
import { isRecent } from 'src/utilities/isRecent.ts';
import { readableBytes } from 'src/utilities/unitConversions';

interface Props {
  linodeId: number;
}

interface StateProps {
  used: number;
  loading: boolean;
  error: boolean;
}

type CombinedProps = Props & StoreProps & StateProps & WithStyles<ClassNames>;

class LinodeNetSummary extends React.Component<CombinedProps, StateProps> {
  state = {
    used: 0,
    loading: true,
    error: false
  };

  componentDidMount() {
    const { linodeId } = this.props;
    getLinodeTransfer(linodeId)
      .then(({ used }) => {
        this.setState({
          used,
          loading: false,
          error: false
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          error: true
        });
      });
  }

  render() {
    const { total, classes, isTooEarlyForStats } = this.props;
    const { used, loading, error } = this.state;

    const usedInGb = used / 1024 / 1024 / 1024;

    const usagePercent = 100 - ((total - usedInGb) * 100) / total;

    const readableUsed = readableBytes(used, {
      maxUnit: 'GB',
      round: { MB: 0, GB: 1 }
    });

    const totalInBytes = total * 1024 * 1024 * 1024;
    const readableFree = readableBytes(totalInBytes - used, {
      maxUnit: 'GB',
      round: { MB: 0, GB: 1 },
      handleNegatives: false
    });

    if (loading) {
      return (
        <>
          <Typography align="center" variant="h2">
            Monthly Network Transfer
          </Typography>
          <Grid container justify="center">
            <Grid item>
              <CircleProgress mini />
            </Grid>
          </Grid>
        </>
      );
    }

    if (error && isTooEarlyForStats) {
      return (
        <>
          <Typography align="center" variant="h2" className={classes.title}>
            Monthly Network Transfer
          </Typography>
          <Typography align="center">
            Network Transfer data is not yet available – check back later.
          </Typography>
        </>
      );
    }

    if (error) {
      return (
        <Notice
          text={
            'Network transfer information for this Linode is currently unavailable.'
          }
          error={true}
          important
          spacingBottom={0}
        />
      );
    }

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h3">Monthly Network Transfer</Typography>
        </Grid>
        <Grid item xs={12}>
          <BarPercent
            max={100}
            value={Math.ceil(usagePercent)}
            className={classes.poolUsageProgress}
            rounded
          />
          <Grid container justify="space-between">
            <Grid item style={{ marginRight: 10 }}>
              <Typography>
                {readableUsed.value} {readableUsed.unit} Used
              </Typography>
            </Grid>
            <Grid item>
              <Typography>
                {total - readableUsed.value} {readableFree.unit} Available
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

interface StoreProps {
  total: number;
  isTooEarlyForStats?: boolean;
}

const mapStateToProps: MapState<StoreProps, CombinedProps> = (state, props) => {
  const linode = state.__resources.linodes.entities.find(
    (l: Linode.Linode) => l.id === props.linodeId
  );
  return {
    total: linode ? linode.specs.transfer : 0,
    isTooEarlyForStats:
      linode && isRecent(linode.created, moment.utc().format())
  };
};

const connected = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  styled,
  connected
)(LinodeNetSummary);
