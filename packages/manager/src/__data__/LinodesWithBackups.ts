import {
  Hypervisor,
  LinodeBackupStatus,
  LinodeBackupType,
  LinodeStatus
} from 'linode-js-sdk/lib/linodes';

export const LinodesWithBackups = [
  {
    label: 'fromnanoooooooode',
    ipv4: ['45.79.8.50', '192.168.211.88'],
    updated: '2018-06-05T16:20:08',
    ipv6: '2600:3c00::f03c:91ff:fed8:fd36/64',
    image: null,
    specs: {
      disk: 81920,
      memory: 4096,
      transfer: 4000,
      vcpus: 2
    },
    type: 'g6-standard-2' as LinodeBackupType,
    hypervisor: 'kvm' as Hypervisor,
    region: 'us-central',
    backups: {
      enabled: true,
      schedule: {
        day: 'Scheduling',
        window: 'Scheduling'
      }
    },
    id: 8284376,
    alerts: {
      network_in: 10,
      transfer_quota: 80,
      io: 10000,
      network_out: 10,
      cpu: 90
    },
    status: 'offline' as LinodeStatus,
    group: '',
    created: '2018-06-05T16:15:03',
    currentBackups: {
      automatic: [
        {
          updated: '2018-06-06T00:29:07',
          id: 94825693,
          configs: ['Restore 121454 - My Arch Linux Disk Profile'],
          finished: '2018-06-06T00:25:25',
          disks: [
            {
              size: 1753,
              label: 'Restore 121454 - Arch Linux Disk',
              filesystem: 'ext4'
            },
            {
              size: 0,
              label: 'Restore 121454 - 512 MB Swap Image',
              filesystem: 'swap'
            }
          ],
          created: '2018-06-06T00:23:17',
          region: 'us-central',
          label: null,
          type: 'auto' as LinodeBackupType,
          status: 'successful' as LinodeBackupStatus
        }
      ],
      snapshot: {
        in_progress: null,
        current: {
          updated: '2018-06-05T16:32:12',
          id: 94805928,
          configs: ['Restore 121454 - My Arch Linux Disk Profile'],
          finished: '2018-06-05T16:32:12',
          disks: [
            {
              size: 1753,
              label: 'Restore 121454 - Arch Linux Disk',
              filesystem: 'ext4'
            },
            {
              size: 0,
              label: 'Restore 121454 - 512 MB Swap Image',
              filesystem: 'swap'
            }
          ],
          created: '2018-06-05T16:29:15',
          region: 'us-central',
          label: 'testing',
          type: 'snapshot' as LinodeBackupType,
          status: 'successful' as LinodeBackupStatus
        }
      }
    },
    watchdog_enabled: false
  }
];
