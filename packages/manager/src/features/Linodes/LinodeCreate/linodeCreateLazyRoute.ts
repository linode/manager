import { createLazyRoute } from '@tanstack/react-router';

import { LinodeCreate } from './';

export const linodeCreateLazyRoute = createLazyRoute('/linodes/create')({
  component: LinodeCreate,
});
