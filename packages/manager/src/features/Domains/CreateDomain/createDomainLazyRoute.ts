import { createLazyRoute } from '@tanstack/react-router';

import { CreateDomain } from 'src/features/Domains/CreateDomain/CreateDomain';

export const createDomainLazyRoute = createLazyRoute('/domains/create')({
  component: CreateDomain,
});
