import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseResize } from './DatabaseResize';

export const databaseResizeLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/resize'
)({
  component: DatabaseResize,
});
