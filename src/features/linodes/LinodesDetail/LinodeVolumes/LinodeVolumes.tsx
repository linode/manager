import * as React from 'react';
import { pathOr, compose } from 'ramda';
import { Subscription } from 'rxjs/Rx';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableBody from 'material-ui/Table/TableBody';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import {
  getVolumes,
  attach as attachtoLinode,
  detach as detachVolume,
  _delete as deleteVolume,
  clone as cloneVolume,
  create as createVolume,
  update as updateVolume,
  resize as resizeVolume,
} from 'src/services/volumes';
import Placeholder, { PlaceholderProps } from 'src/components/Placeholder';
import IconTextLink, { IconTextLinkProps } from 'src/components/IconTextLink';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import { getLinodeConfigs, getLinodeVolumes } from 'src/services/linode';
import ErrorState from 'src/components/ErrorState';
import ConfirmationDialog from 'src/components/ConfirmationDialog';

import AttachVolumeDrawer from './AttachVolumeDrawer';
import UpdateVolumeDrawer, { Props as UpdateVolumeDrawerProps } from './UpdateVolumeDrawer';
import ActionMenu from './LinodeVolumesActionMenu';
import { events$, resetEventsPolling } from 'src/events';

type ClassNames = 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  title: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  linodeVolumes: Linode.Volume[];
  linodeLabel: string;
  linodeRegion: string;
  linodeID: number;

  /** PromiseLoader */
  volumes: PromiseLoaderResponse<Linode.Volume[]>;
  linodeConfigs: PromiseLoaderResponse<Linode.Config[]>;
}

interface AttachVolumeDrawerState {
  open: boolean;
  errors?: Linode.ApiFieldError[];
  selectedVolume: null | number;
}

interface UpdateDialogState {
  open: boolean;
  mode?: 'detach' | 'delete';
  id?: number;
}

interface UpdateVolumeDrawerState extends UpdateVolumeDrawerProps {
  mode?: 'create' | 'edit' | 'resize' | 'clone';
  id?: number;
}

