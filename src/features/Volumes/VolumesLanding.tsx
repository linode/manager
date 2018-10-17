import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowError from 'src/components/TableRowError';
import { BlockStorage } from 'src/documentation';
import { generateInFilter, resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getLinodes } from 'src/services/linodes';
import { deleteVolume, detachVolume, getVolumes } from 'src/services/volumes';
import { openForClone, openForCreating, openForEdit, openForResize } from 'src/store/reducers/volumeDrawer';
import { formatRegion } from 'src/utilities';

import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import VolumeConfigDrawer from './VolumeConfigDrawer';
import VolumesActionMenu from './VolumesActionMenu';
import WithEvents from './WithEvents';

type ClassNames = 'root'
  | 'title'
  | 'labelCol'
  | 'attachmentCol'
  | 'sizeCol'
  | 'pathCol';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  labelCol: {
    width: '15%',
    minWidth: 150,
  },
  attachmentCol: {
    width: '15%',
    minWidth: 150,
  },
  sizeCol: {
    width: '10%',
    minWidth: 75,
  },
  pathCol: {
    width: '25%',
    minWidth: 250,
  }
});

interface ExtendedVolume extends Linode.Volume {
  linodeLabel: string;
  linodeStatus: string;
}

interface Props extends PaginationProps<ExtendedVolume> {
  openForEdit: typeof openForEdit;
  openForResize: typeof openForResize;
  openForClone: typeof openForClone;
  openForCreating: typeof openForCreating;
  recentEvent?: Linode.Event;
}

interface State {
  configDrawer: {
    open: boolean;
    volumePath?: string;
    volumeLabel?: string;
  };
  attachmentDrawer: {
    open: boolean;
    volumeID?: number;
    volumeLabel?: string;
    linodeRegion?: string;
  };
  destructiveDialog: {
    open: boolean;
    mode: 'detach' | 'delete';
    volumeID?: number;
  };
}

type CombinedProps = Props & WithStyles<ClassNames>;

class VolumesLanding extends React.Component<CombinedProps, State> {
  state: State = {
    configDrawer: {
      open: false,
    },
    attachmentDrawer: {
      open: false,
    },
    destructiveDialog: {
      open: false,
      mode: 'detach',
    },
  };

  mounted: boolean = false;

  static docs: Linode.Doc[] = [
    BlockStorage,
    {
      title: 'Boot a Linode from a Block Storage Volume',
      src: `https://www.linode.com/docs/platform/block-storage/boot-from-block-storage-volume/`,
      body: `This guide shows how to boot a Linode from a Block Storage Volume.`,
    },
  ];

