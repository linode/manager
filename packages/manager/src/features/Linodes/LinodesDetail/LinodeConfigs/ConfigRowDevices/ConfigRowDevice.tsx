import { ListItem } from '@linode/ui';
import React from 'react';

import { isDiskDevice, isVolumeDevice } from '../utilities';
import { DiskDevice } from './DiskDevice';
import { VolumeDevice } from './VolumeDevice';

import type { Devices } from '@linode/api-v4';

interface Props {
  device: Devices[keyof Devices];
  deviceKey: keyof Devices;
  linodeId: number;
}

export const ConfigRowDevice = ({ device, deviceKey, linodeId }: Props) => {
  if (!device) {
    return null;
  }

  if (isVolumeDevice(device)) {
    return <VolumeDevice device={device} deviceKey={deviceKey} />;
  }

  if (isDiskDevice(device)) {
    return (
      <DiskDevice device={device} deviceKey={deviceKey} linodeId={linodeId} />
    );
  }

  return (
    <ListItem disableGutters disablePadding>
      /dev/{deviceKey} – Unknown
    </ListItem>
  );
};
