import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import ReactGA from 'react-ga';

import { GA_ID } from './constants';

import styles from '../scss/index.scss';

import { Layout } from './layouts';
import { Routes as IntroductionRoutes } from './docs/introduction';
import { Routes as LinodeRoutes } from './docs/linodes';
import { NotFound } from 'linode-components/errors';


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
      <Route path="/" component={Layout}>
        <IndexRedirect to="introduction"/>
        {IntroductionRoutes}
        {LinodeRoutes}
        <Route path="*" component={NotFound} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
