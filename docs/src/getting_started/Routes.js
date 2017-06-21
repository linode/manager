import React from 'react';
import { Redirect, Route, IndexRedirect } from 'react-router';

import {
  IndexLayout,
} from '~/layouts';

import {
  Introduction,
  Access,
  Pagination,
  Filtering,
  Errors,
} from './intros';

import { default as GuidesIndex } from './guides/GuidesIndex';

import {
  TestingWithCurl,
  CreateLinode
} from './guides/curl';

import {
  PythonIntroduction,
  BasicSetup,
  CoreConcepts,
  OAuthWorkflow
} from './guides/python';

import { python } from '~/data/python';

import { API_VERSION } from '~/constants';
const guideCrumbs = [{ groupLabel: 'Getting Started', label: '/guides', to: `/${API_VERSION}/guides` }];

export default (
  <Route component={IndexLayout}>
    <IndexRedirect to="introduction" />
    <Redirect from="reference" to="introduction" />
    <Route path="introduction" component={Introduction} />
    <Route path="access" component={Access} />
    <Route path="pagination" component={Pagination} />
    <Route path="filtering" component={Filtering} />
    <Route path="errors" component={Errors} />
    <Route path="guides" component={GuidesIndex} crumbs={guideCrumbs} />
    <Route path="guides/curl/creating-a-linode" component={CreateLinode} crumbs={guideCrumbs} />
    <Route path="guides/curl/testing-with-curl" component={TestingWithCurl} crumbs={guideCrumbs} />
    <Route path="guides/python/getting-started" component={PythonIntroduction} crumbs={guideCrumbs} />
    <Route path="guides/python/oauth-workflow" component={OAuthWorkflow} crumbs={guideCrumbs} />
    <Route path="guides/python/core-concepts" component={CoreConcepts} crumbs={guideCrumbs} />
  </Route>
);
