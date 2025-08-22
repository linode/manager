import { createLazyRoute } from '@tanstack/react-router';

import { VolumeLanding } from './VolumeLanding';

export const volumeLandingLazyRoute = createLazyRoute('/volumes/$volumeId')({
  component: VolumeLanding,
});
