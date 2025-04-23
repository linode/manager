import { createLazyRoute } from '@tanstack/react-router';

import { ImagesCreateContainer } from 'src/features/Images/ImagesCreate/ImageCreateContainer';
import { ImagesLanding } from 'src/features/Images/ImagesLanding/ImagesLanding';

export const imagesLandingLazyRoute = createLazyRoute('/images')({
  component: ImagesLanding,
});

export const imageCreateLazyRoute = createLazyRoute('/images/create')({
  component: ImagesCreateContainer,
});
