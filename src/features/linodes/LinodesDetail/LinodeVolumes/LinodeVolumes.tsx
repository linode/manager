import { append, compose, equals, filter, lensPath, over, pathOr, set, when } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import VolumeIcon from 'src/assets/addnewmenu/volume.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Placeholder, { PlaceholderProps } from 'src/components/Placeholder';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import renderGuard from 'src/components/RenderGuard';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { events$, resetEventsPolling } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { getLinodeConfigs, getLinodeVolumes } from 'src/services/linodes';
import { attachVolume, cloneVolume, createVolume, deleteVolume, detachVolume, resizeVolume, updateVolume } from 'src/services/volumes';
import { handleUpdate } from 'src/store/reducers/features/linodeDetail/volumes';
import composeState from 'src/utilities/composeState';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import { withLinode } from '../context';
import ActionMenu from './LinodeVolumesActionMenu';
import VolumeDrawer, { Modes, Props as VolumeDrawerProps } from './VolumeDrawer';

type ClassNames = 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props {
  /** PromiseLoader */
  linodeConfigs: PromiseLoaderResponse<Linode.Config[]>;
}

interface LinodeContextProps {
  linodeLabel: string;
  linodeRegion: string;
  linodeID: number;
  linodeStatus: string;
}

interface UpdateDialogState {
  open: boolean;
  submitting: boolean;
  mode?: 'detach' | 'delete';
  id?: number;
  error?: string;
}

interface VolumeDrawer extends VolumeDrawerProps {
  mode: Modes;
  id?: number;
}

interface State {
  attachedVolumes: Linode.Volume[];
  updateDialog: UpdateDialogState;
  volumeDrawer: VolumeDrawer;
}

type CombinedProps = Props
  & StateProps & DispatchProps
  & LinodeContextProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

const volumeDrawerData = (path: (string | number)[]) => lensPath(['volumeDrawer', ...path])

const L = {
  volumeDrawer: {
    errors: volumeDrawerData(['errors']),
    size: volumeDrawerData(['size']),
  }
};

