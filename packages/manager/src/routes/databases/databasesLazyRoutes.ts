import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseCreate } from 'src/features/Databases/DatabaseCreate/DatabaseCreate';
import { DatabaseDetail } from 'src/features/Databases/DatabaseDetail';
import { DatabaseLanding } from 'src/features/Databases/DatabaseLanding/DatabaseLanding';

export const databaseLandingLazyRoute = createLazyRoute('/databases')({
  component: DatabaseLanding,
});

export const databaseCreateLazyRoute = createLazyRoute('/databases/create')({
  component: DatabaseCreate,
});

export const databaseDetailLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId'
)({
  component: DatabaseDetail,
});
