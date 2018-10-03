import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Flag from 'src/assets/icons/flag.svg';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { withTypes } from 'src/context/types';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { displayType } from 'src/features/linodes/presentation';
import { linodeInTransition, transitionText } from 'src/features/linodes/transitions';
import haveAnyBeenModified from 'src/utilities/haveAnyBeenModified';

import { getType } from 'src/services/linodes';

import IPAddress from './IPAddress';
import LinodeActionMenu from './LinodeActionMenu';
import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';

type ClassNames = 'bodyRow'
  | 'linodeCell'
  | 'ipCell'
  | 'ipCellWrapper'
  | 'regionCell'
  | 'actionCell'
  | 'actionInner'
  | 'flag'
  | 'status'
  | 'link'
  | 'linkButton'
  | 'tagWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => {
  return ({
    bodyRow: {
      height: 77,
    },
    linodeCell: {
      width: '30%',
      '& h3': {
        transition: theme.transitions.create(['color']),
      },
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    ipCell: {
      width: '30%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    ipCellWrapper: {
      display: 'inline-flex',
      flexDirection: 'column',
    },
    regionCell: {
      width: '15%',
      [theme.breakpoints.down('sm')]: {
        width: '100%'
      },
    },
    actionCell: {
      width: '10%',
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
    tagWrapper: {
      marginTop: theme.spacing.unit / 2,
      marginLeft: theme.spacing.unit * 4,
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
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction,
    linodeId: number, linodeLabel: string) => void;
  renderTagsAndMoreTags: (tags: string[]) => JSX.Element;
}

interface TypesContextProps {
  typesData?: Linode.LinodeType[];
  typesLoading: boolean;
}

type CombinedProps =
  Props &
  TypesContextProps &
  WithStyles<ClassNames>;

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

  headCell = () => {
    const { linodeId, linodeStatus, linodeLabel, linodeTags, classes } = this.props;

    return (
      <TableCell parentColumn="Linode" className={classes.linodeCell}>
        <Link to={`/linodes/${linodeId}`} className={classes.link}>
          <Grid container wrap="nowrap" alignItems="center">
            <Grid item className="py0">
              <LinodeStatusIndicator status={linodeStatus} />
            </Grid>
            <Grid item className="py0">
              <Typography role="header" variant="subheading" data-qa-label>
                {linodeLabel}
              </Typography>
            </Grid>
          </Grid>
          </Link>
          <div className={classes.tagWrapper}>
            {this.props.renderTagsAndMoreTags(linodeTags)}
            </div>
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
      linodeId,
      linodeStatus,
      linodeIpv4,
      linodeIpv6,
      linodeRegion,
      linodeLabel,
      linodeBackups,
      classes,
      openConfigDrawer,
      toggleConfirmation,
      typesLoading,
      typesData,
      linodeType,
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
        {this.headCell()}
        <TableCell parentColumn="Plan">
          {!typesLoading &&
            <Typography variant="caption">{displayType(linodeType, typesData || [])} </Typography>
          }
        </TableCell>
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
