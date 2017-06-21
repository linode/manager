import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import _ from 'lodash';

import {
  Endpoint,
  EndpointIndex,
  Library,
} from '~/components';


export function generateIndexRoute(props) {
  const { endpoint, key } = props;
  const crumbs = [{ groupLabel: 'Reference', label: endpoint.path, to: endpoint.routePath }];

  return (
    <Route
      key={key}
      component={EndpointIndex}
      crumbs={crumbs}
      endpoint={endpoint}
      path={endpoint.routePath}
    />
  );
}

export function generateChildRoute(props) {
  const { prevCrumbs, endpoint } = props;

  let childEndpoints = null;
  if (endpoint.endpoints) {
    childEndpoints = endpoint.endpoints.map(function(childEndpoint, index) {
      if (childEndpoint.endpoints && childEndpoint.endpoints.length) {
        return generateChildRoute({ endpoint: childEndpoint, prevCrumbs: prevCrumbs });
      }

      const crumbs = [].concat(prevCrumbs).concat([{ label: childEndpoint.path, to: childEndpoint.routePath }]);
      return (
        <Route
          key={index}
          component={Endpoint}
          crumbs={crumbs}
          endpoint={childEndpoint}
          path={childEndpoint.routePath}
        />
      );
    });
    childEndpoints = _.flatten(childEndpoints);
  }

  return childEndpoints;
}

export function generateLibraryRoutes(props) {
  const { prevCrumbs, libraryObject, index } = props;

  const crumbs = [].concat(prevCrumbs).concat([{ label: libraryObject.path, to: libraryObject.href }]);
  return (
    <Route
      key={index}
      component={Library}
      crumbs={crumbs}
      libraryObject={libraryObject}
      path={libraryObject.href}
    />
  );
}
