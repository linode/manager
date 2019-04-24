import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import { WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import {
  ClassNames,
  renderPercentageString,
  styled
} from 'src/features/Dashboard/TransferDashboardCard/TransferDashboardCard';
import { getLinodeStatsByDate } from 'src/services/linodes';
import { MapState } from 'src/store/types';
import { isRecent } from 'src/utilities/isRecent.ts';
import { readableBytes } from 'src/utilities/readableBytes';
import { getMonthlyNetworkTransferInBits } from 'src/utilities/statMetrics';

interface Props {
  linodeId: number;
}

interface State {
  usedInBytes: number;
  loading: boolean;
  error: boolean;
}

type CombinedProps = Props & StoreProps & WithStyles<ClassNames>;

class LinodeNetSummary extends React.Component<CombinedProps, State> {
  state = {
    usedInBytes: 0,
    loading: true,
    error: false
  };

  componentDidMount() {
    const { linodeId } = this.props;
    const now = moment();
    const year = now.format('YYYY');
    const month = now.format('MM');
    getLinodeStatsByDate(linodeId, year, month)
      .then(resp => {
        this.setState({
          usedInBytes: getMonthlyNetworkTransferInBits(resp.data) / 8,
          loading: false
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
    const { totalTransferInGB, classes, isTooEarlyForStats } = this.props;
    const { usedInBytes, loading, error } = this.state;

    const usedInGB = usedInBytes / 1024 / 1024 / 1024;

    const usagePercent =
      100 - ((totalTransferInGB - usedInGB) * 100) / totalTransferInGB;

    const usedInReadableBytes = readableBytes(usedInBytes);

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
          <Typography align="center" variant="h2">
            Monthly Network Transfer
          </Typography>
        </Grid>
        <Grid item xs={6} sm={3} md={12}>
          <CircleProgress
            variant="static"
            noTopMargin
            green
            value={Math.ceil(usagePercent)}
            className={classes.poolUsageProgress}
          >
            <span className={classes.circleChildren}>
              <Typography className={classes.used} data-qa-transfer-used>
                {renderPercentageString(usagePercent)}
              </Typography>
            </span>
          </CircleProgress>
        </Grid>
        <Grid item xs={6} sm={9} md={12}>
          <Typography>
            You have used{' '}
            <strong>{renderPercentageString(usagePercent)}</strong> of your
            available Network Transfer quota for this Linode's plan (
            {totalTransferInGB} GB).
          </Typography>
          <Divider className={classes.divider} />
          <Typography
            className={classes.itemText + ' ' + classes.itemTextFirst}
          >
            Total: <strong>{totalTransferInGB}</strong> GB
          </Typography>

          <Typography className={classes.itemText}>
            Used: <strong>{usedInReadableBytes.value}</strong>{' '}
            {usedInReadableBytes.unit}
          </Typography>
          <Divider className={classes.divider} />
          <Typography className={classes.itemText}>
            Free: <strong>{Math.floor(totalTransferInGB - usedInGB)}</strong> GB
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

interface StoreProps {
  totalTransferInGB: number;
  isTooEarlyForStats?: boolean;
}

const mapStateToProps: MapState<StoreProps, CombinedProps> = (state, props) => {
  const linode = state.__resources.linodes.entities.find(
    (l: Linode.Linode) => l.id === props.linodeId
  );
  return {
    totalTransferInGB: linode ? linode.specs.transfer : 0,
    isTooEarlyForStats:
      linode && isRecent(linode.created, moment.utc().format())
  };
};

const connected = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  styled,
  connected
)(LinodeNetSummary);
