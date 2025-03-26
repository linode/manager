import {
  DataSeries,
  ManagedContact,
  ManagedCredential,
  ManagedIssue,
  ManagedLinodeSetting,
  ManagedSSHPubKey,
  ManagedSSHSetting,
  ManagedServiceMonitor,
  ManagedStats,
} from '@linode/api-v4/lib/managed/types';
import Factory from 'src/factories/factoryProxy';

export const contactFactory = Factory.Sync.makeFactory<ManagedContact>({
  email: Factory.each((i) => `john.doe.${i}@example.com`),
  group: 'on-call',
  id: Factory.each((i) => i + 100),
  name: Factory.each((i) => `John Doe ${i}`),
  phone: {
    primary: '555-555-5555',
    secondary: null,
  },
  updated: '2019-08-01T20:29:14',
});

export const credentialFactory = Factory.Sync.makeFactory<ManagedCredential>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `Credential ${i}`),
  last_decrypted: '2019-07-01',
});

export const monitorFactory = Factory.Sync.makeFactory<ManagedServiceMonitor>({
  address: 'http://www.example.com',
  body: '',
  consultation_group: '',
  created: '2019-08-01T20:29:14',
  credentials: credentialFactory
    .buildList(3)
    .map((credential) => credential.id),
  id: Factory.each((i) => i),
  label: 'Test service',
  notes: '',
  region: null,
  service_type: 'url',
  status: 'pending',
  timeout: 10,
  updated: '2019-08-01T20:31:19',
});

export const generateManagedStats = (modifier = 1): DataSeries[] => {
  const stat: DataSeries[] = [];
  let i = 0;
  for (i; i < 200; i++) {
    stat.push({ x: Date.now() - i * 300000, y: Math.random() * modifier });
  }
  return stat;
};

export const managedStatsFactory = Factory.Sync.makeFactory<ManagedStats>({
  data: {
    cpu: generateManagedStats(4),
    disk: generateManagedStats(),
    net_in: generateManagedStats(3),
    net_out: generateManagedStats(2),
    swap: generateManagedStats(),
  },
});

export const managedIssueFactory = Factory.Sync.makeFactory<ManagedIssue>({
  created: '2018-01-01T00:01:01',
  entity: {
    id: 98765,
    label: 'Managed Issue opened!',
    type: 'ticket',
    url: '/support/tickets/98765',
  },
  id: 823,
  services: [],
});

export const managedSSHSettingFactory = Factory.Sync.makeFactory<ManagedSSHSetting>(
  {
    access: true,
    ip: 'any',
    port: 22,
    user: 'root',
  }
);

export const managedLinodeSettingFactory = Factory.Sync.makeFactory<ManagedLinodeSetting>(
  {
    group: 'linodes',
    id: Factory.each((i) => i),
    label: Factory.each((i) => `Managed Linode ${i}`),
    ssh: managedSSHSettingFactory.build(),
  }
);

export const managedSSHPubKeyFactory = Factory.Sync.makeFactory<ManagedSSHPubKey>(
  {
    ssh_key:
      'ssh-rsa MOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEYMOCKEDSSHKEY managedservices@linode',
  }
);
