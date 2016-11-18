import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';

import { IndexPage, AlertsPage, DisplayPage } from './layouts';
import AdvancedPage from './layouts/AdvancedPage';
import EditConfigPage from './layouts/EditConfigPage';
import AddConfigPage from './layouts/AddConfigPage';

import { linodes } from '~/api';

async function advanced_preload(dispatch, params) {
  const { linodeId } = params;
  await dispatch(linodes.one(linodeId));
  await dispatch(linodes.configs.all(linodeId));
}

export default (
  <Route path="settings" component={IndexPage}>
    <IndexRoute component={DisplayPage} />
    <Route path="alerts" component={AlertsPage} />
    <Route path="advanced">
      <IndexRoute component={AdvancedPage} preload={advanced_preload} />
      <Route path="configs">
        <IndexRedirect to=".." />
        <Route path="create" component={AddConfigPage} />
        <Route path=":configId" component={EditConfigPage} />
      </Route>
    </Route>
  </Route>
);
