import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import { EndpointIndex } from '~/components';


export function generateRoutes(props) {
  const { endpointConfig, key } = props;
  const { crumbs, endpoint, navPath } = endpointConfig;

  if (navPath !== endpoint.basePath) {
    return (
      <Route key={key} path={navPath}>
        <IndexRedirect to={endpoint.basePath} />
        <Route
          component={EndpointIndex}
          crumbs={crumbs}
          endpoint={endpoint}
          path={endpoint.basePath}
        />
      </Route>
    );
  }

  return (
    <Route
      component={EndpointIndex}
      crumbs={crumbs}
      endpoint={endpoint}
      path={endpoint.basePath}
    />
  );
}
