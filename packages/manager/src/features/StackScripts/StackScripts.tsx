import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { parseQueryParams } from 'src/utilities/queryParams';

const StackScriptsDetail = React.lazy(() => import('./StackScriptsDetail'));
const StackScriptsLanding = React.lazy(() => import('./StackScriptsLanding'));
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));

type Props = RouteComponentProps<{}>;

export const StackScripts: React.FC<Props> = (props) => {
  const {
    match: { path },
    location: { search },
  } = props;

  // Redirects to prevent breaking old stackscripts?type=whatever bookmarks
  const searchParams = parseQueryParams(search);
  if (searchParams.type === 'community') {
    props.history.replace('stackscripts/community');
  }
  if (searchParams.type === 'account') {
    props.history.replace('stackscripts/account');
  }

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={StackScriptsLanding} path={`${path}/account`} />
        <Route component={StackScriptsLanding} path={`${path}/community`} />
        <Route component={StackScriptsLanding} path={path} exact />
        <Route
          render={() => <StackScriptCreate mode="create" />}
          path={`${path}/create`}
          exact
        />
        <Route
          render={() => <StackScriptCreate mode="edit" />}
          path={`${path}/:stackScriptID/edit`}
          exact
        />
        <Route
          component={StackScriptsDetail}
          path={`${path}/:stackScriptId`}
          exact
        />
        <Redirect to={`${path}`} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(StackScripts);
