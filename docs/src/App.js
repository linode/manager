import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import ReactGA from 'react-ga';

import { GA_ID } from './constants';

import styles from '../scss/index.scss';

import { NotFound } from 'linode-components/errors';

import {
  IndexLayout,
  Layout
} from './layouts';

import {
  generateIndexRoute,
  generateChildRoute
} from '~/RoutesGenerator';

import {
  account,
  regions,
  distributions,
  domains,
  events,
  kernels,
  linodes,
  networking,
  services,
  stackscripts,
  supporttickets
} from '~/data/endpoints';

ReactGA.initialize(GA_ID); // eslint-disable-line no-undef
function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

const endpointConfigs = [
  {
    crumbs: [
      { groupLabel: 'Reference', label: account.basePath, to: account.basePath },
    ],
    endpoint: account
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: regions.basePath, to: regions.basePath },
    ],
    endpoint: regions
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: distributions.basePath, to: distributions.basePath },
    ],
    endpoint: distributions
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: domains.basePath, to: domains.basePath },
    ],
    endpoint: domains
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: events.basePath, to: events.basePath },
    ],
    endpoint: events
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: kernels.basePath, to: kernels.basePath },
    ],
    endpoint: kernels
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: linodes.basePath, to: linodes.basePath },
    ],
    endpoint: linodes
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: networking.basePath, to: networking.basePath },
    ],
    endpoint: networking
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: services.basePath, to: services.basePath },
    ],
    endpoint: services
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: stackscripts.basePath, to: stackscripts.basePath },
    ],
    endpoint: stackscripts
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: supporttickets.basePath, to: supporttickets.basePath },
    ],
    endpoint: supporttickets,
  }
].map(function(endpointConfig) {
  const { crumbs, endpoint } = endpointConfig;
  let childEndpoints;

  if (endpoint.endpoints) {
    childEndpoints = endpoint.endpoints.map(function(childEndpoint) {
      const routePath = `/${childEndpoint.path}/endpoint`;
      const crumb = {
        label: childEndpoint.path,
        to: routePath
      };

      return {
        ...childEndpoint,
        crumbs: crumbs.concat([crumb]),
        routePath: routePath
      };
    });
  }

  endpoint.endpoints = childEndpoints;
  return endpointConfig;
});


export function init() {
  render(
    <Router
      history={browserHistory}
      onUpdate={logPageView}
    >
      <Route path="/" component={Layout} endpointConfigs={endpointConfigs}>
        <Route component={IndexLayout}>
          <IndexRedirect to="linode/instances" />
          {endpointConfigs.map(function(endpointConfig, index) {
            return generateIndexRoute({ key: index, endpointConfig: endpointConfig });
          })}
          {endpointConfigs.map(function(endpointConfig) {
            return generateChildRoute({ endpointConfig: endpointConfig });
          })}
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
