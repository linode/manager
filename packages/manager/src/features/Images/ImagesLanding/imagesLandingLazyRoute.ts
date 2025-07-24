import { createLazyRoute } from '@tanstack/react-router';

import { ImagesLanding } from 'src/features/Images/ImagesLanding/ImagesLanding';

export const imagesLandingLazyRoute = createLazyRoute('/images')({
  component: ImagesLanding,
});
