import { createLazyRoute } from '@tanstack/react-router';

import { Backups } from './Backups';

export const backupsLazyRoute = createLazyRoute('/linodes/create/backups')({
  component: Backups,
});
