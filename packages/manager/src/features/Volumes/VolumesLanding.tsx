import { Event } from 'linode-js-sdk/lib/account';
import { Config, Linode } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import { Volume } from 'linode-js-sdk/lib/volumes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import { PaginationProps } from 'src/components/Pagey';
import Placeholder from 'src/components/Placeholder';
import Toggle from 'src/components/Toggle';
import _withEvents, { EventsProps } from 'src/containers/events.container';
import withVolumes, {
  Props as WithVolumesProps
} from 'src/containers/volumes.container';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import withLinodes from 'src/containers/withLinodes.container';
import { BlockStorage } from 'src/documentation';
import { resetEventsPolling } from 'src/events';
import LinodePermissionsError from 'src/features/linodes/LinodesDetail/LinodePermissionsError';
import {
  LinodeOptions,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
  Origin as VolumeDrawerOrigin
} from 'src/store/volumeDrawer';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import ListGroupedVolumes from './ListGroupedVolumes';
import ListVolumes from './ListVolumes';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';

import ErrorState from 'src/components/ErrorState';
import Loading from 'src/components/LandingLoading';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';

import withRegions, {
  DefaultProps as RegionProps
} from 'src/containers/regions.container';
import { doesRegionSupportBlockStorage } from 'src/utilities/doesRegionSupportBlockStorage';

type ClassNames =
  | 'root'
  | 'titleWrapper'
  | 'title'
  | 'tagGroup'
  | 'labelCol'
  | 'icon'
  | 'attachmentCol'
  | 'sizeCol'
  | 'pathCol'
  | 'volumesWrapper'
  | 'linodeVolumesWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    tagGroup: {
      flexDirection: 'row-reverse',
      marginBottom: theme.spacing(1)
    },
    titleWrapper: {
      flex: 1
    },
    title: {
      marginBottom: theme.spacing(1)
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
    icon: {
      position: 'relative',
      top: 3,
      width: 40,
      height: 40,
      '& .circle': {
        fill: theme.bg.offWhiteDT
      },
      '& .outerCircle': {
        stroke: theme.bg.main
      }
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
    }
  });

interface WithLinodesProps {
  linodesData: Linode[];
  linodesLoading: boolean;
  linodesError?: APIError[];
}
export interface ExtendedVolume extends Volume {
  linodeLabel?: string;
  linodeStatus?: string;
}

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Config[];
  recentEvent?: Event;
  readOnly?: boolean;
  removeBreadCrumb?: boolean;
}

