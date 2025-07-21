import { createLazyRoute } from '@tanstack/react-router';

import { LinodeBackups } from './LinodeBackups';

export const linodeBackupsLazyRoute = createLazyRoute(
  '/linodes/$linodeId/backup'
)({
  component: LinodeBackups,
});
