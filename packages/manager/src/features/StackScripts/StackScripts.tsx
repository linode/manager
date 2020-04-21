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
const StackScriptsLanding = React.lazy(() => import('./StackScriptsLanding'));
const StackScriptCreate = React.lazy(() => import('./StackScriptCreate'));
const StackScriptUpdate = React.lazy(() => import('./StackScriptUpdate'));

type Props = RouteComponentProps<{}>;

class NodeBalancers extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={StackScriptsLanding} path={path} exact />
          <Route component={StackScriptCreate} path={`${path}/create`} exact />
          <Route
            component={StackScriptUpdate}
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
  }
}

export default withRouter(NodeBalancers);
