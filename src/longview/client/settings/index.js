import React from 'react';
import { Route, IndexRoute } from 'react-router';

import { IndexPage, InstallPage, DisplayPage } from './layouts';


export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="install" component={InstallPage} />
  </Route>
);
