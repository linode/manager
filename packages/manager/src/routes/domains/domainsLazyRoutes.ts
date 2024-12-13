import { createLazyRoute } from '@tanstack/react-router';

import { CreateDomain } from 'src/features/Domains/CreateDomain/CreateDomain';
import { DomainDetail } from 'src/features/Domains/DomainDetail/DomainDetail';
import { DomainsLanding } from 'src/features/Domains/DomainsLanding';

export const domainsLandingLazyRoute = createLazyRoute('/domains')({
  component: DomainsLanding,
});

export const createDomainLazyRoute = createLazyRoute('/domains/create')({
  component: CreateDomain,
});

export const domainDetailLazyRoute = createLazyRoute('/domains/$domainId')({
  component: DomainDetail,
});
