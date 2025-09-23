import { useVolumeQuery } from '@linode/queries';
import { ListItem } from '@linode/ui';
import React from 'react';

import type { VolumeDevice as VolumeDeviceType } from '@linode/api-v4';
import type { Devices } from '@linode/api-v4';

interface Props {
  device: VolumeDeviceType;
  deviceKey: keyof Devices;
}

export const VolumeDevice = ({ device, deviceKey }: Props) => {
  const { data: volume } = useVolumeQuery(device.volume_id);

  return (
    <ListItem disableGutters disablePadding>
      /dev/{deviceKey} – {volume?.label ?? `Volume ${device.volume_id}`}
    </ListItem>
  );
};
