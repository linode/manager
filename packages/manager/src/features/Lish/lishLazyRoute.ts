import { createLazyRoute } from '@tanstack/react-router';

import { Lish } from './Lish';

export const lishLazyRoute = createLazyRoute('/linodes/$linodeId/lish/$type')({
  component: Lish,
});
