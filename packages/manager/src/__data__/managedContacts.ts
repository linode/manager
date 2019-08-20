export const contact1: Linode.ManagedContact = {
  id: 1,
  name: 'Fred',
  group: 'DBA',
  email: 'user@host.com',
  phone: {
    primary: '555-555-5555',
    secondary: null
  },
  updated: '2019-08-01T12:00:00'
};

export const contact2: Linode.ManagedContact = {
  id: 2,
  name: 'Barney',
  group: 'DBA',
  email: 'user@host.com',
  phone: {
    primary: '555-555-5555',
    secondary: null
  },
  updated: '2019-08-01T12:00:00'
};

export const contact3: Linode.ManagedContact = {
  id: 3,
  name: 'Jane',
  group: 'Web Server Admin',
  email: 'user@host.com',
  phone: {
    primary: '555-555-5555',
    secondary: null
  },
  updated: '2019-08-01T12:00:00'
};

export const contactWithoutGroup: Linode.ManagedContact = {
  id: 3,
  name: 'Jane',
  group: null,
  email: 'user@host.com',
  phone: {
    primary: '555-555-5555',
    secondary: null
  },
  updated: '2019-08-01T12:00:00'
};

export default [contact1, contact2, contact3];
