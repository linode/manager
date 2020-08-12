import { Event } from '@linode/api-v4/lib/account';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import Loading from 'src/components/LandingLoading';
import { PaginationProps } from 'src/components/Pagey';
import _withEvents, { EventsProps } from 'src/containers/events.container';
import withRegions, {
  DefaultProps as RegionProps
} from 'src/containers/regions.container';
import { StateProps as WithVolumesProps } from 'src/containers/volumes.container';
import withVolumesRequests, {
  VolumesRequests
} from 'src/containers/volumesRequests.container';
import { Props as WithLinodesProps } from 'src/containers/withLinodes.container';
import { resetEventsPolling } from 'src/eventsPolling';
import {
  LinodeOptions,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
  Origin as VolumeDrawerOrigin
} from 'src/store/volumeForm';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DestructiveVolumeDialog from 'src/features/Volumes/DestructiveVolumeDialog';
import VolumeAttachmentDrawer from 'src/features/Volumes/VolumeAttachmentDrawer';
import { ExtendedVolume } from 'src/features/Volumes/types';
import EntityTable_CMR from 'src/components/EntityTable/EntityTable_CMR';
import { ActionHandlers as VolumeHandlers } from 'src/features/Volumes/VolumesActionMenu_CMR';
import VolumeTableRow from 'src/features/Volumes/VolumeTableRow_CMR';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { Volume } from '@linode/api-v4/lib/volumes';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%'
  },
  headline: {
    marginBottom: 3,
    marginLeft: 8,
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
    }
  },
  volumesPanel: {
    marginTop: '20px'
  }
}));

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

type RouteProps = RouteComponentProps<{ linodeId: string }>;

type CombinedProps = LinodeContextProps &
  VolumesRequests &
  WithVolumesProps &
  WithLinodesProps &
  EventsProps &
  PaginationProps<ExtendedVolume> &
  DispatchProps &
  RouteProps &
  WithSnackbarProps &
  RegionProps;

const volumeHeaders = [
  {
    label: 'Label',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 25
  },
  {
    label: 'Region',
    dataColumn: 'region',
    sortable: true,
    widthPercent: 20
  },
  {
    label: 'Size',
    dataColumn: 'size',
    sortable: true,
    widthPercent: 5
  },
  {
    label: 'File System Path',
    dataColumn: 'File System Path',
    sortable: false,
    widthPercent: 25
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 25
  }
];

