import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import type { RouteComponentProps } from 'react-router-dom';

const IAMLanding = React.lazy(() =>
  import('./IAMLanding').then((module) => ({
    default: module.IdentityAccessManagementLanding,
  }))
);

const UserDetails = React.lazy(() =>
  import('./Users/UserDetailsLanding').then((module) => ({
    default: module.UserDetailsLanding,
  }))
);

export const IdentityAccessManagement = (props: RouteComponentProps) => {
  const path = props.match.path;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Identity and Access Management" />
      <Switch>
        <Route component={UserDetails} path={`${path}/users/:username/`} />
        <Redirect exact from={path} to={`${path}/users`} />
        <Route component={IAMLanding} path={path} />
      </Switch>
    </React.Suspense>
  );
};
