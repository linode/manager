import { pathOr } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import Tags from 'src/components/Tags';
import { formatRegion } from 'src/utilities';
import VolumesActionMenu from './VolumesActionMenu';

type TagClassNames = 'tagWrapper';

interface TagProps {
  tags: string[];
}
type CombinedTagsProps = TagProps & WithStyles<TagClassNames>;

class RenderTagsBase extends React.Component<CombinedTagsProps, {}> {
  render() {
    const { classes, tags } = this.props;
    return (
      <div className={classes.tagWrapper}>
        <Tags tags={tags} />
      </div>
    )
  }
}

const tagStyles: StyleRulesCallback<TagClassNames> = (theme) => ({
  tagWrapper: {
    marginTop: theme.spacing.unit / 2,
    '& [class*="MuiChip"]': {
      cursor: 'pointer',
    },
  },
});

const RenderTags = withStyles(tagStyles)(RenderTagsBase);

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  volume: any;
  isUpdating: boolean;
  isVolumesLanding: boolean;
  openForEdit: (volumeId: number, volumeLabel: string, volumeTags: string[]) => void;
  openForResize: (volumeId: number, volumeSize: number, volumeLabel: string) => void;
  openForClone: (volumeId: number, volumeLabel: string, volumeSize: number, volumeRegion: string) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  handleAttach: (volumeId: number, label: string, regionID: string) => void;
  handleDetach: (volumeId: number) => void;
  handleDelete: (volumeId: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const progressFromEvent = (e?: Linode.Event) => {
  if (!e) { return undefined }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
}

const VolumeTableRow: React.StatelessComponent<CombinedProps> = (props) => {
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
    volume,
  );
  const regionID = pathOr('', ['region'], volume);
  const region = formatRegion(regionID);

  return isUpdating
    ?
      <TableRow key={volume.id} data-qa-volume-loading className="fade-in-table">
        <TableCell data-qa-volume-cell-label={label}>
          {label}
          <RenderTags tags={volume.tags} />
        </TableCell>
        <TableCell colSpan={5}>
          <LinearProgress value={progressFromEvent(volume.recentEvent)} />
        </TableCell>
      </TableRow>
    :
      <TableRow key={volume.id} data-qa-volume-cell={volume.id} className="fade-in-table">
        <TableCell parentColumn="Label" data-qa-volume-cell-label={volume.label}>
          {volume.label}
          <RenderTags tags={volume.tags} />
        </TableCell>
        {isVolumesLanding &&
          <TableCell parentColumn="Region" data-qa-volume-region>
            {region}
          </TableCell>
        }
        <TableCell parentColumn="Size" data-qa-volume-size>{size} GiB</TableCell>
        <TableCell parentColumn="File System Path" data-qa-fs-path>{filesystemPath}</TableCell>
        {isVolumesLanding &&
          <TableCell parentColumn="Attached To" data-qa-volume-cell-attachment={volume.linodeLabel}>
            {volume.linodeLabel &&
              <Link to={`/linodes/${volume.linode_id}`}>
                {volume.linodeLabel}
              </Link>
            }
          </TableCell>
        }
        <TableCell>
          <VolumesActionMenu
            onShowConfig={openForConfig}
            filesystemPath={filesystemPath}
            linodeLabel={volume.linodeLabel}
            regionID={regionID}
            volumeId={volume.id}
            volumeTags={volume.tags}
            size={size}
            label={label}
            onEdit={openForEdit}
            onResize={openForResize}
            onClone={openForClone}
            attached={Boolean(volume.linode_id)}
            onAttach={handleAttach}
            onDetach={handleDetach}
            poweredOff={volume.linodeStatus === 'offline'}
            onDelete={handleDelete}
          />
        </TableCell>
    </TableRow>

};

const styled = withStyles(styles);

export default styled(VolumeTableRow);