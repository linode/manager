import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const StackScriptsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="StackScripts" />
      <Outlet />
    </React.Suspense>
  );
};

const StackScriptsRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/StackScripts/StackScriptsLanding'),
    'StackScriptsLanding'
  ),
  getParentRoute: () => rootRoute,
  path: 'stackscripts',
});

const StackScriptsAccountRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/StackScripts/StackScriptsLanding'),
    'StackScriptsLanding'
  ),
  getParentRoute: () => StackScriptsRoute,
  path: 'account',
});

const StackScriptsCommunityRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/StackScripts/StackScriptsLanding'),
    'StackScriptsLanding'
  ),
  getParentRoute: () => StackScriptsRoute,
  path: 'community',
});

const StackScriptsCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import('src/features/StackScripts/StackScriptCreate/StackScriptCreate'),
    'StackScriptCreate'
  ),
  getParentRoute: () => StackScriptsRoute,
  path: 'create',
});

const StackScriptsDetailRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/StackScripts/StackScriptsDetail'),
    'StackScriptsDetail'
  ),
  getParentRoute: () => StackScriptsRoute,
  path: '$stackScriptID',
});

const StackScriptsEditRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import('src/features/StackScripts/StackScriptCreate/StackScriptCreate'),
    'StackScriptCreate'
  ),
  getParentRoute: () => StackScriptsRoute,
  path: '$stackScriptID/edit',
});

export const stackScriptsRouteTree = StackScriptsRoute.addChildren([
  StackScriptsAccountRoute,
  StackScriptsCommunityRoute,
  StackScriptsCreateRoute,
  StackScriptsDetailRoute,
  StackScriptsEditRoute,
]);
