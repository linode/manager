import { Event } from '@linode/api-v4/lib/account';
import { Config, Linode } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import Breadcrumb from 'src/components/Breadcrumb';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import Loading from 'src/components/LandingLoading';
import OrderBy from 'src/components/OrderBy';
import { PaginationProps } from 'src/components/Pagey';
import { REFRESH_INTERVAL } from 'src/constants';
import _withEvents, { EventsProps } from 'src/containers/events.container';
import withRegions, {
  DefaultProps as RegionProps
} from 'src/containers/regions.container';
import withVolumes, {
  StateProps as WithVolumesProps
} from 'src/containers/volumes.container';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import withLinodes, {
  Props as WithLinodesProps
} from 'src/containers/withLinodes.container';
import { BlockStorage } from 'src/documentation';
import { resetEventsPolling } from 'src/eventsPolling';
import LinodeDisks from 'src/features/linodes/LinodesDetail/LinodeAdvanced/LinodeDisks_CMR';
import LinodePermissionsError from 'src/features/linodes/LinodesDetail/LinodePermissionsError';
import {
  LinodeOptions,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
  Origin as VolumeDrawerOrigin
} from 'src/store/volumeForm';
import { doesRegionSupportBlockStorage } from 'src/utilities/doesRegionSupportBlockStorage';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import ListVolumes from './ListVolumes_CMR';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import { ExtendedVolume } from './types';

type ClassNames = 'root' | 'headline' | 'addNewWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.color.white,
      margin: 0,
      marginTop: 20,
      width: '100%'
    },
    headline: {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 15,
      lineHeight: '1.5rem',
      [theme.breakpoints.down('xs')]: {
        marginBottom: 0,
        marginTop: theme.spacing(2)
      }
    },
    addNewWrapper: {
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
        marginTop: -theme.spacing(1)
      },
      '&.MuiGrid-item': {
        padding: 5
      }
    }
  });

interface Props {
  isVolumesLanding?: boolean;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Config[];
  recentEvent?: Event;
  readOnly?: boolean;
  removeBreadCrumb?: boolean;
  fromLinodes?: boolean;
}

interface WithMappedVolumesProps {
  mappedVolumesDataWithLinodes: ExtendedVolume[];
}

interface DispatchProps {
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
  openForCreating: (
    origin: VolumeDrawerOrigin,
    linodeOptions?: LinodeOptions
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
}

interface State {
  attachmentDrawer: {
    open: boolean;
    volumeId?: number;
    volumeLabel?: string;
    linodeRegion?: string;
  };
  destructiveDialog: {
    open: boolean;
    mode: 'detach' | 'delete';
    volumeLabel: string;
    volumeId?: number;
    linodeLabel: string;
    poweredOff?: boolean;
    error?: string;
  };
}

type RouteProps = RouteComponentProps<{ linodeId: string }>;

type CombinedProps = Props &
  VolumesRequests &
  WithVolumesProps &
  WithLinodesProps &
  EventsProps &
  PaginationProps<ExtendedVolume> &
  DispatchProps &
  RouteProps &
  WithSnackbarProps &
  WithMappedVolumesProps &
  WithStyles<ClassNames> &
  RegionProps;

class VolumesLanding extends React.Component<CombinedProps, State> {
  state: State = {
    attachmentDrawer: {
      open: false
    },
    destructiveDialog: {
      open: false,
      mode: 'detach',
      volumeLabel: '',
      linodeLabel: ''
    }
  };

  mounted: boolean = false;

  static docs: Linode.Doc[] = [
    BlockStorage,
    {
      title: 'Boot a Linode from a Block Storage Volume',
      src: `https://www.linode.com/docs/platform/block-storage/boot-from-block-storage-volume/`,
      body: `This guide shows how to boot a Linode from a Block Storage Volume.`
    }
  ];

