import { compose, equals, pathOr } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/merge';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

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
import PaginationFooter, { PaginationProps } from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowError from 'src/components/TableRowError';
import { events$, generateInFilter, resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getLinodes } from 'src/services/linodes';
import { deleteVolume, detachVolume, getVolumes } from 'src/services/volumes';
import { openForClone, openForCreating, openForEdit, openForResize } from 'src/store/reducers/volumeDrawer';
import { formatRegion } from 'src/utilities';
import scrollToTop from 'src/utilities/scrollToTop';

import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import VolumeConfigDrawer from './VolumeConfigDrawer';
import VolumesActionMenu from './VolumesActionMenu';

export const updateVolumes$ = new Subject<boolean>();

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

interface Props {
  openForEdit: typeof openForEdit;
  openForResize: typeof openForResize;
  openForClone: typeof openForClone;
  openForCreating: typeof openForCreating;
}

interface State extends PaginationProps {
  loading: boolean;
  labelsLoading: boolean;
  errors?: Linode.ApiFieldError[];
  volumes: Linode.Volume[];
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
    page: 1,
    count: 0,
    pageSize: 25,
    volumes: [],
    loading: true,
    labelsLoading: true,
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

  eventsSub: Subscription;

  mounted: boolean = false;

  static docs: Linode.Doc[] = [
    {
      title: 'How to Use Block Storage with Your Linode',
      /* tslint:disable-next-line */
      src: `https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode`,
      body: `This tutorial explains how to use Linode's block storage service.`,
    },
    {
      title: 'Boot a Linode from a Block Storage Volume',
      src: `https://www.linode.com/docs/platform/block-storage/boot-from-block-storage-volume/`,
      body: `This guide shows how to boot a Linode from a Block Storage Volume.`,
    },
  ];

  componentDidMount() {
    this.mounted = true;

    this.getVolumes(undefined, undefined, true);

    this.getLinodeLabels();

    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'volume_create',
          'volume_attach',
          'volume_delete',
          'volume_detach',
          'volume_resize',
          'volume_clone',
        ].includes(event.action)
      ))
      .merge(updateVolumes$)
      .subscribe((event) => {
        this.getVolumes()
          .then((volumes) => {
            if (!volumes || !this.mounted) { return; }

            this.setState({
              volumes: volumes.map((v) => ({
                ...v,
                ...maybeAddEvent(event, v),
              })),
            });
          })
          .catch(() => {
            /* @todo: how do we want to display this error? */
          });
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    /*
    We just need to know if different volumes are now on the state, so we can compare a list of
    IDs rather than the whole object.
    */
    if (!equals(prevState.volumes.map(v => v.id), this.state.volumes.map(v => v.id))) {
      this.getLinodeLabels();
    }
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
    const { classes } = this.props;
    const { count, loading, labelsLoading } = this.state;

    if (loading || labelsLoading) {
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
          count={this.state.count}
          page={this.state.page}
          pageSize={this.state.pageSize}
          handlePageChange={this.handlePageChange}
          handleSizeChange={this.handlePageSizeChange}
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
    const { errors, volumes, count, linodeLabels, linodeStatuses } = this.state;

    if (errors) {
      return this.renderErrors(errors);
    }


    if (volumes && count > 0) {
      return this.renderData(volumes, linodeLabels, linodeStatuses);
    }

    return null;
  };

  renderLoading = () => {
    return <CircleProgress />;
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => {
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

  renderData = (volumes: Linode.Volume[], linodeLabels: any, linodeStatuses: any) => {
    return volumes.map((volume) => {
      const label = pathOr('', ['label'], volume);
      const linodeLabel = volume.linode_id ? linodeLabels[volume.linode_id] : '';
      const linodeStatus = volume.linode_id ? linodeStatuses[volume.linode_id] : '';
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
            <TableCell parentColumn="Attached To" data-qa-volume-cell-attachment={linodeLabel}>
              {linodeLabel &&
                <Link to={`/linodes/${volume.linode_id}`}>
                  {linodeLabel}
                </Link>
              }</TableCell>
            <TableCell parentColumn="Size" data-qa-volume-size>{size} GB</TableCell>
            <TableCell parentColumn="File System Path" data-qa-fs-path>{filesystemPath}</TableCell>
            <TableCell parentColumn="Region" data-qa-volume-region>{region}</TableCell>
            <TableCell>
              <VolumesActionMenu
                onShowConfig={this.handleShowConfig}
                filesystemPath={filesystemPath}
                linodeLabel={linodeLabel}
                regionID={regionID}
                volumeID={volume.id}
                size={size}
                label={label}
                onEdit={this.handleEdit}
                onResize={this.handleResize}
                onClone={this.handleClone}
                attached={Boolean(linodeLabel)}
                onAttach={this.handleAttach}
                onDetach={this.handleDetach}
                poweredOff={linodeStatus === 'offline'}
                onDelete={this.handleDelete}
              />
            </TableCell>
          </TableRow>
        );
    });
  };

  getVolumes = (
    page: number = this.state.page,
    pageSize: number = this.state.pageSize,
    initial: boolean = false,
  ) => {

    if (initial) {
      this.setState({ loading: true });
    }

    return getVolumes({ page, page_size: pageSize })
      .then((response) => {
        if (!this.mounted) { return response.data; }

        this.setState({
          count: response.results,
          page: response.page,
          loading: false,
          volumes: response.data,
        });

        return response.data;
      })
      .catch((err) => this.mounted && this.setState({
        loading: false,
        errors: pathOr([{ reason: 'Unable to load Volumes.' }], ['response', 'data', 'errors'], err),
      }));
  };

  handlePageChange = (page: number) => {
    this.setState({ page }, () => { this.getVolumes() });
    scrollToTop();
  }

  handlePageSizeChange = (pageSize: number) => {
    this.setState({ pageSize }, () => { this.getVolumes() });
  }

  getLinodeLabels = () => {
    const linodeIDs = this.state.volumes.map(volume => volume.linode_id).filter(Boolean);
    const xFilter = generateInFilter('id', linodeIDs);
    this.setState({ labelsLoading: true });

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
        this.setState({ linodeStatuses, labelsLoading: false });
      })
      .catch((err) => { /** @todo how do we want to display this error */ });
  }

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
    && ['scheculed', 'started'].includes(e.status);
};

const progressFromEvent = (e?: Linode.Event) => {
  if (!e) { return undefined }

  if (e.status === 'started' && e.percent_complete) {
    return e.percent_complete;
  }

  return undefined;
}

const maybeAddEvent = (e: boolean | Linode.Event, volume: Linode.Volume) => {
  if (typeof e === 'boolean') { return {} };
  if (!e.entity || e.entity.id !== volume.id) { return {} }
  return { recentEvent: e };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForEdit, openForResize, openForClone, openForCreating },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

const styled = withStyles(styles, { withTheme: true });

const documented = setDocs(VolumesLanding.docs);

export default compose<Linode.TodoAny, Linode.TodoAny, Linode.TodoAny, Linode.TodoAny>(
  connected,
  documented,
  styled,
)(VolumesLanding);
