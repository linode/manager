import type { ManagedContact } from '@linode/api-v4/lib/managed';

export const contact1: ManagedContact = {
  email: 'user@host.com',
  group: 'DBA',
  id: 1,
  name: 'Fred',
  phone: {
    primary: '555-555-5555',
    secondary: null,
  },
  updated: '2019-08-01T12:00:00',
};

export const contact2: ManagedContact = {
  email: 'user@host.com',
  group: 'DBA',
  id: 2,
  name: 'Barney',
  phone: {
    primary: '555-555-5555',
    secondary: null,
  },
  updated: '2019-08-01T12:00:00',
};

export const contact3: ManagedContact = {
  email: 'user@host.com',
  group: 'Web Server Admin',
  id: 3,
  name: 'Jane',
  phone: {
    primary: '555-555-5555',
    secondary: null,
  },
  updated: '2019-08-01T12:00:00',
};

export const contactWithoutGroup: ManagedContact = {
  email: 'user@host.com',
  group: null,
  id: 3,
  name: 'Jane',
  phone: {
    primary: '555-555-5555',
    secondary: null,
  },
  updated: '2019-08-01T12:00:00',
};

export default [contact1, contact2, contact3];
