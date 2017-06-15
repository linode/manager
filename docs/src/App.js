import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Redirect, Router, Route, IndexRedirect, browserHistory } from 'react-router';
import ReactGA from 'react-ga';

import { GA_ID } from './constants';

import styles from '../scss/index.scss';

import { NotFound } from 'linode-components/errors';

import {
  IndexLayout,
  Layout,
} from './layouts';

import { default as GettingStartedRoutes } from './getting_started/Routes';
import { Python as PythonLibrary } from './libraries/python';

import {
  generateIndexRoute,
  generateChildRoute,
  generateLibraryRoutes,
} from '~/RoutesGenerator';

import { default as api } from '~/api';
import { python } from '~/data/python';

const pythonDataTitles = Object.values(python.pythonObjects).map(function(pythonObject) {
  return {
    href: pythonObject.routePath,
    path: pythonObject.name,
    description: pythonObject.formattedPythonObject.desc,
    formattedLibraryObject: pythonObject.formattedPythonObject,
  };
});
const pythonClientObjectTitles = pythonDataTitles.filter(function(pythonData) {
  return (pythonData.path === 'LinodeLoginClient' || pythonData.path === 'LinodeClient');
});
const pythonAPITitles = pythonDataTitles.filter(function(pythonData) {
  return (pythonData.path !== 'LinodeLoginClient' && pythonData.path !== 'LinodeClient');
});

import { API_VERSION } from '~/constants';


ReactGA.initialize(GA_ID); // eslint-disable-line no-undef
function logPageView() {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
}

// https://github.com/ReactTraining/react-router/issues/394#issuecomment-220221604
function hashLinkScroll() {
  const { hash } = window.location;
  if (hash !== '') {
    // Push onto callback queue so it runs after the DOM is updated,
    // this is required when navigating from a different page so that
    // the element is rendered on the page before trying to getElementById.
    setTimeout(() => {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollTop = element.offsetHeight;
      }
    }, 0);
  } else {
    // If we're not jumping to a specific place, scroll to top.
    window.scroll(0, 0);
  }
}

function onRouterUpdate() {
  logPageView();
  hashLinkScroll();
}

export function init() {
  hashLinkScroll();
  render(
    <Router
      history={browserHistory}
      onUpdate={onRouterUpdate}
    >
      <Route path="/" component={Layout} endpoints={api.endpoints}>
        <Route component={IndexLayout}>
          <IndexRedirect to={`/${API_VERSION}`} />
          <Redirect from='/reference' to={`/${API_VERSION}/`} />
          <Route path={`/${API_VERSION}`}>
            {GettingStartedRoutes}
            <Route path="libraries/python" component={PythonLibrary} pythonDataObjects={{pythonDataTitles, pythonClientObjectTitles, pythonAPITitles}} />
            {api.endpoints.map(function(endpoint, index) {
              return generateIndexRoute({ key: index, endpoint: endpoint });
            })}
            {api.endpoints.map(function(endpoint) {
              const crumb = [{ groupLabel: 'Reference', label: endpoint.path, to: endpoint.routePath }];
              return generateChildRoute({ endpoint: endpoint, prevCrumbs: crumb });
            })}
            {pythonClientObjectTitles.map(function(pythonObject, index) {
              const crumb = [{ groupLabel: 'Libraries', label: '/python', to: `/${API_VERSION}/libraries/python` }];
              return generateLibraryRoutes({ index: index, libraryObject: pythonObject, prevCrumbs: crumb });
            })}
            {pythonAPITitles.map(function(pythonObject, index) {
              const crumb = [{ groupLabel: 'Libraries', label: '/python', to: `/${API_VERSION}/libraries/python` }];
              return generateLibraryRoutes({ index: index, libraryObject: pythonObject, prevCrumbs: crumb });
            })}
          </Route>
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
