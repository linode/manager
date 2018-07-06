import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { compose, equals, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import AddNewLink from 'src/components/AddNewLink';
import setDocs from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import LinearProgress from 'src/components/LinearProgress';
import Table from 'src/components/Table';
import { dcDisplayNames } from 'src/constants';
import { generateInFilter, resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getLinodes } from 'src/services/linodes';
import { detach, _delete } from 'src/services/volumes';
import { openForClone, openForCreating, openForEdit, openForResize } from 'src/store/reducers/volumeDrawer';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import VolumeConfigDrawer from './VolumeConfigDrawer';
import VolumesActionMenu from './VolumesActionMenu';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  volumes: Linode.Volume[];
  openForEdit: typeof openForEdit;
  openForResize: typeof openForResize;
  openForClone: typeof openForClone;
  openForCreating: typeof openForCreating;
}

interface State {
  linodeLabels: { [id: number]: string };
  linodeStatuses: { [id: number]: string };
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
    linodeLabels: {},
    linodeStatuses: {},
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
    {
      title: 'How to Use Block Storage with Your Linode',
      /* tslint:disable-next-line */
      src: `https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode`,
      body: `Linode’s Block Storage service allows you to attach additional storage volumes to your
      Linode. A single volume can range from 10 GiB to 10,000 GiB in size and costs $0.10/GiB per
      month. They can be partitioned however you like and can accommodate any filesystem type you
      choose. Up to eight volumes can be attached to a single Linode, be it new or already
      existing, so you do not need to recreate your server to add a Block Storage Volume.`,
    },
    {
      title: 'Boot a Linode from a Block Storage Volume',
      src: `https://www.linode.com/docs/platform/block-storage/boot-from-block-storage-volume/`,
      body: `Linode’s Block Storage service allows you to attach additional storage volumes to your
      Linode. In addition to storing files and media, you can also use a Block Storage Volume as a
      boot disk. This can provide a low-cost way to maintain an image that can be quickly attached
      to a new Linode and booted up when needed.`,
    },
  ];

  getLinodeLabels() {
    const linodeIDs = this.props.volumes.map(volume => volume.linode_id).filter(Boolean);
    const xFilter = generateInFilter('id', linodeIDs);
    getLinodes(undefined, xFilter)
      .then((response) => {
        if (!this.mounted) { return; }
        const linodeLabels = {};
        for (const linode of response.data) {
          linodeLabels[linode.id] = linode.label;
        }
        this.setState({ linodeLabels });

        const linodeStatuses = {};
        for (const linode of response.data) {
          linodeStatuses[linode.id] = linode.status;
        }
        this.setState({ linodeStatuses });
      })
      .catch((err) => { /** @todo how do we want to display this error */ });
  }

  componentDidMount() {
    this.mounted = true;
    this.getLinodeLabels();
  }
  
  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (!equals(prevProps.volumes, this.props.volumes)) {
      this.getLinodeLabels();
    }
  }

  closeDestructiveDialog() {
    this.setState({
      destructiveDialog: { open: false, mode: 'detach' },
    });
  }

  openCreateVolumeDrawer = (e: any) => {
    this.props.openForCreating();
    e.preventDefault();
}

  detachVolume = () => {
    const { destructiveDialog: { volumeID } } = this.state;
    if (!volumeID) { return; }

    detach(volumeID)
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

    _delete(volumeID)
      .then((response) => {
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        /** @todo Error handling. */
      });
  }

  render() {
    const {
      volumes,
      classes,
      openForEdit,
      openForResize,
      openForClone,
    } = this.props;
    const { linodeLabels, linodeStatuses } = this.state;
    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography variant="headline" className={classes.title} data-qa-title >
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Attachment</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>File System Path</TableCell>
                <TableCell>Region</TableCell>
                <TableCell/>
              </TableRow>
            </TableHead>
            <TableBody>
              {volumes.map((volume) => {
                const label = pathOr('', ['label'], volume);
                const linodeLabel = volume.linode_id ? linodeLabels[volume.linode_id] : '';
                const linodeStatus = volume.linode_id ? linodeStatuses[volume.linode_id] : '';
                const size = pathOr('', ['size'], volume);
                const filesystem_path = pathOr(
                  /** @todo Remove path default when API releases filesystem_path. */
                  `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
                  ['filesystem_path'],
                  volume,
                );
                const regionID = pathOr('', ['region'], volume);
                const region = dcDisplayNames[regionID];

                return isVolumeUpdating(volume.recentEvent)
                  ? (
                    <TableRow key={volume.id} data-qa-volume-loading>
                      <TableCell data-qa-volume-cell-label>{label}</TableCell>
                      <TableCell colSpan={5}>
                        <LinearProgress value={progressFromEvent(volume.recentEvent)} />
                      </TableCell>
                    </TableRow>
                  )
                  : (
                    <TableRow key={volume.id} data-qa-volume-cell={volume.id}>
                      <TableCell data-qa-volume-cell-label>{label}</TableCell>
                      <TableCell data-qa-volume-cell-attachment>{linodeLabel}</TableCell>
                      <TableCell data-qa-volume-size>{size} GB</TableCell>
                      <TableCell data-qa-fs-path>{filesystem_path}</TableCell>
                      <TableCell data-qa-volume-region>{region}</TableCell>
                      <TableCell>
                        <VolumesActionMenu
                          onShowConfig={() => {
                            this.setState({
                              configDrawer: {
                                open: true,
                                volumePath: filesystem_path,
                                volumeLabel: label,
                              },
                            });
                          }}
                          onEdit={() => openForEdit(
                            volume.id,
                            label,
                            size,
                            regionID,
                            linodeLabel,
                          )}
                          onResize={() => openForResize(
                            volume.id,
                            label,
                            size,
                            regionID,
                            linodeLabel,
                          )}
                          onClone={() => openForClone(
                            volume.id,
                            label,
                            size,
                            regionID,
                          )}
                          attached={Boolean(linodeLabel)}
                          onAttach={() => {
                            this.setState({
                              attachmentDrawer: {
                                open: true,
                                volumeID: volume.id,
                                volumeLabel: label,
                                linodeRegion: regionID,
                              },
                            });
                          }}
                          onDetach={() => {
                            this.setState({
                              destructiveDialog: {
                                open: true,
                                mode: 'detach',
                                volumeID: volume.id,
                              },
                            });
                          }}
                          poweredOff={linodeStatus === 'offline'}
                          onDelete={() => {
                            this.setState({
                              destructiveDialog: {
                                open: true,
                                mode: 'delete',
                                volumeID: volume.id,
                              },
                            });
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
              })}
            </TableBody>
          </Table>
        </Paper>
        <VolumeConfigDrawer
          open={this.state.configDrawer.open}
          onClose={() => { this.setState({ configDrawer: { open: false } }); }}
          volumePath={this.state.configDrawer.volumePath}
          volumeLabel={this.state.configDrawer.volumeLabel}
        />
        <VolumeAttachmentDrawer
          open={this.state.attachmentDrawer.open}
          volumeID={this.state.attachmentDrawer.volumeID || 0}
          volumeLabel={this.state.attachmentDrawer.volumeLabel || ''}
          linodeRegion={this.state.attachmentDrawer.linodeRegion || ''}
          onClose={() => { this.setState({ attachmentDrawer: { open: false } }); }}
        />
        <DestructiveVolumeDialog
          open={this.state.destructiveDialog.open}
          mode={this.state.destructiveDialog.mode}
          onClose={() => this.closeDestructiveDialog()}
          onDetach={() => this.detachVolume()}
          onDelete={() => this.deleteVolume()}
        />
      </React.Fragment>
    );
  }
}

const isVolumeUpdating = (e?: Linode.Event) => {
  return e
    && ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action)
    && e.status !== 'finished';
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

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  documented,
  connected,
  styled,
)(VolumesLanding);
