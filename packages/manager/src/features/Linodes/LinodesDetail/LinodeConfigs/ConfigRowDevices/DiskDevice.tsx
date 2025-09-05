import { useAllLinodeDisksQuery } from '@linode/queries';
import { ListItem } from '@linode/ui';
import React from 'react';

import type { DiskDevice as DiskDeviceType } from '@linode/api-v4';
import type { Devices } from '@linode/api-v4';

interface Props {
  device: DiskDeviceType;
  deviceKey: keyof Devices;
  linodeId: number;
}

export const DiskDevice = ({ linodeId, device, deviceKey }: Props) => {
  const { data: disks } = useAllLinodeDisksQuery(linodeId);

  const disk = disks?.find((disk) => disk.id === device.disk_id);

  return (
    <ListItem disableGutters disablePadding>
      /dev/{deviceKey} – {disk?.label ?? `Disk ${device.disk_id}`}
    </ListItem>
  );
};
