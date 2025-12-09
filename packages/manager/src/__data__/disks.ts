import type { Disk } from '@linode/api-v4/lib/linodes';

export const extDisk: Disk = {
  created: '2018-07-05T18:15:43',
  filesystem: 'ext4',
  id: 19040623,
  label: 'Arch Linux Disk',
  size: 25088,
  status: 'ready',
  updated: '2018-07-05T18:16:08',
};

export const swapDisk: Disk = {
  created: '2018-07-05T18:15:43',
  filesystem: 'swap',
  id: 19040624,
  label: '512 MB Swap Image',
  size: 512,
  status: 'ready',
  updated: '2018-07-05T18:16:09',
};

export const extDiskCopy: Disk = {
  created: '2018-07-05T18:15:43',
  filesystem: 'ext4',
  id: 19040623,
  label: 'Arch Linux Disk',
  size: 25088,
  status: 'ready',
  updated: '2018-07-05T18:16:08',
};

export const extDisk2: Disk = {
  created: '2018-08-05T18:15:43',
  filesystem: 'ext4',
  id: 19040625,
  label: 'Custom Disk',
  size: 10000,
  status: 'ready',
  updated: '2018-08-05T18:16:08',
};

export const extDisk3: Disk = {
  created: '2018-08-06T18:15:43',
  filesystem: 'ext4',
  id: 18795181,
  label: 'Custom Disk which matches config',
  size: 10000,
  status: 'ready',
  updated: '2018-08-05T18:16:08',
};

export const disks = [extDisk, swapDisk];
