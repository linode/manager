import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import type { RouteComponentProps } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const IAMLanding = React.lazy(() =>
  import('./IAMLanding').then((module) => ({
    default: module.IdentityAccessLanding,
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
      <ProductInformationBanner bannerLocation="Identity and Access" />
      <Switch>
        <Route
          component={UserDetails}
          exact
          path={`${path}/users/:username/details`}
        />
        <Route
          component={UserDetails}
          exact
          path={`${path}/users/:username/roles`}
        />
        <Route
          component={UserDetails}
          exact
          path={`${path}/users/:username/entities`}
        />
        <Route component={IAMLanding} exact path={`${path}/roles`} />

        <Route component={IAMLanding} exact path={`${path}/users`} />

        <Redirect exact from={path} to={`${path}/users`} />
        <Redirect
          exact
          from={`${path}/users/:username`}
          to={`${path}/users/:username/details`}
        />
        <Redirect
          from={`${path}/users/:username/*`}
          to={`${path}/users/:username/details`}
        />
        <Redirect from={`${path}/roles/*`} to={`${path}/roles`} />
        <Redirect from={`${path}/*`} to={`${path}/users`} />
      </Switch>
    </React.Suspense>
  );
};
