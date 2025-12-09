import { createLazyRoute } from '@tanstack/react-router';

import { BucketDetailLanding } from 'src/features/ObjectStorage/BucketDetail';

export const bucketDetailLandingLazyRoute = createLazyRoute(
  '/object-storage/buckets/$clusterId/$bucketName'
)({
  component: BucketDetailLanding,
});
