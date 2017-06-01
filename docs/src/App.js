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

import {
  Introduction,
  Access,
  Pagination,
  Filtering,
  Errors,
} from './components/intros';

import {
  Python,
  PythonIntroduction,
  Curl,
  CreateLinode,
  TestingWithCurl,
  BasicSetup,
  CoreConcepts,
  OAuthWorkflow,
} from './components/guides';

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
          <IndexRedirect to={`/${API_VERSION}/introduction`} />
          <Redirect from='/reference' to={`/${API_VERSION}/introduction`} />
          <Redirect from={`/${API_VERSION}/reference`} to={`/${API_VERSION}/introduction`} />
          <Route path={`/${API_VERSION}/introduction`} component={Introduction} />
          <Route path={`/${API_VERSION}/access`} component={Access} />
          <Route path={`/${API_VERSION}/pagination`} component={Pagination} />
          <Route path={`/${API_VERSION}/filtering`} component={Filtering} />
          <Route path={`/${API_VERSION}/errors`} component={Errors} />
          <Route path={`/${API_VERSION}/guides/curl`} component={Curl} />
          <Route path={`/${API_VERSION}/guides/curl/creating-a-linode`} component={CreateLinode} />
          <Route path={`/${API_VERSION}/guides/curl/testing-with-curl`} component={TestingWithCurl} />
          <Route path={`/${API_VERSION}/guides/python`} component={Python} pythonDataObjects={{pythonDataTitles, pythonClientObjectTitles, pythonAPITitles}} />
          <Route path={`/${API_VERSION}/guides/python/introduction`} component={PythonIntroduction} />
          <Route path={`/${API_VERSION}/guides/python/basic-setup`} component={BasicSetup} />
          <Route path={`/${API_VERSION}/guides/python/oauth-Workflow`} component={OAuthWorkflow} />
          <Route path={`/${API_VERSION}/guides/python/core-concepts`} component={CoreConcepts} />
          {api.endpoints.map(function(endpoint, index) {
            return generateIndexRoute({ key: index, endpoint: endpoint });
          })}
          {api.endpoints.map(function(endpoint) {
            const crumb = [{ groupLabel: 'Reference', label: endpoint.path, to: endpoint.routePath }];
            return generateChildRoute({ endpoint: endpoint, prevCrumbs: crumb });
          })}
          {pythonClientObjectTitles.map(function(pythonObject, index) {
            return generateLibraryRoutes({ index: index, libraryObject: pythonObject, prevCrumbs: []});
          })}
          {pythonAPITitles.map(function(pythonObject, index) {
            return generateLibraryRoutes({ index: index, libraryObject: pythonObject, prevCrumbs: []});
          })}
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Router>,
    document.getElementById('root')
  );
};
