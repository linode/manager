import { Disk } from '@linode/api-v4/lib/linodes';

export const extDisk: Disk = {
  updated: '2018-07-05T18:16:08',
  label: 'Arch Linux Disk',
  created: '2018-07-05T18:15:43',
  filesystem: 'ext4',
  status: 'ready',
  size: 25088,
  id: 19040623,
};

export const swapDisk: Disk = {
  updated: '2018-07-05T18:16:09',
  label: '512 MB Swap Image',
  created: '2018-07-05T18:15:43',
  filesystem: 'swap',
  status: 'ready',
  size: 512,
  id: 19040624,
};

export const extDiskCopy: Disk = {
  updated: '2018-07-05T18:16:08',
  label: 'Arch Linux Disk',
  created: '2018-07-05T18:15:43',
  filesystem: 'ext4',
  status: 'ready',
  size: 25088,
  id: 19040623,
};

export const extDisk2: Disk = {
  updated: '2018-08-05T18:16:08',
  label: 'Custom Disk',
  created: '2018-08-05T18:15:43',
  filesystem: 'ext4',
  status: 'ready',
  size: 10000,
  id: 19040625,
};

export const extDisk3: Disk = {
  updated: '2018-08-05T18:16:08',
  label: 'Custom Disk which matches config',
  created: '2018-08-06T18:15:43',
  filesystem: 'ext4',
  status: 'ready',
  size: 10000,
  id: 18795181,
};

export const disks = [extDisk, swapDisk];
