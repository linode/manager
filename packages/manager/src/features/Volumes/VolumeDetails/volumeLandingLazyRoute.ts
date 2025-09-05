import { createLazyRoute } from '@tanstack/react-router';

import { VolumeDetails } from './VolumeDetails';

export const volumeDetailsLazyRoute = createLazyRoute('/volumes/$volumeId')({
  component: VolumeDetails,
});
