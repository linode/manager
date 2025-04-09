import { Button, Dialog, ErrorState, Notice, Paper, clamp } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { usePrevious } from 'src/hooks/usePrevious';
import { useEventsPollingActions } from 'src/queries/events/events';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import {
  useLinodeQuery,
  useLinodeRescueMutation,
} from 'src/queries/linodes/linodes';
import { useGrants, useProfile } from 'src/queries/profile/profile';
import { useAllVolumesQuery } from 'src/queries/volumes/volumes';
import { createDevicesFromStrings } from 'src/utilities/createDevicesFromStrings';

import { LinodePermissionsError } from '../LinodePermissionsError';
import { DeviceSelection } from './DeviceSelection';
import { RescueDescription } from './RescueDescription';

import type { ExtendedDisk } from './DeviceSelection';
import type { APIError } from '@linode/api-v4/lib/types';
import type { DevicesAsStrings } from 'src/utilities/createDevicesFromStrings';

interface Props {
  linodeId: number | undefined;
  linodeLabel: string | undefined;
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
  const { linodeId, linodeLabel, onClose, open } = props;

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

  const linodeDisks = disks?.map((disk) => ({
    ...disk,
    _id: `disk-${disk.id}`,
  }));

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

  const { checkForNewEvents } = useEventsPollingActions();

  const { enqueueSnackbar } = useSnackbar();

  const [APIError, setAPIError] = React.useState<string>('');

  React.useEffect(() => {
    if (
      Object.entries(deviceMap).length !==
        Object.entries(prevDeviceMap ?? {}).length ||
      Object.entries(deviceMap).some(
        ([key, value]) => prevDeviceMap?.[key as keyof DeviceMap] !== value
      )
    ) {
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
        checkForNewEvents();
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
      title={`Rescue Linode ${linodeLabel ?? ''}`}
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
              getSelected={(slot) =>
                rescueDevices?.[slot as keyof DevicesAsStrings] ?? ''
              }
              counter={counter}
              devices={devices}
              disabled={disabled}
              onChange={onChange}
              rescue
              slots={['sda', 'sdb', 'sdc', 'sdd', 'sde', 'sdf', 'sdg']}
            />
            <Button
              buttonType="secondary"
              compactX
              disabled={disabled || counter >= 6}
              onClick={incrementCounter}
              sx={{ marginTop: theme.spacing() }}
            >
              Add Disk
            </Button>
            <ActionsPanel
              primaryButtonProps={{
                'data-qa-form-data-loading': isLoading,
                'data-testid': 'submit',
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
