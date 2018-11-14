import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Flag from 'src/assets/icons/flag.svg';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { displayType } from 'src/features/linodes/presentation';
import IPAddress from '../IPAddress';
import LinodeActionMenu from '../LinodeActionMenu';
import RegionIndicator from '../RegionIndicator';
import BackupCell from './BackupCell';
import HeadCell from './HeadCell';

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
  typesData?: Linode.LinodeType[];
  typesLoading: boolean;

}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowLoaded: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeBackups,
    linodeId,
    linodeIpv4,
    linodeIpv6,
    linodeLabel,
    linodeNotification,
    linodeRegion,
    linodeStatus,
    linodeTags,
    linodeType,
    mostRecentBackup,
    mutationAvailable,
    openConfigDrawer,
    toggleConfirmation,
    typesData,
    typesLoading,
  } = props;

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
