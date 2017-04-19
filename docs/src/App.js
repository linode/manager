import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import ReactGA from 'react-ga';

import { GA_ID } from './constants';

import styles from '../scss/index.scss';

import { MainLayout } from './layouts';
import { DocsIndexPage } from './docs';
import NotFoundPage from './NotFoundPage';


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
      <Route path="/" component={MainLayout}>
        <IndexRedirect to="/docs" />
        <Route path="/docs" component={DocsIndexPage} />
        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
