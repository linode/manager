import React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const StackScriptsDetail = React.lazy(() =>
  import('./StackScriptsDetail').then((module) => ({
    default: module.StackScriptDetail,
  }))
);
const StackScriptsLanding = React.lazy(() =>
  import('./StackScriptLanding/StackScriptsLanding').then((module) => ({
    default: module.StackScriptsLanding,
  }))
);
const StackScriptCreate = React.lazy(() =>
  import('./StackScriptCreate/StackScriptCreate').then((module) => ({
    default: module.StackScriptCreate,
  }))
);

const StackScriptEdit = React.lazy(() =>
  import('./StackScriptEdit').then((module) => ({
    default: module.StackScriptEdit,
  }))
);

export const StackScripts = () => {
  const { search } = useLocation();
  const history = useHistory();
  const { path } = useRouteMatch();

  // Redirects to prevent breaking old stackscripts?type=whatever bookmarks
  const searchParams = new URLSearchParams(search);

  if (searchParams.get('type') === 'community') {
    history.replace('stackscripts/community');
  }
  if (searchParams.get('type') === 'account') {
    history.replace('stackscripts/account');
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="StackScripts" />
      <Switch>
        <Route component={StackScriptsLanding} path={`${path}/account`} />
        <Route component={StackScriptsLanding} path={`${path}/community`} />
        <Route component={StackScriptsLanding} exact path={path} />
        <Route component={StackScriptCreate} exact path={`${path}/create`} />
        <Route
          component={StackScriptEdit}
          exact
          path={`${path}/:stackScriptID/edit`}
        />
        <Route
          component={StackScriptsDetail}
          exact
          path={`${path}/:stackScriptId`}
        />
        <Redirect to={`${path}`} />
      </Switch>
    </React.Suspense>
  );
};

export default StackScripts;
