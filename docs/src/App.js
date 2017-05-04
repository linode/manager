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

import { api } from '~/data/endpoints';


ReactGA.initialize(GA_ID); // eslint-disable-line no-undef
function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

export function init() {
  render(
    <Router
      history={browserHistory}
      onUpdate={logPageView}
    >
      <Route path="/" component={Layout} endpoints={api.endpoints}>
        <Route component={IndexLayout}>
          <IndexRedirect to={api.endpoints[0].path} />
          {api.endpoints.map(function(endpoint, index) {
            return generateIndexRoute({ key: index, endpoint: endpoint });
          })}
          {api.endpoints.map(function(endpoint) {
            const crumb = [{ groupLabel: 'Reference', label: endpoint.path, to: endpoint.path }];
            return generateChildRoute({ endpoint: endpoint, prevCrumbs: crumb });
          })}
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
