import { createLazyRoute } from '@tanstack/react-router';

import { Clone } from './Clone';

export const cloneLazyRoute = createLazyRoute('/linodes/create/clone')({
  component: Clone,
});
