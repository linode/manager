import { createStore } from 'redux';
import reducers from './reducers';

interface ManyResourceState<T> {
  data?: T[];
  page: number;
  pages: number;
  results: number;
}

interface ApiState {
  linodes?: ManyResourceState<Linode.Linode>;
  linodeTypes?: ManyResourceState<Linode.LinodeType>;
  images?: ManyResourceState<Linode.Image>;
}

export interface AppState {
  api: ApiState;
}

const defaultState: AppState = {
  api: {
    linodes: {
      page: 0,
      pages: 1,
      results: 2,
      data: [
        {
          specs: {
            transfer: 1000,
            memory: 1024,
            vcpus: 1,
            disk: 20480,
          },
          updated: '2017-12-11T16:35:31',
          ipv4: [
            '97.107.143.78',
          ],
          id: 2020425,
          alerts: {
            transfer_quota: 80,
            network_in: 10,
            io: 10000,
            network_out: 10,
            cpu: 90,
          },
          created: '2017-12-07T19:12:58',
          hypervisor: 'kvm',
          label: 'test',
          image: 'linode/Ubuntu16.10',
          group: '',
          region: 'us-east-1a',
          type: 'g5-nanode-1',
          backups: {
            schedule: {
              window: 'W2',
              day: 'Saturday',
            },
            enabled: true,
          },
          status: 'running',
          ipv6: '2600:3c03::f03c:91ff:fe0a:109a/64',
        },
        {
          specs: {
            transfer: 2000,
            memory: 2048,
            vcpus: 1,
            disk: 30720,
          },
          updated: '2018-02-22T16:11:07',
          ipv4: [
            '97.107.143.49',
          ],
          id: 2020755,
          alerts: {
            transfer_quota: 80,
            network_in: 10,
            io: 10000,
            network_out: 10,
            cpu: 90,
          },
          created: '2018-02-22T16:11:07',
          hypervisor: 'kvm',
          label: 'another-test',
          image: 'linode/Ubuntu16.04LTS',
          group: '',
          region: 'us-east-1a',
          type: 'g5-standard-1',
          backups: {
            schedule: {
              window: 'Scheduling',
              day: 'Scheduling',
            },
            enabled: true,
          },
          status: 'running',
          ipv6: '2600:3c03::f03c:91ff:fe0a:0d7a/64',
        },
      ],
    },
    linodeTypes: {
      page: 0,
      pages: 1,
      results: 14,
      data: [
        {
          transfer: 2000,
          network_out: 1000,
          price: {
            monthly: 10.0,
            hourly: 0.015,
          },
          id: 'g5-standard-1',
          label: 'Linode 2048',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 2.5,
                hourly: 0.004,
              },
            },
          },
          memory: 2048,
          vcpus: 1,
          disk: 30720,
        },
        {
          transfer: 3000,
          network_out: 1000,
          price: {
            monthly: 20.0,
            hourly: 0.03,
          },
          id: 'g5-standard-2',
          label: 'Linode 4096',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 5.0,
                hourly: 0.008,
              },
            },
          },
          memory: 4096,
          vcpus: 2,
          disk: 49152,
        },
        {
          transfer: 4000,
          network_out: 1000,
          price: {
            monthly: 40.0,
            hourly: 0.06,
          },
          id: 'g5-standard-4',
          label: 'Linode 8192',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 10.0,
                hourly: 0.015,
              },
            },
          },
          memory: 8192,
          vcpus: 4,
          disk: 98304,
        },
        {
          transfer: 8000,
          network_out: 1000,
          price: {
            monthly: 80.0,
            hourly: 0.12,
          },
          id: 'g5-standard-6',
          label: 'Linode 12288',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 20.0,
                hourly: 0.03,
              },
            },
          },
          memory: 12288,
          vcpus: 6,
          disk: 196608,
        },
        {
          transfer: 16000,
          network_out: 2000,
          price: {
            monthly: 160.0,
            hourly: 0.24,
          },
          id: 'g5-standard-8',
          label: 'Linode 24576',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 40.0,
                hourly: 0.06,
              },
            },
          },
          memory: 24576,
          vcpus: 8,
          disk: 393216,
        },
        {
          transfer: 20000,
          network_out: 4000,
          price: {
            monthly: 320.0,
            hourly: 0.48,
          },
          id: 'g5-standard-12',
          label: 'Linode 49152',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 80.0,
                hourly: 0.12,
              },
            },
          },
          memory: 49152,
          vcpus: 12,
          disk: 786432,
        },
        {
          transfer: 20000,
          network_out: 6000,
          price: {
            monthly: 480.0,
            hourly: 0.72,
          },
          id: 'g5-standard-16',
          label: 'Linode 65536',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 120.0,
                hourly: 0.18,
              },
            },
          },
          memory: 65536,
          vcpus: 16,
          disk: 1179648,
        },
        {
          transfer: 20000,
          network_out: 8000,
          price: {
            monthly: 640.0,
            hourly: 0.96,
          },
          id: 'g5-standard-20',
          label: 'Linode 81920',
          class: 'standard',
          addons: {
            backups: {
              price: {
                monthly: 160.0,
                hourly: 0.24,
              },
            },
          },
          memory: 81920,
          vcpus: 20,
          disk: 1572864,
        },
        {
          transfer: 1000,
          network_out: 1000,
          price: {
            monthly: 5.0,
            hourly: 0.0075,
          },
          id: 'g5-nanode-1',
          label: 'Linode 1024',
          class: 'nanode',
          addons: {
            backups: {
              price: {
                monthly: 2.0,
                hourly: 0.003,
              },
            },
          },
          memory: 1024,
          vcpus: 1,
          disk: 20480,
        },
        {
          transfer: 5000,
          network_out: 1000,
          price: {
            monthly: 60.0,
            hourly: 0.09,
          },
          id: 'g5-highmem-1',
          label: 'Linode 16384',
          class: 'highmem',
          addons: {
            backups: {
              price: {
                monthly: 5.0,
                hourly: 0.008,
              },
            },
          },
          memory: 16384,
          vcpus: 1,
          disk: 20480,
        },
        {
          transfer: 6000,
          network_out: 1500,
          price: {
            monthly: 120.0,
            hourly: 0.18,
          },
          id: 'g5-highmem-2',
          label: 'Linode 32768',
          class: 'highmem',
          addons: {
            backups: {
              price: {
                monthly: 10.0,
                hourly: 0.015,
              },
            },
          },
          memory: 32768,
          vcpus: 2,
          disk: 40960,
        },
        {
          transfer: 7000,
          network_out: 3000,
          price: {
            monthly: 240.0,
            hourly: 0.36,
          },
          id: 'g5-highmem-4',
          label: 'Linode 61440',
          class: 'highmem',
          addons: {
            backups: {
              price: {
                monthly: 20.0,
                hourly: 0.03,
              },
            },
          },
          memory: 61440,
          vcpus: 4,
          disk: 92160,
        },
        {
          transfer: 8000,
          network_out: 6000,
          price: {
            monthly: 480.0,
            hourly: 0.72,
          },
          id: 'g5-highmem-8',
          label: 'Linode 102400',
          class: 'highmem',
          addons: {
            backups: {
              price: {
                monthly: 40.0,
                hourly: 0.06,
              },
            },
          },
          memory: 102400,
          vcpus: 8,
          disk: 204800,
        },
        {
          transfer: 9000,
          network_out: 10000,
          price: {
            monthly: 960.0,
            hourly: 1.44,
          },
          id: 'g5-highmem-16',
          label: 'Linode 204800',
          class: 'highmem',
          addons: {
            backups: {
              price: {
                monthly: 60.0,
                hourly: 0.09,
              },
            },
          },
          memory: 204800,
          vcpus: 16,
          disk: 348160,
        },
      ],

    },
    images: {
      page: 0,
      pages: 1,
      results: 21,
      data: [
        {
          created_by: 'linode',
          deprecated: true,
          id: 'linode/slackware13',
          vendor: 'Slackware',
          size: 600,
          type: 'manual',
          created: '2011-06-05T19:11:59',
          is_public: true,
          label: 'Slackware 13.37',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/slackware14',
          vendor: 'Slackware',
          size: 1000,
          type: 'manual',
          created: '2013-11-25T16:11:02',
          is_public: true,
          label: 'Slackware 14.1',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: true,
          id: 'linode/ubuntu12',
          vendor: 'Ubuntu',
          size: 550,
          type: 'manual',
          created: '2014-04-28T18:16:59',
          is_public: true,
          label: 'Ubuntu 12.04 LTS',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: true,
          id: 'linode/centos6',
          vendor: 'CentOS',
          size: 675,
          type: 'manual',
          created: '2014-04-28T19:19:34',
          is_public: true,
          label: 'CentOS 6.5',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/centos7',
          vendor: 'CentOS',
          size: 750,
          type: 'manual',
          created: '2014-07-08T14:07:21',
          is_public: true,
          label: 'CentOS 7',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/debian7',
          vendor: 'Debian',
          size: 600,
          type: 'manual',
          created: '2014-09-24T17:59:32',
          is_public: true,
          label: 'Debian 7',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/opensuse13.2',
          vendor: 'openSUSE',
          size: 700,
          type: 'manual',
          created: '2014-12-17T22:55:42',
          is_public: true,
          label: 'openSUSE 13.2',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/debian8',
          vendor: 'Debian',
          size: 900,
          type: 'manual',
          created: '2015-04-27T20:26:41',
          is_public: true,
          label: 'Debian 8.1',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/Ubuntu16.04LTS',
          vendor: 'Ubuntu',
          size: 800,
          type: 'manual',
          created: '2016-04-22T18:11:29',
          is_public: true,
          label: 'Ubuntu 16.04 LTS',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: true,
          id: 'linode/Fedora23',
          vendor: 'Fedora',
          size: 1700,
          type: 'manual',
          created: '2016-05-26T17:36:32',
          is_public: true,
          label: 'Fedora 23',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/Arch2016.09.03',
          vendor: 'Arch',
          size: 1639,
          type: 'manual',
          created: '2016-06-13T20:31:34',
          is_public: true,
          label: 'Arch 2016.09.03',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: true,
          id: 'linode/Fedora24',
          vendor: 'Fedora',
          size: 1024,
          type: 'manual',
          created: '2016-06-22T19:03:38',
          is_public: true,
          label: 'Fedora 24',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: true,
          id: 'linode/openSUSELeap42.1',
          vendor: 'openSUSE',
          size: 1700,
          type: 'manual',
          created: '2016-06-27T17:01:16',
          is_public: true,
          label: 'openSUSE Leap 42.1',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/Slackware14.2',
          vendor: 'Slackware',
          size: 1700,
          type: 'manual',
          created: '2016-10-13T13:14:34',
          is_public: true,
          label: 'Slackware 14.2',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/Ubuntu16.10',
          vendor: 'Ubuntu',
          size: 1300,
          type: 'manual',
          created: '2016-10-13T21:22:25',
          is_public: true,
          label: 'Ubuntu 16.10',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/Gentoo2016-10-13',
          vendor: 'Gentoo',
          size: 2000,
          type: 'manual',
          created: '2016-10-25T17:31:25',
          is_public: true,
          label: 'Gentoo 2016-10-13',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/openSUSELeap42.2',
          vendor: 'openSUSE',
          size: 1700,
          type: 'manual',
          created: '2016-11-17T19:52:54',
          is_public: true,
          label: 'openSUSE Leap 42.2',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/Fedora25',
          vendor: 'Fedora',
          size: 1500,
          type: 'manual',
          created: '2016-11-28T19:53:47',
          is_public: true,
          label: 'Fedora 25',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/debian9',
          vendor: 'Debian',
          size: 1100,
          type: 'manual',
          created: '2017-06-16T20:02:29',
          is_public: true,
          label: 'Debian 9',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/debian8.7',
          vendor: 'Debian',
          size: 1100,
          type: 'manual',
          created: '2017-08-15T22:28:13',
          is_public: true,
          label: 'Debian 8.7',
          description: null,
        },
        {
          created_by: 'linode',
          deprecated: false,
          id: 'linode/containerlinux',
          vendor: 'CoreOS',
          size: 3000,
          type: 'manual',
          created: '2017-08-15T22:28:13',
          is_public: true,
          label: 'Container Linux',
          description: null,
        },
      ],
    },
  },
};

export default createStore<AppState>(
  reducers,
  defaultState,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
);
