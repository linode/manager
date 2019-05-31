import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import FormControlLabel from 'src/components/core/FormControlLabel';
import {
  StyleRulesCallback,
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
import { regionsWithoutBlockStorage } from 'src/constants';
import _withEvents, { EventsProps } from 'src/containers/events.container';
import localStorageContainer from 'src/containers/localStorage.container';
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
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize
} from 'src/store/volumeDrawer';
import { sendGroupByTagEnabledEvent } from 'src/utilities/ga';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import ListGroupedVolumes from './ListGroupedVolumes';
import ListVolumes from './ListVolumes';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';

import ErrorState from 'src/components/ErrorState';
import Loading from 'src/components/LandingLoading';

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

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  tagGroup: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing.unit
  },
  titleWrapper: {
    flex: 1
  },
  title: {
    marginBottom: theme.spacing.unit + theme.spacing.unit / 2
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
  linodesData: Linode.Linode[];
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}
export interface ExtendedVolume extends Linode.Volume {
  linodeLabel?: string;
  linodeStatus?: string;
}

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Linode.Config[];
  recentEvent?: Linode.Event;
  readOnly?: boolean;
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
    linodeId?: number,
    linodeLabel?: string,
    linodeRegion?: string
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
  };
}

type RouteProps = RouteComponentProps<{ linodeId: string }>;

type CombinedProps = Props &
  VolumesRequests &
  WithVolumesProps &
  WithLinodesProps &
  EventsProps &
  LocalStorageProps &
  PaginationProps<ExtendedVolume> &
  DispatchProps &
  RouteProps &
  WithSnackbarProps &
  WithMappedVolumesProps &
  WithStyles<ClassNames>;

class VolumesLanding extends React.Component<CombinedProps, State> {
  static eventCategory = `volumes landing`;

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
    linodeLabel: string
  ) => {
    this.setState({
      destructiveDialog: {
        open: true,
        mode: 'detach',
        volumeId,
        volumeLabel,
        linodeLabel
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
        linodeLabel: ''
      }
    });
  };

  render() {
    const {
      classes,
      volumesError,
      volumesLoading,
      mappedVolumesDataWithLinodes,
      readOnly
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
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          style={{ paddingBottom: 0 }}
        >
          <Grid item className={classes.titleWrapper}>
            <Typography variant="h1" className={classes.title} data-qa-title>
              Volumes
            </Typography>
          </Grid>
          <Grid item className="p0">
            <FormControlLabel
              className={classes.tagGroup}
              control={
                <Toggle
                  className={this.props.groupByTag ? ' checked' : ' unchecked'}
                  onChange={(e, checked) =>
                    this.props.toggleGroupByTag(checked)
                  }
                  checked={this.props.groupByTag}
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
          volumeLabel={this.state.destructiveDialog.volumeLabel}
          linodeLabel={this.state.destructiveDialog.linodeLabel}
          mode={this.state.destructiveDialog.mode}
          onClose={this.closeDestructiveDialog}
          onDetach={this.detachVolume}
          onDelete={this.deleteVolume}
        />
      </React.Fragment>
    );
  }

  gotToSettings = () => {
    const { history, linodeId } = this.props;
    history.push(`/linodes/${linodeId}/settings`);
  };

  renderEmpty = () => {
    const { linodeConfigs, linodeRegion, readOnly } = this.props;

    if (regionsWithoutBlockStorage.some(region => region === linodeRegion)) {
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
            buttonProps={{
              onClick: this.gotToSettings,
              children: 'View Linode Configurations'
            }}
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
          buttonProps={{
            onClick: this.openCreateVolumeDrawer,
            children: 'Add a Volume',
            disabled: readOnly
          }}
        />
      </React.Fragment>
    );
  };

  renderData = (volumes: ExtendedVolume[]) => {
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

          return this.props.groupByTag ? (
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
      return this.props.openForCreating(linodeId, linodeLabel, linodeRegion);
    }

    this.props.openForCreating();

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
      .then(response => {
        /* @todo: show a progress bar for volume detachment */
        this.props.enqueueSnackbar('Volume detachment started', {
          variant: 'info'
        });
        this.closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch(response => {
        /** @todo Error handling. */
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
      .catch(() => {
        /** @todo Error handling. */
      });
  };
}

const EmptyCopy = () => (
  <>
    <Typography variant="subtitle1">Need additional storage?</Typography>
    <Typography variant="subtitle1">
      <a
        href="https://linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode-new-manager/"
        target="_blank"
        className="h-u"
      >
        Here's how to use Block Storage with your Linode
      </a>
      &nbsp;or&nbsp;
      <a href="https://www.linode.com/docs/" target="_blank" className="h-u">
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

type LocalStorageProps = LocalStorageState & LocalStorageUpdater;

interface LocalStorageState {
  groupByTag: boolean;
}

interface LocalStorageUpdater {
  toggleGroupByTag: (checked: boolean) => Partial<LocalStorageState>;
  [key: string]: (...args: any[]) => Partial<LocalStorageState>;
}

const withLocalStorage = localStorageContainer<
  LocalStorageState,
  LocalStorageUpdater,
  {}
>(
  storage => {
    return { groupByTag: storage.groupVolumesByTag.get() };
  },
  storage => ({
    toggleGroupByTag: state => (checked: boolean) => {
      storage.groupVolumesByTag.set(checked ? 'true' : 'false');

      sendGroupByTagEnabledEvent(VolumesLanding.eventCategory, checked);

      return {
        ...state,
        groupByTag: checked
      };
    }
  })
);

const addAttachedLinodeInfoToVolume = (
  volume: Linode.Volume,
  linodes: Linode.Linode[]
): Linode.Volume | ExtendedVolume => {
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

const addRecentEventToVolume = (
  volume: Linode.Volume,
  events: Linode.Event[]
) => {
  // We're filtering out events without entities in the reducer, so we can assume these
  // all have an entity attached.
  const recentEvent = events.find(event => event.entity!.id === volume.id);
  if (recentEvent) {
    return { ...volume, recentEvent };
  } else {
    return volume;
  }
};

const filterVolumeEvents = (event: Linode.Event): boolean => {
  return (
    !event._initial && Boolean(event.entity) && event.entity!.type === 'volume'
  );
};

export default compose<CombinedProps, Props>(
  connected,
  withLocalStorage,
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
  withSnackbar
)(VolumesLanding);

const RenderError = () => {
  return (
    <ErrorState errorText="There was an error loading your Volumes. Please try again later" />
  );
};
