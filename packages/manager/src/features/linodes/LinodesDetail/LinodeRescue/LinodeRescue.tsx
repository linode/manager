import { GrantLevel } from '@linode/api-v4/lib/account';
import { Config, LinodeStatus, rescueLinode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { assoc, clamp, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import withVolumes from 'src/containers/volumes.container';
import { resetEventsPolling } from 'src/eventsPolling';
import { withLinodeDetailContext } from 'src/features/linodes/LinodesDetail/linodeDetailContext';
import { MapState } from 'src/store/types';
import createDevicesFromStrings, {
  DevicesAsStrings
} from 'src/utilities/createDevicesFromStrings';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import HostMaintenanceError from '../HostMaintenanceError';
import LinodePermissionsError from '../LinodePermissionsError';
import DeviceSelection, {
  ExtendedDisk,
  ExtendedVolume
} from './DeviceSelection';

type ClassNames = 'root' | 'title' | 'intro';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
      paddingBottom: theme.spacing(1),
      '& .iconTextLink': {
        display: 'inline-flex',
        margin: `${theme.spacing(3)}px 0 0 0`
      }
    },
    title: {
      marginBottom: theme.spacing(2)
    },
    intro: {
      marginBottom: theme.spacing(2)
    }
  });

interface ContextProps {
  linodeId: number;
  linodeRegion?: string;
  linodeLabel: string;
  linodeDisks?: ExtendedDisk[];
  linodeStatus: LinodeStatus;
  permissions: GrantLevel;
}

interface StateProps {
  diskError?: APIError[];
}

interface VolumesProps {
  volumesData: ExtendedVolume[];
  volumesError?: string;
  volumesLastUpdated: number;
}

interface State {
  rescueDevices: DevicesAsStrings;
  errors?: APIError[];
  devices: {
    disks: ExtendedDisk[];
    volumes: ExtendedVolume[];
  };
  config?: Config;
  counter: number;
}

type CombinedProps = VolumesProps &
  StateProps &
  ContextProps &
  RouteComponentProps &
  WithStyles<ClassNames> &
  WithSnackbarProps;

interface DeviceMap {
  sda?: string;
  sdb?: string;
  sdc?: string;
  sdd?: string;
  sde?: string;
  sdf?: string;
  sdg?: string;
}

export const getDefaultDeviceMapAndCounter = (
  disks: ExtendedDisk[]
): [DeviceMap, number] => {
  const defaultDisks = disks.map(thisDisk => thisDisk._id);
  const counter = defaultDisks.reduce(
    (c, thisDisk) => (!!thisDisk ? c + 1 : c),
    0
  );
  /**
   * This mimics the behavior of Classic:
   * when you load the Rebuild tab, each
   * device slot is filled with one of your
   * disks, until you run out of either disks
   * or slots. Note that defaultDisks[10000]
   * will be `undefined`, which is the correct
   * value for an empty slot, so this is a safe
   * assignment.
   */
  const deviceMap = {
    sda: defaultDisks[0],
    sdb: defaultDisks[1],
    sdc: defaultDisks[2],
    sdd: defaultDisks[3],
    sde: defaultDisks[4],
    sdf: defaultDisks[5],
    sdg: defaultDisks[6]
  };
  return [deviceMap, counter];
};

