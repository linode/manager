import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import { formatRegion } from 'src/utilities';
import VolumesActionMenu from './VolumesActionMenu';
import { ExtendedVolume } from './VolumesLanding';

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

type CombinedProps = Props & WithStyles<ClassNames>;

const progressFromEvent = (e?: Linode.Event) => {
  if (!e) {
    return undefined;
  }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
};

export const VolumeTableRow: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
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
          <Grid item className="py0">
            <EntityIcon variant="volume" marginTop={1} />
          </Grid>
          <Grid item>
            <div className={classes.labelStatusWrapper}>
              <Typography variant="h3" data-qa-label>
                {label}
              </Typography>
            </div>
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
      className="fade-in-table"
    >
      <TableCell parentColumn="Label" data-qa-volume-cell-label={volume.label}>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            <EntityIcon variant="volume" marginTop={1} />
          </Grid>
          <Grid item>
            <div className={classes.labelStatusWrapper}>
              <Typography variant="h3" data-qa-label>
                {volume.label}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </TableCell>
      {isVolumesLanding && (
        <TableCell parentColumn="Region" data-qa-volume-region>
          {region}
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
            <Typography>Unattached</Typography>
          )}
        </TableCell>
      )}
      <TableCell>
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

const styled = withStyles(styles);

export default styled(VolumeTableRow);
