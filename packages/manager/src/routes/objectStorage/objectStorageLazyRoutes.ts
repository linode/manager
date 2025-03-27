import { createLazyRoute } from '@tanstack/react-router';

import { BucketDetailLanding } from 'src/features/ObjectStorage/BucketDetail';
import { ObjectStorageLanding } from 'src/features/ObjectStorage/ObjectStorageLanding';

export const objectStorageLandingLazyRoute = createLazyRoute('/object-storage')(
  {
    component: ObjectStorageLanding,
  }
);

export const bucketDetailLandingLazyRoute = createLazyRoute(
  '/object-storage/buckets/$clusterId/$bucketName'
)({
  component: BucketDetailLanding,
});
