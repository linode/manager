import { InjectedNotistackProps, withSnackbar } from 'notistack';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import VolumesIcon from 'src/assets/addnewmenu/volume.svg';
import AddNewLink from 'src/components/AddNewLink';
import CircleProgress from 'src/components/CircleProgress';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';

import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Placeholder from 'src/components/Placeholder';
import TableRowError from 'src/components/TableRowError';
import _withEvents, { EventsProps } from 'src/containers/events.container';
import withVolumes from 'src/containers/volumes.container';
import withLinodes from 'src/containers/withLinodes.container';
import { BlockStorage } from 'src/documentation';
import { resetEventsPolling } from 'src/events';
import { deleteVolume, detachVolume } from 'src/services/volumes';
import { openForClone, openForConfig, openForCreating, openForEdit, openForResize } from 'src/store/reducers/volumeDrawer';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';

import ListVolumes from './ListVolumes';

type ClassNames = 'root'
  | 'title'

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface ExtendedVolume extends Linode.Volume {
  linodeLabel?: string;
  linodeStatus?: string;
}

interface WithVolumesProps {
  volumesData: ExtendedVolume[];
  volumesLoading: boolean;
  volumesError?: Linode.ApiFieldError[];
}

interface WithLinodesProps {
  linodesData: Linode.Linode[]
  linodesLoading: boolean;
  linodesError?: Linode.ApiFieldError[];
}

interface Props {
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Linode.Config[];
  recentEvent?: Linode.Event;
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
  & DispatchProps
  & RouteProps
  & InjectedNotistackProps
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
      volumesData,
      volumesLoading
    } = this.props;

    if (volumesLoading) {
      return this.renderLoading();
    }

    if (volumesData.length === 0) {
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

        {this.renderContent()}

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
    const { volumesError, volumesData } = this.props;

    if (volumesError) {
      return this.renderErrors(volumesError);
    }

    if (volumesData && volumesData.length > 0) {
      return this.renderData(volumesData);
    }

    return null;
  };

  renderLoading = () => {
    return <CircleProgress />;
  };

  renderErrors = (errors: Linode.ApiFieldError[]) => {
    const errorText = getErrorStringOrDefault(errors, "There was an error loading your volumes.");
    return (
      <TableRowError colSpan={5} message={errorText} />
    );
  };

  goToSettings = () => {
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
              onClick: this.goToSettings,
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
    }

    return (
      <OrderBy data={volumes} order={'desc'} orderBy={'label'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => {
          const orderProps = {
            orderBy,
            order,
            handleOrderChange,
            data: orderedData,
          };

          return false // this.props.groupByTag
            ? <></> // ListGroupedVolumes will live here
            : <ListVolumes data={orderedData} {...orderProps} renderProps={{...renderProps}}  />
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

const addAttachedLinodeInfotoVolume = (volume: Linode.Volume, linodes: Linode.Linode[]): ExtendedVolume => {
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

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  connected,
  documented,
  styled,
  withSnackbar,
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
  withVolumes((ownProps: CombinedProps, volumesData, volumesLoading) => ({
    ...ownProps,
    volumesData: volumesData.map((volume) => {
      const volumeWithLinodeData = addAttachedLinodeInfotoVolume(volume, ownProps.linodesData);
      return addRecentEventToVolume(volumeWithLinodeData, ownProps.eventsData);
    }),
    volumesLoading,
  })),
)(VolumesLanding);
