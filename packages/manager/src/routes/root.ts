import {
  createRootRouteWithContext,
  ErrorComponent,
} from '@tanstack/react-router';

import { isAuthCallbackPath, waitForAppShell } from 'src/hooks/appShellReady';

import { RootSwitch } from './../RootSwitch';

import type { RouterContext } from './types';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    // Auth callback must render immediately (splash). Post-login navigation
    // awaits bootstrap so route guards see a resolved router context.
    if (isAuthCallbackPath(location.pathname)) {
      return;
    }

    await waitForAppShell();
  },
  component: RootSwitch,
  errorComponent: ErrorComponent,
});
