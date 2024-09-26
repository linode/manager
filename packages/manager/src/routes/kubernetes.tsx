import { Outlet, createRoute } from '@tanstack/react-router';
import React from 'react';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { rootRoute } from './root';
import { strictLazyRouteComponent } from './utils';

export const KubernetesRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Kubernetes" />
      <Outlet />
    </React.Suspense>
  );
};

export const kubernetesRoute = createRoute({
  component: KubernetesRoutes,
  getParentRoute: () => rootRoute,
  path: 'kubernetes/clusters',
});

const kubernetesIndexRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Kubernetes/KubernetesLanding/KubernetesLanding'),
    'KubernetesLanding'
  ),
  getParentRoute: () => kubernetesRoute,
  path: '/',
});

const kubernetesCreateRoute = createRoute({
  component: strictLazyRouteComponent(
    () => import('src/features/Kubernetes/CreateCluster/CreateCluster'),
    'CreateCluster'
  ),
  getParentRoute: () => rootRoute,
  // this route does not have the "clusters" prefix
  path: 'kubernetes/create',
});

const kubernetesClusterRoute = createRoute({
  component: strictLazyRouteComponent(
    () =>
      import(
        'src/features/Kubernetes/KubernetesClusterDetail/KubernetesClusterDetail'
      ),
    'KubernetesClusterDetail'
  ),
  getParentRoute: () => kubernetesRoute,
  path: '$clusterID',
});

export const kubernetesRouteTree = kubernetesRoute.addChildren([
  kubernetesIndexRoute,
  kubernetesCreateRoute,
  kubernetesClusterRoute,
]);
