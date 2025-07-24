import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseSettings } from './DatabaseSettings';

export const databaseSettingsLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/settings'
)({
  component: DatabaseSettings,
});
