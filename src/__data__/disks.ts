export const extDisk: Linode.Disk = {
  updated: '2018-07-05T18:16:08',
  label: 'Arch Linux Disk',
  created: '2018-07-05T18:15:43',
  filesystem: 'ext4',
  status: 'ready',
  size: 25088,
  id: 19040623
};

export const swapDisk: Linode.Disk = {
  updated: '2018-07-05T18:16:09',
  label: '512 MB Swap Image',
  created: '2018-07-05T18:15:43',
  filesystem: 'swap',
  status: 'ready',
  size: 512,
  id: 19040624
};

export const disks = [extDisk, swapDisk];
