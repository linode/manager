import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const StackScriptsDetail = React.lazy(() => import('./StackScriptsDetail'));
const StackScriptsLanding_CMR = React.lazy(() =>
  import('./StackScriptsLanding_CMR')
);
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));

type Props = RouteComponentProps<{}>;

export const NodeBalancers: React.FC<Props> = props => {
  const {
    match: { path }
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={StackScriptsLanding_CMR} path={path} />
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
        {/* <Redirect to={`${path}`} /> */}
        <Redirect from={`${path}?type=account`} to={`${path}/account`} />
        <Redirect from={`${path}?type=community`} to={`${path}/community`} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(NodeBalancers);
