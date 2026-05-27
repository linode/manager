import { createLazyRoute } from '@tanstack/react-router';

import { ShareGroupsTabs } from './ShareGroupsTabs';

export const shareGroupsTabsLazyRoute = createLazyRoute('/images/share-groups')(
  {
    component: ShareGroupsTabs,
  }
);
