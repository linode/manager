import React, { PropTypes } from 'react';
import { Route } from 'react-router';

import {
  Endpoint,
  EndpointIndex,
  Library,
} from '~/components';


export function generateIndexRoute(props) {
  const { endpointIndex, key } = props;
  const crumbs = [
    { groupLabel: 'Reference', label: endpointIndex.path, to: endpointIndex.routePath },
  ];

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

generateIndexRoute.propTypes = {
  endpointIndex: PropTypes.object,
  key: PropTypes.string,
};

export function generateChildRoute(props) {
  const { prevCrumbs, endpointIndex } = props;
  let childEndpoints = [];

  if (endpointIndex.groups.length) {
    endpointIndex.groups.forEach(function (group, index) {
      childEndpoints = childEndpoints.concat(group.endpoints.map(function (endpoint) {
        const crumbs = []
          .concat(prevCrumbs)
          .concat([{ label: endpoint.path, to: endpoint.routePath }]);

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

generateChildRoute.propTypes = {
  prevCrumbs: PropTypes.array,
  endpointIndex: PropTypes.object,
};

export function generateLibraryRoutes(props) {
  const { prevCrumbs, libraryObject, index } = props;

  const crumbs = []
    .concat(prevCrumbs)
    .concat([{ label: libraryObject.path, to: libraryObject.href }]);
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

generateLibraryRoutes.propTypes = {
  prevCrumbs: PropTypes.array,
  libraryObject: PropTypes.object,
  index: PropTypes.number,
};
