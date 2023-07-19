import { Linode } from '@linode/api-v4/lib/linodes';

export const linode1: Linode = {
  alerts: {
    cpu: 90,
    io: 10000,
    network_in: 10,
    network_out: 10,
    transfer_quota: 80,
  },
  backups: {
    enabled: true,
    last_successful: null,
    schedule: {
      day: 'Saturday',
      window: 'W2',
    },
  },
  created: '2017-12-07T19:12:58',
  group: 'active',
  hypervisor: 'kvm',
  id: 2020425,
  image: 'linode/Ubuntu16.10',
  ipv4: ['97.107.143.78', '98.107.143.78', '99.107.143.78'],
  ipv6: '2600:3c03::f03c:91ff:fe0a:109a/64',
  label: 'test',
  region: 'us-east',
  specs: {
    disk: 20480,
    gpus: 0,
    memory: 1024,
    transfer: 1000,
    vcpus: 1,
  },
  status: 'running',
  tags: [],
  type: 'g6-nanode-1',
  updated: '2017-12-11T16:35:31',
  watchdog_enabled: false,
};

export const linode2: Linode = {
  alerts: {
    cpu: 90,
    io: 10000,
    network_in: 10,
    network_out: 10,
    transfer_quota: 80,
  },
  backups: {
    enabled: true,
    last_successful: null,
    schedule: {
      day: 'Scheduling',
      window: 'Scheduling',
    },
  },
  created: '2018-02-22T16:11:07',
  group: 'inactive',
  hypervisor: 'kvm',
  id: 2020755,
  image: 'linode/Ubuntu16.04LTS',
  ipv4: ['97.107.143.49'],
  ipv6: '2600:3c03::f03c:91ff:fe0a:0d7a/64',
  label: 'another-test',
  region: 'us-east',
  specs: {
    disk: 30720,
    gpus: 0,
    memory: 2048,
    transfer: 2000,
    vcpus: 1,
  },
  status: 'running',
  tags: [],
  type: 'g6-standard-1',
  updated: '2018-02-22T16:11:07',
  watchdog_enabled: false,
};

export const linode3: Linode = {
  alerts: {
    cpu: 90,
    io: 10000,
    network_in: 10,
    network_out: 10,
    transfer_quota: 80,
  },
  backups: {
    enabled: false,
    last_successful: null,
    schedule: {
      day: 'Scheduling',
      window: 'Scheduling',
    },
  },
  created: '2018-02-22T16:11:07',
  group: 'inactive',
  hypervisor: 'kvm',
  id: 2020755,
  image: 'linode/Ubuntu16.04LTS',
  ipv4: ['97.107.143.49'],
  ipv6: '2600:3c03::f03c:91ff:fe0a:0d7a/64',
  label: 'another-test',
  region: 'us-east',
  specs: {
    disk: 30720,
    gpus: 0,
    memory: 2048,
    transfer: 2000,
    vcpus: 1,
  },
  status: 'running',
  tags: [],
  type: 'g6-standard-2',
  updated: '2018-02-22T16:11:07',
  watchdog_enabled: false,
};

export const linode4: Linode = {
  alerts: {
    cpu: 90,
    io: 10000,
    network_in: 10,
    network_out: 10,
    transfer_quota: 80,
  },
  backups: {
    enabled: false,
    last_successful: null,
    schedule: {
      day: 'Scheduling',
      window: 'Scheduling',
    },
  },
  created: '2018-02-22T16:11:07',
  group: 'inactive',
  hypervisor: 'kvm',
  id: 12345,
  image: 'linode/Ubuntu16.04LTS',
  ipv4: ['97.107.143.49'],
  ipv6: '2600:3c03::f03c:91ff:fe0a:0d7a/64',
  label: 'another-test-eu',
  region: 'eu-west',
  specs: {
    disk: 30720,
    gpus: 0,
    memory: 2048,
    transfer: 2000,
    vcpus: 1,
  },
  status: 'running',
  tags: [],
  type: 'g6-standard-2',
  updated: '2018-02-22T16:11:07',
  watchdog_enabled: false,
};

export const linodes = [linode1, linode2, linode3];
