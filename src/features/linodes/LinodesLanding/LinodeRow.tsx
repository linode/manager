import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import Tooltip from 'material-ui/Tooltip';

import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import Flag from 'src/assets/icons/flag.svg';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import LinearProgress from 'src/components/LinearProgress';

import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { displayLabel } from '../presentation';
import LinodeActionMenu from './LinodeActionMenu';
import transitionStatus from '../linodeTransitionStatus';

type ClassNames = 'bodyRow'
  | 'linodeCell'
  | 'tagsCell'
  | 'ipCell'
  | 'regionCell'
  | 'actionCell'
  | 'actionInner'
  | 'flag'
  | 'status';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    bodyRow: {
      height: 77,
    },
    linodeCell: {
      width: '30%',
    },
    tagsCell: {
      width: '15%',
    },
    ipCell: {
      width: '30%',
    },
    regionCell: {
      width: '15%',
    },
    actionCell: {
      width: '10%',
      textAlign: 'right',
      '& button': {
        width: 30,
      },
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    flag: {
      marginRight: 10,
      transition: theme.transitions.create('opacity'),
      opaity: 1,
      '&:hover': {
        opacity: .75,
      },
    },
    status: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing.unit,
      color: '#555',
      fontSize: '.92rem',
    },
  });
};

interface Props {
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeRegion: string;
  linodeNotification?: string;
  linodeLabel: string;
  linodeRecentEvent?: Linode.Event;
  type?: Linode.LinodeType;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
}

type PropsWithStyles = Props & WithStyles<ClassNames>;

class LinodeRow extends React.Component<PropsWithStyles> {
  shouldComponentUpdate(nextProps: PropsWithStyles) {
    return haveAnyBeenModified<Props>(
      nextProps,
      this.props,
      [
        'type',
        'linodeStatus',
        'linodeRegion',
        'linodeNotification',
        'linodeLabel',
        'linodeIpv6',
        'linodeIpv4',
      ],
    );
  }

  headCell = () => {
    const { type, linodeId, linodeStatus, linodeLabel, classes } = this.props;
    const specsLabel = type && displayLabel(type.memory);

    return (
      <TableCell className={classes.linodeCell}>
        <Grid container alignItems="center">
          <Grid item className="py0">
            <LinodeStatusIndicator status={linodeStatus} />
          </Grid>
          <Grid item className="py0">
            <Link to={`/linodes/${linodeId}`}>
              <Typography variant="subheading" data-qa-label>
                {linodeLabel}
              </Typography>
            </Link>
            {specsLabel && <div>{specsLabel}</div>}
          </Grid>
        </Grid>
      </TableCell>
    );
  }

  loadingState = () => {
    const { linodeId, linodeStatus, linodeRecentEvent, classes } = this.props;
    const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;
    return (
      <TableRow key={linodeId} className={classes.bodyRow} data-qa-loading>
        {this.headCell()}
        <TableCell colSpan={4}>
          {typeof value === 'number' &&
            <div className={classes.status}>{linodeStatus.replace('_', ' ')}: {value}%</div>
          }
          <LinearProgress value={value} />
        </TableCell>
      </TableRow>
    );
  }

  loadedState = () => {
    const {
      linodeId,
      linodeStatus,
      linodeIpv4,
      linodeIpv6,
      linodeRegion,
      linodeNotification,
      linodeLabel,
      classes,
      openConfigDrawer,
    } = this.props;

    return (
      <TableRow key={linodeId} data-qa-linode={linodeLabel}>
        {this.headCell()}
        <TableCell className={classes.ipCell} data-qa-ips>
          <IPAddress ips={linodeIpv4} copyRight />
          <IPAddress ips={[linodeIpv6]} copyRight />
        </TableCell>
        <TableCell className={classes.regionCell} data-qa-region>
          <RegionIndicator region={linodeRegion} />
        </TableCell>
        <TableCell className={classes.actionCell} data-qa-notifications>
          <div className={classes.actionInner}>
            {linodeNotification &&
              <Tooltip title={linodeNotification}><Flag className={classes.flag} /></Tooltip>
            }
            <LinodeActionMenu
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeStatus={linodeStatus}
              openConfigDrawer={openConfigDrawer}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  render() {
    const loading = transitionStatus.includes(this.props.linodeStatus);

    return loading
      ? this.loadingState()
      : this.loadedState();
  }
}

export default withStyles(styles, { withTheme: true })(LinodeRow);
