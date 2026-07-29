import { createLazyRoute } from '@tanstack/react-router';

import BucketDetailsPage from 'src/features/ObjectStorage/Buckets/BucketDetails/BucketDetailsPage';

export const bucketDetailsPageLazyRoute = createLazyRoute(
  '/object-storage/buckets/$regionId/$bucketName'
)({
  component: BucketDetailsPage,
});
