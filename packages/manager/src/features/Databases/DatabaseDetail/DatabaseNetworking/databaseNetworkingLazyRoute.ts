import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseNetworking } from './DatabaseNetworking';

export const databaseNetworkingLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/networking'
)({
  component: DatabaseNetworking,
});
