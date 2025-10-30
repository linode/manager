import { createLazyRoute } from '@tanstack/react-router';

import { ImagesLandingV2 } from './ImagesLandingV2';

export const imagesLandingV2LazyRoute = createLazyRoute('/images/images')({
  component: ImagesLandingV2,
});