  componentDidMount() {
    const { getAllVolumes, volumesLastUpdated } = this.props;
    this.mounted = true;
    // If we haven't requested Volumes, or it's been a while, request them
    if (Date.now() - volumesLastUpdated > REFRESH_INTERVAL) {
      getAllVolumes().catch(_ => null); // Errors through Redux
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleCloseAttachDrawer = () => {
    this.setState({ attachmentDrawer: { open: false } });
  };

  handleAttach = (volumeId: number, label: string, regionID: string) => {
    this.setState({
      attachmentDrawer: {
        open: true,
        volumeId,
        volumeLabel: label,
        linodeRegion: regionID
      }
    });
  };

  handleDetach = (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    poweredOff: boolean
  ) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'detach',
        volumeId,
        volumeLabel,
        linodeLabel,
        poweredOff,
        error: undefined
      }
    });
  };

  handleDelete = (volumeId: number, volumeLabel: string) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'delete',
        volumeId,
        volumeLabel,
        linodeLabel: '',
        error: undefined
      }
    });
  };

  render() {
    const {
      classes,
      volumesLoading,
      mappedVolumesDataWithLinodes,
      readOnly,
      removeBreadCrumb,
      fromLinodes,
      linodeRegion,
      regionsData
    } = this.props;

    if (volumesLoading) {
      return <Loading shouldDelay />;
    }

    // If this is the Volumes tab on a Linode, we want ONLY the Volumes attached to this Linode.
    const data =
      mappedVolumesDataWithLinodes && this.props.linodeId
        ? mappedVolumesDataWithLinodes.filter(
            vol => vol.linode_id === this.props.linodeId
          )
        : mappedVolumesDataWithLinodes;

    return (
      <React.Fragment>
        {readOnly && <LinodePermissionsError />}
        <LinodeDisks />
        <Grid
          className={classes.root}
          container
          alignItems={removeBreadCrumb ? 'center' : 'flex-end'}
          justify="space-between"
        >
          <Grid item className="p0">
            {removeBreadCrumb ? (
              <Typography variant="h3" className={classes.headline}>
                Volumes
              </Typography>
            ) : (
              <Breadcrumb
                labelTitle="Volumes"
                pathname={this.props.location.pathname}
              />
            )}
          </Grid>
          <Grid item className={classes.addNewWrapper}>
            <AddNewLink
              label="Add a Volume..."
              onClick={
                fromLinodes
                  ? this.openCreateVolumeDrawer
                  : () => {
                      this.props.history.push('/volumes/create');
                    }
              }
              disabled={
                readOnly ||
                (linodeRegion &&
                  !doesRegionSupportBlockStorage(linodeRegion, regionsData)) ||
                data.length >= 10
              }
            />
          </Grid>
        </Grid>
        {this.renderData(data)}

        <VolumeAttachmentDrawer
          open={this.state.attachmentDrawer.open}
          volumeId={this.state.attachmentDrawer.volumeId || 0}
          volumeLabel={this.state.attachmentDrawer.volumeLabel || ''}
          linodeRegion={this.state.attachmentDrawer.linodeRegion || ''}
          onClose={this.handleCloseAttachDrawer}
        />
        <DestructiveVolumeDialog
          open={this.state.destructiveDialog.open}
          error={this.state.destructiveDialog.error}
          volumeLabel={this.state.destructiveDialog.volumeLabel}
          linodeLabel={this.state.destructiveDialog.linodeLabel}
          poweredOff={this.state.destructiveDialog.poweredOff || false}
          mode={this.state.destructiveDialog.mode}
          onClose={this.closeDestructiveDialog}
          onDetach={this.detachVolume}
          onDelete={this.deleteVolume}
        />
      </React.Fragment>
    );
  }

  goToSettings = () => {
    const { history, linodeId } = this.props;
    history.push(`/linodes/${linodeId}/settings`);
  };

  renderData = (volumes: ExtendedVolume[]) => {
    const {
      isVolumesLanding,
      linodeConfigs,
      linodeRegion,
      regionsData,
      volumesError
    } = this.props;

    let error = '';

    const renderProps = {
      isVolumesLanding: Boolean(isVolumesLanding),
      handleAttach: this.handleAttach,
      handleDelete: this.handleDelete,
      handleDetach: this.handleDetach,
      openForEdit: this.props.openForEdit,
      openForClone: this.props.openForClone,
      openForConfig: this.props.openForConfig,
      openForResize: this.props.openForResize
    };

    if (
      linodeRegion &&
      !doesRegionSupportBlockStorage(linodeRegion, regionsData)
    ) {
      error = 'Volumes are not available in this region.';
    }

    if (linodeConfigs && linodeConfigs.length === 0) {
      error = 'No configs available.';
    }

    return (
      <OrderBy data={volumes} order={'asc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          const orderProps = {
            data: orderedData,
            handleOrderChange,
            order,
            orderBy
          };

          return (
            <ListVolumes
              {...orderProps}
              renderProps={{ ...renderProps }}
              error={error}
              volumesError={volumesError}
            />
          );
        }}
      </OrderBy>
    );
  };

  closeDestructiveDialog = () => {
    this.setState({
      destructiveDialog: {
        ...this.state.destructiveDialog,
        open: false
      }
    });
  };

  openCreateVolumeDrawer = (e: any) => {
    const { linodeId, linodeLabel, linodeRegion } = this.props;
    if (linodeId && linodeLabel && linodeRegion) {
      return this.props.openForCreating('Created from Linode Details', {
        linodeId,
        linodeLabel,
        linodeRegion
      });
    }

    this.props.openForCreating('Created from Volumes Landing');

    e.preventDefault();
  };

  detachVolume = () => {
    const {
      destructiveDialog: { volumeId }
    } = this.state;
    const { detachVolume } = this.props;
    if (!volumeId) {
      return;
    }

    detachVolume({ volumeId })
      .then(_ => {
        /* @todo: show a progress bar for volume detachment */
        this.props.enqueueSnackbar('Volume detachment started', {
          variant: 'info'
        });
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch(error => {
        this.setState({
          destructiveDialog: {
            ...this.state.destructiveDialog,
            error: getAPIErrorOrDefault(error, 'Unable to detach Volume.')[0]
              .reason
          }
        });
      });
  };

  deleteVolume = () => {
    const {
      destructiveDialog: { volumeId }
    } = this.state;
    const { deleteVolume } = this.props;

    if (!volumeId) {
      return;
    }

    deleteVolume({ volumeId })
      .then(() => {
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch(error => {
        this.setState({
          destructiveDialog: {
            ...this.state.destructiveDialog,
            error: getAPIErrorOrDefault(error, 'Unable to delete Volume.')[0]
              .reason
          }
        });
      });
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      openForEdit,
      openForResize,
      openForClone,
      openForCreating,
      openForConfig
    },
    dispatch
  );

const connected = connect(undefined, mapDispatchToProps);

const documented = setDocs(VolumesLanding.docs);

const styled = withStyles(styles);

const addAttachedLinodeInfoToVolume = (
  volume: Volume,
  linodes: Linode[]
): Volume | ExtendedVolume => {
  if (!volume.linode_id) {
    return volume;
  }
  const attachedLinode = linodes.find(linode => linode.id === volume.linode_id);
  if (attachedLinode) {
    return {
      ...volume,
      linodeLabel: attachedLinode.label,
      linodeStatus: attachedLinode.status
    };
  } else {
    return volume;
  }
};

const addRecentEventToVolume = (volume: Volume, events: Event[]) => {
  // We're filtering out events without entities in the reducer, so we can assume these
  // all have an entity attached.
  const recentEvent = events.find(event => event.entity!.id === volume.id);
  if (recentEvent) {
    return { ...volume, recentEvent };
  } else {
    return volume;
  }
};

const filterVolumeEvents = (event: Event): boolean => {
  return (
    !event._initial && Boolean(event.entity) && event.entity!.type === 'volume'
  );
};

export default compose<CombinedProps, Props>(
  connected,
  documented,
  withVolumesRequests,
  _withEvents((ownProps: CombinedProps, eventsData) => ({
    ...ownProps,
    eventsData: eventsData.filter(filterVolumeEvents)
  })),
  withLinodes(),
  withVolumes(
    (
      ownProps: CombinedProps,
      volumesData,
      volumesLoading,
      volumesLastUpdated,
      volumesResults,
      volumesError
    ) => {
      const mappedVolumesDataWithLinodes = volumesData.map(volume => {
        const volumeWithLinodeData = addAttachedLinodeInfoToVolume(
          volume,
          ownProps.linodesData
        );
        return addRecentEventToVolume(
          volumeWithLinodeData,
          ownProps.eventsData
        );
      });
      return {
        ...ownProps,
        volumesData,
        mappedVolumesDataWithLinodes,
        volumesLoading,
        volumesLastUpdated,
        volumesError
      };
    }
  ),
  withRegions(),
  withSnackbar,
  styled
)(VolumesLanding);
