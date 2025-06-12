import { eventType } from './types';

export const dataSets = [
  {
    id: eventType.Configuration,
    name: 'Configuration',
    description: 'Resource creation, modification, and deletion.',
    details: {
      header: 'Header',
      details: 'Details',
    },
  },
  {
    id: eventType.Authentication,
    name: 'Authentication',
    description: 'Login and identity verification events.',
    details: {
      header: 'Header',
      details: 'Details',
    },
  },
  {
    id: eventType.Authorization,
    name: 'Authorization',
    description: 'User roles, permissions, and access control changes.',
    details: {
      header: 'Header',
      details: 'Details',
    },
  },
];
