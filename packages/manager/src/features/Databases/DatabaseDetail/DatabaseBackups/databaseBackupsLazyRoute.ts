import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseBackups } from './DatabaseBackups';

export const databaseBackupsLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/backups'
)({
  component: DatabaseBackups,
});
