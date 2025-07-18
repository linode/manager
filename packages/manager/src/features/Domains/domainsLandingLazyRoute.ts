import { createLazyRoute } from '@tanstack/react-router';

import { DomainsLanding } from 'src/features/Domains/DomainsLanding';

export const domainsLandingLazyRoute = createLazyRoute('/domains')({
  component: DomainsLanding,
});
