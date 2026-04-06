import { createLazyRoute } from '@tanstack/react-router';

import { Images } from './Images';

export const imagesLazyRoute = createLazyRoute('/linodes/create/images')({
  component: Images,
});
