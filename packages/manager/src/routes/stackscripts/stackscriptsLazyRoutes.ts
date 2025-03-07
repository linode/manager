import { createLazyRoute } from '@tanstack/react-router';

import { StackScriptsLanding } from 'src/features/StackScripts/StackScriptLanding/StackScriptsLanding';

export const stackScriptsLandingLazyRoute = createLazyRoute('/stackscripts')({
  component: StackScriptsLanding,
});
