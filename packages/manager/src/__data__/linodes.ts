export const linode1: Linode.Linode = {
  specs: {
    transfer: 1000,
    memory: 1024,
    vcpus: 1,
    disk: 20480
  },
  updated: '2017-12-11T16:35:31',
  ipv4: ['97.107.143.78', '98.107.143.78', '99.107.143.78'],
  id: 2020425,
  alerts: {
    transfer_quota: 80,
    network_in: 10,
    io: 10000,
    network_out: 10,
    cpu: 90
  },
  created: '2017-12-07T19:12:58',
  hypervisor: 'kvm',
  label: 'test',
  image: 'linode/Ubuntu16.10',
  group: 'active',
  region: 'us-east-1a',
  type: 'g5-nanode-1',
  backups: {
    schedule: {
      window: 'W2',
      day: 'Saturday'
    },
    enabled: true
  },
  mostRecentBackup: null,
  status: 'running',
  ipv6: '2600:3c03::f03c:91ff:fe0a:109a/64',
  watchdog_enabled: false,
  tags: []
};

export const linode2: Linode.Linode = {
  specs: {
    transfer: 2000,
    memory: 2048,
    vcpus: 1,
    disk: 30720
  },
  updated: '2018-02-22T16:11:07',
  ipv4: ['97.107.143.49'],
  id: 2020755,
  alerts: {
    transfer_quota: 80,
    network_in: 10,
    io: 10000,
    network_out: 10,
    cpu: 90
  },
  created: '2018-02-22T16:11:07',
  hypervisor: 'kvm',
  label: 'another-test',
  image: 'linode/Ubuntu16.04LTS',
  group: 'inactive',
  region: 'us-east-1a',
  type: 'g5-standard-1',
  backups: {
    schedule: {
      window: 'Scheduling',
      day: 'Scheduling'
    },
    enabled: true
  },
  mostRecentBackup: null,
  status: 'running',
  ipv6: '2600:3c03::f03c:91ff:fe0a:0d7a/64',
  watchdog_enabled: false,
  tags: []
};

export const linode3: Linode.Linode = {
  specs: {
    transfer: 2000,
    memory: 2048,
    vcpus: 1,
    disk: 30720
  },
  updated: '2018-02-22T16:11:07',
  ipv4: ['97.107.143.49'],
  id: 2020755,
  alerts: {
    transfer_quota: 80,
    network_in: 10,
    io: 10000,
    network_out: 10,
    cpu: 90
  },
  created: '2018-02-22T16:11:07',
  hypervisor: 'kvm',
  label: 'another-test',
  image: 'linode/Ubuntu16.04LTS',
  group: 'inactive',
  region: 'us-east-1a',
  type: 'g5-standard-2',
  backups: {
    schedule: {
      window: 'Scheduling',
      day: 'Scheduling'
    },
    enabled: false
  },
  mostRecentBackup: null,
  status: 'running',
  ipv6: '2600:3c03::f03c:91ff:fe0a:0d7a/64',
  watchdog_enabled: false,
  tags: []
};

export const linodes = [linode1, linode2, linode3];
