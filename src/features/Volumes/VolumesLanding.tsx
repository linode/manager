import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import { PaginationProps } from 'src/components/Pagey';
import Placeholder from 'src/components/Placeholder';
import TableRowError from 'src/components/TableRowError';
import Toggle from 'src/components/Toggle';
import _withEvents, { EventsProps } from 'src/containers/events.container';
import localStorageContainer from 'src/containers/localStorage.container';
import withVolumes, { Props as WithVolumesProps } from 'src/containers/volumes.container';
import withLinodes from 'src/containers/withLinodes.container';
import { BlockStorage } from 'src/documentation';
import { resetEventsPolling } from 'src/events';
import { deleteVolume, detachVolume } from 'src/services/volumes';
import { openForClone, openForConfig, openForCreating, openForEdit, openForResize } from 'src/store/volumeDrawer';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import ListGroupedVolumes from './ListGroupedVolumes';
import ListVolumes from './ListVolumes';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';

type ClassNames = 'root'
  | 'title'
  | 'tagGroup';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  tagGroup: {
    flexDirection: 'row-reverse',
    marginBottom: theme.spacing.unit -2,
  }
});

interface WithLinodesProps {
  linodesData: Linode.Linode[]
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}
export interface ExtendedVolume extends Linode.Volume {
  linodeLabel: string;
  linodeStatus: string;
}

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Linode.Config[];
  recentEvent?: Linode.Event;
}

//
interface WithMappedVolumesProps {
  mappedVolumesDataWithLinodes: ExtendedVolume[];
}

interface DispatchProps {
  openForEdit: (volumeId: number, volumeLabel: string, volumeTags: string[]) => void;
  openForResize: (volumeId: number, volumeSize: number, volumeLabel: string) => void;
  openForClone: (volumeId: number, volumeLabel: string, volumeSize: number, volumeRegion: string) => void;
  openForCreating: (linodeId?: number, linodeLabel?: string, linodeRegion?: string) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
}

interface State {
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

type RouteProps = RouteComponentProps<{ linodeId: string }>;

type CombinedProps =
  & Props
  & WithVolumesProps
  & WithLinodesProps
  & EventsProps
  & LocalStorageProps
  & PaginationProps<ExtendedVolume>
  & DispatchProps
  & RouteProps
  & InjectedNotistackProps
  & WithMappedVolumesProps
  & WithStyles<ClassNames>;

  class VolumesLanding extends React.Component<CombinedProps, State> {
  state: State = {
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
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleCloseAttachDrawer = () => {
    this.setState({ attachmentDrawer: { open: false } });
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
      volumesLoading,
      volumesError,
      mappedVolumesDataWithLinodes
    } = this.props;

    if (volumesError) {
      return <RenderError />;
    }

    if (volumesLoading) {
      return <RenderLoading />;
    }

    // If this is the Volumes tab on a Linode, we want ONLY the Volumes attached to this Linode.
    const data = mappedVolumesDataWithLinodes && this.props.linodeId
      ? mappedVolumesDataWithLinodes.filter(vol => vol.linode_id === this.props.linodeId)
      : mappedVolumesDataWithLinodes;

    if (data.length < 1) {
      return this.renderEmpty();
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Grid item>
            <Typography role="header" variant="h1" className={classes.title} data-qa-title >
              Volumes
            </Typography>
          </Grid>
          <Grid item>
            <FormControlLabel
                className={classes.tagGroup}
                control={
                  <Toggle
                    className={(this.props.groupByTag ? ' checked' : ' unchecked')}
                    onChange={(e, checked) => this.props.toggleGroupByTag(checked)}
                    checked={this.props.groupByTag}
                  />
                }
                label="Group by Tag:"
              />
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

        { this.renderData(data) }

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



  gotToSettings = () => {
    const { history, linodeId } = this.props;
    history.push(`/linodes/${linodeId}/settings`);
  };

  renderEmpty = () => {
    const { linodeConfigs } = this.props;

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
              children: 'View Linode Configurations',
            }}
          />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        <Placeholder
          title="Create a Volume"
          copy="Add storage to your Linodes using the resilient Volumes service for $0.10/GiB per month."
          icon={VolumesIcon}
          buttonProps={{
            onClick: this.openCreateVolumeDrawer,
            children: 'Create a Volume',
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
      openForResize: this.props.openForResize,
    };

    return (
      <OrderBy data={volumes} order={'desc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          const orderProps = {
            orderBy,
            order,
            handleOrderChange,
            data: orderedData,
          };

          return this.props.groupByTag
            ? <ListGroupedVolumes data={orderedData} {...orderProps} renderProps={{ ...renderProps }} />
            : <ListVolumes data={orderedData} {...orderProps} renderProps={{ ...renderProps }} />
        }}
      </OrderBy>
    )
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
    const { linodeId, linodeLabel, linodeRegion } = this.props;
    if (linodeId && linodeLabel && linodeRegion) {
      return this.props.openForCreating(linodeId, linodeLabel, linodeRegion);
    }