interface State {
  attachedVolumes: Linode.Volume[];
  attachableVolumes: Linode.Volume[];
  attachVolumeDrawer: AttachVolumeDrawerState;
  updateDialog: UpdateDialogState;
  updateVolumeDrawer: UpdateVolumeDrawerState;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class LinodeVolumes extends React.Component<CombinedProps, State> {
  static defaultProps = {
    volumes: [],
    linodeConfigs: [],
  };

  static attachVolumeDrawerDefaultState = {
    open: false,
    selectedVolume: null,
  };

  static updateDialogDefaultState = {
    open: false,
  };

  static updateVolumeDrawerDefaultState = {
    open: false,
    label: '',
    title: '',
    linodeLabel: '',
    size: 0,
    region: '',
    linodeId: 0,
    onClose: () => null,
    onChange: () => null,
    onSubmit: () => null,
  };

  constructor(props: CombinedProps) {
    super(props);
    const { linodeVolumes } = props;

    this.state = {
      attachedVolumes: linodeVolumes,
      attachableVolumes: props.volumes.response,
      attachVolumeDrawer: LinodeVolumes.attachVolumeDrawerDefaultState,
      updateDialog: LinodeVolumes.updateDialogDefaultState,
      updateVolumeDrawer: LinodeVolumes.updateVolumeDrawerDefaultState,
    };
  }

  eventSubscription: Subscription;

  componentDidMount() {

    this.eventSubscription = events$
      /** @todo filter on mount time. */
      .filter(e => [
        'volume_attach',
        'volume_clone',
        'volume_create',
        'volume_delete',
        'volume_detach',
        'volume_resize',
      ].includes(e.action))
      .subscribe((v) => {
        getLinodeVolumes(this.props.linodeID)
          .then(response => response.data)
          .then((attachedVolumes) => {
            this.getAllVolumes();
          })
          .catch(() => {
            /** @todo Error handling. */
          });
      });
  }

  componentWillUnmount() {
    this.eventSubscription.unsubscribe();
  }

  getAllVolumes = () => {
    const { linodeRegion } = this.props;
    const getAttachedVolumes = getLinodeVolumes(this.props.linodeID)
      .then(response => response.data);
    const getAttachableVolumes = getVolumes()
      .then(response => response
        .data
        .filter(volume => volume.region === linodeRegion && volume.linode_id === null));

    Promise
      .all([
        getAttachedVolumes,
        getAttachableVolumes,
      ])
      .then(([attachedVolumes, attachableVolumes]) => {
        this.setState({
          attachedVolumes,
          attachableVolumes,
        });
      });
  }

  /** Attachment */
  openAttachmentDrawer = () => this.setState(prevState => ({
    attachVolumeDrawer: {
      ...prevState.attachVolumeDrawer,
      open: true,
    },
  }))

  closeAttachmentDrawer = () => this.setState(prevState => ({
    attachVolumeDrawer: LinodeVolumes.attachVolumeDrawerDefaultState,
  }))

  attachVolume = () => {
    const { linodeID } = this.props;
    const { attachVolumeDrawer: { selectedVolume } } = this.state;

    if (!selectedVolume) {
      this.setState({
        attachVolumeDrawer: {
          ...this.state.attachVolumeDrawer,
          errors: [{ field: 'volume', reason: 'volume cannot be blank.' }],
        },
      });
      return;
    }

    attachtoLinode(Number(selectedVolume))(Number(linodeID))
      .then((response) => {
        this.closeAttachmentDrawer();
        resetEventsPolling();
      })
      .catch((error) => {
        this.setState({
          attachVolumeDrawer: {
            ...this.state.attachVolumeDrawer,
            errors: [{ field: 'volume', reason: 'Could not attach volume.' }],
          },
        });
      });
  }

  AttachVolumeDrawer = (): JSX.Element => {
    const { linodeLabel } = this.props;
    const {
      attachableVolumes,
      attachVolumeDrawer: {
        selectedVolume,
        open,
        errors,
      },
    } = this.state;

    return (
      <AttachVolumeDrawer
        open={open}
        linodeLabel={linodeLabel}
        volumes={attachableVolumes}
        errors={errors}
        selectedVolume={selectedVolume}
        onClose={this.closeAttachmentDrawer}
        onChange={(key, value) => this.setState({
          attachVolumeDrawer: {
            ...this.state.attachVolumeDrawer,
            [key]: value,
          },
        })}
        onSubmit={this.attachVolume}
      />
    );
  }

  /** Detachment / Deletion */
  openUpdateDialog = (mode: 'detach' | 'delete', id: number) => () => {
    this.setState({
      updateDialog: {
        mode,
        open: true,
        id,
      },
    });
  }

  closeUpdateDialog = () => {
    this.setState({
      updateDialog: LinodeVolumes.updateDialogDefaultState,
    });
  }

  detachVolume = () => {
    const { updateDialog: { id } } = this.state;
    if (!id) { return; }

    detachVolume(id)
      .then((response) => {
        this.closeUpdateDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        /** @todo Error handling. */
      });
  }

  deleteVolume = () => {
    const { updateDialog: { id } } = this.state;
    if (!id) { return; }

    deleteVolume(id)
      .then((response) => {
        this.closeUpdateDialog();
        resetEventsPolling();
      })
      .catch((response) => {
        this.closeUpdateDialog();
        /** @todo Error handling */
      });
  }

  UpdateDialog = (): null | JSX.Element => {
    const {
      updateDialog: {
        mode,
        open,
      },
    } = this.state;

    if (!mode) { return null; }

    const method = (() => {
      switch (mode) {
        case 'detach': return this.detachVolume;
        case 'delete': return this.deleteVolume;
      }
    })();

    const title = (function () {
      switch (mode) {
        case 'detach': return 'Detach Volume';
        case 'delete': return 'Delete Volume';
      }
    })();

    return (
      <ConfirmationDialog
        onClose={this.closeUpdateDialog}
        actions={() => <div>
          <Button
            variant="raised"
            color="secondary"
            className="destructive"
            onClick={method}
          >
            Confirm
          </Button>
          <Button
            onClick={this.closeUpdateDialog}
            variant="raised"
            color="secondary"
            className="cancel"
          >
            Cancel
          </Button>
        </div>}
        open={open}
        title={title}
      >
        Are you sure you want to {mode} this volume?
    </ConfirmationDialog>
    );
  }

  /** Create / Edit / Resize / Cloning */
  openUpdatingDrawer = (
    mode: 'create' | 'edit' | 'resize' | 'clone',
    id: number,
    label: string,
    size: number,
  ) => () => {
    const { linodeLabel, linodeRegion, linodeID } = this.props;

    switch (mode) {
      case 'create':
        return this.setState({
          updateVolumeDrawer: {
            open: true,
            label: '',
            title: 'Create a Volume',
            linodeLabel,
            size: 20,
            region: linodeRegion,
            linodeId: linodeID,
            disabled: { region: true, linode: true },
            onClose: this.closeUpdatingDrawer,
            onLabelChange: (label: string) => this.setState(prevState => ({
              updateVolumeDrawer: {
                ...prevState.updateVolumeDrawer,
                label,
              },
            })),
            onSizeChange: (size: string) => this.setState(prevState => ({
              updateVolumeDrawer: {
                ...prevState.updateVolumeDrawer,
                size: Number(size),
              },
            })),
            onSubmit: this.createVolume,
          },
        });

      case 'resize':
        return this.setState({
          updateVolumeDrawer: {
            open: true,
            id,
            label: label!,
            title: 'Resize a Volume',
            linodeLabel,
            size: size!,
            region: linodeRegion,
            linodeId: linodeID,
            disabled: { region: true, linode: true, label: true },
            onClose: this.closeUpdatingDrawer,
            onSizeChange: (size: string) => this.setState(prevState => ({
              updateVolumeDrawer: {
                ...prevState.updateVolumeDrawer,
                size: Number(size),
              },
            })),
            onSubmit: this.resizeVolume,
          },
        });

      case 'clone':
        return this.setState({
          updateVolumeDrawer: {
            open: true,
            id,
            label: label!,
            title: 'Clone a Volume',
            cloning: true,
            cloneLabel: '',
            linodeLabel,
            size: size!,
            region: linodeRegion,
            linodeId: linodeID,
            disabled: { region: true, linode: true, size: true, label: true },
            onClose: this.closeUpdatingDrawer,
            onCloneLabelChange: (cloneLabel: string) => this.setState(prevState => ({
              updateVolumeDrawer: {
                ...prevState.updateVolumeDrawer,
                cloneLabel,
              },
            })),
            onSubmit: this.cloneVolume,
          },
        });

      case 'edit':
        return this.setState({
          updateVolumeDrawer: {
            open: true,
            id,
            label: label!,
            title: 'Rename a Volume',
            linodeLabel,
            size: size!,
            region: linodeRegion,
            disabled: { region: true, linode: true, size: true },
            linodeId: linodeID,
            onClose: this.closeUpdatingDrawer,
            onLabelChange: (label: string) => this.setState(prevState => ({
              updateVolumeDrawer: {
                ...prevState.updateVolumeDrawer,
                label,
              },
            })),
            onSubmit: this.editVolume,
          },
        });

      default: return {};
    }
  }

  closeUpdatingDrawer = () => this.setState(prevState => ({
    updateVolumeDrawer: LinodeVolumes.updateVolumeDrawerDefaultState,
  }))

  createVolume = () => {
    const {
      updateVolumeDrawer: {
        label, size, region, linodeId,
      },
    } = this.state;

    if (!region || !linodeId) { return; }

    if (!label) {
      return this.setState({
        updateVolumeDrawer: {
          ...this.state.updateVolumeDrawer,
          errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
        },
      });
    }

    if (!size) {
      return this.setState({
        updateVolumeDrawer: {
          ...this.state.updateVolumeDrawer,
          errors: [{ field: 'size', reason: 'cannot be blank.' }],
        },
      });
    }

    createVolume(label, Number(size), region, linodeId)
      .then(() => {
        this.closeUpdatingDrawer();
        this.getAllVolumes();
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        this.setState({
          updateVolumeDrawer: {
            ...this.state.updateVolumeDrawer,
            errors: errorResponse.response.data.errors,
          },
        });
      });
  }

  editVolume = () => {
    const {
      updateVolumeDrawer: {
        id,
        label,
      },
    } = this.state;

    if (!id) {
      return;
    }

    if (!label) {
      return this.setState({
        updateVolumeDrawer: {
          ...this.state.updateVolumeDrawer,
          errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
        },
      });
    }

    updateVolume(id, label)
      .then(() => {
        this.closeUpdatingDrawer();
        this.getAllVolumes();
      })
      .catch((errorResponse: any) => {
        this.setState({
          updateVolumeDrawer: {
            ...this.state.updateVolumeDrawer,
            errors: errorResponse.response.data.errors,
          },
        });
      });
  }

  resizeVolume = () => {
    const {
      updateVolumeDrawer: {
        id,
        size,
      },
    } = this.state;


    if (!id) {
      return;
    }

    if (!size) {
      return this.setState({
        updateVolumeDrawer: {
          ...this.state.updateVolumeDrawer,
          errors: [{ field: 'size', reason: 'Size cannot be blank.' }],
        },
      });
    }

    resizeVolume(id, Number(size))
      .then(() => {
        this.closeUpdatingDrawer();
        resetEventsPolling();
      })
      .catch((errorResponse: any) => {
        this.setState({
          updateVolumeDrawer: {
            ...this.state.updateVolumeDrawer,
            errors: errorResponse.response.data.errors.map(({ reason }: Linode.ApiFieldError) => ({
              field: 'size',
              reason,
            })),
          },
        });
      });
  }

  cloneVolume = () => {
    const { updateVolumeDrawer: { id, cloneLabel } } = this.state;

    if (!cloneLabel) {
      return this.setState({
        updateVolumeDrawer: {
          ...this.state.updateVolumeDrawer,
          errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
        },
      });
    }

    if (!id) {
      return;
    }

    cloneVolume(id, cloneLabel)
      .then(() => {
        /**
         * @todo Now what? Per CF parity the volume is not automagically attached.
        */
        this.closeUpdatingDrawer();
        resetEventsPolling();
      })
      .catch((error) => {
        /** @todo Error handling. */
        this.setState({
          updateVolumeDrawer: {
            ...this.state.updateVolumeDrawer,
            errors: error.response.data.errors,
          },
        });
      });
  }

  /**
   * Only ever show if the Linode has attached volumes.
   *
   * IconTextLink is
   *  - If user has no configs, show null.
   *  - Else
   *    - If User has eligible volumes, show "Attach a Volume"
   *    - Else show "Create a Volume"
   */
  IconTextLink = (): null | JSX.Element => {
    const { linodeConfigs: { response: configs } } = this.props;
    const { attachableVolumes } = this.state;

    if (configs.length === 0) {
      return null;
    }

    let IconTextLinkProps: IconTextLinkProps = {
      SideIcon: PlusSquare,
      onClick: this.openUpdatingDrawer('create', 0, '', 0),
      text: 'Create a Volume',
      title: 'Create a Volume',
    };

    if (attachableVolumes.length > 0) {
      IconTextLinkProps = {
        SideIcon: PlusSquare,
        onClick: this.openAttachmentDrawer,
        text: 'Attach Existing Volume',
        title: 'Attach Existing Volume',
      };
    }
    return <IconTextLink {...IconTextLinkProps} />;
  }

  /**
   * Placeholder is
   * - If Linode has volumes, null.
   *  - Else
   *    - If user has no configs, show "View Linode Config"
   *    - Else
   *      - If user has eligible Volumes, show "Attach a Volume"
   *      - Else, show "Create a Volume"
   */
  Placeholder = (): null | JSX.Element => {
    const {
      linodeConfigs: { response: configs },
    } = this.props;
    const { attachedVolumes, attachableVolumes } = this.state;
    let props: PlaceholderProps;

    if (attachedVolumes.length > 0) {
      return null;
    }

    if (configs.length === 0) {
      props = {
        buttonProps: {
          onClick: this.openAttachmentDrawer,
          children: 'View Linode Config',
        },
        icon: VolumeIcon,
        title: 'No configs available',
        copy: 'This Linode has no configurations. Click below to create a configuration.',
      };
      return <Placeholder {...props} />;
    }

    if (attachableVolumes.length > 0) {
      props = {
        buttonProps: {
          onClick: this.openAttachmentDrawer,
          children: 'Attach a Volume',
        },
        icon: VolumeIcon,
        title: 'No volumes attached',
        copy: 'Click below to attach a volume.',
      };
      return < Placeholder {...props} />;
    }

    /** We have at least one config, but we have no volumes. */
    props = {
      buttonProps: {
        onClick: this.openUpdatingDrawer('create', 0, '', 0),
        children: 'Create a Volume',
      },
      icon: VolumeIcon,
      title: 'No volumes found',
      copy: 'Click below to create a volume.',
    };

    return <Placeholder {...props} />;
  }

  /**
   * Table is
   * - If Linode has no volumes, null.
   * - Else show rows of volumes.
   */
  Table = (): null | JSX.Element => {
    const { classes } = this.props;
    const { attachedVolumes } = this.state;

    if (attachedVolumes.length === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
          <Grid item>
            <Typography
              variant="title"
              className={classes.title}>
              Volumes
            </Typography>
          </Grid>
          <Grid item>
            <this.IconTextLink />
          </Grid>
        </Grid>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>File System Path</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                attachedVolumes!.map((volume) => {
                  /** @todo Remove path defaulting when API releases filesystem_path. */
                  const label = pathOr('', ['label'], volume);
                  const size = pathOr('', ['size'], volume);
                  const filesystem_path = pathOr(
                    `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
                    ['filesystem_path'],
                    volume,
                  );

                  return <TableRow key={volume.id}>
                    <TableCell>{label}</TableCell>
                    <TableCell>{size} GiB</TableCell>
                    <TableCell>{filesystem_path}</TableCell>
                    <TableCell>
                      <ActionMenu
                        volumeId={volume.id}
                        onDetach={this.openUpdateDialog('detach', volume.id)}
                        onDelete={this.openUpdateDialog('delete', volume.id)}
                        onClone={this.openUpdatingDrawer(
                          'clone',
                          volume.id,
                          volume.label,
                          volume.size,
                        )}
                        onEdit={this.openUpdatingDrawer(
                          'edit',
                          volume.id,
                          volume.label,
                          volume.size,
                        )}
                        onResize={this.openUpdatingDrawer(
                          'resize',
                          volume.id,
                          volume.label,
                          volume.size,
                        )}
                      />
                    </TableCell>
                  </TableRow>;
                })
              }
            </TableBody>
          </Table>
        </Paper>
        <this.UpdateDialog />
      </React.Fragment>
    );
  }

  /**
   * Important numbers;
   * number of configs
   * number of this linodes volumes
   * number of eligible volumes
   */
  render() {
    const {
      volumes: { error: volumesError },
      linodeConfigs: { error: linodeConfigsError },
    } = this.props;

    const { updateVolumeDrawer } = this.state;

    if (volumesError || linodeConfigsError) {
      return <ErrorState errorText="An error has occured." />;
    }

    return (
      <React.Fragment>
        <this.Placeholder />
        <this.Table />
        <this.AttachVolumeDrawer />
        <UpdateVolumeDrawer {...updateVolumeDrawer} />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader({
  linodeConfigs: (props: Props) => getLinodeConfigs(props.linodeID)
    .then(response => response.data),

  volumes: (props: Props) => getVolumes()
    .then(response => response.data
      .filter(volume => volume.region === props.linodeRegion && volume.linode_id === null)),
});

export default compose<any, any, any, any>(
  styled,
  SectionErrorBoundary,
  preloaded,
)(LinodeVolumes);
