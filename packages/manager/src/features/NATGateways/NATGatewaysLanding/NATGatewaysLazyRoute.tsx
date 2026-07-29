import { createLazyRoute } from '@tanstack/react-router';

import { NATGatewaysLanding } from './NATGatewaysLanding';

export const natGatewaysLazyRoute = createLazyRoute('/natgateways')({
  component: NATGatewaysLanding,
});
