import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import StackScriptCreate from 'src/features/StackScripts/StackScriptCreate/StackScriptCreate';
import StackScriptDetail from 'src/features/StackScripts/StackScriptsDetail';

import { rootRoute } from './root';

export const StackScriptsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="StackScripts" />
      <Outlet />
    </React.Suspense>
  );
};

const StackScriptsRoute = createRoute({
  component: StackScriptsRoutes,
  getParentRoute: () => rootRoute,
  path: 'stackscripts',
});

const StackScriptsLandingRoute = createRoute({
  getParentRoute: () => StackScriptsRoute,
  path: '/',
}).lazy(() =>
  import('src/features/StackScripts/StackScriptsLanding').then(
    (m) => m.stackScriptsLandingLazyRoute
  )
);

const StackScriptsAccountRoute = createRoute({
  getParentRoute: () => StackScriptsRoute,
  path: 'account',
}).lazy(() =>
  import('src/features/StackScripts/StackScriptsLanding').then(
    (m) => m.stackScriptsLandingLazyRoute
  )
);

const StackScriptsCommunityRoute = createRoute({
  getParentRoute: () => StackScriptsRoute,
  path: 'community',
}).lazy(() =>
  import('src/features/StackScripts/StackScriptsLanding').then(
    (m) => m.stackScriptsLandingLazyRoute
  )
);

const StackScriptsCreateRoute = createRoute({
  // TODO: TanStack Router - broken, perhaps due to being a class component.
  component: () => <StackScriptCreate mode="create" />,
  getParentRoute: () => StackScriptsRoute,
  path: 'create',
});

const StackScriptsDetailRoute = createRoute({
  // TODO: TanStack Router - broken, perhaps due to being a class component.
  component: () => <StackScriptDetail />,
  getParentRoute: () => StackScriptsRoute,
  parseParams: (params) => ({
    stackScriptID: Number(params.stackScriptID),
  }),
  path: '$stackScriptID',
});

const StackScriptsEditRoute = createRoute({
  // TODO: TanStack Router - broken, perhaps due to being a class component.
  component: () => <StackScriptCreate mode="edit" />,
  getParentRoute: () => StackScriptsRoute,
  parseParams: (params) => ({
    stackScriptID: Number(params.stackScriptID),
  }),
  path: '$stackScriptID/edit',
});

export const stackScriptsRouteTree = StackScriptsRoute.addChildren([
  StackScriptsLandingRoute,
  StackScriptsAccountRoute,
  StackScriptsCommunityRoute,
  StackScriptsCreateRoute,
  StackScriptsDetailRoute,
  StackScriptsEditRoute,
]);
