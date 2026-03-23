import { createLazyRoute } from '@tanstack/react-router';

import { ReservedIpsLanding } from './ReservedIpsLanding';

export const reservedIpsLazyRoute = createLazyRoute('/reserved-ips')({
  component: ReservedIpsLanding,
});
