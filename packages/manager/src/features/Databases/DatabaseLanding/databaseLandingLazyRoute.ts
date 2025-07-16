import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseLanding } from 'src/features/Databases/DatabaseLanding/DatabaseLanding';

export const databaseLandingLazyRoute = createLazyRoute('/databases')({
  component: DatabaseLanding,
});
