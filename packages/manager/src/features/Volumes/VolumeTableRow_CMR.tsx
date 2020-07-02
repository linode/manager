import { Event } from '@linode/api-v4/lib/account';
import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'src/components/core/styles';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import { formatRegion } from 'src/utilities';
import { ExtendedVolume } from './types';
import VolumesActionMenu from './VolumesActionMenu_CMR';

const useStyles = makeStyles(() => ({
  root: {},
  volumeLabel: {
    width: '25%'
  },
  volumeSize: {
    width: '10%'
  },
  volumePath: {
    width: '35%',
    wordBreak: 'break-all'
  },
  actionMenu: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 0,
    '&.MuiTableCell-root': {
      paddingRight: 0
    }
  }
}));

interface Props {
  volume: ExtendedVolume;
  isUpdating: boolean;
  isVolumesLanding: boolean;
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string
  ) => void;
  openForClone: (
    volumeId: number,
    volumeLabel: string,
    volumeSize: number,
    volumeRegion: string
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  handleAttach: (volumeId: number, label: string, regionID: string) => void;
  handleDetach: (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    poweredOff: boolean
  ) => void;
  handleDelete: (volumeId: number, volumeLabel: string) => void;
}

type CombinedProps = Props;

const progressFromEvent = (e?: Event) => {
  if (!e) {
    return undefined;
  }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
};

export const VolumeTableRow: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    isUpdating,
    isVolumesLanding,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
    handleAttach,
    handleDelete,
    handleDetach,
    volume
  } = props;
  const label = pathOr('', ['label'], volume);
  const size = pathOr('', ['size'], volume);
  const filesystemPath = pathOr(
    /** @todo Remove path default when API releases filesystem_path. */
    `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
    ['filesystem_path'],
    volume
  );
  const regionID = pathOr('', ['region'], volume);
  const region = formatRegion(regionID);

  return isUpdating ? (
    <TableRow key={volume.id} data-qa-volume-loading className="fade-in-table">
      <TableCell data-qa-volume-cell-label={label}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div>{label}</div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell colSpan={5}>
        <LinearProgress value={progressFromEvent(volume.recentEvent)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow
      key={volume.id}
      data-qa-volume-cell={volume.id}
      // className="fade-in-table"
    >
      <TableCell
        className={classes.volumeLabel}
        parentColumn="Label"
        data-qa-volume-cell-label={volume.label}
      >
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div>{volume.label}</div>
          </Grid>
        </Grid>
      </TableCell>
      {isVolumesLanding && (
        <TableCell parentColumn="Region" data-qa-volume-region>
          {region}
        </TableCell>
      )}
      <TableCell
        className={classes.volumeSize}
        parentColumn="Size"
        data-qa-volume-size
      >
        {size} GiB
      </TableCell>
      <TableCell
        className={classes.volumePath}
        parentColumn="File System Path"
        data-qa-fs-path
      >
        {filesystemPath}
      </TableCell>
      {isVolumesLanding && (
        <TableCell
          parentColumn="Attached To"
          data-qa-volume-cell-attachment={volume.linodeLabel}
        >
          {volume.linodeLabel ? (
            <Link
              to={`/linodes/${volume.linode_id}`}
              className="link secondaryLink"
            >
              {volume.linodeLabel}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell className={classes.actionMenu}>
        <VolumesActionMenu
          onShowConfig={openForConfig}
          filesystemPath={filesystemPath}
          linodeLabel={volume.linodeLabel || ''}
          regionID={regionID}
          volumeId={volume.id}
          volumeTags={volume.tags}
          size={size}
          label={label}
          onEdit={openForEdit}
          onResize={openForResize}
          onClone={openForClone}
          volumeLabel={volume.label}
          /**
           * This is a safer check than volume.linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(volume.linodeLabel)}
          onAttach={handleAttach}
          onDetach={handleDetach}
          poweredOff={volume.linodeStatus === 'offline'}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default VolumeTableRow;
