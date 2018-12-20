import * as React from 'react';
import Flag from 'src/assets/icons/flag.svg';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import LinodeRowBackupCell from './LinodeRowBackupCell';
import LinodeRowHeadCell from './LinodeRowHeadCell';
import LinodeRowLoading from './LinodeRowLoading';

type ClassNames =
  'actionCell'
  | 'actionInner'
  | 'bodyRow'
  | 'ipCell'
  | 'ipCellWrapper'
  | 'planCell'
  | 'regionCell'

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
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
  bodyRow: {
    height: 77,
    '&:hover .backupIcon': {
      fill: theme.palette.primary.main,
    },
  },
  ipCell: {
    width: '25%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  ipCellWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
  },
  planCell: {
    width: '15%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
  regionCell: {
    width: '10%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
  },
});

interface Props {
  loading: boolean;
  linodeBackups: Linode.LinodeBackups;
  linodeId: number;
  linodeIpv4: string[];
  linodeIpv6: string;
  linodeLabel: string;
  linodeNotification?: string;
  linodeRecentEvent?: Linode.Event;
  linodeRegion: string;
  linodeStatus: Linode.LinodeStatus;
  linodeTags: string[];
  linodeType: null | string;
  mostRecentBackup?: string;
  mutationAvailable: boolean;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
  displayType: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowLoaded: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeBackups,
    linodeId,
    loading,
    linodeIpv4,
    linodeIpv6,
    linodeLabel,
    linodeNotification,
    linodeRegion,
    linodeStatus,
    linodeTags,
    mostRecentBackup,
    mutationAvailable,
    openConfigDrawer,
    toggleConfirmation,
    displayType,
    linodeRecentEvent,
  } = props;

  const headCell = <LinodeRowHeadCell
    loading={loading}
    linodeId={linodeId}
    linodeRecentEvent={linodeRecentEvent}
    linodeLabel={linodeLabel}
    linodeTags={linodeTags}
    linodeStatus={linodeStatus}
  />

  return (
    <React.Fragment>
      {loading && <LinodeRowLoading linodeStatus={linodeStatus} linodeId={linodeId} linodeRecentEvent={linodeRecentEvent}>
        {headCell}
      </ LinodeRowLoading>}
      <TableRow
        key={linodeId}
        className={`${classes.bodyRow}`}
        data-qa-loading
        data-qa-linode={linodeLabel}
        rowLink={`/linodes/${linodeId}`}
        arial-label={linodeLabel}
      >
        {!loading && headCell}
        <TableCell parentColumn="Plan" className={classes.planCell}>
          <Typography variant="body1">{displayType}</Typography>
        </TableCell>
        <LinodeRowBackupCell linodeId={linodeId} mostRecentBackup={mostRecentBackup} />
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
            <RenderFlag
              mutationAvailable={mutationAvailable}
              linodeNotification={linodeNotification}
              classes={classes}
            />
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
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowLoaded);

const RenderFlag: React.StatelessComponent<{
  mutationAvailable: boolean;
  linodeNotification?: string,
  classes: any
}> = (props) => {
  /*
  * Render either a flag for if the Linode has a notification
  * or if it has a pending mutation available. Mutations take
  * precedent over notifications
  */
  const { mutationAvailable, linodeNotification, classes } = props;

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
