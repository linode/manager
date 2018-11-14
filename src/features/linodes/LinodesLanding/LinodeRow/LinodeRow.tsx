import { compose } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles, WithTheme } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Flag from 'src/assets/icons/flag.svg';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { withTypes } from 'src/context/types';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { displayType } from 'src/features/linodes/presentation';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import { getType } from 'src/services/linodes';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import BackupCell from './BackupCell';
import HeadCell from './HeadCell';

type ClassNames =
  'bodyRow'
  | 'planCell'
  | 'ipCell'
  | 'ipCellWrapper'
  | 'regionCell'
  | 'actionCell'
  | 'actionInner'
  | 'flag'
  | 'status'
  | 'linkButton'
  ;

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  return ({
    bodyRow: {
      height: 77,
    },

    ipCell: {
      width: '25%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    planCell: {
      width: '15%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    ipCellWrapper: {
      display: 'inline-flex',
      flexDirection: 'column',
    },
    regionCell: {
      width: '10%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    actionCell: {
      width: '5%',
      textAlign: 'right',
      '& button': {
        width: 30,
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    flag: {
      marginRight: 10,
      transition: theme.transitions.create(['opacity']),
      opacity: 1,
      '&:hover': {
        opacity: .75,
      },
    },
    status: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing.unit,
      color: theme.palette.text.primary,
      fontSize: '.92rem',
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

interface State {
  mutationAvailable: boolean;
}

interface Props {
  linodeId: number;
  linodeStatus: Linode.LinodeStatus;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeRegion: string;
  linodeType: null | string;
  linodeNotification?: string;
  linodeLabel: string;
  linodeBackups: Linode.LinodeBackups;
  linodeTags: string[];
  linodeRecentEvent?: Linode.Event;
  mostRecentBackup?: string;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
}

interface TypesContextProps {
  typesData?: Linode.LinodeType[];
  typesLoading: boolean;
}

type CombinedProps =
  & Props
  & TypesContextProps
  & WithTheme
  & WithStyles<ClassNames>;

class LinodeRow extends React.Component<CombinedProps, State> {
  state: State = {
    mutationAvailable: false,
  }

  shouldComponentUpdate(nextProps: CombinedProps, nextState: State) {
    return haveAnyBeenModified<Props & TypesContextProps>(
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
        'typesData',
        'typesLoading',
      ],
    )
      || haveAnyBeenModified<State>(
        nextState,
        this.state,
        ['mutationAvailable']
      )
      || this.props.theme.name !== nextProps.theme.name
  }

  componentDidMount() {
    const { linodeType } = this.props;
    if (!linodeType) { return }
    getType(linodeType)
      .then((data: Linode.LinodeType) => {
        if (data.successor && data.successor !== null) {
          this.setState({ mutationAvailable: true })
        }
      })
      .catch((e: Error) => e)
  }

  loadingState = () => {
    const {
      classes,
      linodeId,
      linodeLabel,
      linodeRecentEvent,
      linodeStatus,
      linodeTags,
    } = this.props;

    const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;

    return (
      <TableRow key={linodeId} className={classes.bodyRow} data-qa-loading>
        <HeadCell
          linodeId={linodeId}
          linodeLabel={linodeLabel}
          linodeTags={linodeTags}
          linodeStatus={linodeStatus}
        />
        <TableCell colSpan={5}>
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

  renderFlag = () => {
    /*
    * Render either a flag for if the Linode has a notification
    * or if it has a pending mutation available. Mutations take
    * precedent over notifications
    */
    const { mutationAvailable } = this.state;
    const { linodeNotification, classes } = this.props;
    if (mutationAvailable) {
      return (
        <Tooltip title="There is a free upgrade available for this Linode">
          <Flag className={classes.flag} />
        </Tooltip>
      )
    }
    if (linodeNotification) {
      return (
        <Tooltip title={linodeNotification}><Flag className={classes.flag} /></Tooltip>
      )
    }
    return null;
  }

  loadedState = () => {
    const {
      classes,
      linodeBackups,
      linodeId,
      linodeIpv4,
      linodeIpv6,
      linodeLabel,
      linodeRegion,
      linodeStatus,
      linodeTags,
      linodeType,
      mostRecentBackup,
      openConfigDrawer,
      toggleConfirmation,
      typesData,
      typesLoading,
    } = this.props;

    return (
      <TableRow
        key={linodeId}
        className={`${classes.bodyRow} 'fade-in-table'`}
        data-qa-loading
        data-qa-linode={linodeLabel}
        rowLink={`/linodes/${linodeId}`}
        arial-label={linodeLabel}
      >
        <HeadCell
          linodeId={linodeId}
          linodeLabel={linodeLabel}
          linodeTags={linodeTags}
          linodeStatus={linodeStatus}
        />
        <TableCell parentColumn="Plan" className={classes.planCell}>
          {!typesLoading &&
            <Typography variant="caption">{displayType(linodeType, typesData || [])}</Typography>
          }
        </TableCell>
        <BackupCell linodeId={linodeId} mostRecentBackup={mostRecentBackup} />
        <TableCell parentColumn="IP Addresses" className={classes.ipCell} data-qa-ips>
          <div className={classes.ipCellWrapper}>
            <IPAddress ips={linodeIpv4} copyRight />
            <IPAddress ips={[linodeIpv6]} copyRight />
          </div>
        </TableCell>
        <TableCell parentColumn="Region" className={classes.regionCell} data-qa-region>
          <RegionIndicator region={linodeRegion} />
        </TableCell>
        <TableCell className={classes.actionCell} data-qa-notifications>
          <div className={classes.actionInner}>
            {this.renderFlag()}
            <LinodeActionMenu
              linodeId={linodeId}
              linodeLabel={linodeLabel}
              linodeStatus={linodeStatus}
              linodeBackups={linodeBackups}
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

const typesContext = withTypes(({ loading: typesLoading, data: typesData }) => ({
  typesLoading,
  typesData,
}));

export default compose(
  withStyles(styles, { withTheme: true }),
  typesContext,
)(LinodeRow) as React.ComponentType<Props>;