export const LinodeStorage: React.FC<CombinedProps> = props => {
  const {
    volumesLoading,
    volumesLastUpdated,
    volumesError,
    linodeVolumes,
    openForConfig,
    openForClone,
    openForEdit,
    openForResize,
    openForCreating,
    linodeId,
    linodeLabel,
    linodeRegion
  } = props;

  const classes = useStyles();

  const [attachmentDrawer, setAttachmentDrawer] = React.useState({
    open: false,
    volumeId: 0,
    volumeLabel: '',
    linodeRegion: ''
  });

  const [destructiveDialog, setDestructiveDialog] = React.useState<{
    open: boolean;
    mode: 'detach' | 'delete';
    volumeId?: number;
    volumeLabel: string;
    linodeLabel: string;
    error?: string;
    poweredOff?: boolean;
  }>({
    open: false,
    mode: 'detach',
    volumeId: 0,
    volumeLabel: '',
    linodeLabel: '',
    error: '',
    poweredOff: false
  });

  const handleCloseAttachDrawer = () => {
    setAttachmentDrawer(attachmentDrawer => ({
      ...attachmentDrawer,
      open: false
    }));
  };

  const handleAttach = (volumeId: number, label: string, regionID: string) => {
    setAttachmentDrawer(attachmentDrawer => ({
      ...attachmentDrawer,
      open: true,
      volumeId,
      volumeLabel: label,
      linodeRegion: regionID
    }));
  };

  const handleDetach = (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    poweredOff: boolean
  ) => {
    setDestructiveDialog(destructiveDialog => ({
      ...destructiveDialog,
      open: true,
      mode: 'detach',
      volumeId,
      volumeLabel,
      linodeLabel,
      poweredOff,
      error: ''
    }));
  };

  const handleDelete = (volumeId: number, volumeLabel: string) => {
    setDestructiveDialog(destructiveDialog => ({
      ...destructiveDialog,
      open: true,
      mode: 'delete',
      volumeId,
      volumeLabel,
      linodeLabel: '',
      error: ''
    }));
  };

  const closeDestructiveDialog = () => {
    setDestructiveDialog(destructiveDialog => ({
      ...destructiveDialog,
      open: false
    }));
  };

  const detachVolume = () => {
    const { volumeId } = destructiveDialog;
    const { detachVolume } = props;
    if (!volumeId) {
      return;
    }

    detachVolume({ volumeId })
      .then(_ => {
        /* @todo: show a progress bar for volume detachment */
        props.enqueueSnackbar('Volume detachment started', {
          variant: 'info'
        });
        closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch(error => {
        setDestructiveDialog(destructiveDialog => ({
          ...destructiveDialog,
          error: getAPIErrorOrDefault(error, 'Unable to detach Volume.')[0]
            .reason
        }));
      });
  };

  const deleteVolume = () => {
    const { volumeId } = destructiveDialog;
    const { deleteVolume } = props;

    if (!volumeId) {
      return;
    }

    deleteVolume({ volumeId })
      .then(() => {
        closeDestructiveDialog();
        resetEventsPolling();
      })
      .catch(error => {
        setDestructiveDialog(destructiveDialog => ({
          ...destructiveDialog,
          error: getAPIErrorOrDefault(error, 'Unable to delete Volume.')[0]
            .reason
        }));
      });
  };

  const openCreateVolumeDrawer = (e: any) => {
    e.preventDefault();

    if (linodeId && linodeLabel && linodeRegion) {
      return openForCreating('Created from Linode Details', {
        linodeId,
        linodeLabel,
        linodeRegion
      });
    }
  };

  const handlers: VolumeHandlers = {
    openForConfig,
    openForEdit,
    openForResize,
    openForClone,
    handleAttach,
    handleDetach,
    handleDelete
  };

  const volumeRow = {
    handlers,
    Component: VolumeTableRow,
    data: linodeVolumes ?? [],
    loading: volumesLoading,
    lastUpdated: volumesLastUpdated,
    error: volumesError?.read
  };

  if (volumesLoading) {
    return <Loading shouldDelay />;
  }

  return (
    <div className={classes.volumesPanel}>
      <Grid
        container
        justify="space-between"
        alignItems="flex-end"
        className={classes.root}
      >
        <Grid item>
          <Typography variant="h3" className={classes.headline}>
            Volumes
          </Typography>
        </Grid>
        <Grid item className={classes.addNewWrapper}>
          <AddNewLink
            onClick={openCreateVolumeDrawer}
            label="Add a Volume..."
            disabled={false}
          />
        </Grid>
      </Grid>
      <EntityTable_CMR
        entity="volume"
        headers={volumeHeaders}
        groupByTag={false}
        row={volumeRow}
        initialOrder={{ order: 'asc', orderBy: 'label' }}
      />
      <VolumeAttachmentDrawer
        open={attachmentDrawer.open}
        volumeId={attachmentDrawer.volumeId || 0}
        volumeLabel={attachmentDrawer.volumeLabel || ''}
        linodeRegion={attachmentDrawer.linodeRegion || ''}
        onClose={handleCloseAttachDrawer}
      />
      <DestructiveVolumeDialog
        open={destructiveDialog.open}
        error={destructiveDialog.error}
        volumeLabel={destructiveDialog.volumeLabel}
        linodeLabel={destructiveDialog.linodeLabel}
        poweredOff={destructiveDialog.poweredOff || false}
        mode={destructiveDialog.mode}
        onClose={closeDestructiveDialog}
        onDetach={detachVolume}
        onDelete={deleteVolume}
      />
    </div>
  );
};

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

interface LinodeContextProps {
  linodeId?: number;
  linodeStatus?: string;
  linodeLabel?: string;
  linodeRegion?: string;
  readOnly: boolean;
  linodeVolumes?: Volume[];
}

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  linodeStatus: linode.status,
  linodeLabel: linode.label,
  linodeRegion: linode.region,
  readOnly: linode._permissions === 'read_only',
  linodeVolumes: linode._volumes
}));

const connected = connect(undefined, mapDispatchToProps);

const filterVolumeEvents = (event: Event): boolean => {
  return (
    !event._initial && Boolean(event.entity) && event.entity!.type === 'volume'
  );
};

export default compose<CombinedProps, {}>(
  connected,
  linodeContext,
  withVolumesRequests,
  _withEvents((ownProps: CombinedProps, eventsData) => ({
    ...ownProps,
    eventsData: eventsData.filter(filterVolumeEvents)
  })),
  withRegions(),
  withSnackbar
)(LinodeStorage);
