import { createLazyRoute } from '@tanstack/react-router';

import { VolumesLanding } from 'src/features/Volumes/VolumesLanding';

export const volumesLandingLazyRoute = createLazyRoute('/')({
  component: VolumesLanding,
});
