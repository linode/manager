import { createLazyRoute } from '@tanstack/react-router';

import { ObjectStorageLanding } from 'src/features/ObjectStorage/ObjectStorageLanding';

export const objectStorageLandingLazyRoute = createLazyRoute('/object-storage')(
  {
    component: ObjectStorageLanding,
  }
);
