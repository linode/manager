import { createLazyRoute } from '@tanstack/react-router';

import { APITokens } from './APITokens';

export const apiTokensLazyRoute = createLazyRoute('/profile/tokens')({
  component: APITokens,
});