export class LinodeRescue extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    const [deviceMap, initialCounter] = getDefaultDeviceMapAndCounter(
      props.linodeDisks || []
    );
    const filteredVolumes = this.getFilteredVolumes();
    this.state = {
      devices: {
        disks: props.linodeDisks || [],
        volumes: filteredVolumes || []
      },
      counter: initialCounter,
      rescueDevices: deviceMap
    };
  }

  getFilteredVolumes = () => {
    const { linodeId, linodeRegion, volumesData } = this.props;
    return volumesData
      ? volumesData.filter(volume => {
          // whether volume is not attached to any Linode
          const volumeIsUnattached = volume.linode_id === null;
          // whether volume is attached to the current Linode we're viewing
          const volumeIsAttachedToCurrentLinode = volume.linode_id === linodeId;
          // whether volume is in the same region as the current Linode we're viewing
          const volumeAndLinodeRegionMatch = linodeRegion === volume.region;
          return (
            (volumeIsAttachedToCurrentLinode || volumeIsUnattached) &&
            volumeAndLinodeRegionMatch
          );
        })
      : [];
  };

  onSubmit = () => {
    const { linodeId, enqueueSnackbar, history } = this.props;
    const { rescueDevices } = this.state;

    rescueLinode(linodeId, createDevicesFromStrings(rescueDevices))
      .then(_ => {
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info'
        });
        resetEventsPolling();
        history.push(`/linodes/${linodeId}/summary`);
      })
      .catch(errorResponse => {
        getAPIErrorOrDefault(
          errorResponse,
          'There was an issue rescuing your Linode.'
        ).forEach((err: APIError) =>
          enqueueSnackbar(err.reason, {
            variant: 'error'
          })
        );
      });
  };

  incrementCounter = () => {
    this.setState({ counter: clamp(1, 6, this.state.counter + 1) });
  };

  /** string format is type-id */
  onChange = (slot: string, _id: string) =>
    this.setState({
      rescueDevices: {
        ...this.state.rescueDevices,
        [slot]: _id
      }
    });

  render() {
    const { devices } = this.state;
    const {
      diskError,
      volumesError,
      classes,
      linodeLabel,
      linodeStatus,
      permissions
    } = this.props;

    const unauthorized = permissions === 'read_only';
    const hostMaintenance = linodeStatus === 'stopped';

    const disabled = unauthorized || hostMaintenance;

    if (diskError) {
      return (
        <div
          id="tabpanel-linode-detail-rescue"
          role="tabpanel"
          aria-labelledby="tab-linode-detail-rescue"
        >
          <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
          <ErrorState errorText="There was an error retrieving Disks information." />
        </div>
      );
    }

    if (volumesError) {
      return (
        <div
          id="tabpanel-linode-detail-rescue"
          role="tabpanel"
          aria-labelledby="tab-linode-detail-rescue"
        >
          <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
          <ErrorState errorText="There was an error retrieving Volumes information." />
        </div>
      );
    }

    return (
      <div id="tabpanel-rescue" role="tabpanel" aria-labelledby="tab-rescue">
        <DocumentTitleSegment segment={`${linodeLabel} - Rescue`} />
        <Paper className={classes.root}>
          {unauthorized && <LinodePermissionsError />}
          {hostMaintenance && <HostMaintenanceError />}
          <Typography
            role="heading"
            aria-level={2}
            variant="h2"
            className={classes.title}
            data-qa-title
          >
            Rescue
          </Typography>
          <Typography className={classes.intro}>
            If you suspect that your primary filesystem is corrupt, use the
            Linode Manager to boot your Linode into Rescue Mode. This is a safe
            environment for performing many system recovery and disk management
            tasks.
          </Typography>
          <DeviceSelection
            slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
            devices={devices}
            onChange={this.onChange}
            getSelected={slot =>
              pathOr('', ['rescueDevices', slot], this.state)
            }
            counter={this.state.counter}
            rescue
            disabled={disabled}
          />
          <AddNewLink
            onClick={this.incrementCounter}
            label="Add Disk"
            disabled={disabled || this.state.counter >= 6}
            left
          />
          <ActionsPanel>
            <Button
              onClick={this.onSubmit}
              buttonType="primary"
              data-qa-submit
              disabled={disabled}
            >
              Reboot into Rescue Mode
            </Button>
          </ActionsPanel>
        </Paper>
      </div>
    );
  }
}

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id,
  linodeRegion: linode.region,
  linodeLabel: linode.label,
  linodeStatus: linode.status,
  linodeDisks: linode._disks.map(disk => assoc('_id', `disk-${disk.id}`, disk)),
  permissions: linode._permissions
}));

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => ({
  diskError: state.__resources.linodeDisks[ownProps.linodeId]?.error?.read
});

const connected = connect(mapStateToProps);

export default compose<CombinedProps, {}>(
  linodeContext,
  SectionErrorBoundary,
  styled,
  withSnackbar,
  withVolumes(
    (
      ownProps,
      volumesData,
      volumesLoading,
      volumesLastUpdated,
      volumesResults,
      volumesError
    ) => {
      const mappedData = volumesData.map(volume => ({
        ...volume,
        _id: `volume-${volume.id}`
      }));
      const _error = volumesError?.read
        ? volumesError.read[0]?.reason
        : undefined;
      return {
        ...ownProps,
        volumesData: mappedData,
        volumesError: _error,
        volumesLastUpdated
      };
    }
  ),
  connected
)(LinodeRescue);
