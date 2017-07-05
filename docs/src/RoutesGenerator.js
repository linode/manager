import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import _ from 'lodash';

import {
  Endpoint,
  EndpointIndex,
  Library,
} from '~/components';


export function generateIndexRoute(props) {
  const { endpointIndex, key } = props;
  const crumbs = [{ groupLabel: 'Reference', label: endpointIndex.path, to: endpointIndex.routePath }];

  return (
    <Route
      key={key}
      component={EndpointIndex}
      crumbs={crumbs}
      endpointIndex={endpointIndex}
      path={endpointIndex.routePath}
    />
  );
}

export function generateChildRoute(props) {
  const { prevCrumbs, endpointIndex } = props;
  let childEndpoints = [];

  if (endpointIndex.groups.length) {
    endpointIndex.groups.forEach(function(group, index) {
      childEndpoints = childEndpoints.concat(group.endpoints.map(function(endpoint) {
        const crumbs = [].concat(prevCrumbs).concat([{ label: endpoint.path, to: endpoint.routePath }]);

        return (
          <Route
            key={index}
            component={Endpoint}
            crumbs={crumbs}
            endpoint={endpoint}
            path={endpoint.routePath}
          />
        );
      }));
    });
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
