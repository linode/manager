import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import _ from 'lodash';

import {
  Endpoint,
  EndpointIndex
} from '~/components';


export function generateIndexRoute(props) {
  const { endpoint, key } = props;
  const crumbs = [{ groupLabel: 'Reference', label: endpoint.path, to: endpoint.path }];

  return (
    <Route
      key={key}
      component={EndpointIndex}
      crumbs={crumbs}
      endpoint={endpoint}
      path={endpoint.path}
    />
  );
}

export function generateChildRoute(props) {
  const { prevCrumbs, endpoint } = props;

  let childEndpoints = null;
  if (endpoint.formattedEndpoints) {
    childEndpoints = endpoint.formattedEndpoints.map(function(childEndpoint, index) {
      if (childEndpoint.formattedEndpoints && childEndpoint.formattedEndpoints.length) {
        return generateChildRoute({ endpoint: childEndpoint, prevCrumbs: prevCrumbs });
      }

      const crumbs = [].concat(prevCrumbs).concat([{ label: childEndpoint.path, to: childEndpoint.path }]);
      return (
        <Route
          key={index}
          component={Endpoint}
          crumbs={crumbs}
          endpoint={childEndpoint}
          path={childEndpoint.path}
        />
      );
    });
    childEndpoints = _.flatten(childEndpoints);
  }

  return childEndpoints;
}