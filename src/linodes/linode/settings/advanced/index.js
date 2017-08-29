import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import { AddConfigPage, AdvancedPage, EditConfigPage, IndexPage } from './layouts';


export default (
  <Route path="advanced" component={IndexPage}>
    <IndexRoute component={AdvancedPage} />
    <Route path="configs">
      <IndexRedirect to=".." />
      <Route path="create" component={AddConfigPage} />
      <Route path=":configId" component={EditConfigPage} />
    </Route>
  </Route>
);