export class LinodeVolumes extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  composeState = composeState;

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
    error: undefined,
    submitting: false,
  };

  static volumeDrawerDefaultState = {
    mode: 'create' as Modes,
    selectedVolume: 'none',
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

    this.state = {
      attachedVolumes: [],
      updateDialog: LinodeVolumes.updateDialogDefaultState,
      volumeDrawer: LinodeVolumes.volumeDrawerDefaultState,
    };
  }

  static getDerivedStateFromProps(props: CombinedProps, state: State) {
    const attachedVolumesUpdate = !equals(props.linodeVolumes, state.attachedVolumes);

    if (attachedVolumesUpdate) {
      return {
        attachedVolumes: props.linodeVolumes,
      };
    }

    return null;
  }

  eventSubscription: Subscription;

  componentDidMount() {
    this.mounted = true;
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
      .filter(e => !e._initial)
      .subscribe((v) => {
        if (this.mounted) {
          this.getVolumes();
        }
      });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.eventSubscription.unsubscribe();
  }

  getVolumes = () => {
    getLinodeVolumes(this.props.linodeID)
      .then((response) => {
        this.setState({
          attachedVolumes: response.data,
        });
      });
  }

  goToSettings = () => {
    const { history, linodeID } = this.props;
    history.push(`/linodes/${linodeID}/settings#configs`);
  }

  /** Attachment */
  attachVolume = () => {
    const { linodeID, actions } = this.props;
    const { volumeDrawer: { selectedVolume } } = this.state;

    /** This should be handled by Joi */
    if (selectedVolume === "none") {
      this.setState({
        volumeDrawer: {
          ...this.state.volumeDrawer,
          errors: [{ field: 'volume', reason: 'volume cannot be blank.' }],
        },
      }, () => {
        scrollErrorIntoView();
      });
      return;
    }

    attachVolume(Number(selectedVolume), { linode_id: Number(linodeID) })
      .then(({ data }) => {
        this.closeUpdatingDrawer();
        actions.updateVolumes((volumes) => ([...volumes, data]));
      })
      .catch((errorResponse) => {
        const fallbackError = [{ reason: 'Unable to attach volume.' }];

        this.setState({
          volumeDrawer: {
            ...this.state.volumeDrawer,
            errors: pathOr(fallbackError, ['response', 'data', 'errors'], errorResponse),
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  /** Detachment / Deletion */
  openUpdateDialog = (mode: 'detach' | 'delete', id: number) => () => {
    this.setState({
      updateDialog: {
        mode,
        open: true,
        submitting: false,
        id,
      },
    });
  }

  setDialogError = (errorResponse:Linode.ApiFieldError) => {
    const { updateDialog } = this.state;
    const fallbackError = [{ reason: 'Unable to detach volume.' }];
    const apiError = pathOr(fallbackError, ['response', 'data', 'errors'], errorResponse);
    const error = apiError[0].reason;
    this.setState({
      updateDialog: {
        ...updateDialog,
        error,
        submitting: false,
      }
    })
  }

  closeUpdateDialog = () => {
    this.setState({
      updateDialog: LinodeVolumes.updateDialogDefaultState,
    });
  }

  detachVolume = () => {
    const { updateDialog: { id } } = this.state;
    if (!id) { return; }
    this.setState({ updateDialog: {
      ...this.state.updateDialog,
      submitting: true,
      error: undefined,
    }})

    detachVolume(id)
      .then(() => {
        this.closeUpdateDialog();
        sendToast('Volume is being detached from this Linode.')
        this.getVolumes();
      })
      .catch((errorResponse) => {
        this.setDialogError(errorResponse);
      });
  }

  deleteVolume = () => {
    const { updateDialog: { id } } = this.state;
    if (!id) { return; }
    this.setState({
      updateDialog: {
        ...this.state.updateDialog,
        submitting: true,
        error: undefined,
      }
    })

    deleteVolume(id)
      .then((response) => {
        this.closeUpdateDialog();
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        this.setDialogError(errorResponse);
      });
  }

  updateDialog = (): null | JSX.Element => {
    const {
      updateDialog: {
        mode,
        open,
        error,
      },
    } = this.state;

    if (!mode) { return null; }

    return (
      <ConfirmationDialog
        onClose={this.closeUpdateDialog}
        open={open}
        actions={mode === 'detach' ? this.renderDetachDialogActions : this.renderDeleteDialogActions}
        title={mode === 'detach' ? 'Detach Volume' : 'Delete Volume'}
      >
        {error && <Notice error text={error}/>}
        <Typography> Are you sure you want to {mode} this volume?</Typography>
      </ConfirmationDialog>
    );
  }

  renderDetachDialogActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          onClick={this.closeUpdateDialog}
          type="cancel"
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          type="secondary"
          loading={this.state.updateDialog.submitting}
          onClick={this.detachVolume}
          data-qa-confirm
        >
          Detach
      </Button>
      </ActionsPanel>
    );
  };

  renderDeleteDialogActions = () => {
    return (
      <ActionsPanel style={{ padding: 0 }}>
        <Button
          onClick={this.closeUpdateDialog}
          type="cancel"
          data-qa-cancel
          >
          Cancel
        </Button>
        <Button
          type="secondary"
          destructive
          loading={this.state.updateDialog.submitting}
          onClick={this.deleteVolume}
          data-qa-confirm
        >
          Delete
      </Button>
      </ActionsPanel>
    );
  };

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
          volumeDrawer: {
            errors: undefined,
            selectedVolume: undefined,
            mode: 'create',
            open: true,
            label: '',
            title: 'Create a Volume',
            linodeLabel,
            size: 20,
            region: linodeRegion,
            linodeId: linodeID,
            onClose: this.closeUpdatingDrawer,
            onModeChange: (newMode: Modes) => this.setState(prevState => ({
              volumeDrawer: {
                ...prevState.volumeDrawer,
                mode: newMode,
              },
            })),
            onLabelChange: (newLabel: string) => this.setState(prevState => ({
              volumeDrawer: {
                ...prevState.volumeDrawer,
                label: newLabel,
              },
            })),
            onSizeChange: (newSize: string) => this.composeState([
              when<State, State>(
                (prevState) => prevState.volumeDrawer.size <= 10240 && Boolean(prevState.volumeDrawer.errors),
                over(L.volumeDrawer.errors, filter((e: Linode.ApiFieldError) => e.field !== 'size')),
              ),
              when<State, State>(
                (prevState) => prevState.volumeDrawer.size > 10240,
                over(L.volumeDrawer.errors, append({ field: 'size', reason: 'Size cannot be over 10240.' })),
              ),
              set(L.volumeDrawer.size, +newSize || ''),
            ]),
            onVolumeChange: (selectedVolume: string) => this.setState(prevState => ({
              volumeDrawer: {
                ...prevState.volumeDrawer,
                selectedVolume,
              },
            })),
            onSubmit: this.createVolume,
          },
        });

      case 'resize':
        return this.setState({
          volumeDrawer: {
            errors: undefined,
            selectedVolume: undefined,
            mode: 'resize',
            open: true,
            id,
            label: label!,
            title: 'Resize a Volume',
            linodeLabel,
            size: size!,
            region: linodeRegion,
            linodeId: linodeID,
            onClose: this.closeUpdatingDrawer,
            onSizeChange: (newSize: string) => this.setState(prevState => ({
              volumeDrawer: {
                ...prevState.volumeDrawer,
                size: Number(newSize),
              },
            })),
            onSubmit: this.resizeVolume,
          },
        });

      case 'clone':
        return this.setState({
          volumeDrawer: {
            errors: undefined,
            selectedVolume: undefined,
            mode: 'clone',
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
            onClose: this.closeUpdatingDrawer,
            onCloneLabelChange: (cloneLabel: string) => this.setState(prevState => ({
              volumeDrawer: {
                ...prevState.volumeDrawer,
                cloneLabel,
              },
            })),
            onSubmit: this.cloneVolume,
          },
        });

      case 'edit':
        return this.setState({
          volumeDrawer: {
            errors: undefined,
            selectedVolume: undefined,
            mode: 'edit',
            open: true,
            id,
            label: label!,
            title: 'Rename a Volume',
            linodeLabel,
            size: size!,
            region: linodeRegion,
            linodeId: linodeID,
            onClose: this.closeUpdatingDrawer,
            onLabelChange: (newLabel: string) => this.setState(prevState => ({
              volumeDrawer: {
                ...prevState.volumeDrawer,
                label: newLabel,
              },
            })),
            onSubmit: this.editVolume,
          },
        });

      default: return {};
    }
  }

  closeUpdatingDrawer = () => this.setState(prevState => ({
    volumeDrawer: {
      ...prevState.volumeDrawer,
      open: false,
    },
  }))

  createVolume = () => {
    if (this.state.volumeDrawer.mode === 'attach') {
      return this.attachVolume();
    }

    const {
      volumeDrawer: {
        label, size, region, linodeId,
      },
    } = this.state;

    if (!region || !linodeId) { return; }

    if (!label) {
      return this.setState({
        volumeDrawer: {
          ...this.state.volumeDrawer,
          errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
        },
      }, () => {
        scrollErrorIntoView();
      });
    }

    if (!size) {
      return this.setState({
        volumeDrawer: {
          ...this.state.volumeDrawer,
          errors: [{ field: 'size', reason: 'cannot be blank.' }],
        },
      }, () => {
        scrollErrorIntoView();
      });
    }

    createVolume({
      label,
      size: Number(size),
      region,
      linode_id: linodeId,
    })
      .then(() => {
        this.closeUpdatingDrawer();
        this.getVolumes();
        resetEventsPolling();
      })
      .catch((errorResponse) => {
        this.setState({
          volumeDrawer: {
            ...this.state.volumeDrawer,
            errors: errorResponse.response.data.errors,
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  editVolume = () => {
    const {
      volumeDrawer: {
        id,
        label,
      },
    } = this.state;

    if (!id) {
      return;
    }

    if (!label) {
      return this.setState({
        volumeDrawer: {
          ...this.state.volumeDrawer,
          errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
        },
      }, () => {
        scrollErrorIntoView();
      });
    }

    updateVolume(id, label)
      .then((response) => {
        this.closeUpdatingDrawer();
        this.props.actions.updateVolumes((volumes) => {
          const newVolumes = [...volumes];
          const idx = volumes.findIndex((volume) => volume.id === response.data.id);
          newVolumes[idx] = response.data;
          return newVolumes;
        });
      })
      .catch((errorResponse: any) => {
        this.setState({
          volumeDrawer: {
            ...this.state.volumeDrawer,
            errors: errorResponse.response.data.errors,
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  resizeVolume = () => {
    const {
      volumeDrawer: {
        id,
        size,
      },
    } = this.state;

    if (!id) {
      return;
    }

    if (!size) {
      return this.setState({
        volumeDrawer: {
          ...this.state.volumeDrawer,
          errors: [{ field: 'size', reason: 'Size cannot be blank.' }],
        },
      }, () => {
        scrollErrorIntoView();
      });
    }

    resizeVolume(id, Number(size))
      .then(() => {
        this.closeUpdatingDrawer();
        resetEventsPolling();
      })
      .catch((errorResponse: any) => {
        this.setState({
          volumeDrawer: {
            ...this.state.volumeDrawer,
            errors: errorResponse.response.data.errors.map(({ reason }: Linode.ApiFieldError) => ({
              field: 'size',
              reason,
            })),
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  cloneVolume = () => {
    const { volumeDrawer: { id, cloneLabel } } = this.state;

    if (!cloneLabel) {
      return this.setState({
        volumeDrawer: {
          ...this.state.volumeDrawer,
          errors: [{ field: 'label', reason: 'Label cannot be blank.' }],
        },
      }, () => {
        scrollErrorIntoView();
      });
    }

    if (!id) {
      return;
    }

    cloneVolume(id, cloneLabel)
      .then(() => {
        /** @todo Now what? Per CF parity the volume is not automagically attached. */
        this.closeUpdatingDrawer();
        resetEventsPolling();
      })
      .catch((error) => {
        /** @todo Error handling. */
        this.setState({
          volumeDrawer: {
            ...this.state.volumeDrawer,
            errors: error.response.data.errors,
          },
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  /**
   * Only ever show if the Linode has attached volumes.
   *
   * IconTextLink is
   *  - If user has no configs, show null.
   *  - Else "Create a Volume"
   */
  iconTextLink = (): null | JSX.Element => {
    const { linodeConfigs: { response: configs } } = this.props;

    if (configs.length === 0) {
      return null;
    }

    return <AddNewLink
      onClick={this.openUpdatingDrawer('create', 0, '', 0)}
      label='Add a Volume'
    />;
  }

  /**
   * Placeholder is
   * - If Linode has volumes, null.
   *  - Else
   *    - If user has no configs, show "View Linode Config"
   *    - Else "Create a Volume"
   */
  placeholder = (): null | JSX.Element => {
    const { linodeConfigs: { response: configs } } = this.props;
    const { attachedVolumes } = this.state;
    let props: PlaceholderProps;

    if (attachedVolumes.length > 0) {
      return null;
    }

    if (configs.length === 0) {
      props = {
        buttonProps: {
          onClick: this.goToSettings,
          children: 'View Linode Configurations',
        },
        icon: VolumeIcon,
        title: 'No configs available',
        copy: 'This Linode has no configurations. Click below to create a configuration.',
      };
      return <Placeholder {...props} />;
    }

    props = {
      buttonProps: {
        onClick: this.openUpdatingDrawer('create', 0, '', 0),
        children: 'Add a Volume',
      },
      icon: VolumeIcon,
      title: 'No volumes found',
      copy: 'Click below to add a volume.',
    };

    return <Placeholder {...props} />;
  }

  /**
   * Table is
   * - If Linode has no volumes, null.
   * - Else show rows of volumes.
   */
  table = renderGuard((): null | JSX.Element => {
    const { classes, linodeStatus } = this.props;
    const { attachedVolumes } = this.state;

    if (attachedVolumes.length === 0) {
      return null;
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end">
          <Grid item>
            <Typography
              role="header"
              variant="headline"
              className={classes.title}
              data-qa-title>
              Attached Volumes
            </Typography>
          </Grid>
          <Grid item>
            <this.iconTextLink />
          </Grid>
        </Grid>
        <Paper>
          <Table aria-label="List of Attached Volumes">
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>File System Path</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {
                attachedVolumes!.map((volume) => {
                  /** @todo Remove path defaulting when API releases filesystem_path. */
                  const label = pathOr('', ['label'], volume);
                  const size = pathOr('', ['size'], volume);
                  const filesysPath = pathOr(
                    `/dev/disk/by-id/scsi-0Linode_Volume_${label}`,
                    ['filesystem_path'],
                    volume,
                  );

                  return <TableRow key={volume.id} data-qa-volume-cell={volume.id}>
                    <TableCell parentColumn="Label" data-qa-volume-cell-label>{label}</TableCell>
                    <TableCell parentColumn="Size" data-qa-volume-size>{size} GiB</TableCell>
                    <TableCell parentColumn="File System Path" data-qa-fs-path>
                      {filesysPath}
                    </TableCell>
                    <TableCell>
                      <ActionMenu
                        data-qa-linode-volume-actions
                        poweredOff={['offline'].includes(linodeStatus)}
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
      </React.Fragment>
    );
  })

  /**
   * Important numbers;
   * number of configs
   * number of this linodes volumes
   * number of eligible volumes
   */
  render() {
    const {
      linodeConfigs: { error: linodeConfigsError },
      linodeLabel,
      linodeVolumes,
      linodeStatus,
    } = this.props;

    const { attachedVolumes, volumeDrawer } = this.state;


    if (linodeConfigsError) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment={`${linodeLabel} - Volumes`} />
          <ErrorState errorText="An error has occured." />;
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${linodeLabel} - Volumes`} />
        <this.placeholder />
        <this.table updateFor={[attachedVolumes, linodeVolumes, linodeStatus]} />
        <VolumeDrawer {...volumeDrawer} />
        <this.updateDialog />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const preloaded = PromiseLoader<Props & LinodeContextProps>({
  linodeConfigs: (props) => getLinodeConfigs(props.linodeID)
    .then(response => response.data),
});

const linodeContext = withLinode((context) => ({
  linodeID: context.data!.id,
  linodeLabel: context.data!.label,
  linodeRegion: context.data!.region,
  linodeStatus: context.data!.status
}));

interface StateProps {
  linodeVolumes?: Linode.Volume[];
}

const mapStateToProps: MapStateToProps<StateProps, Props, ApplicationState> = (state, ownProps) => ({
  linodeVolumes: state.features.linodeDetail.volumes.data
});

interface DispatchProps {
  actions: {
    updateVolumes: (fn: (v: Linode.Volume[])=> Linode.Volume[]) => void;
  },
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (dispatch, ownProps) => ({
  actions: {
    updateVolumes: (fn) => dispatch(handleUpdate(fn)),
  }
});

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<any, any, any, any, any, any, any>(
  connected,
  linodeContext,
  styled,
  withRouter,
  SectionErrorBoundary,
  preloaded,
)(LinodeVolumes);
