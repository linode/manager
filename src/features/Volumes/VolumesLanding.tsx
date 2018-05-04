import * as React from 'react';
import { pathOr, equals } from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import { bindActionCreators } from 'redux';
import { connect, Dispatch } from 'react-redux';

import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import Table from 'src/components/Table';
import Grid from 'src/components/Grid';
import { getLinodes } from 'src/services/linodes';
import { dcDisplayNames } from 'src/constants';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { generateInFilter, resetEventsPolling } from 'src/events';
import { openForEdit, openForResize, openForClone } from 'src/store/reducers/volumeDrawer';
import { detach, _delete } from 'src/services/volumes';

import VolumesActionMenu from './VolumesActionMenu';
import VolumeConfigDrawer from './VolumeConfigDrawer';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';

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

  getLinodeLabels() {
    const linodeIDs = this.props.volumes.map(volume => volume.linode_id).filter(Boolean);
    const xFilter = generateInFilter('id', linodeIDs);
    getLinodes(undefined, xFilter)
      .then((response) => {
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
      .catch((err) => { /** @todo how do we want to display this error */});
  }

  componentDidMount() {
    this.getLinodeLabels();
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
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography variant="headline" data-qa-title className={classes.title}>
              Volumes
            </Typography>
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
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {volumes.map((volume) => {
                const label = pathOr('', ['label'], volume);
                const linodeLabel = linodeLabels[volume.linode_id];
                const linodeStatus = linodeStatuses[volume.linode_id];
                const size = pathOr('', ['size'], volume);
                const filesystem_path = pathOr(
                  /** @todo Remove path default when API releases filesystem_path. */
                  `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
                  ['filesystem_path'],
                  volume,
                );
                const regionID = pathOr('', ['region'], volume);
                const region = dcDisplayNames[regionID];
                return (
                  <TableRow key={volume.id} data-qa-volume-cell>
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

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForEdit, openForResize, openForClone },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

export default connected(styled(VolumesLanding));
