import * as React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose, pathOr } from 'ramda';

import { withStyles, Theme, WithStyles, StyleRulesCallback } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import Grid from 'src/components/Grid';
import Typography from '@material-ui/core/Typography';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Tooltip from '@material-ui/core/Tooltip';

import { displayType } from 'src/features/linodes/presentation';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import Flag from 'src/assets/icons/flag.svg';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import LinearProgress from 'src/components/LinearProgress';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';

import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';

type ClassNames = 'bodyRow'
  | 'linodeCell'
  | 'tagsCell'
  | 'ipCell'
  | 'regionCell'
  | 'actionCell'
  | 'actionInner'
  | 'flag'
  | 'status'
  | 'link'
  | 'linkButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    bodyRow: {
      height: 77,
    },
    linodeCell: {
      width: '30%',
      '& h3': {
        transition: theme.transitions.create(['color']),
      },
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
      transition: theme.transitions.create(['opacity']),
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
    link: {
      display: 'block',
    },
    linkButton: {
      padding: 0,
      width: '100%',
      textAlign: 'left',
      '&:hover': {
        backgroundColor: 'transparent',
        '& h3': {
          color: theme.palette.primary.main,
        },
      },
    },
  });
};

interface Props {
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeRegion: string;
  linodeType: null | string;
  linodeNotification?: string;
  linodeLabel: string;
  linodeRecentEvent?: Linode.Event;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

interface ConnectedProps {
  typeLabel: string;
}

type PropsWithStyles = Props & ConnectedProps & WithStyles<ClassNames>;

class LinodeRow extends React.Component<PropsWithStyles> {
  shouldComponentUpdate(nextProps: PropsWithStyles) {
    return haveAnyBeenModified<Props>(
      nextProps,
      this.props,
      [
        'linodeStatus',
        'linodeRegion',
        'linodeNotification',
        'linodeRecentEvent',
        'linodeLabel',
        'linodeIpv6',
        'linodeIpv4',
      ],
    );
  }

  headCell = () => {
    const { linodeId, linodeStatus, linodeLabel, classes, typeLabel } = this.props;

    return (
      <TableCell className={classes.linodeCell}>
        <Link to={`/linodes/${linodeId}`} className={classes.link}>
          <Button className={classes.linkButton}>
            <Grid container alignItems="center">
              <Grid item className="py0">
                <LinodeStatusIndicator status={linodeStatus} />
              </Grid>
              <Grid item className="py0">
                <Typography variant="subheading" data-qa-label>
                  {linodeLabel}
                </Typography>
                <Typography>
                  {typeLabel}
                </Typography>
              </Grid>
            </Grid>
          </Button>
        </Link>
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
            <div className={classes.status}>
              {transitionText(linodeStatus, linodeRecentEvent)}: {value}%
            </div>
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
      toggleConfirmation,
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
              toggleConfirmation={toggleConfirmation}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }

  render() {
    const loading = linodeInTransition(this.props.linodeStatus, this.props.linodeRecentEvent);

    return loading
      ? this.loadingState()
      : this.loadedState();
  }
}
const connected = connect((state: Linode.AppState, ownProps: Props) => ({
  typeLabel: displayType(
    ownProps.linodeType,
    pathOr([], ['resources', 'types', 'data', 'data'], state),
  ),
}));

export default compose(
  withStyles(styles, { withTheme: true }),
  connected,
)(LinodeRow) as React.ComponentType<Props>;
