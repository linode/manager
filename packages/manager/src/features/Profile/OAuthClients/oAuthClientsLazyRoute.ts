import { createLazyRoute } from '@tanstack/react-router';

import OAuthClients from './OAuthClients';

export const oAuthClientsLazyRoute = createLazyRoute('/profile/clients')({
  component: OAuthClients,
});
