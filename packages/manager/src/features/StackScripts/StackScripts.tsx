import * as React from 'react';
import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { getParamsFromUrl } from 'src/utilities/queryParams';

const StackScriptsLanding = React.lazy(() => import('./StackScriptsLanding'));
const StackScriptsDetail = React.lazy(() => import('./StackScriptsDetail'));
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));

export const StackScripts: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const { path } = useRouteMatch();

  // Redirects to prevent breaking old stackscripts?type=whatever bookmarks
  const searchParams = getParamsFromUrl(location.search);
  if (searchParams.type === 'community') {
    history.replace('stackscripts/community');
  }
  if (searchParams.type === 'account') {
    history.replace('stackscripts/account');
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={StackScriptsLanding} path={`${path}/account`} />
        <Route component={StackScriptsLanding} path={`${path}/community`} />
        <Route component={StackScriptsLanding} path={path} exact strict />
        <Route
          render={() => <StackScriptCreate mode="create" />}
          path={`${path}/create`}
        />
        <Route
          render={() => <StackScriptCreate mode="edit" />}
          path={`${path}/:stackScriptId/edit`}
        />
        <Route component={StackScriptsDetail} path={`${path}/:stackScriptId`} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(StackScripts);