    this.props.openForCreating();

    e.preventDefault();
  }

  detachVolume = () => {
    const { destructiveDialog: { volumeID } } = this.state;
    if (!volumeID) { return; }

    detachVolume(volumeID)
      .then((response) => {
        /* @todo: show a progress bar for volume detachment */
        this.props.enqueueSnackbar('Volume detachment started', {
          variant: 'info',
        });
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

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators(
  { openForEdit, openForResize, openForClone, openForCreating, openForConfig },
  dispatch,
);

const connected = connect(undefined, mapDispatchToProps);

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

const withLocalStorage = localStorageContainer<LocalStorageState, LocalStorageUpdater, {}>(
  (storage) => {
    return {groupByTag: storage.groupVolumesByTag.get() }},
  (storage) => ({
    toggleGroupByTag: (state) => (checked: boolean) => {
      storage.groupVolumesByTag.set(checked ? 'true' : 'false');

      // @todo: Uncomment to send event to GA
      // sendEvent({
      //   category: VolumesLanding.eventCategory,
      //   action: 'group by tag',
      //   label: String(checked),
      // });

      return {
        ...state,
        groupByTag: checked,
      }
    },
  }),
);

const addAttachedLinodeInfoToVolume = (volume: Linode.Volume, linodes: Linode.Linode[]): Linode.Volume | ExtendedVolume => {
  if (!volume.linode_id) { return volume; }
  const attachedLinode = linodes.find((linode) => linode.id === volume.linode_id);
  if (attachedLinode) {
    return {
      ...volume,
      linodeLabel: attachedLinode.label,
      linodeStatus: attachedLinode.status,
    }
  } else {
    return volume;
  }
}

const addRecentEventToVolume = (volume: Linode.Volume, events: Linode.Event[]) => {
  // We're filtering out events without entities in the reducer, so we can assume these
  // all have an entity attached.
  const recentEvent = events.find(event => event.entity!.id === volume.id);
  if (recentEvent) {
    return {...volume, recentEvent}
  } else {
    return volume;
  }
}

const filterVolumeEvents = (event: Linode.Event): boolean => {
  return (
    !event._initial
    && Boolean(event.entity)
    && event.entity!.type === 'volume'
  )
}

export default compose<CombinedProps, Props>(
  connected,
  withLocalStorage,
  documented,
  styled,
  _withEvents((ownProps: CombinedProps, eventsData) => ({
    ...ownProps,
    eventsData: eventsData.filter(filterVolumeEvents)
  })),
  withLinodes((ownProps: CombinedProps, linodesData, linodesLoading, linodesError) => ({
    ...ownProps,
    linodesData,
    linodesLoading,
    linodesError,
  })),
  withVolumes((ownProps: CombinedProps, volumesData, volumesLoading) => {
    const mappedData = volumesData.items.map(id => volumesData.itemsById[id]);
    const mappedVolumesDataWithLinodes = mappedData.map((volume) => {
      const volumeWithLinodeData = addAttachedLinodeInfoToVolume(volume, ownProps.linodesData);
      return addRecentEventToVolume(volumeWithLinodeData, ownProps.eventsData);
    });
    return {
      ...ownProps,
      volumesData,
      mappedVolumesDataWithLinodes,
      volumesLoading,
    }
  }),
  withSnackbar,
)(VolumesLanding);

const RenderLoading = () => {
  return <CircleProgress />;
};

const RenderError = () => {
  return (
    <TableRowError colSpan={7} message="There was an error loading your volumes. Please try again later" />
  );
};
