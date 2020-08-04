import { Event } from '@linode/api-v4/lib/account';
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
import VolumesActionMenu, { ActionHandlers } from './VolumesActionMenu_CMR';
import { compose } from 'recompose';

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

type CombinedProps = ExtendedVolume & ActionHandlers;

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
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
    handleAttach,
    handleDelete,
    handleDetach,
    id,
    label,
    tags,
    size,
    recentEvent,
    region,
    filesystem_path: filesystemPath,
    linodeLabel,
    linode_id: linodeId,
    linodeStatus
  } = props;

  const formattedRegion = formatRegion(region);

  return isUpdating ? (
    <TableRow
      key={`volume-row-${id}`}
      data-qa-volume-loading
      className="fade-in-table"
    >
      <TableCell data-qa-volume-cell-label={label}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div>{label}</div>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell colSpan={5}>
        <LinearProgress value={progressFromEvent(recentEvent)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow
      key={`volume-row-${id}`}
      data-qa-volume-cell={id}
      // className="fade-in-table"
    >
      <TableCell
        className={classes.volumeLabel}
        parentColumn="Label"
        data-qa-volume-cell-label={label}
      >
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <div>{label}</div>
          </Grid>
        </Grid>
      </TableCell>
      {region && (
        <TableCell parentColumn="Region" data-qa-volume-region>
          {formattedRegion}
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
      <TableCell
        parentColumn="Attached To"
        data-qa-volume-cell-attachment={linodeLabel}
      >
        {linodeId ? (
          <Link to={`/linodes/${linodeId}`} className="link secondaryLink">
            {linodeLabel}
          </Link>
        ) : (
          <Typography data-qa-unattached>Unattached</Typography>
        )}
      </TableCell>
      <TableCell className={classes.actionMenu}>
        <VolumesActionMenu
          onShowConfig={openForConfig}
          filesystemPath={filesystemPath}
          linodeLabel={linodeLabel || ''}
          regionID={region}
          volumeId={id}
          volumeTags={tags}
          size={size}
          label={label}
          onEdit={openForEdit}
          onResize={openForResize}
          onClone={openForClone}
          volumeLabel={label}
          /**
           * This is a safer check than linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(linodeLabel)}
          onAttach={handleAttach}
          onDetach={handleDetach}
          poweredOff={linodeStatus === 'offline'}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default compose<CombinedProps, ActionHandlers & ExtendedVolume>(
  React.memo
)(VolumeTableRow);
