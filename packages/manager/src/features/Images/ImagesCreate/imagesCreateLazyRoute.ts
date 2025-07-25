import { createLazyRoute } from '@tanstack/react-router';

import { ImagesCreateContainer } from 'src/features/Images/ImagesCreate/ImageCreateContainer';

export const imageCreateLazyRoute = createLazyRoute('/images/create')({
  component: ImagesCreateContainer,
});
