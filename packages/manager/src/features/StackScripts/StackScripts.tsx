import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useFlags from 'src/hooks/useFlags';

const StackScriptsDetail = React.lazy(() => import('./StackScriptsDetail'));
const StackScriptsLanding = React.lazy(() => import('./StackScriptsLanding'));
const StackScriptsLanding_CMR = React.lazy(() =>
  import('./StackScriptsLanding_CMR')
);
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));

type Props = RouteComponentProps<{}>;

export const NodeBalancers: React.FC<Props> = props => {
  const flags = useFlags();

  const {
    match: { path }
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        {flags.cmr ? (
          <Route component={StackScriptsLanding_CMR} path={path} exact />
        ) : (
          <Route component={StackScriptsLanding} path={path} exact />
        )}
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

export default withRouter(NodeBalancers);
