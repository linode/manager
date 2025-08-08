import { createLazyRoute } from '@tanstack/react-router';

import { StackScripts } from './StackScripts';

export const stackScriptsLazyRoute = createLazyRoute(
  '/linodes/create/stackscripts'
)({
  component: StackScripts,
});
