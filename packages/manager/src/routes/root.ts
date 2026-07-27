import {
  createRootRouteWithContext,
  ErrorComponent,
} from '@tanstack/react-router';

import { waitForAppShell } from 'src/hooks/appShellReady';

import { RootSwitch } from './../RootSwitch';

import type { RouterContext } from './types';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    await waitForAppShell();
  },
  component: RootSwitch,
  errorComponent: ErrorComponent,
});
