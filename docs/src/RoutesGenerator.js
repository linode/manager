import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import {
  Endpoint,
  EndpointIndex
} from '~/components';

export function generateIndexRoute(props) {
  const { endpointConfig, key } = props;
  const { endpoint } = endpointConfig;

  return (
    <Route
      key={key}
      component={EndpointIndex}
      endpointConfig={endpointConfig}
      path={endpoint.basePath}
    />
  );
}

export function generateChildRoute(props) {
  const { endpointConfig } = props;
  const { endpoint } = endpointConfig;

  let childEndpoints = null;
  if (endpoint.endpoints) {
    childEndpoints = endpoint.endpoints.map(function(childEndpoint, index) {
      return (
        <Route
          key={index}
          component={Endpoint}
          endpoint={childEndpoint}
          path={childEndpoint.routePath}
        />
      );
    });
  }

  return childEndpoints;
}