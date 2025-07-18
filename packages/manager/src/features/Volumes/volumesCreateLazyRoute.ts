import { createLazyRoute } from '@tanstack/react-router';

import { VolumeCreate } from 'src/features/Volumes/VolumeCreate';

export const volumeCreateLazyRoute = createLazyRoute('/volumes/create')({
  component: VolumeCreate,
});
