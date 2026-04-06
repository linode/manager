import { createLazyRoute } from '@tanstack/react-router';

import { BetasLanding } from './BetasLanding';

export const betasLandingLazyRoute = createLazyRoute('/betas')({
  component: BetasLanding,
});
