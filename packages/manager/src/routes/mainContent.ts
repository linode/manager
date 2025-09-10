import { accountQueries } from '@linode/queries';
import { createRoute, redirect } from '@tanstack/react-router';

import { SplashScreen } from 'src/components/SplashScreen';
import { Root } from 'src/Root';

import { rootRoute } from './root';

export const mainContentRoute = createRoute({
  component: Root,
  wrapInSuspense: true,
  pendingComponent: SplashScreen,
  getParentRoute: () => rootRoute,
  async beforeLoad(ctx) {
    if (ctx.location.pathname === '/') {
      try {
        const accountSettings = await ctx.context.queryClient.ensureQueryData(
          accountQueries.settings
        );
        throw redirect({
          to: accountSettings.managed ? '/managed' : '/linodes',
        });
      // eslint-disable-next-line sonarjs/no-ignored-exceptions
      } catch (error) {
        throw redirect({ to: '/linodes' });
      }
    }
  },
  path: '/',
});