  componentDidMount() {
    this.mounted = true;

    this.props.request();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleCloseConfigDrawer = () => {
    this.setState({ configDrawer: { open: false } });
  }

  handleCloseAttachDrawer = () => {
    this.setState({ attachmentDrawer: { open: false } });
  }

  handleShowConfig = (volumePath: string, volumeLabel: string) => {
    this.setState({
      configDrawer: {
        open: true,
        volumePath,
        volumeLabel,
      }
    })
  }

  handleEdit = (
    volumeID: number,
    label: string,
    size: number,
    regionID: string,
    linodeLabel: string,
  ) => {
    this.props.openForEdit(
      volumeID,
      label,
      size,
      regionID,
      linodeLabel
    )
  }

  handleResize = (
    volumeID: number,
    label: string,
    size: number,
    regionID: string,
    linodeLabel: string,
  ) => {
    this.props.openForResize(
      volumeID,
      label,
      size,
      regionID,
      linodeLabel
    )
  }

  handleClone = (
    volumeID: number,
    label: string,
    size: number,
    regionID: string,
  ) => {
    this.props.openForClone(
      volumeID,
      label,
      size,
      regionID
    )
  }

  handleAttach = (
    volumeID: number,
    label: string,
    regionID: string
  ) => {
    this.setState({
      attachmentDrawer: {
        open: true,
        volumeID,
        volumeLabel: label,
        linodeRegion: regionID,
      }
    })
  }

  handleDetach = (volumeID: number) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'detach',
        volumeID,
      }
    })
  }

  handleDelete = (volumeID: number) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'delete',
        volumeID,
      }
    })
  }

  render() {
    const {
      classes,
      loading,
      count,
      page,
      pageSize,
    } = this.props;

    if (loading) {
      return this.renderLoading();
    }

    if (count === 0) {
      return this.renderEmpty();
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography role="header" variant="headline" className={classes.title} data-qa-title >
              Volumes
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={this.openCreateVolumeDrawer}
                  label="Create a Volume"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper>
          <Table aria-label="List of Volumes">
            <TableHead>
              <TableRow>
                <TableCell className={classes.labelCol}>Label</TableCell>
                <TableCell className={classes.attachmentCol}>Attached To</TableCell>
                <TableCell className={classes.sizeCol}>Size</TableCell>
                <TableCell className={classes.pathCol}>File System Path</TableCell>
                <TableCell>Region</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderContent()}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          count={count}
          page={page}
          pageSize={pageSize}
          handlePageChange={this.props.handlePageChange}
          handleSizeChange={this.props.handlePageSizeChange}
        />
        <VolumeConfigDrawer
          open={this.state.configDrawer.open}
          onClose={this.handleCloseConfigDrawer}
          volumePath={this.state.configDrawer.volumePath}
          volumeLabel={this.state.configDrawer.volumeLabel}
        />
        <VolumeAttachmentDrawer
          open={this.state.attachmentDrawer.open}
          volumeID={this.state.attachmentDrawer.volumeID || 0}
          volumeLabel={this.state.attachmentDrawer.volumeLabel || ''}
          linodeRegion={this.state.attachmentDrawer.linodeRegion || ''}
          onClose={this.handleCloseAttachDrawer}
        />
        <DestructiveVolumeDialog
          open={this.state.destructiveDialog.open}
          mode={this.state.destructiveDialog.mode}
          onClose={this.closeDestructiveDialog}
          onDetach={this.detachVolume}
          onDelete={this.deleteVolume}
        />
      </React.Fragment>
    );
  }

  renderContent = () => {
    const { error, data: volumes } = this.props;

    if (error) {
      return this.renderErrors(error);
    }


    if (volumes && this.props.count > 0) {
      return this.renderData(volumes);
    }

    return null;
  };

  renderLoading = () => {
    return <CircleProgress />;
  };

  renderErrors = (errors: Error) => {
    return (
      <TableRowError colSpan={5} message="There was an error loading your volumes." />
    );
  };

  renderEmpty = () => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        <Placeholder
          title="Create a Volume"
          copy="Add storage to your Linodes using the resilient Volumes service"
          icon={VolumesIcon}
          buttonProps={{
            onClick: this.props.openForCreating,
            children: 'Create a Volume',
          }}
        />
      </React.Fragment>
    );
  };

  renderData = (volumes: ExtendedVolume[]) => {
    return volumes.map((volume) => {
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

      return isVolumeUpdating(volume.recentEvent)
        ? (
          <TableRow key={volume.id} data-qa-volume-loading className="fade-in-table">
            <TableCell data-qa-volume-cell-label>{label}</TableCell>
            <TableCell colSpan={5}>
              <LinearProgress value={progressFromEvent(volume.recentEvent)} />
            </TableCell>
          </TableRow>
        )
        : (
          <TableRow key={volume.id} data-qa-volume-cell={volume.id} className="fade-in-table">
            <TableCell parentColumn="Label" data-qa-volume-cell-label>{volume.label}</TableCell>
            <TableCell parentColumn="Attached To" data-qa-volume-cell-attachment={volume.linodeLabel}>
              {volume.linodeLabel &&
                <Link to={`/linodes/${volume.linode_id}`}>
                  {volume.linodeLabel}
                </Link>
              }</TableCell>
            <TableCell parentColumn="Size" data-qa-volume-size>{size} GB</TableCell>
            <TableCell parentColumn="File System Path" data-qa-fs-path>{filesystemPath}</TableCell>
            <TableCell parentColumn="Region" data-qa-volume-region>{region}</TableCell>
            <TableCell>
              <VolumesActionMenu
                onShowConfig={this.handleShowConfig}
                filesystemPath={filesystemPath}
                linodeLabel={volume.linodeLabel}
                regionID={regionID}
                volumeID={volume.id}
                size={size}
                label={label}
                onEdit={this.handleEdit}
                onResize={this.handleResize}
                onClone={this.handleClone}
                attached={Boolean(volume.linodeLabel)}
                onAttach={this.handleAttach}
                onDetach={this.handleDetach}
                poweredOff={volume.linodeStatus === 'offline'}
                onDelete={this.handleDelete}
              />
            </TableCell>
          </TableRow>
        );
    });
  };

  closeDestructiveDialog = () => {
    this.setState({
      destructiveDialog: {
        ...this.state.destructiveDialog,
        open: false,
      },
    });
  }

  openCreateVolumeDrawer = (e: any) => {
    this.props.openForCreating();
    e.preventDefault();
  }

  detachVolume = () => {
    const { destructiveDialog: { volumeID } } = this.state;
    if (!volumeID) { return; }

    detachVolume(volumeID)
      .then((response) => {
        /* @todo: show a progress bar for volume detachment */
        sendToast('Volume detachment started');
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        /** @todo Error handling. */
      });
  }

  deleteVolume = () => {
    const { destructiveDialog: { volumeID } } = this.state;
    if (!volumeID) { return; }

    deleteVolume(volumeID)
      .then((response) => {
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        /** @todo Error handling. */
      });
  }
}

