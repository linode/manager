import { createLazyRoute } from '@tanstack/react-router';

import { ImagesLanding } from './ImagesLanding';

export const imagesLandingLazyRoute = createLazyRoute('/images')({
  component: ImagesLanding,
});
