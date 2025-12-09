import { createLazyRoute } from '@tanstack/react-router';

import { DatabaseAdvancedConfiguration } from './DatabaseAdvancedConfiguration';

export const databaseAdvancedConfigurationLazyRoute = createLazyRoute(
  '/databases/$engine/$databaseId/configs'
)({
  component: DatabaseAdvancedConfiguration,
});
