import { createLazyRoute } from '@tanstack/react-router';

import { ManagedLanding } from 'src/features/Managed/ManagedLanding';

export const managedLandingLazyRoute = createLazyRoute('/managed')({
  component: ManagedLanding,
});
