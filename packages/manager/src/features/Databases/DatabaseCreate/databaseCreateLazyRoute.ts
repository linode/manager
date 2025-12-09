import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseCreate } from './DatabaseCreate';

export const databaseCreateLazyRoute = createLazyRoute('/databases/create')({
  component: DatabaseCreate,
});
