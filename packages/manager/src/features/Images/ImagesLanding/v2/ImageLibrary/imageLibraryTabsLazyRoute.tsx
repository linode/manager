import { createLazyRoute } from '@tanstack/react-router';

import { ImageLibraryTabs } from './ImageLibraryTabs';

export const imageLibraryTabsLazyRoute = createLazyRoute(
  '/images/image-library'
)({
  component: ImageLibraryTabs,
});
