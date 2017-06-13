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

import { GuidesIndex } from './guides/GuidesIndex';

import {
  TestingWithCurl,
  CreateLinode
} from './guides/curl';

import {
  Introduction as PythonIntroduction,
  BasicSetup,
  CoreConcepts,
  OAuthWorkflow
} from './guides/python';

import { python } from '~/data/python';

import { API_VERSION } from '~/constants';
const guideCrumbs = [{ groupLabel: 'Guides', label: '/guides', to: `/${API_VERSION}/guides` }];
const pythonCrumbs = [{ groupLabel: 'Python', label: '/python', to: `/${API_VERSION}/libraries/python` }];

export default (
  <Route component={IndexLayout}>
    <IndexRedirect to="introduction" />
    <Redirect from="reference" to="introduction" />
    <Route path="introduction" component={Introduction} />
    <Route path="access" component={Access} />
    <Route path="pagination" component={Pagination} />
    <Route path="filtering" component={Filtering} />
    <Route path="errors" component={Errors} />
    <Route path="guides" component={GuidesIndex}>
      <Route path="curl/creating-a-linode" component={CreateLinode} crumbs={guideCrumbs} />
      <Route path="curl/testing-with-curl" component={TestingWithCurl} crumbs={guideCrumbs} />
      <Route path="python/getting-started" component={PythonIntroduction} crumbs={guideCrumbs} />
      <Route path="python/basic-setup" component={BasicSetup} crumbs={pythonCrumbs} />
      <Route path="python/oauth-workflow" component={OAuthWorkflow} crumbs={pythonCrumbs} />
      <Route path="python/core-concepts" component={CoreConcepts} crumbs={pythonCrumbs} />
    </Route>
  </Route>
);
