import { createLazyRoute } from '@tanstack/react-router';

import { LinodesLandingWrapper } from './';

export const linodesLandingLazyRoute = createLazyRoute('/linodes')({
  component: LinodesLandingWrapper,
});