//
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
    this.mounted = true;
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
      volumesError,
      volumesLoading,
      mappedVolumesDataWithLinodes,
      readOnly,
      removeBreadCrumb
    } = this.props;

    if (volumesLoading) {
      return <Loading shouldDelay />;
    }

    if (volumesError && volumesError.read) {
      return <RenderError />;
    }

    // If this is the Volumes tab on a Linode, we want ONLY the Volumes attached to this Linode.
    const data =
      mappedVolumesDataWithLinodes && this.props.linodeId
        ? mappedVolumesDataWithLinodes.filter(
            vol => vol.linode_id === this.props.linodeId
          )
        : mappedVolumesDataWithLinodes;

    if (data.length < 1) {
      return this.renderEmpty();
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        {readOnly && <LinodePermissionsError />}
        <PreferenceToggle<boolean>
          preferenceKey="volumes_group_by_tag"
          preferenceOptions={[false, true]}
          localStorageKey="GROUP_VOLUMES"
          toggleCallbackFnDebounced={toggleVolumesGroupBy}
        >
          {({
            preference: volumesAreGrouped,
            togglePreference: toggleGroupVolumes
          }: ToggleProps<boolean>) => {
            return (
              <React.Fragment>
                <Grid
                  container
                  justify="space-between"
                  alignItems={removeBreadCrumb ? 'center' : 'flex-end'}
                  style={{ paddingBottom: 0 }}
                >
                  <Grid item className={classes.titleWrapper}>
                    {removeBreadCrumb ? (
                      <Typography variant="h2">Volumes</Typography>
                    ) : (
                      <Breadcrumb
                        pathname={this.props.location.pathname}
                        labelTitle="Volumes"
                        className={classes.title}
                      />
                    )}
                  </Grid>
                  <Grid item className="p0">
                    <FormControlLabel
                      className={classes.tagGroup}
                      control={
                        <Toggle
                          className={
                            volumesAreGrouped ? ' checked' : ' unchecked'
                          }
                          onChange={toggleGroupVolumes}
                          checked={volumesAreGrouped}
                        />
                      }
                      label="Group by Tag:"
                    />
                  </Grid>
                  <Grid item>
                    <Grid container alignItems="flex-end">
                      <Grid item className="pt0">
                        <AddNewLink
                          onClick={this.openCreateVolumeDrawer}
                          label="Add a Volume"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {this.renderData(data, volumesAreGrouped)}
              </React.Fragment>
            );
          }}
        </PreferenceToggle>

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

  renderEmpty = () => {
    const { linodeConfigs, linodeRegion, readOnly, regionsData } = this.props;

    if (
      linodeRegion &&
      !doesRegionSupportBlockStorage(linodeRegion, regionsData)
    ) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Volumes" />
          <Placeholder
            title="Volumes are not available in this region"
            copy=""
            icon={VolumesIcon}
          />
        </React.Fragment>
      );
    }

    if (linodeConfigs && linodeConfigs.length === 0) {
      return (
        <React.Fragment>
          <DocumentTitleSegment segment="Volumes" />
          <Placeholder
            title="No configs available."
            copy="This Linode has no configurations. Click below to create a configuration."
            icon={VolumesIcon}
            buttonProps={[
              {
                onClick: this.goToSettings,
                children: 'View Linode Configurations'
              }
            ]}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        {readOnly && <LinodePermissionsError />}
        <Placeholder
          title="Add Block Storage!"
          copy={<EmptyCopy />}
          icon={VolumesIcon}
          buttonProps={[
            {
              onClick: this.openCreateVolumeDrawer,
              children: 'Add a Volume',
              disabled: readOnly
            }
          ]}
        />
      </React.Fragment>
    );
  };

  renderData = (volumes: ExtendedVolume[], volumesAreGrouped: boolean) => {
    const isVolumesLanding = this.props.match.params.linodeId === undefined;
    const renderProps = {
      isVolumesLanding,
      handleAttach: this.handleAttach,
      handleDelete: this.handleDelete,
      handleDetach: this.handleDetach,
      openForEdit: this.props.openForEdit,
      openForClone: this.props.openForClone,
      openForConfig: this.props.openForConfig,
      openForResize: this.props.openForResize
    };

    return (
      <OrderBy data={volumes} order={'asc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          const orderProps = {
            orderBy,
            order,
            handleOrderChange,
            data: orderedData
          };

          return volumesAreGrouped ? (
            <ListGroupedVolumes
              data={orderedData}
              {...orderProps}
              renderProps={{ ...renderProps }}
            />
          ) : (
            <ListVolumes
              data={orderedData}
              {...orderProps}
              renderProps={{ ...renderProps }}
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

const eventCategory = `volumes landing`;

const toggleVolumesGroupBy = (checked: boolean) =>
  sendGroupByTagEnabledEvent(eventCategory, checked);

const EmptyCopy = () => (
  <>
    <Typography variant="subtitle1">Need additional storage?</Typography>
    <Typography variant="subtitle1">
      <a
        href="https://linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode-new-manager/"
        target="_blank"
        rel="noopener noreferrer"
        className="h-u"
      >
        Here's how to use Block Storage with your Linode
      </a>
      &nbsp;or&nbsp;
      <a
        href="https://www.linode.com/docs/"
        target="_blank"
        rel="noopener noreferrer"
        className="h-u"
      >
        visit our guides and tutorials.
      </a>
    </Typography>
  </>
);

const mapDispatchToProps = (dispatch: Dispatch<any>) =>
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

const connected = connect(
  undefined,
  mapDispatchToProps
);

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
  styled,
  withVolumesRequests,
  _withEvents((ownProps: CombinedProps, eventsData) => ({
    ...ownProps,
    eventsData: eventsData.filter(filterVolumeEvents)
  })),
  withLinodes(
    (ownProps: CombinedProps, linodesData, linodesLoading, linodesError) => ({
      ...ownProps,
      linodesData,
      linodesLoading,
      linodesError
    })
  ),
  withVolumes(
    (ownProps: CombinedProps, volumesData, volumesLoading, volumesError) => {
      const mappedData = volumesData.items.map(id => volumesData.itemsById[id]);
      const mappedVolumesDataWithLinodes = mappedData.map(volume => {
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
        volumesError
      };
    }
  ),
  withRegions(),
  withSnackbar
)(VolumesLanding);

const RenderError = () => {
  return (
    <ErrorState errorText="There was an error loading your Volumes. Please try again later" />
  );
};
