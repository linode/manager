import { credentials } from './managedCredentials';

export const monitors: Linode.ManagedServiceMonitor[] = [
  {
    consultation_group: '',
    timeout: 10,
    label: 'Test service',
    created: '2019-08-01T20:29:14',
    status: 'pending',
    region: null,
    updated: '2019-08-01T20:31:19',
    service_type: 'url',
    notes: '',
    id: 1224,
    credentials,
    address: 'http://www.example.com',
    body: ''
  },
  {
    consultation_group: '',
    timeout: 10,
    label: 'Test service 2',
    created: '2019-08-01T20:28:40',
    status: 'problem',
    region: null,
    updated: '2019-08-01T20:29:05',
    service_type: 'url',
    notes: '',
    id: 2345,
    credentials: [],
    address: 'http://www.example.com',
    body: ''
  },
  {
    consultation_group: '',
    timeout: 10,
    label: 'Test service 3',
    created: '2019-08-01T20:28:40',
    status: 'ok',
    region: null,
    updated: '2019-08-01T20:29:05',
    service_type: 'url',
    notes: '',
    id: 3456,
    credentials,
    address: 'http://www.example.com',
    body: ''
  },
  {
    consultation_group: '',
    timeout: 10,
    label: 'Test service 4',
    created: '2019-08-01T20:28:40',
    status: 'disabled',
    region: null,
    updated: '2019-08-01T20:29:05',
    service_type: 'url',
    notes: '',
    id: 3456,
    credentials,
    address: 'http://www.example.com',
    body: ''
  }
];
