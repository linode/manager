import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseDetail } from 'src/features/Databases/DatabaseDetail';

export const databaseDetailLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId'
)({
  component: DatabaseDetail,
});
