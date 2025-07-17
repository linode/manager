import { createLazyRoute } from '@tanstack/react-router';

import { SearchLanding } from 'src/features/Search/SearchLanding';

export const searchLandingLazyRoute = createLazyRoute('/search')({
  component: SearchLanding,
});
