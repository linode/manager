import { Event } from '@linode/api-v4/lib/account';
import { Config, Linode } from '@linode/api-v4/lib/linodes';
import { Volume } from '@linode/api-v4/lib/volumes';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect } from 'react-redux';
import VolumeIcon from 'src/assets/icons/entityIcons/volume.svg';
import { makeStyles } from 'src/components/core/styles';
import Placeholder from 'src/components/Placeholder';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import Loading from 'src/components/LandingLoading';
import { PaginationProps } from 'src/components/Pagey';
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
import DestructiveVolumeDialog from './DestructiveVolumeDialog';
import VolumeAttachmentDrawer from './VolumeAttachmentDrawer';
import { ExtendedVolume } from './types';
import EntityTable_CMR from 'src/components/EntityTable/EntityTable_CMR';
import LandingHeader from 'src/components/LandingHeader';
import { ActionHandlers as VolumeHandlers } from './VolumesActionMenu_CMR';
import VolumeTableRow from './VolumeTableRow_CMR';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import PreferenceToggle from 'src/components/PreferenceToggle';
import { ToggleProps } from 'src/components/PreferenceToggle/PreferenceToggle';

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
    widthPercent: 15
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
    widthPercent: 25,
    hideOnMobile: true
  },
  {
    label: 'Attached To',
    dataColumn: 'Attached To',
    sortable: false,
    widthPercent: 20
  }
];

const useStyles = makeStyles(() => ({
  empty: {
    '& svg': {
      transform: 'scale(0.75)'
    }
  }
}));

export const VolumesLanding: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    volumesLoading,
    mappedVolumesDataWithLinodes,
    volumesLastUpdated,
    volumesError,
    openForConfig,
    openForClone,
    openForEdit,
    openForResize
  } = props;

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

  const { _loading } = useReduxLoad(['volumes', 'linodes']);

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

  if (_loading) {
    return <Loading />;
  }

  if (
    mappedVolumesDataWithLinodes.length === 0 &&
    !volumesError.read &&
    volumesLastUpdated > 0
  ) {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Volumes" />
        <Placeholder
          title="Volumes"
          className={classes.empty}
          icon={VolumeIcon}
          isEntity
          buttonProps={[
            {
              onClick: () => props.history.push('/volumes/create'),
              children: 'Add a Volume'
            }
          ]}
        >
          <Typography variant="subtitle1">
            Attach additional storage to your Linode.
          </Typography>
          <Typography variant="subtitle1">
            <Link to="https://www.linode.com/docs/products/storage/block-storage/">
              Learn more about Linode Block Storage Volumes.
            </Link>
          </Typography>
        </Placeholder>
      </React.Fragment>
    );
  }

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
    data: mappedVolumesDataWithLinodes ?? [],
    loading: volumesLoading,
    lastUpdated: volumesLastUpdated,
    error: volumesError.read
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Volumes" />
      <PreferenceToggle<boolean>
        preferenceKey="volumes_group_by_tag"
        preferenceOptions={[false, true]}
        localStorageKey="GROUP_VOLUMES"
      >
        {({
          preference: volumesAreGrouped,
          togglePreference: toggleGroupVolumes
        }: ToggleProps<boolean>) => {
          return (
            <>
              <LandingHeader
                title="Volumes"
                entity="Volume"
                onAddNew={() => props.history.push('/volumes/create')}
                docsLink="https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode/"
              />
              <EntityTable_CMR
                entity="volume"
                headers={volumeHeaders}
                isGroupedByTag={volumesAreGrouped}
                toggleGroupByTag={toggleGroupVolumes}
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
            </>
          );
        }}
      </PreferenceToggle>
    </React.Fragment>
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

const connected = connect(undefined, mapDispatchToProps);

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
  withSnackbar
)(VolumesLanding);
