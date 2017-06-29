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
import { default as python } from '~/python';

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


import {
  TestingWithCurl,
  CreateLinode
} from './getting_started/guides/curl';
import {
  PythonIntroduction,
  BasicSetup,
  CoreConcepts,
  OAuthWorkflow
} from './getting_started/guides/python';

const guidesRoutePath = `/${API_VERSION}/guides`;
const guideCrumbs = [{ groupLabel: 'Getting Started', label: '/guides', to: guidesRoutePath }];
const guides = [
  { routePath: `${guidesRoutePath}/curl/creating-a-linode`, component: CreateLinode, crumbs: guideCrumbs },
  { routePath: `${guidesRoutePath}/curl/testing-with-curl`, component: TestingWithCurl, crumbs: guideCrumbs },
  { routePath: `${guidesRoutePath}/python/getting-started`, component: PythonIntroduction, crumbs: guideCrumbs },
  { routePath: `${guidesRoutePath}/python/oauth-workflow`, component: OAuthWorkflow, crumbs: guideCrumbs },
  { routePath: `${guidesRoutePath}/python/core-concepts`, component: CoreConcepts, crumbs: guideCrumbs },
];

// only used for active nav state
const childParentMap = {};
api.endpoints.forEach(function(endpoint) {
  endpoint.endpoints.forEach(function(childEndpoint, index) {
    childEndpoint.endpoints.forEach(function(child) {
      childParentMap[child.routePath] = endpoint.routePath;
    });
  });
});
[].concat(pythonClientObjectTitles).concat(pythonAPITitles).forEach(function(endpoint) {
  childParentMap[endpoint.href] = `/${API_VERSION}/libraries/python`;
});
guides.forEach(function(endpoint) {
  childParentMap[endpoint.routePath] = guidesRoutePath;
});


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

window.setTitle = function(newTitle) {
  const title = document.querySelector('title');
  title.textContent = 'Linode API Documentation';

  if (newTitle) {
    title.textContent = `${newTitle} | ${title.textContent}`;
  }
};


function updateTitle() {
  const h1 = document.querySelector('h1');
  if (h1) {
    window.setTitle(h1.textContent);
  } else {
    // If the page is missing h1, we should fill it in. But it's probably better to reset
    // the title than to leave it as the last page.
    window.setTitle();
  }
}

function onRouterUpdate() {
  logPageView();
  hashLinkScroll();
  updateTitle();
}

export function init() {
  hashLinkScroll();
  render(
    <Router
      history={browserHistory}
      onUpdate={onRouterUpdate}
    >
      <Route path="/" component={Layout} endpoints={api.endpoints} childParentMap={childParentMap}>
        <Route component={IndexLayout}>
          <IndexRedirect to={`/${API_VERSION}`} />
          <Redirect from='/reference' to={`/${API_VERSION}/`} />
          <Route path={`/${API_VERSION}`}>
            {GettingStartedRoutes(guides, guideCrumbs)}
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
