import { createLazyRoute } from '@tanstack/react-router';

import { DomainDetail } from 'src/features/Domains/DomainDetail/DomainDetail';

export const domainDetailLazyRoute = createLazyRoute('/domains/$domainId')({
  component: DomainDetail,
});
