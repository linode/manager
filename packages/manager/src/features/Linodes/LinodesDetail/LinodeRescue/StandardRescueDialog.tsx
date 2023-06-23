import { rescueLinode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { assoc, clamp, equals, pathOr } from 'ramda';
import * as React from 'react';
import { StyledActionPanel } from 'src/components/ActionsPanel/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { Dialog } from 'src/components/Dialog/Dialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { resetEventsPolling } from 'src/eventsPolling';
import usePrevious from 'src/hooks/usePrevious';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { useAllVolumesQuery } from 'src/queries/volumes';
import createDevicesFromStrings, {
  DevicesAsStrings,
} from 'src/utilities/createDevicesFromStrings';
import LinodePermissionsError from '../LinodePermissionsError';
import DeviceSelection, { ExtendedDisk } from './DeviceSelection';
import RescueDescription from './RescueDescription';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(3)} 0 ${theme.spacing(1)}`,
    '& .iconTextLink': {
      display: 'inline-flex',
      margin: `${theme.spacing(3)} 0 0 0`,
    },
  },
  button: {
    marginTop: theme.spacing(),
  },
}));

interface Props {
  linodeId: number | undefined;
  open: boolean;
  onClose: () => void;
}

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
  const defaultDisks = disks.map((thisDisk) => thisDisk._id);
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
  const deviceMap: DeviceMap = {
    sda: defaultDisks[0],
    sdb: defaultDisks[1],
    sdc: defaultDisks[2],
    sdd: defaultDisks[3],
    sde: defaultDisks[4],
    sdf: defaultDisks[5],
    sdg: defaultDisks[6],
  };
  return [deviceMap, counter];
};

export const StandardRescueDialog = (props: Props) => {
  const { open, onClose, linodeId } = props;

  const classes = useStyles();

  const { data: linode } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );
  const { data: disks, error: disksError } = useAllLinodeDisksQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );
  const { data: volumes, error: volumesError } = useAllVolumesQuery(
    {},
    { region: linode?.region },
    open
  );

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const isReadOnly =
    Boolean(profile?.restricted) &&
    grants?.linode.find((grant) => grant.id === linodeId)?.permissions ===
      'read_only';

  // We need the API to allow us to filter on `linode_id`
  // const { data: volumes } = useAllVolumesQuery(
  //   {},
  //   {
  //     '+or': [
  //       { linode_id: props.linodeId },
  //       { linode_id: null, region: linodeRegion },
  //     ],
  //   },
  //   open
  // );

  const linodeDisks = disks?.map((disk) =>
    assoc('_id', `disk-${disk.id}`, disk)
  );

  const filteredVolumes =
    volumes?.filter((volume) => {
      // whether volume is not attached to any Linode
      const volumeIsUnattached = volume.linode_id === null;
      // whether volume is attached to the current Linode we're viewing
      const volumeIsAttachedToCurrentLinode = volume.linode_id === linodeId;

      return volumeIsAttachedToCurrentLinode || volumeIsUnattached;
    }) ?? [];

  const [deviceMap, initialCounter] = getDefaultDeviceMapAndCounter(
    linodeDisks ?? []
  );

  const prevDeviceMap = usePrevious(deviceMap);

  const [counter, setCounter] = React.useState<number>(initialCounter);
  const [rescueDevices, setRescueDevices] =
    React.useState<DevicesAsStrings>(deviceMap);

  const { enqueueSnackbar } = useSnackbar();

  const [APIError, setAPIError] = React.useState<string>('');

  React.useEffect(() => {
    if (!equals(deviceMap, prevDeviceMap)) {
      setCounter(initialCounter);
      setRescueDevices(deviceMap);
      setAPIError('');
    }
  }, [open, initialCounter, deviceMap, prevDeviceMap]);

  const devices = {
    disks: linodeDisks ?? [],
    volumes:
      filteredVolumes.map((volume) => ({
        ...volume,
        _id: `volume-${volume.id}`,
      })) ?? [],
  };

  const disabled = isReadOnly;

  const onSubmit = () => {
    rescueLinode(linodeId ?? -1, createDevicesFromStrings(rescueDevices))
      .then((_) => {
        enqueueSnackbar('Linode rescue started.', {
          variant: 'info',
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
    setRescueDevices((rescueDevices) => ({
      ...rescueDevices,
      [slot]: _id,
    }));

  return (
    <Dialog
      title={`Rescue Linode ${linode?.label ?? ''}`}
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
      {disksError ? (
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
            {isReadOnly && <LinodePermissionsError />}
            {linodeId ? <RescueDescription linodeId={linodeId} /> : null}
            <DeviceSelection
              slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
              devices={devices}
              onChange={onChange}
              getSelected={(slot) => pathOr('', [slot], rescueDevices)}
              counter={counter}
              rescue
              disabled={disabled}
            />
            <Button
              buttonType="secondary"
              onClick={incrementCounter}
              className={classes.button}
              compactX
              disabled={disabled || counter >= 6}
            >
              Add Disk
            </Button>
            <StyledActionPanel>
              <Button
                buttonType="primary"
                disabled={disabled}
                onClick={onSubmit}
                data-qa-submit
              >
                Reboot into Rescue Mode
              </Button>
            </StyledActionPanel>
          </Paper>
        </div>
      )}
    </Dialog>
  );
};
