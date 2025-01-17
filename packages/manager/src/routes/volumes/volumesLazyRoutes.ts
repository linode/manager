import { createLazyRoute } from '@tanstack/react-router';
import VolumeCreate from 'volume_create/VolumeCreate';

import { VolumesLanding } from 'src/features/Volumes/VolumesLanding';

export const volumesLandingLazyRoute = createLazyRoute('/')({
  component: VolumesLanding,
});

export const volumeCreateLazyRoute = createLazyRoute('/volumes/create')({
  component: VolumeCreate,
});
