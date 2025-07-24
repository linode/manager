import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseSummary } from './DatabaseSummary';

export const databaseSummaryLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/summary'
)({
  component: DatabaseSummary,
});
