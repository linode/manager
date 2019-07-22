export const linodeConfigs: Linode.Config[] = [
  {
    created: '2018-06-26T16:04:28',
    memory_limit: 0,
    updated: '2018-06-26T16:04:28',
    comments: '',
    virt_mode: 'paravirt',
    id: 9859511,
    run_level: 'default',
    helpers: {
      distro: true,
      network: true,
      modules_dep: true,
      devtmpfs_automount: true,
      updatedb_disabled: true
    },
    root_device: '/dev/sda',
    label: 'My Arch Linux Disk Profile',
    initrd: null,
    devices: {
      sdc: {
        volume_id: 8702,
        disk_id: null
      },
      sda: {
        volume_id: null,
        disk_id: 18795181
      },
      sdd: null,
      sdf: null,
      sdb: {
        volume_id: null,
        disk_id: 18795182
      },
      sdh: null,
      sdg: null,
      sde: null
    },
    kernel: 'linode/grub2'
  }
];
