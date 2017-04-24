import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import ReactGA from 'react-ga';

import { GA_ID } from './constants';

import styles from '../scss/index.scss';

import { NotFound } from 'linode-components/errors';

import { Layout } from './layouts';
import { generateRoutes } from '~/RoutesGenerator';

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
      { groupLabel: 'Reference', label: 'Account', to: '/account' },
    ],
    endpoint: account
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Regions', to: '/regions' },
    ],
    endpoint: regions
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Distributions', to: '/distributions' },
    ],
    endpoint: distributions
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Domains', to: '/domains' },
    ],
    endpoint: domains
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Events', to: '/events' },
    ],
    endpoint: events
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Kernels', to: '/kernels' },
    ],
    endpoint: kernels
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Linodes', to: '/linodes' },
    ],
    endpoint: linodes
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Networking', to: '/networking' },
    ],
    endpoint: networking
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Types', to: '/types' },
    ],
    endpoint: services
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Stack Scripts', to: '/stackscripts' },
    ],
    endpoint: stackscripts
  },
  {
    crumbs: [
      { groupLabel: 'Reference', label: 'Support Tickets', to: '/supporttickets' },
    ],
    endpoint: supporttickets
  }
];

const topLevelRoutes = endpointConfigs.map(function(endpointConfig) {
  return {
    to: endpointConfig.endpoint.basePath,
    label: endpointConfig.endpoint.name
  };
});


export function init() {
  render(
    <Router
      history={browserHistory}
      onUpdate={logPageView}
    >
      <Route path="/" component={Layout} topLevelRoutes={topLevelRoutes}>
        <IndexRedirect to="linodes"/>
        {endpointConfigs.map(function(endpointConfig, index) {
          return generateRoutes({ key: index, endpointConfig: endpointConfig });
        })}
        <Route path="*" component={NotFound} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
