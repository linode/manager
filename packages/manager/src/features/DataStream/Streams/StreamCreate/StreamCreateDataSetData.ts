import { EventType } from './types';

export const dataSets = [
  {
    id: EventType.Configuration,
    name: 'Configuration',
    description: 'Resource creation, modification, and deletion.',
    details: {
      header: 'Header',
      details: 'Details',
    },
  },
  {
    id: EventType.Authentication,
    name: 'Authentication',
    description: 'Login and identity verification events.',
    details: {
      header: 'Header',
      details: 'Details',
    },
  },
  {
    id: EventType.Authorization,
    name: 'Authorization',
    description: 'User roles, permissions, and access control changes.',
    details: {
      header: 'Header',
      details: 'Details',
    },
  },
];
