import { APIError } from '@linode/api-v4/lib/types';
import { styled, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { assoc, clamp, equals, pathOr } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { Dialog } from 'src/components/Dialog/Dialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { resetEventsPolling } from 'src/eventsPolling';
import { usePrevious } from 'src/hooks/usePrevious';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useLinodeQuery,
  useLinodeRescueMutation,
} from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile';
import { useAllVolumesQuery } from 'src/queries/volumes';
import {
  DevicesAsStrings,
  createDevicesFromStrings,
} from 'src/utilities/createDevicesFromStrings';

import { LinodePermissionsError } from '../LinodePermissionsError';
import { DeviceSelection, ExtendedDisk } from './DeviceSelection';
import { RescueDescription } from './RescueDescription';

interface Props {
  linodeId: number | undefined;
  onClose: () => void;
  open: boolean;
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
  const { linodeId, onClose, open } = props;

  const theme = useTheme();

  const { data: linode, isLoading: isLoadingLinodes } = useLinodeQuery(
    linodeId ?? -1,
    linodeId !== undefined && open
  );
  const {
    data: disks,
    error: disksError,
    isLoading: isLoadingDisks,
  } = useAllLinodeDisksQuery(linodeId ?? -1, linodeId !== undefined && open);
  const {
    data: volumes,
    error: volumesError,
    isLoading: isLoadingVolumes,
  } = useAllVolumesQuery({}, { region: linode?.region }, open);
  const isLoading = isLoadingLinodes || isLoadingDisks || isLoadingVolumes;

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

  const { mutateAsync: rescueLinode } = useLinodeRescueMutation(linodeId ?? -1);

  const prevDeviceMap = usePrevious(deviceMap);

  const [counter, setCounter] = React.useState<number>(initialCounter);
  const [rescueDevices, setRescueDevices] = React.useState<DevicesAsStrings>(
    deviceMap
  );

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
    rescueLinode(createDevicesFromStrings(rescueDevices))
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
      onClose={() => {
        setAPIError('');
        onClose();
      }}
      fullHeight
      fullWidth
      maxWidth="md"
      open={open}
      title={`Rescue Linode ${linode?.label ?? ''}`}
    >
      {APIError && <Notice text={APIError} variant="error" />}
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
          <StyledPaper>
            {isReadOnly && <LinodePermissionsError />}
            {linodeId ? <RescueDescription linodeId={linodeId} /> : null}
            <DeviceSelection
              counter={counter}
              devices={devices}
              disabled={disabled}
              getSelected={(slot) => pathOr('', [slot], rescueDevices)}
              onChange={onChange}
              rescue
              slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
            />
            <Button
              sx={{ marginTop: theme.spacing() }}
              buttonType="secondary"
              compactX
              disabled={disabled || counter >= 6}
              onClick={incrementCounter}
            >
              Add Disk
            </Button>
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                'data-qa-form-data-loading': isLoading,
                disabled,
                label: 'Reboot into Rescue Mode',
                onClick: onSubmit,
              }}
            />
          </StyledPaper>
        </div>
      )}
    </Dialog>
  );
};

const StyledPaper = styled(Paper, { label: 'StyledPaper' })(({ theme }) => ({
  '& .iconTextLink': {
    display: 'inline-flex',
    margin: `${theme.spacing(3)} 0 0 0`,
  },
  padding: `${theme.spacing(3)} 0 ${theme.spacing(1)}`,
}));
