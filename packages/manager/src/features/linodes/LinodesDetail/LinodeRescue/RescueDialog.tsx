import { rescueLinode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { assoc, clamp, equals, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import ErrorState from 'src/components/ErrorState';
import SectionErrorBoundary from 'src/components/SectionErrorBoundary';
import withVolumes from 'src/containers/volumes.container';
import { resetEventsPolling } from 'src/eventsPolling';
import { MapState } from 'src/store/types';
import createDevicesFromStrings, {
  DevicesAsStrings
} from 'src/utilities/createDevicesFromStrings';
import LinodePermissionsError from '../LinodePermissionsError';
import DeviceSelection, {
  ExtendedDisk,
  ExtendedVolume
} from './DeviceSelection';
import Dialog from 'src/components/Dialog';
import useExtendedLinode from 'src/hooks/useExtendedLinode';
import usePrevious from 'src/hooks/usePrevious';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3)}px 0 ${theme.spacing(1)}px`,
    '& .iconTextLink': {
      display: 'inline-flex',
      margin: `${theme.spacing(3)}px 0 0 0`
    }
  }
}));

interface StateProps {
  diskError?: APIError[];
}

interface VolumesProps {
  volumesData: ExtendedVolume[];
  volumesError?: string;
  volumesLastUpdated: number;
}

interface Props {
  linodeId: number;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props &
  VolumesProps &
  StateProps &
  RouteComponentProps &
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

const LinodeRescue: React.FC<CombinedProps> = props => {
  const {
    diskError,
    volumesData,
    volumesError,
    open,
    onClose,
    linodeId
  } = props;

  const classes = useStyles();

  const linode = useExtendedLinode(linodeId);
  const linodeRegion = linode?.region;
  const linodeLabel = linode?.label;
  const linodeDisks = linode?._disks.map(disk =>
    assoc('_id', `disk-${disk.id}`, disk)
  );

  const filteredVolumes = React.useMemo(() => {
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
  }, [volumesData, linodeId, linodeRegion]);

  const [deviceMap, initialCounter] = getDefaultDeviceMapAndCounter(
    linodeDisks ?? []
  );

  const prevDeviceMap = usePrevious(deviceMap);

  const [counter, setCounter] = React.useState<number>(initialCounter);
  const [rescueDevices, setRescueDevices] = React.useState<DevicesAsStrings>(
    deviceMap
  );

  const [APIError, setAPIError] = React.useState<string>('');

  React.useEffect(() => {
    if (open && !equals(deviceMap, prevDeviceMap)) {
      setCounter(initialCounter);
      setRescueDevices(deviceMap);
      setAPIError('');
    }
  }, [open, initialCounter, deviceMap, prevDeviceMap]);

  const devices = {
    disks: linodeDisks ?? [],
    volumes: filteredVolumes ?? []
  };

  const unauthorized = linode?._permissions === 'read_only';
  const disabled = unauthorized;

  const onSubmit = () => {
    const { enqueueSnackbar } = props;

    rescueLinode(linodeId, createDevicesFromStrings(rescueDevices))
      .then(_ => {
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info'
        });
        resetEventsPolling();
        onClose();
      })
      .catch((errorResponse: APIError[]) => {
        setAPIError(errorResponse[0].reason);
      });
  };

  const incrementCounter = () => {
    setCounter(clamp(1, 6, counter + 1));
  };

  /** string format is type-id */
  const onChange = (slot: string, _id: string) =>
    setRescueDevices(rescueDevices => ({
      ...rescueDevices,
      [slot]: _id
    }));

  return (
    <Dialog
      title={`Rescue ${linodeLabel ?? ''}`}
      open={open}
      onClose={() => {
        setAPIError('');
        onClose();
      }}
      fullWidth
      fullHeight
      maxWidth="md"
    >
      {APIError && <Notice error text={APIError} />}
      {diskError ? (
        <div>
          <ErrorState errorText="There was an error retrieving Disks information." />
        </div>
      ) : volumesError ? (
        <div>
          <ErrorState errorText="There was an error retrieving Volumes information." />
        </div>
      ) : (
        <div>
          <Paper className={classes.root}>
            {unauthorized && <LinodePermissionsError />}
            <Typography>
              If you suspect that your primary filesystem is corrupt, use the
              Linode Manager to boot your Linode into Rescue Mode. This is a
              safe environment for performing many system recovery and disk
              management tasks.
            </Typography>
            <DeviceSelection
              slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
              devices={devices}
              onChange={onChange}
              getSelected={slot => pathOr('', [slot], rescueDevices)}
              counter={counter}
              rescue
              disabled={disabled}
            />
            <AddNewLink
              onClick={incrementCounter}
              label="Add Disk"
              disabled={disabled || counter >= 6}
              left
            />
            <ActionsPanel>
              <Button
                onClick={onSubmit}
                buttonType="primary"
                data-qa-submit
                disabled={disabled}
              >
                Reboot into Rescue Mode
              </Button>
            </ActionsPanel>
          </Paper>
        </div>
      )}
    </Dialog>
  );
};

const mapStateToProps: MapState<StateProps, CombinedProps> = (
  state,
  ownProps
) => ({
  diskError: state.__resources.linodeDisks[ownProps.linodeId]?.error?.read
});

const connected = connect(mapStateToProps);

export default compose<CombinedProps, Props>(
  React.memo,
  SectionErrorBoundary,
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
