import { createLazyRoute } from '@tanstack/react-router';

import { ShareGroupsTabs } from './ShareGroupsLanding';

export const shareGroupsTabsLazyRoute = createLazyRoute('/images/share-groups')(
  {
    component: ShareGroupsTabs,
  }
);
