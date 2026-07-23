import { createLazyRoute } from '@tanstack/react-router';

import { NATGatewaysCreate } from './index';

export const natGatewaysCreateLazyRoute = createLazyRoute(
  '/natgateways/create'
)({
  component: NATGatewaysCreate,
});
