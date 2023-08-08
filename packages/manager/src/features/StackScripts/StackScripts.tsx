import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

const StackScriptsDetail = React.lazy(() => import('./StackScriptsDetail'));
const StackScriptsLanding = React.lazy(() => import('./StackScriptsLanding'));
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));

type Props = RouteComponentProps<{}>;

export const StackScripts: React.FC<Props> = (props) => {
  const {
    location: { search },
    match: { path },
  } = props;

  // Redirects to prevent breaking old stackscripts?type=whatever bookmarks
  const searchParams = new URLSearchParams(search);

  if (searchParams.get('type') === 'community') {
    props.history.replace('stackscripts/community');
  }
  if (searchParams.get('type') === 'account') {
    props.history.replace('stackscripts/account');
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={StackScriptsLanding} path={`${path}/account`} />
        <Route component={StackScriptsLanding} path={`${path}/community`} />
        <Route component={StackScriptsLanding} exact path={path} />
        <Route
          exact
          path={`${path}/create`}
          render={() => <StackScriptCreate mode="create" />}
        />
        <Route
          exact
          path={`${path}/:stackScriptID/edit`}
          render={() => <StackScriptCreate mode="edit" />}
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

export default withRouter(StackScripts);
