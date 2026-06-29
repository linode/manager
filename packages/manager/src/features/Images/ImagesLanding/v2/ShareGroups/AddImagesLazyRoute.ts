import { createLazyRoute } from '@tanstack/react-router';

import { AddImages } from './AddImages';

export const addImagesLazyRoute = createLazyRoute(
  '/images/share-groups/owned-groups/$shareGroupId/add-images'
)({
  component: AddImages,
});
