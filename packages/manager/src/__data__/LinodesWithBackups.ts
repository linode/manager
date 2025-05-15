import type {
  Hypervisor,
  LinodeBackupStatus,
  LinodeBackupType,
  LinodeStatus,
} from '@linode/api-v4/lib/linodes';

export const LinodesWithBackups = [
  {
    alerts: {
      cpu: 90,
      io: 10000,
      network_in: 10,
      network_out: 10,
      transfer_quota: 80,
    },
    backups: {
      enabled: true,
      schedule: {
        day: 'Scheduling',
        window: 'Scheduling',
      },
    },
    created: '2018-06-05T16:15:03',
    currentBackups: {
      automatic: [
        {
          configs: ['Restore 121454 - My Arch Linux Disk Profile'],
          created: '2018-06-06T00:23:17',
          disks: [
            {
              filesystem: 'ext4',
              label: 'Restore 121454 - Arch Linux Disk',
              size: 1753,
            },
            {
              filesystem: 'swap',
              label: 'Restore 121454 - 512 MB Swap Image',
              size: 0,
            },
          ],
          finished: '2018-06-06T00:25:25',
          id: 94825693,
          label: null,
          region: 'us-central',
          status: 'successful' as LinodeBackupStatus,
          type: 'auto' as LinodeBackupType,
          updated: '2018-06-06T00:29:07',
        },
      ],
      snapshot: {
        current: {
          configs: ['Restore 121454 - My Arch Linux Disk Profile'],
          created: '2018-06-05T16:29:15',
          disks: [
            {
              filesystem: 'ext4',
              label: 'Restore 121454 - Arch Linux Disk',
              size: 1753,
            },
            {
              filesystem: 'swap',
              label: 'Restore 121454 - 512 MB Swap Image',
              size: 0,
            },
          ],
          finished: '2018-06-05T16:32:12',
          id: 94805928,
          label: 'testing',
          region: 'us-central',
          status: 'successful' as LinodeBackupStatus,
          type: 'snapshot' as LinodeBackupType,
          updated: '2018-06-05T16:32:12',
        },
        in_progress: null,
      },
    },
    group: '',
    hypervisor: 'kvm' as Hypervisor,
    id: 8284376,
    image: null,
    ipv4: ['45.79.8.50', '192.168.211.88'],
    ipv6: '2600:3c00::f03c:91ff:fed8:fd36/64',
    label: 'fromnanoooooooode',
    region: 'us-central',
    specs: {
      disk: 81920,
      memory: 4096,
      transfer: 4000,
      vcpus: 2,
    },
    status: 'offline' as LinodeStatus,
    type: 'g6-standard-2' as LinodeBackupType,
    updated: '2018-06-05T16:20:08',
    watchdog_enabled: false,
  },
];