const isVolumeUpdating = (e?: Linode.Event) => {
  return e
    && ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action)
    && ['scheduled', 'started'].includes(e.status);
};

const progressFromEvent = (e?: Linode.Event) => {
  if (!e) { return undefined }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForEdit, openForResize, openForClone, openForCreating },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

const documented = setDocs(VolumesLanding.docs);

const updatedRequest = (ownProps: any, params: any, filters: any) => {
  return getVolumes(params, filters)
    .then((volumesResponse) => {
      /*
       * Iterate over all the volumes data and find the ones that
       * have a linodeId property that is not null and create an X-Filter
       * that we can use in the getLinodes() request
       */
      const linodeIDs = volumesResponse.data.map(volume => volume.linode_id).filter(Boolean);
      const xFilter = generateInFilter('id', linodeIDs);

      return getLinodes(undefined, xFilter)
        .then((linodesResponse) => {
          const volumesWithLinodeData = volumesResponse.data.map(eachVolume => {
            /*
             * Iterate over all the linode data and find a match between
             * the volumes linode ID and the Linode data id. If there's a match
             * it means that the Linode is attached to the volume and the Linode
             * status and label needs needs to be appended to the result data 
             */
            for (const eachLinode of linodesResponse.data) {
              if (eachLinode.id === eachVolume.linode_id) {
                return {
                  ...eachVolume,
                  linodeLabel: eachLinode.label,
                  linodeStatus: eachLinode.status
                }
              }
            }
            /*
             * Otherwise, this volume is not attached to a Linode 
             */
            return eachVolume;
          });

          return {
            ...volumesResponse,
            data: volumesWithLinodeData,
          }
        })
        .catch((err) => {
          /*
           * If getting the Linode data fails, no problem.
           * Just return the volumes 
           */
          return volumesResponse;
        });
    });
}

const paginated = paginate(updatedRequest);

const withEvents = WithEvents();

export default
  compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
    connected,
    documented,
    paginated,
    styled,
    withEvents
  )(VolumesLanding);
