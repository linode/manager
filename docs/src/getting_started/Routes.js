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

import {
  Changelogs,
} from './changelogs';

import { default as GuidesIndex } from './guides/GuidesIndex';


export default function GettingStartedRoutes(guides, crumbs) {
  return (
    <Route component={IndexLayout}>
      <IndexRedirect to="introduction" />
      <Redirect from="reference" to="introduction" />
      <Route path="changelogs" components={Changelogs} />
      <Route path="introduction" component={Introduction} />
      <Route path="access" component={Access} />
      <Route path="pagination" component={Pagination} />
      <Route path="filtering" component={Filtering} />
      <Route path="errors" component={Errors} />
      <Route path="guides" component={GuidesIndex} crumbs={crumbs} />
      {guides.map(function (guide) {
        return (<Route path={guide.routePath} component={guide.component} crumbs={guide.crumbs} />);
      })}
    </Route>
  );
}
