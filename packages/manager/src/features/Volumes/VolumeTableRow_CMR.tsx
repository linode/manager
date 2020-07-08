import { Event } from '@linode/api-v4/lib/account';
import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import { formatRegion } from 'src/utilities';
import { ExtendedVolume } from './types';
import VolumesActionMenu, { VolumeHandlers } from './VolumesActionMenu_CMR';

type ClassNames =
  | 'root'
  | 'title'
  | 'labelCol'
  | 'labelStatusWrapper'
  | 'attachmentCol'
  | 'sizeCol'
  | 'pathCol'
  | 'volumesWrapper'
  | 'linodeVolumesWrapper'
  | 'systemPath';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginBottom: theme.spacing(2)
    },
    // styles for /volumes table
    volumesWrapper: {},
    // styles for linodes/id/volumes table
    linodeVolumesWrapper: {
      '& $labelCol': {
        width: '20%',
        minWidth: 200
      },
      '& $sizeCol': {
        width: '15%',
        minWidth: 100
      },
      '& $pathCol': {
        width: '55%',
        minWidth: 350
      }
    },
    labelCol: {
      width: '25%',
      minWidth: 150,
      paddingLeft: 65
    },
    labelStatusWrapper: {
      display: 'flex',
      flexFlow: 'row nowrap',
      alignItems: 'center'
    },
    attachmentCol: {
      width: '15%',
      minWidth: 150
    },
    sizeCol: {
      width: '10%',
      minWidth: 75
    },
    pathCol: {
      width: '25%',
      minWidth: 250
    },
    systemPath: {
      wordBreak: 'break-all'
    }
  });

type CombinedProps = ExtendedVolume & VolumeHandlers & WithStyles<ClassNames>;

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
  const {
    classes,
    label,
    size,
    region,
    id,
    recentEvent,
    linodeLabel,
    linodeStatus,
    linode_id,
    tags,
    filesystem_path,
    ...handlers
  } = props;

  const params = useParams<{ linodeId: string }>();
  const isVolumesLanding = params.linodeId === undefined;

  const filesystemPath =
    filesystem_path ?? `/dev/disk/by-id/scsi-0Linode_Volume_${label}`;
  const regionID = region ?? '';
  const formattedRegion = formatRegion(regionID);
  const isUpdating = isVolumeUpdating(recentEvent);

  return isUpdating ? (
    <TableRow key={id} data-qa-volume-loading className="fade-in-table">
      <TableCell data-qa-volume-cell-label={label}>
        <div className={classes.labelStatusWrapper}>
          <Typography variant="h3" data-qa-label>
            {label}
          </Typography>
        </div>
      </TableCell>
      <TableCell colSpan={5}>
        <LinearProgress value={progressFromEvent(recentEvent)} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow key={id} data-qa-volume-cell={id} className="fade-in-table">
      <TableCell parentColumn="Label" data-qa-volume-cell-label={label}>
        <div className={classes.labelStatusWrapper}>
          <Typography variant="h3" data-qa-label>
            {label}
          </Typography>
        </div>
      </TableCell>
      {isVolumesLanding && (
        <TableCell parentColumn="Region" data-qa-volume-region>
          {formattedRegion}
        </TableCell>
      )}
      <TableCell parentColumn="Size" data-qa-volume-size>
        {size} GiB
      </TableCell>
      <TableCell
        parentColumn="File System Path"
        data-qa-fs-path
        className={classes.systemPath}
      >
        {filesystemPath}
      </TableCell>
      {isVolumesLanding && (
        <TableCell
          parentColumn="Attached To"
          data-qa-volume-cell-attachment={linodeLabel}
        >
          {linodeLabel ? (
            <Link to={`/linodes/${linode_id}`} className="link secondaryLink">
              {linodeLabel}
            </Link>
          ) : (
            <Typography data-qa-unattached>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell>
        <VolumesActionMenu
          {...handlers}
          filesystemPath={filesystemPath}
          linodeLabel={linodeLabel || ''}
          regionID={regionID}
          volumeId={id}
          volumeTags={tags}
          size={size}
          label={label}
          volumeLabel={label}
          /**
           * This is a safer check than linode_id (see logic in addAttachedLinodeInfoToVolume() from VolumesLanding)
           * as it actually checks to see if the Linode exists before adding linodeLabel and linodeStatus.
           * This avoids a bug (M3-2534) where a Volume attached to a just-deleted Linode
           * could sometimes get tagged as "attached" here.
           */
          attached={Boolean(linodeLabel)}
          poweredOff={linodeStatus === 'offline'}
        />
      </TableCell>
    </TableRow>
  );
};

export const isVolumeUpdating = (e?: Event) => {
  if (!e) {
    return false;
  }
  return (
    e &&
    ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action) &&
    ['scheduled', 'started'].includes(e.status)
  );
};

const styled = withStyles(styles);

export default styled(VolumeTableRow);
