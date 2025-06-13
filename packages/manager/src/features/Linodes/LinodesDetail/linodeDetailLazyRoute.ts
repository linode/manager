import { createLazyRoute } from '@tanstack/react-router';

import { LinodeDetail } from './LinodesDetail';

export const linodeDetailLazyRoute = createLazyRoute('/linodes/$linodeId')({
  component: LinodeDetail,
});
