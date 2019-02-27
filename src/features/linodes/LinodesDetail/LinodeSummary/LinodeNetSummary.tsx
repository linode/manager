import * as React from 'react';
import { connect } from 'react-redux';
import * as moment from 'moment'
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import {
  WithStyles
} from 'src/components/core/styles';

import Typography from 'src/components/core/Typography';
import { getLinodeStatsByDate } from 'src/services/linodes';
import { MapState } from 'src/store/types';

import { ClassNames, renderPercentageString, styled } from 'src/features/Dashboard/TransferDashboardCard/TransferDashboardCard';
import { formatMagnitude, getMonthlyTraffic } from 'src/utilities/statMetrics'

  
interface Props {
  linodeId: number;
}

interface StateProps {
  used: number;
}


type CombinedProps = Props &
  StoreProps &
  StateProps &
  WithStyles<ClassNames>;


const Strong = (props: React.Props<{}>) => {
  return (<strong>
    {props.children}
  </strong>)
}
class LinodeNetSummary extends React.Component<CombinedProps, StateProps> {
  state = {
    used: 0
  };

  componentDidMount() {
    const { linodeId } = this.props;
    const now = moment();
    const year = now.format('YYYY');
    const month = now.format('MM');
    getLinodeStatsByDate(linodeId, year, month).then(resp => {
      this.setState({
        used: getMonthlyTraffic(resp.data.data)
      })
    })
  }

  render() {
    const { total, classes } = this.props;
    const { used } = this.state;

    const usedInGb = used / 8e9;
    const usagePercent = 100 - Math.floor((total - usedInGb) * 100 / total);

    return (
      <Paper className={classes.root}>
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
        <Typography variant="h2" className={classes.title}>
          This Month's Network Transfer Pool
        </Typography>
        <Typography>
          You have used {renderPercentageString(usagePercent)} of your
          available network transfer during the current billing cycle.
        </Typography>
        <Divider className={classes.divider} />
        <Typography
          className={classes.itemText + ' ' + classes.itemTextFirst}
        >
          Free: <strong>{Math.floor(total - usedInGb)}</strong> GB
        </Typography>
        <Typography className={classes.itemText}>
          Used: { formatMagnitude(used / 8, 'B', Strong) }
        </Typography>
        <Divider className={classes.divider} />
        <Typography className={classes.itemText}>
          Total: <strong>{total}</strong> GB
        </Typography>
      </Paper>
    )
  }
}

interface StoreProps {
  total: number;
}

const mapStateToProps: MapState<StoreProps, CombinedProps> = (state, props) => {
  const linode = state.__resources.linodes.entities.find((linode: Linode.Linode) => linode.id === props.linodeId);
  return {
    total: linode ? linode.specs.transfer : 0
  };
};

const connected = connect(mapStateToProps);


export default compose(styled, connected)(LinodeNetSummary);
